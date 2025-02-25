---
draft: true
title: Linux gaming in 2025
date: 
author: William
category: 
tags: 
description: 
cover:
  image: test
  alt: test
---



So you are considering a switch to linux. We all have these moments in our life.
First time for me was back in my honours year where we were given the choice in the beginning of the year wether we wanted our machine to be formatted with windows or linux.

Having grown up my whole life using windows i chose to get a little linux in my life and installed mint. But not a fuck was i installing it on my own machine. Homie got to play games and wine was not good enough. So if you wanted to do linux gaming you needed a game to be precompiled for linux. Wine wasnt performant enough

Want to code -> Linux
Want dockers -> Linux
Want to AI -> Linux
Want to hack -> Linux
Gaming always fell squarely into the windows realm. 
And anything adobe but thats a sidenote


Skip forward to today and i find myself more and more wanting to use Linux as my daily driver. Effectively if i want to do any side projects or run any container or do anything nerd related i need a Linux

When WSL was relieased it was a god send. I used it to manage docker containers, run code... but the longer you use it you start running into weird edge cases. Like good fucking luck getting a container to work with an AMD GPU through the WSL abstraction. 
Ever tried to mount a network shared drive to a docker container? You cant on windows because docker uses WSL? And you just cant.
Even Ollama is like GLHF get Linux

But what about gaming these days.
Gaming on linux has come a really long way. Valve has put alot of work into it due to the Steam deck. 

Alot of people recommend Fadora if your gaming inclinded. But I was wanting a little bit of a more conviniant plug and play experiance. 

Let me introduce you to Nobara Linux

https://nobaraproject.org/

Download this puppy and burn her to a USB drive. 

Split out a partition on your drive of choice, or just boot into it to give it a try.



### Dual Booting Windows & Linux 

As i was trialing this i wanted to dual boot. This is easier enough.
Dont worry it linux plays nice with the dual booting. Windows is the one that would throw a fit if you do it the other way around
1. Shrink drive size making a partition available
2. Install Linux on empty drive


### How to handle NTFS volumes
I have a data drive with a butt load of data on it. It is however an NTFS formatted drive. One of a few formats supported by Windows most of which are proprioty.  Good thing Linux is compatible. 

Mount it with the following in your /etc/fstab 
Mount the Drive

You may run into issues with permissions. For this we do the following...

### The good
KDE GUI is fucking amazing, you can customise so much and even link your phone which is amazing

Mounting AMD GPUs to running containers

Gaming does work out of the box. If your permissions and everything are set up correctly. It does just work. Even with windows games.
If you do run into any issue or want to see how well a game works you can always 
TK XXX Insert link

### The Meh

Game modding: With the abstraction any modding you do adds potential edge cases to something that is already running through an abstraction.

Dealing with all Linux different installation flows
### The Ugly
The gaming abstraction isn't always smooth sailing. You can run into issues. Whether it be stutters, crashes or any wierd issues you will run into them. 
TK XXX can help with this troubleshooting but it wont always get you what you want. Which makes me think it would just be easier to reboot to windows and not have the problems at all




### Conclusion
In my experiance so far has been great but not without its flaws and drawbacks

Some things just dont work like anything adobe related... 
Sure there are opensource alternatives but i do like then sync functionality






