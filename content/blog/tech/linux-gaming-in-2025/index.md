---
draft: false
title: Linux gaming in 2025
date: 2025-06-28
author: William
category:
  - Tech
tags:
  - Linux
  - Gaming
description: Thinking about switching to Linux for gaming? Here's a deep dive into dual-booting, gaming on Nobara Linux, NTFS shenanigans, Steam support, and the good, bad, and ugly of Linux gaming in 2025 from someone who actually made the switch. 
cover:
  image: LinuxSteam.png
  alt: LinuxSteam.png
---
So you're thinking about switching to Linux. We've all had those moments.

For me, the first time was during my honours year. At the start of the year, we were asked whether we wanted our machines set up with Windows or Linux.

I’d spent my whole life on Windows, but I figured it was time to see what Linux had to offer. So I installed Mint. But no way was I putting that shit on my main machine! Homie had games to play, and the idea of running stuff through Wine? Laughable. Back then, Linux gaming meant _only_ playing what was precompiled for Linux.

Fast forward a few years, and as my technical chops have matured, I keep circling back to Linux as my daily driver. There are just so many benefits it’s a better environment in so many ways:

Want to code? → Linux.  
Want containers? → Linux.  
Want to run AI workloads? → Linux.  
Want to hack? → Linux.

Gaming though? That’s always been Windows territory.  
(Also anything Adobe, but that’s a whole other rant.)

Yeah, yeah I know you _can_ get most of that stuff running on Windows, and often pretty well. But I’ve always preferred how Linux does things. And honestly? Even Microsoft knows it: look at them bundling **wget**, or baking in **WSL**.

And don’t get me wrong WSL is cool. I used it every day for Docker, for coding, all that jazz. But the more I leaned into it, the more weird edge cases I hit. Good fucking luck getting a container to interface with an AMD GPU through the WSL abstraction. Even Ollama straight up says: _“GLHF just get Linux.”_

That’s why, more and more, I’ve been wanting to go full Linux for my daily driver. If I’m doing side projects or literally anything other than gaming, Linux is the answer.

But what about gaming _now_?

The scene’s changed a lot. Thanks to the Steam Deck, Valve’s been putting in serious work.

A lot of folks recommend Fedora if you’re gaming inclined. But I wanted something more plug-and-play. Enter: **Nobara Linux**.

[https://nobaraproject.org/](https://nobaraproject.org/)

Nobara is a modified version of Fedora that comes preloaded with a lot of the usual Linux gaming BS already set up. That means WINE, Proton, Nvidia drivers, and more all out of the box.

So I downloaded the ISO, flashed it to a USB, and booted it up to take a look. Honestly? Loved the KDE desktop. Decided to go all in split out a new partition and installed it.

## Getting It Up and Running: Dual Boot + NTFS Shenanigans
Since I was just trialing Nobara, I went with a dual-boot setup.  
Linux? Plays nice.  
Windows? Throws a tantrum if you don’t do it _just right_.

![https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2dlYXFpNmx1eTRocm93YWd6NjFrYmpkYmNicmhqcWZxampkY2l5cSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT0GqvzWqa6Jf9c9hK/giphy.gif](https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2dlYXFpNmx1eTRocm93YWd6NjFrYmpkYmNicmhqcWZxampkY2l5cSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT0GqvzWqa6Jf9c9hK/giphy.gif#center)

Here’s what I did:
1. **Shrank** my Windows drive to make room for a new partition.
2. Flashed Nobara to USB 
3. Disabled **Secure Boot** in the BIOS
4. Installed Nobara on the newly freed space.

Now, about my **data drive** it’s a massive NTFS volume full of games, media, junk... you name it. NTFS is Windows' baby, and while Linux can talk to it, it’s not exactly a smooth conversation.

Mounting it in `/etc/fstab` works fine, though. If you're trying to run games directly off an NTFS drive (like I was), check out [my other write-up](/blog/tech/fix-steam-issues-on-linux/#mounting-your-ntfs-drive-the-right-way) where I explain exactly how I got that sorted.

You _will_ hit permissions weirdness. When you do, here's what I did to fix it...

## The Good

- The **package manager experience** on Linux is unmatched. Yeah, it’s terminal-based, but it’s basic stuff and Windows is clearly trying to copy the vibe with Chocolatey and `wget`.
- **Writing and running small scripts** is just way smoother. No faffing around with permissions or obscure admin settings.
- **Privacy**: Windows makes you wrestle your OS into respecting your privacy. Linux? Not an issue.
- **KDE is a beast**. You can tweak just about everything. Hell, I even linked my phone to it and can run terminal commands from there.
![https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ2VhOXE3dzV1bDE3Y2E5djRtc2Rrc2JlZnBsOGd0YmIybGIxdW8wYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/IwAZ6dvvvaTtdI8SD5/giphy.gif](https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ2VhOXE3dzV1bDE3Y2E5djRtc2Rrc2JlZnBsOGd0YmIybGIxdW8wYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/IwAZ6dvvvaTtdI8SD5/giphy.gif#center)
- **Running containers with AMD GPUs** is totally doable on Linux. Great news if you’re doing AI work or compute-heavy stuff.
- **Gaming legit works out of the box** (assuming permissions and basic setup are correct). Even most Windows games run like a charm.
- **Not being Windows** is a huge win on its own. The bloat, the weird UX decisions, the constant feeling that you're wrestling the OS… it's exhausting. Linux feels cleaner, more responsive especially if you're comfy in the terminal.
- You’ve got killer tools like:
    - [ProtonDB](https://www.protondb.com/)
    - [Lutris](https://lutris.net/)

## The Meh

- **GPU driver setup** can get a little spicy but Nobara solves this out of the box.
- **Not every game works.** Linux gaming has come a long way, but some titles still break. You might need to tweak settings, or accept that some just don’t run (_Escape from Tarkov_, looking at you).
- **Anti-cheat** systems are still a problem. Kernal-level tools like EAC and BattlEye often just say “nope” to Linux.
- **Modding** is hit-or-miss. With all the abstraction layers, modding can become fragile or weirdly buggy.
![https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnBreG5veDFuNm5kbmRqd3RhcHU2NTdncTc0bTZ4Y29iZDJ0bzh3bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT77XTpyEzJ4OJO06c/giphy.gif](https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnBreG5veDFuNm5kbmRqd3RhcHU2NTdncTc0bTZ4Y29iZDJ0bzh3bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT77XTpyEzJ4OJO06c/giphy.gif#center)
- The **Linux terminal** is a superpower but with WSL and PowerShell, Windows has started catching up. Somewhat. Still, Linux is where I live.
- **Media support** isn’t ideal. OBS runs well, but if you’re trying to use stuff like Lightroom or DaVinci Resolve, you’re in Wine/emulator territory and it’s janky. Web versions? Feature-stripped.
- **Fragmented install methods** can get confusing fast. `.deb`, `.rpm`, Flatpak, AppImage pick your poison. Nobara tries to streamline this with a unified update GUI, but if you're not careful, your system starts to feel like Frankenstein’s monster.
## The Ugly
- **Gaming abstraction ≠ flawless.** Proton and Wine do most of the lifting, but you _will_ run into random bugs, stutters, crashes, or “why is this happening” moments.
![https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXNrbTB0ZGY0MnhmM2x3MWkydTg3aXJhZnEwbDI2b2gycWtqdTNlOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/i7JBZ17h3gFJUKwzH0/giphy.gif](https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXNrbTB0ZGY0MnhmM2x3MWkydTg3aXJhZnEwbDI2b2gycWtqdTNlOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/i7JBZ17h3gFJUKwzH0/giphy.gif#center)
That’s when you think: _“Wouldn’t it just be easier to reboot into Windows?”_  
	And yeah... sometimes it is.
- **You’ll need a Windows partition**. No matter how much you want to commit, there will be That One Game that refuses to cooperate.
- **Anti-cheat is the final boss.** For multiplayer games, it’s the wall you hit. Even if your game runs perfectly under emulation, getting banned because the kernel driver saw something "weird" isn’t worth it.
- **Nobara-specific problem**: It’s based on Fedora, and while the out-of-box experience is great, sometimes the packages are a little old. Updating or overriding repos can feel like open-heart surgery, and I almost had to reinstall the whole OS because of one broken dependency chain.
- **System coherence slowly unravels.** With all the install methods (Flatpak, RPMs, manual builds, etc.), your system can turn into a mess. Even with Nobara’s tools, it takes discipline to stop your setup from spiraling.

## Final Thoughts

So... is Linux gaming ready for prime time?

Honestly, yes… but with an asterisk. If you’re a developer, a tinkerer, or just someone who likes to poke under the hood, Linux offers a rich, flexible, and increasingly viable alternative to Windows. With tools like Proton, Wine, and distros like Nobara doing the heavy lifting, the gap has narrowed significantly.

But don’t toss your Windows install just yet.

If you’re deep into AAA multiplayer games, especially those with kernel-level anti-cheat, you’ll still need Windows in your back pocket. Same goes for certain creative tools — the Adobe ecosystem, for example, just doesn’t play nice outside its native habitat.

That’s why I advocate for the middle path: dual-booting. It’s painless on modern hardware, and you get the best of both worlds. Need to tweak containers, train models, or write code? Boot into Linux. Want to jump into a game night with friends or run DaVinci Resolve? Reboot into Windows.

That flexibility is the real win.

Just know going in: Linux asks more of you. You’ll need to be okay with a terminal, patient with weird edge cases, and maybe even enjoy solving those puzzles. The good news? With tools like ChatGPT, debugging has never been easier.

As for me? Linux stays my daily driver not because it’s perfect, but because it aligns with how I work, build, and learn. It removes barriers for me to expand my technical skills. Windows is there when I need it, but Linux is where I feel at home.


## Bonus: My Setup

- **Distro**: Nobara KDE (Fedora-based)
- **CPU**: i7-13700k
- **GPU**: AMD RX 7900 XT
- **RAM**: 64GB DDR4
- **Storage**: NVMe 450GB (Linux), 450GB (Windows), 4TB NTFS Data drive
