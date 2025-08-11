---
draft: true
title: Getting OBS to work on wayland
date: 
author: William
category: 
tags: 
description: 
bskyid: 
cover:
  image: test
  alt: test
---
Ive been loving the linux world, having it as my main driver day to day is a breath of freash air and flexability afforded by thee platform

Fedora life has been good

and today we are solving an issue that Ive run into when running OBS.
This issue is spesifically when you are using wayland as your GUI deiver 

OBS requirest x11 to provide its flexable docking functionlaity. Now with wayland this is not available. Not bevuase of OBS but its an upsteam issue of TK
[https://github.com/obsproject/obs-studio/issues/9369](https://github.com/obsproject/obs-studio/issues/9369)


Now being linux there is a way to get what we want. Introducing xwayland who is here to save the day.
firstly we need to see if its installed

Next we need to force OBS to use it.

For this we must ask where or how is OBS installed?
If Flatpak we need to uninstall. You can figure out how to install xcb into your flatpak envionrment but tbh i couldnt figure this out.

That would involve some complexity that i dont want to deal with


Insead i suggest the seccond route. Reinstalling OBS on your general envionrment
I know this is against the recommendation of OBS but we got to do what we got to do to get this working 


Fistly we need to see if xwayland is running. The following command will show if we have it installed
```
ps -e | grep Xwayland
```

Next we need to install obs and dont forget to uninstall the flatpak install

```
sudo dnf install obs-studio
```

finally we need to force OBS to use xwayland

for me i use KDE as my GUI 
going to my start bar and edit application of OBS  

![[Pasted image 20250805224026.png]]