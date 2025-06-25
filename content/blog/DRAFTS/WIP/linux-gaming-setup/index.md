---
draft: true
title: Linux gaming in 2025
date: 2025-06-07
author: William
category: 
tags: 
description: 
cover:
  image: Steam-Linux.webp
  alt: Steam-Linux.webp
---


So you are considering a switch to Linux. We all have these moments in our life.
First time for me was back in my honours year where we were given the choice in the beginning of the year whether we wanted our machine to be formatted with windows or Linux.

Having grown up my whole life using windows I chose to get a little Linux in my life and installed mint. But not a fuck was I installing it on my own machine. Homie got games play and the idea of using wine was laughable. Linux gaming was only possible with games that were precompiled for Linux. 

But as my technical abilities have matured over the years my mind always comes back to linux as my primary driver. Think of all the benifits!Its a better environment in so many ways

Want to code -> Linux

Want containers -> Linux

Want to AI -> Linux

Want to hack -> Linux

Gaming always fell squarely into the Windows realm. 
And anything adobe but thats a sidenote.

I know there are Windows implementaitons for what i have listed out and you can make it work. Really well even, but i have always preferred the Linux way of doing things. You even see these days that Windows is going the way of Linux with **wget** and even adding it lock stock and barrel with **wsl**. Now dont get me wrong you can get by with **wsl** I used it for everyday for managing docker container, running code etc. but the longer i used it the more weird edge cases i ran into. Like good fucking luck getting a container to work with an AMD GPU through the WSL abstraction. Even Ollama is like GLHF get Linux!

It is for this reason I find myself more and more wanting to use Linux as my daily driver. Effectively if i want to do any side projects or do anything other then game the answer is Linux. But what about gaming these days?
Gaming on Linux has come a really long way. Valve has put alot of work into it due to the Steam deck. 

A lot of people recommend Fedora if your gaming inclined. But I was wanting a little bit of a more convenient plug and play experience. Let me introduce you to Nobara Linux.

https://nobaraproject.org/

This is a modified version of Fedora Linux that comes pre-installed with a lot of the Linux gaming bullshit preconfigured this includes WNE, Proton, Nvidia drivers and much more!

So I downloaded this puppy and burnt her to a USB drive and booted into her to click around. Personally i really liked the KDE feel and chose to go ahead, splitting out a partition on my drive of choice.


### Dual Booting Windows & Linux 

As I was trialing this I wanted to dual boot. This is easy enough Linux plays nice with the dual booting. Windows is the one that would throw a fit if you do it the other way around
1. **Shrink** drive size making a partition available.
2. Install Linux on **empty drive partition**.
3. Disable **Secure Boot** in BIOS.

### How to handle NTFS volumes
I have a data drive with a butt load of data on it. It is however an NTFS formatted drive. One of a few formats supported by Windows most of which are propriety.  Good thing Linux is compatible, it sure isn't ideal but it can be made to work and its the best option if you want a windows compatible drive. 

You can mount the drive in your `/etc/fstab` 
If you want details of how I have mounted my drive check out [my other writeup](/blog/tech/fix-steam-issues-on-linux/#mounting-your-ntfs-drive-the-right-way) where I was looking to execute games from the other drive. Following this piece of the guide will help you all the way there 

You may run into issues with permissions. For this we do the following...

Anyhow without further adue, here is my 2 cents on the good, the bad and the ugly of linux gaming

### The good

The package manager experience with Linux is second to none. Sure you need to use a terminal but thats all very basic. Its so superior you even find windows going that route with wget and chocolate

Small scripts are just easier to setup and run

Windows is far from privacy focused and you actively have to say no at every turn to get some sembilance of privacy. You dont have this problem with Linux at all

KDE GUI is fucking amazing, you can customise so much and even link your phone to it with an app through which you can execute terminal commands on your machine!

Mounting AMD GPUs to running containers (For the AI people out there)

Gaming does work out of the box. If your permissions and everything are set up correctly. It does just work. Even with windows games.
If you do run into any issue or want to see how well a game works you can always 
TK XXX Insert link

Not being windows... I dont know what it is but lately i have run into so many limitations with the windows platform that it is actully starting to annoy me. Maybe it is my fimiliarity with a linux terminal which allows me to troubleshoot issues better but with windows i can feel the bloat of the OS building and building.



### The Meh

GPU drivers can be a little weirder to setup on Linux, Naboro does come with this solved though.

Not all games will work. Thats right, even though linux gaming has come a long way not all games play nicely. You may need to tune some settings for your game. Or your a lucky one where its not supported at all.
Im an escape for tarkov enjoyer and there is no way i can play it on my linux system without the anti cheat coming down on my head.

Game modding: With the abstraction any modding you do adds potential edge cases to something that is already running through an abstraction. hench modding can be a little difficult on linux



The linux terminal, Ususally i would put this in good but these days we have wsl and powershell on windows side that levels the playing field. somewhat atleast. Im still way more of an advicate for the linux terminal

Media support is somewhat limited sure linux has OBS but if you want to use anything link lightroom or DaVinci resolve you are running though emulators and it is a little janky.
For lightroom if you choose to go the webapp route you get reduced features


Dealing with all Linux different installation flows
### The Ugly
The gaming abstraction isn't always smooth sailing. You can run into issues. Whether it be stutters, crashes or any wierd issues you will run into them. 
TK XXX can help with this troubleshooting but it wont always get you what you want. Which makes me think it would just be easier to reboot to windows and not have the problems at all

Because of these limitations you will always have to have windows ready to go incase your friends want to play that one game that just doesnt seem to play nice with linux. no matter how hard you try.

AntiCheat now becomes your enemy. Lots of popular multiplayer games running kernal level anti cheats like EasyAntiCheat or battleeye dont play nice with emulators. Meaning games like Tarkov I have to play on windows even if i could run it though the emulator just because i dont want my account banned 

Nabara in partifular is a flavor of fedora. This is all fine as it comes with a preinstalled and preconfigured setup. and TKXX has done and continue to do an amazing job at maintaining and building on the OS. 
But because it is a flavour I have run into some situations where that packages that are being installed are a little on the old side. and figuring out how to update or overwrite your default repositories that you are looking to pull from is not a fun task and almost caused me to have to reinstall my OS.

Your system can turn into a frankenstine with all the different installation methods. Each one having their own install and removal flows. For new users this can be really confusing. 
Nabara does a good job of having system updates and flatpack updates as a single 'App' but it can get out of hand. And as an experianced linux user i have to stop myself from letting my frankenstine monster of a PC from getting out of hand




#### 5. **Link Recommendations / Resources**

You mention adding TK links—here are ideas for what to actually put there:

- [ProtonDB](https://www.protondb.com/) — Check Linux game compatibility
- [Lutris](https://lutris.net/) — Manage Wine/Proton installations
- [Steam Deck Guide](https://www.steamdeckhq.com/) — Great source of Linux-compatible game setups
- [r/linux_gaming](https://www.reddit.com/r/linux_gaming/) — Helpful community
- WineHQ AppDB — Wine compatibility tracker
- [Level1Techs](https://www.youtube.com/c/Level1Techs) — Great Linux gaming and dev content

#### 6. **Add a “My Setup” Section**

People love knowing what exactly you’re working with. Include:
### My Setup 
- **Distro**: Nobara KDE (Fedora-based) 
- **CPU**: Ryzen 5800X 
- **GPU**: AMD RX 6800 XT 
- **RAM**: 64GB DDR4 
- **Storage**: NVMe 450GB (Linux), 450GB (Windows), 4TB Data drive
- **Use Case**: Coding (AI/ML), Docker, gaming (Tarkov, Elden Ring, etc.)`

---

### Conclusion 

So thats all good william i hear you say. So who is this life for? I would say everyone, but some people will make the transision easier then others and some might go down the middle road like me which can seem quite daunting if you have never done it before. 

If your a developer, a tinkerer or techie go for it, im suprised you have read this far. 
If your sick of windows bloat and being locked in make the change. 

If youre a being AAA gamer playing multiplayer games you will most probably run into some problems. This can be solved by the middle way of dual boot. and if youre like me with an NVMe your boot times are rediculiously quick so it isnt a drawback if you need to quickly switch OS

But one thing i will say could be a showstopper for people is if you go down the linux path you need to be comfortable with the terminal, or willing to learn it and be happy to troubleshoot weird issues you run into. 

These days with AI it can help you troubleshoot issues alot easier but it still is a thing to keep in mind.

### Conclusion
In my experiance so far has been great but not without its flaws and drawbacks. At the end of the day it is a trade off as in all things. I myself am a techie and enjoy tinkering and learning more and more about computers. Often this road leads me to linux where you can operate in a more flexible and free manner 

Im going to keep linux as my primary driver for my day to day. but ill always have to keep windows on hand incase of emergancies or wierd edge cases that arent solvable on linux. 

Ultimitly its down to what you want to use your system for. As my skills have matured i have found the need to have both operating systems available to me for different reasons.

There are somethings you just cant do on windows that you can do on linux there are things you cant do on linux (though fewer) that you can do on windows.

Some things just dont work like anything adobe related... 
Sure there are opensource alternatives but i do like that sync functionality

