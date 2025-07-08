---
draft: true
title: 
date: 
author: William
category: 
tags: 
description: 
cover:
  image: test
  alt: test
---
The time has come! docker just isnt doing it for me anymore. 
Its limitations and lack on industory application has driven me to the dark side
Thats right its kubernetes time baby.

I have always wanted to learn kubernetes. and people freak out about how complicated it is.
After diving down this rabbit hole, i would say it is pretty straight forward if youre familiar with containers. There are just some additional pieces you need to learn about that turn you small little docker compose environment to a dynamic reconfigurable cluster. 

There is just one level with docker, there are so many more levels with kubernetes and my god im excuted to learn them all.

Why migrate away from docker?
started running into limitations, in running my plex server on my pi it was struggling to transcode effectively. This meant that i needed to move the cluster over to my primary desktop. 
And this is where the problems started and just wouldnt end.

For my media server it needed to be hosted on a NAS as it was all plugged into my PI
Now get that media server to talk through wsl to your container so you can just serve your media files. HEADACHE.

Now try mount this NAS to your docker containers!

Docker wasnt really built with multihost in mind. It runs on one machine and it does that well. Sure you can docker swarm it but we dont talk about that.


Kubernetes does all of this pretty easily. and mounting NAS to a linux system wierdly just seems to work more seemlessly maybe that is just my bias but hey.


Why chose k3s over k8s?
k3s light weight, i would want to run it on my pi aswell as my desktop


kubernetese only works on linux
 eeyup which is another reason why i wanted to migrate away from windows



Include the plex migration




