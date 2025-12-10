---
draft: true
title: "Mealies Permission Denied Mystery: A Tale of AppArmor Being a Dick"
date:
author: William
category:
  - Tech
tags:
description:
bskyid:
cover:
  image: test
  alt: test
---
## Introduction

So there I was, minding my own business, trying to restart my Mealie container after what should have been a routine update. You know, that recipe management app that promises to organize your culinary life but somehow always ends up being more work than scribbling recipes on the back of receipts?

Yeah, that one.

Except this time, Mealie decided it wasn't going to boot. At all. Instead, it gave me the digital equivalent of a middle finger:

```
PermissionError: [Errno 13] Permission denied
```

Now, I've seen my fair share of permission errors. Usually they're pretty straightforward - you forgot sudo, or you're trying to write to `/root` as a peasant user, or you mounted a volume with the wrong ownership. Easy fixes.

This was not one of those times.

## The Rabbit Hole Begins

The error was coming from deep within Python's asyncio event loop, specifically when uvloop (a high-performance alternative to asyncio's default loop) tried to create a socket pair. For the uninitiated, a socket pair is basically two ends of a pipe that processes use to talk to each other. Nothing fancy, nothing exotic - this is basic shit that every application does.

But Mealie? Nah, mate. Permission denied.

"Fine," I thought, "probably a user permission issue." The container was doing that thing where it starts as root and then drops privileges to uid 1000. Classic security practice. Except... my system didn't have a user with uid 1000. Just root. Probably a bad idea security-wise, but we're not here to judge life choices.

## Down the Docker Configuration Hole

So I did what any reasonable person would do: started throwing Docker configurations at the wall to see what stuck.

### Attempt 1: IPC Host Mode

First up: `ipc: host`. This removes IPC namespace isolation, letting the container access the host's shared memory without artificial limits. Makes sense, right? If it can't create sockets in its own namespace, maybe the host namespace would be more permissive.

```yaml
services:
  mealie:
    ipc: host
```

Narrator: _It was not more permissive._

### Attempt 2: Running as Root

"Okay," I said to my rubber duck, "maybe it's because the container is switching users. Let's just run the whole thing as root."

```yaml
services:
  mealie:
    user: "0:0"  # YOLO
```

The logs confirmed it was running as uid 0, gid 0. Full root privileges. All the power. All the glory.

Still got:

```
PermissionError: [Errno 13] Permission denied
```

At this point I was starting to question reality. How does ROOT get a permission denied error for creating a socket pair? That's like the king of England being told he needs permission to sit on his own throne.

### Attempt 3: Capability Roulette

Maybe it needed specific Linux capabilities? I started adding them like Pokemon:

```yaml
cap_add:
  - IPC_LOCK
  - SYS_RESOURCE
  - SYS_ADMIN
```

Gotta catch 'em all, right?

Nope. Still permission denied.

## The Plot Twist

After about an hour of this nonsense, I decided to go nuclear and add every security override I could think of:

```yaml
security_opt:
  - seccomp=unconfined
  - apparmor=unconfined
  - label=disable
```

And boom. It fucking worked.

Now began the process of elimination. Which one of these security overrides was the culprit?

Turns out it was **AppArmor**.

## What the Hell is AppArmor Anyway?

AppArmor is a Linux kernel security module that's like that overly protective parent who won't let their kid do anything fun. It applies mandatory access control profiles to applications, restricting what system calls they can make.

Docker has a default AppArmor profile that applies to all containers. It's designed to prevent containers from doing naughty things like:

- Mounting filesystems
- Loading kernel modules
- Accessing raw sockets
- And apparently, creating the specific type of socket pairs that uvloop needs for signal handling

That last one is the kicker. uvloop uses more advanced, lower-level system calls than standard asyncio for better performance. It's trying to create Unix domain socket pairs with specific flags for asynchronous signal handling - you know, so it can gracefully shut down when you hit Ctrl+C or send it a SIGTERM.

Docker's AppArmor profile saw these syscalls and went: "Nope. Blocked. Get fucked."

Even as root. Even with all the capabilities. AppArmor doesn't care about your permissions - it's filtering at the syscall level, before the kernel even checks if you have permission to do the thing.

## The Fix

The solution was surprisingly simple:

```yaml
services:
  mealie:
    image: ghcr.io/mealie-recipes/mealie:latest
    security_opt:
      - apparmor=unconfined
    # ... rest of your config
```

One line. That's it. One fucking line after an hour of troubleshooting.

## But Wait, Isn't That Insecure?

Yes and no.

By setting `apparmor=unconfined`, you're removing one layer of defense-in-depth. The container no longer has AppArmor's syscall filtering protecting it.

But here's the thing: for a personal Mealie instance running on your home lab, this is **totally fine**. You're still getting:

- Namespace isolation (filesystem, network, PID)
- Cgroup resource limits
- SELinux (if you're on a distro that uses it)
- The fact that it's in a container at all

### The Proper Secure Approach

Now, as a security engineer, I'd be remiss if I didn't mention the **proper** way to fix this. Instead of going full `apparmor=unconfined`, you should create a custom AppArmor profile that allows only the specific syscalls uvloop needs:

**Step 1:** Create `/etc/apparmor.d/docker-mealie`:

```apparmor
services:
  mealie:
    security_opt:
      - apparmor=docker-mealie-custom
```

Then create `/etc/apparmor.d/docker-mealie-custom`:
```
#include <tunables/global>

profile docker-mealie-custom flags=(attach_disconnected,mediate_deleted) {
  #include <abstractions/base>
  
  # Allow socket operations for uvloop
  network unix stream,
  network unix dgram,
  
  # Allow signal handling
  signal (send, receive),
  
  # Include default docker profile
  #include <abstractions/docker>
}
```

**Step 2:** Load the profile:

```bash
sudo apparmor_parser -r -W /etc/apparmor.d/docker-mealie
```

**Step 3:** Update your docker-compose.yml:

```yaml
services:
  mealie:
    image: ghcr.io/mealie-recipes/mealie:latest
    security_opt:
      - apparmor=docker-mealie
    # ... rest of your config
```

This gives you:

- ✅ Socket pair creation (what uvloop needs)
- ✅ Signal handling (for graceful shutdowns)
- ✅ Network operations (for the web server)
- ❌ Kernel module loading (blocked)
- ❌ System administration capabilities (blocked)
- ❌ Arbitrary kernel writes (blocked)

### When to Use Which Approach

**Use `apparmor=unconfined` if:**

- Personal home lab
- Single-user environment
- You trust the application source
- You just want the damn thing to work

**Use a custom profile if:**

- Production environment
- Multi-tenant system
- Handling sensitive data
- You're being paid to care about security
- Your threat model includes container escapes

For Mealie storing your grandmother's cookie recipe? Just disable AppArmor and move on with your life. But if you're deploying this in an environment where security actually matters? Take the extra 10 minutes to write the custom profile.

## Why Didn't Anyone Warn Me?

This is one of those beautiful edge cases that sits at the intersection of:

1. Using uvloop (many Python apps don't)
2. Running on a system with AppArmor enabled (not all distros do)
3. Using Docker (which applies its own AppArmor profile)
4. Having uvloop try to set up signal handlers (which requires specific socket operations)

Most people won't hit this. Most people will install Mealie, it'll work fine, and they'll go on with their lives organizing recipes like responsible adults.

But if you're the unlucky soul who hits this exact combination? Welcome to hell. Population: you and the three other people on GitHub who reported this issue two years ago with no resolution.

## Lessons Learned

1. **Permission denied doesn't always mean what you think it means.** Sometimes it's not about file permissions or user privileges - it's about syscall filtering that's happening before the kernel even checks your credentials.
    
2. **uvloop is amazing until it isn't.** It's faster than standard asyncio, but it uses more aggressive optimizations that can run afoul of security policies. Sometimes standard asyncio's "slower" approach is actually more compatible.
    
3. **Security is layers upon layers.** Docker has namespaces, cgroups, capabilities, SELinux, AppArmor, and probably five other things I'm forgetting. Any one of them can fuck you in unexpected ways.
    
4. **The nuclear option is sometimes the right option.** For personal projects, `apparmor=unconfined` is fine. Don't let perfect be the enemy of working.
    
5. **Document your weird fixes.** Future you (or some poor bastard Googling the same error) will thank you.
    

## Conclusion

After all this, Mealie is now happily running, storing my collection of recipes I'll never make and meal plans I'll never follow. Was it worth an hour of troubleshooting? Probably not. Did I learn something about the dark corners of Linux security? Absolutely.

And isn't that what home-labbing is all about? Breaking shit, fixing shit, and writing overly long blog posts about the experience?

Now if you'll excuse me, I have some recipes to import that I'll definitely cook one day. Definitely.

---

**Tags:** Linux, Docker, Home-Lab, Security, Rant

_Got questions, corrections, or your own AppArmor horror stories? Drop a comment below. Or don't. I'm not your dad._