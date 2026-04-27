---
draft: false
title: "Mealie Permission Denied: AppArmor Was Blocking uvloop"
date: 2026-04-27
author: William
category:
  - Tech
tags:
  - Linux
  - Docker
  - Home-Lab
  - Security
  - Rant
description: Mealie throwing Permission denied as root, inside a root container. Not file permissions. AppArmor blocking uvloop syscalls before the kernel even checked credentials. Here is how to fix it.
bskyid:
cover:
  image: mealie_cake.png
  alt: mealie_cake.png
---
## Introduction

So there I was, minding my own business, trying to restart my Mealie container after a routine update. You know Mealie. The recipe management app that promises to organise your culinary life. I use it to hoard recipes I'll never cook, which is its own kind of joy.

Except this time Mealie decided it wasn't going to boot. At all. Instead, it gave me this:

```
PermissionError: [Errno 13] Permission denied
```

I've seen my fair share of permission errors. Usually they're straightforward. You forgot sudo, or you mounted a volume with wrong ownership, or you're trying to write to `/root` as a peasant user. Easy fixes.

This was not one of those times.

## Setting the Scene

This was running on a throwaway VPS I'd spun up to mess around with a few self-hosted services. Single user box. Root. The container? Also root. Permissions should not have been a problem. Root cannot be denied permission. Root IS permission.

And yet. Permission denied.

## Throwing Docker Configs at the Wall

The error was coming from deep inside Python's asyncio event loop, specifically when uvloop (a high-performance alternative to asyncio's default loop) tried to create a socket pair via `socketpair(AF_UNIX, SOCK_STREAM|SOCK_CLOEXEC|SOCK_NONBLOCK, 0)`. A socket pair is two ends of a pipe that processes use to talk to each other. Basic shit every application does.

But Mealie? Nah. Permission denied.

So I did what any reasonable person would do. Started throwing Docker configs at the wall to see what stuck.

### Attempt 1: IPC Host Mode

First up: `ipc: host`. This strips IPC namespace isolation and lets the container reach the host's shared memory without the usual artificial limits. If uvloop couldn't create sockets in its own namespace, maybe the host's would be more permissive.

```yaml
services:
  mealie:
    ipc: host
```

It was not more permissive.

### Attempt 2: Capability Roulette

Maybe it needed specific Linux capabilities? I started adding them:

```yaml
cap_add:
  - IPC_LOCK
  - SYS_RESOURCE
  - SYS_ADMIN
```

Nope. Still permission denied.

## The Plot Twist

After about an hour of this nonsense, I decided to go nuclear. Piled on every security override I could think of:

```yaml
security_opt:
  - seccomp=unconfined
  - apparmor=unconfined
  - label=disable
```

And boom. It fucking worked.

Now the fun part. Which one of these three was actually the bouncer? I pulled them out one at a time and restarted the container. Remove `seccomp=unconfined`, still works. Remove `label=disable`, still works. Put `apparmor=unconfined` back in? Broken.

AppArmor. The whole time.

## What is AppArmor and Why It Was Blocking Me

AppArmor is a Linux kernel security module that applies mandatory access control profiles to applications and restricts what system calls they can make. Think of it as a bouncer at a club with a very specific guest list. Doesn't care that you own the building.

Docker ships a default AppArmor profile that applies to all containers. It stops containers from doing naughty things like mounting filesystems, loading kernel modules, or poking at raw sockets. Sensible stuff.

The problem? uvloop leans on lower-level syscalls than standard asyncio for performance. The self-pipe trick it uses for signal handling wants a Unix domain socket pair created with those `SOCK_CLOEXEC|SOCK_NONBLOCK` flags, so it can gracefully shut down when you send it a SIGTERM.

Docker's default profile saw those syscalls and said no. Even as root. Even with every capability. AppArmor doesn't care about your credentials. It filters at the syscall layer, before the kernel even gets a chance to check whether you have permission to do the thing.

Your root shell is irrelevant. Your capabilities are irrelevant. The bouncer already said no.

## The Fix

One line:

```yaml
services:
  mealie:
    image: ghcr.io/mealie-recipes/mealie:latest
    security_opt:
      - apparmor=unconfined
    # ... rest of your config
```

One line. An hour of troubleshooting. Classic.

## But Wait, Isn't That Insecure?

Yes and no.

Setting `apparmor=unconfined` strips out one layer of defence-in-depth. The container no longer has AppArmor's syscall filter in front of it. For a personal Mealie instance, that's fine. You've still got namespace isolation, cgroup limits, and the fact that it's in a container at all.

As a security engineer though, I'd be remiss not to flag the proper fix. Instead of going full unconfined, you can ship a custom AppArmor profile that allows only what uvloop needs.

Create `/etc/apparmor.d/docker-mealie-custom`:

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

Load it and reference it in your compose:

```bash
sudo apparmor_parser -r -W /etc/apparmor.d/docker-mealie-custom
```

```yaml
services:
  mealie:
    security_opt:
      - apparmor=docker-mealie-custom
```

You now get socket pair creation and signal handling, while still blocking kernel module loading, arbitrary kernel writes, and sysadmin capabilities. Best of both worlds.

For Mealie storing your grandmother's cookie recipe? Disable AppArmor and move on. For anything production or multi-tenant? Take the ten minutes and write the profile.

## Why This Is So Hard to Find

This sits at a very specific intersection. Using uvloop (many Python apps don't). Running on a system with AppArmor enabled (not all distros do). Using Docker (which stacks its own AppArmor profile on top). And having uvloop wire up signal handlers that need specific socket operations.

Most people install Mealie and it Just Works™. Hit this exact combination though and your reward is an error message that tells you nothing useful. I checked the Mealie GitHub for an existing issue covering this. Nothing. Not even a stale one buried in the discussions. So if you've landed here from a frustrated Google search, congratulations. You're not crazy and you're not alone. I've raised an issue upstream to get this documented properly.

## What I Took Away

Permission denied doesn't always mean what you think. Sometimes it's not file permissions or user privileges. It's syscall filtering happening before the kernel even looks at your credentials. Exhausted the obvious stuff (ownership, caps, user context) and still hitting walls? Start looking at the security modules. AppArmor, SELinux, seccomp. One of them is probably the bouncer you didn't know was working the door.

And uvloop is great until it isn't. Faster than standard asyncio, sure, but those gains come from more aggressive syscalls that can trip security policies in ways the error messages will never explain. Sometimes the "slower" default loop is the more compatible one.

---


_If you've got your own AppArmor horror story, I'd love to hear it in the comments. Misery loves company._