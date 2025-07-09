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
Its limitations and lack of industory application has driven me to the dark side
Thats right its kubernetes time baby.

I have always wanted to learn kubernetes. and people freak out about how complicated it is.
After diving down this rabbit hole, i would say it is pretty straight forward if you're familiar with containers. There are just some additional pieces you need to learn about that turn you small little docker compose environment to a dynamic reconfigurable cluster. But is nothing that cant be overcome.

When it comes to docker it feels like there is one level, maybe two if you count docker swarm. Compare that to Kubernetes it feels like im staring down a black hole of complexity that works with black magic and gnomes... and oh am I excited to dive down it!

Why migrate away from docker?
The main reason is I started running into limitations. Want to integrate a NAS to your container? 
Rather mount it on your machine then add the drive.
Want to dynamically move containers to another machine? You can swarm but that just doesnt feel right.
relevant industry training. I was wanting to familirise myself more with the Kubernetes ecosystem. Not that i use it in my day to day professional life but im a step away and sometimes do need to get my hands dirty with kubernetes. And there is nothing more embarising then forgetting basic kubectl transversal infront of the principle SRE.

I was also spered on due to the abstraction that is taking place under the hood on windows machines where in truth Docker is using wsl to make things work. Which was causing me wierd abstraction headaches which made me jump to using linux as my daily driver. Check out my post about that experiance TK

As you know TK my plex server is hosted on my PI which is really limited in its CPU capacity. This made me want to migrate the plex server to my primary machine but cupple a windows machine running docker through WSL with a NAS hosted through the pi is a hair pulling mess that i lost to many hours that i would care to admit to. 

For my media server it needed to be hosted on a NAS as it was all plugged into my PI
Now get that media server to talk through wsl to your container so you can just serve your media files. HEADACHE.

Now try mount this NAS to your docker containers!

Docker wasnt really built with multihost in mind. It runs on one machine and it does that well. Sure you can docker swarm it but we dont talk about that.

TK (We dont do that here)


Kubernetes on the other hand is built with flexability and modularity in mind. Making all these listed issues pretty easily yto deal with. and mounting NAS to a linux system wierdly just seems to work more seemlessly maybe that is just my bias but hey.


So the question comes what flavour of kubernetes am i going to dabble in? K3s and heres why

Why chose k3s over k8s?
k3s is light weight and built for running on smaller systems, But william i here you squeel arent you running the cluster on your main PC. I would still like to run my own cluster so i can expose myself to a multi node kubernetes environment not only because of resiliancy or whatever but just because it will be pretty cool to run my own kubernetes cluster. Due to k3s lightweight nature i is wellsuited to run on my existing pi enabling me to easily add a node to my cluster.


kubernetese only works on linux
This migration was a bigger inititave then just deploying kubernetes. I needed to change my whole daily driver from windows to linux. I had other reasons check them out here TK 
 eeyup which is another reason why i wanted to migrate away from windows



Setting up K3s on linux

Migrating Plex capability

Why plex is a bad idea in Kubernetes

Jellyfin recommendation

Arr stack blog post referance

Conclusion




