---
draft: false
title: Windows 11 Has Been Lying to Your Games
date: 2026-03-15
author: William
category:
  - Tech
tags:
  - Windows
  - Gaming
  - Performance
description: Windows 11 quietly broke the way games request higher timer resolution — and it's been causing microstutter on desktop PCs ever since. Here's what changed, why Microsoft did it, and the single registry key that fixes it permanently.
bskyid:
cover:
  image: SlowedTime.png
  alt: SlowedTime.png
---
> **TL;DR** Run this in an elevated Command Prompt and reboot:
> ```cmd
> reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\kernel" /v GlobalTimerResolutionRequests /t REG_DWORD /d 1 /f
> ```
> Windows 11 silently broke global timer resolution. This restores it.
> Scroll down for the full breakdown.

## A Year of Micro stutters. One Registry Key.

For about a year my PC has been stuttering. Not crashing, not dropping to unplayable framerates. Just this persistent, infuriating microstutter that made everything feel slightly wrong. Moving windows across the desktop, playing a game would stutter when looking at a moderately busy scene. That subtle jankiness you can't quite screenshot but absolutely feel, and it all started when I upgraded to Windows 11.

It's not like I'm running a machine that gets overwhelmed as soon as the Chrome tabs hit double digits. I'm running an i7 13th gen with 64GB RAM for crying out loud. I tried everything. Reinstalled GPU drivers. Triaged heating issues. It even drove me to migrate to Linux for 6 months just so the desktop environment could be snappy again. I've recently moved back to Windows because the dual boot life got to be too much. I've since deployed my K3s cluster into a Hyper-V Linux VM instead (stay tuned, post incoming). Did the microstutters go away? Nope. They came back with even more vengeance. But I don't care who you are, an i7 should not be stuttering for nobody.

One evening, fed up and deep in a triage rabbit hole, I was digging into power settings and stumbled across `powercfg /energy`. This command runs a 60 second trace of your system and spits out a full power efficiency diagnostics report. Think of it as an MOT for your Windows power configuration. What I found in that report was infuriating, and confirmed to me that the enshittification of Windows is very real and they do not give a fuck about gamers at all.

It all boils down to one single kernel setting, `timeBeginPeriod()`, that determines the timer resolution of your whole system. So let's dig in.

---

## What is Timer Resolution and Why Should You Care

Your OS has a hardware timer, a chip that fires interrupts at a set frequency, waking the kernel scheduler so it can decide what threads get CPU time next. By default on Windows this fires at **15.6ms**, a legacy tick rate inherited from Windows 98-era hardware. That's ~64 interrupts per second.

For productivity workloads this is fine. Sure you'll notice it if you're looking for it, but for gaming it's terrible. A game rendering at 144fps needs frames delivered every ~7ms. If the scheduler only wakes up every 15.6ms to check what needs running, your frame delivery becomes lumpy. That lumpiness is microstutter.

To fix this, Windows exposes an API called `timeBeginPeriod()` that lets applications request a higher timer resolution. A game calling `timeBeginPeriod(1)` tells the kernel "I need 1ms timer resolution", which bumps the hardware interrupt rate to 1000Hz. Finer scheduler ticks, smoother frame delivery. War Thunder specifically requests **0.5ms** (5000 in 100ns units), which would push it to 2000Hz.

The key word there is _would_.

---

## What Microsoft Changed in Windows 11

Prior to Windows 11, `timeBeginPeriod()` was a global setting. One application requesting 1ms raised the timer resolution for the **entire system**. Every thread, every process, the whole scheduler, all running at that tighter tick rate for as long as the request was held. You know, like when you're actually playing a computer game.

Microsoft changed this in Windows 11. Timer resolution requests are now **per-process scoped**. An application's request only applies to its own sleep and wait operations. The global hardware timer stays at 15.6ms regardless of what any individual process asks for.

This is documented in Microsoft's own `timeBeginPeriod` reference:

> Starting with Windows 11, if a window-owning process becomes fully occluded, minimized, or otherwise invisible or inaudible to the end user, Windows does not guarantee a higher resolution than the default system resolution.

[Read the full Microsoft documentation here](https://learn.microsoft.com/en-us/windows/win32/api/timeapi/nf-timeapi-timebeginperiod)

The technical deep-dive on exactly what changed and why is covered brilliantly by Bruce Dawson in his article "Windows Timer Resolution: The Great Rule Change". It's also where the registry fix I'll get to in a moment was first publicly documented:

[randomascii.wordpress.com: Windows Timer Resolution: The Great Rule Change](https://randomascii.wordpress.com/2020/10/04/windows-timer-resolution-the-great-rule-change/)

---

## Why Did Microsoft Do This

The official reasoning was power efficiency. Pre-Windows 11, any background app carelessly calling `timeBeginPeriod(1)` (a browser, Spotify, a video player) would silently push the entire system to 1ms. This prevents the CPU from entering deep C-states between ticks, causing measurable continuous battery drain.

Microsoft's own measurements showed a single misbehaving background process could increase system power consumption by 10–25% indefinitely. For laptops, that's a real problem.

Here's the thing though. It's a **laptop-first decision applied globally**. They didn't even put in a check to see if your machine is, I don't know, a plugged-in desktop? The power saving rationale is mostly irrelevant to any desktop use case, and for anyone who actually cares about a smooth gaming experience it is completely irrelevant. Microsoft traded worse game scheduling for better laptop battery life and applied it to everyone equally.

The result: War Thunder requests 0.5ms precision, Windows nods politely, and then continues running the global scheduler at 15.6ms. The game feels like it's running through treacle and you get driven mad trying to figure out what new bloat is causing the problem.

---

## How I Found It

Running `powercfg /energy` while your game is open generates a power efficiency diagnostics report. I'd recommend giving it a go and throwing the output HTML file into your friendly neighbourhood AI. Buried in the warnings section was this:

```
Platform Timer Resolution: Outstanding Timer Request
Requested Period: 5000
Requesting Process Path: ...\War Thunder\win64\aces.exe
```

And in the information section, confirming the system hadn't budged:

```
Platform Timer Resolution: Platform Timer Resolution
Current Timer Resolution (100ns units): 156250
```

156250 × 100ns = **15.6ms**. War Thunder was screaming into the void. **Every game will be doing exactly the same.**

---

## The Fix

Microsoft left a backdoor in the registry that restores the old Windows 10 global timer behaviour. It's actually really straightforward, just a nightmare to stumble across. One key, one value:

```
HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\kernel
Value: GlobalTimerResolutionRequests
Type: DWORD
Data: 1
```

Run this in an elevated Command Prompt:

```cmd
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\kernel" /v GlobalTimerResolutionRequests /t REG_DWORD /d 1 /f
```

Then reboot. This key is read by `ntoskrnl.exe` at kernel initialisation. It can't be hot-reloaded, the reboot is not optional.

After rebooting, when your game launches and calls `timeBeginPeriod()`, the kernel will honour it globally. The hardware timer reprograms for the duration of your session. Everything running concurrently (audio drivers, Discord, frame delivery) gets scheduled at that tighter granularity. When you close the game, the system relaxes back to 15.6ms default.

No third party tools. No scheduled tasks. Nothing to maintain. One registry key and done.

---

## Does It Actually Work

Yes. The stutter is gone. Moving windows across the desktop is smooth. Games feel like they should, even in wide open busy scenes, which is exactly where the scheduler tick rate matters most because that's where frame delivery needs to be tightest.

A year of blaming drivers, thermal throttling and overheating, my homelab VM, my browser tabs. One registry key.

If you're on Windows 11 and have persistent microstutter that doesn't correlate with CPU or GPU load spikes, run `powercfg /energy` while your game is running. If you see a timer resolution warning with the current resolution sitting at 156250 while your game is requesting something much lower, you've found your problem.

---

Hope this saves someone else a year of head-scratching. Drop a comment below if you hit any issues.