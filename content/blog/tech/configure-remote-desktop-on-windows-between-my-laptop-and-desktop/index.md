---
draft: false
title: Set Up Windows Remote Desktop (RDP) and Secure Access with VPN
date: 2023-12-12T08:51:09+00:00
author: William
category:
  - Tech
tags:
  - Infrastructure
  - Windows
cover:
  image: desktop_plus_laptop.png
  alt: EpicDesktopPic.png
description: Learn how to set up Windows Remote Desktop Protocol (RDP) for seamless access to your powerful desktop from a laptop, even while traveling or dealing with power outages. This guide covers enabling RDP on Windows Pro, resolving common RDP issues like the black screen, and securing remote access with Tailscale VPN. Perfect for those needing a remote connection to their desktop without relying on third-party software, ensuring a smooth, reliable experience wherever you are. Simplify remote access and stay productive on the go.
---
So I’m visiting my family back in my home country which is currently experiencing daily power cuts, FUN! And as much as i love my chonky desktop there is not a flying fuck im lugging it all the way home. That is what we have laptops for! Saddly my desktop is x10 more powerful than my cafe warrior of a laptop so any cheeky hacking i might want to do will be severly limited...

So the only rational solution was proposed to me by a colleague at work, thank you Sam, for me to configure my desktop for RDP and connect to it from my laptop whenever I'm feeling feisty or want to do anything that would make my cafe warrior into a worrier!

I decided to go with using the native **Windows Remote Desktop Protocol** (RDP) service instead of a third-party solution like TeamViewer because I have run into problems with these before. Plus having the reduced complexity just makes everything better right?!

First things first you need to have **Windows Pro to enable RDP**. Luckily you only require Windows Pro on the device you want to connect to, my desktop, as you can only enable RDP service on Pro. If you do have the right version of Windows the setup is pretty simple.

[Windows Guidelines](https://support.microsoft.com/en-us/windows/how-to-use-remote-desktop-5fe128d5-8fb1-7a23-3b8a-41e636865e8c#:~:text=When%20you're%20ready%2C%20select%20Start%20%3E%20Settings%20%3E%20System,turn%20on%20Enable%20Remote%20Desktop.)  
**Select Start &gt; Settings &gt; System &gt; Remote Desktop, and turn on Enable Remote Desktop**

I have Windows configured with my Microsoft account, so that is what we will be using to log into the computer remotely. I also suggest you make this password really complex as this is providing remote access to your computer.  
Now if you’re on your local network you can try and RDP to your desktop using your computer’s name or IP address. You can find this in **powershell** by either `**$env:computername**` or `**ipconfig**`.

![CoolImage](https://i.imgur.com/0H0xgTJ.png?resize=493%2C185&ssl=1#center)

Now I can connect to \\\\BigChungus however my RDP session shows only a black screen. After a bit of digging, it turns out to be a **Windows RDP policy issue**.

This is fixed with the following steps partly mentioned [here](https://answers.microsoft.com/en-us/windows/forum/all/use-remote-desktop-while-also-logged-in-windows-11/0794e410-0ea4-4cc8-987b-a5aff212df5f), namely:

1. Open the Local Group Policy Editor with **Win + R** (**gpedit.msc**)
2. Go to **Computer Configuration &gt; Administrative Templates &gt; Windows Components &gt; Remote Desktop Services &gt; Remote Desktop Session Host &gt; Connections**
3. **Enable** the “Allow users to connect remotely using Remote Desktop Services” policy.
 
We can now connect to our desktop from our laptop from anywhere on my local network but how can we do this from the other side of the world? Well, it’s not port forwarding I dont want to expose a port for the whole world to see instead I’m going to set up a **Virtual Private Network** (VPN). And before you ask no I’m not about to try to configure my own VPN from scratch, as I stated before I want to keep things simple. For my use cases, I have decided to go with **[tailscale](https://tailscale.com/compare/build-it-yourself/)**. It’s super simple to set up, install it on both the laptop and desktop, log in to my account and wham bam thank you mam. Now if I type in the IP address of BigChungus we connect to it. WINNING!!!

We are pretty much good to go but a couple more housekeeping items to think about.

1. Make sure the desktop’s power settings are set so the desktop never goes to sleep.
2. Set up auto login as there is always a chance that your machine restarts.   
  I’M LOOKING AT YOU WINDOWS UPDATES!!!!  
  This [guide](https://answers.microsoft.com/en-us/windows/forum/all/how-to-login-automatically-to-windows-11/c0e9301e-392e-445a-a5cb-f44d00289715)<span style="font-size: 16px;"> does a great job of explaining how to set this up.</span>
 
And we are done, now I can be anywhere in the world with an internet connection and my laptop and RDP to my desktop whether I’m flying home or going down to the local cafe. FANTASTIC!

![CelebrationImage](https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmJtY3ZrdTZkaHZzaWR6ODlpYnM3Nmx3ODNlYTVuYmhtbTc1cnBiNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/8OqgB15nDMjX8c05tY/giphy.gif#center) 

It would be cool if i could have written my OSCP using this but the proctor being unable to track and confirm it is in fact me writing the exam due to the RDP... So big sad I know...
Anyway, thanks for reading this far! Now go touch grass 😁