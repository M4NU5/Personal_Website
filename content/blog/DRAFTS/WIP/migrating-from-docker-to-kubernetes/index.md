---
draft: true
title: Migrating from docker to Kubernetes
date: 
author: William
category:
  - Tech
tags: 
description: 
cover:
  image: test
  alt: test
---
The time has come! docker just isn't doing it for me anymore. 
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
Installing K3s is super straight forward. Just go here TK and follow the installation guide.



Migrating Plex capability
Migrating Plex was more of a headache however because of how plex works as a platform.
In the docker verse it is easy and straight forward. Expose ports and good to go. In the kubernetes world where you want your cluster to handle your networking for you you run into a problem 

Deploying Plex call out but you cant configure or set it up becuase you need to access the port 32500 directly to get access to the admin panels.
On top of this if if your TV tries to connect to the plex media server which requires port 32500 again your plex client wont be able to find it with a direct conneciton. Your client will fallback to an indirect connection which i think uses Plexes own servers as a sudo proxy / vpn thing that will result in terrible quality video streams... If it even streams at all!

All in all plex is a bad idea if you want kubernetes to handle the networking. It can still be made to work by setting net `nodePort` option on your helm chart. 

This seemingly weird limitation makes sense if you remember that plex is old. Like pre containers old as a platform and hence was built with the idea of running on a VM or directly on tin.

Yes im using helm charts and fuck i forget to mention that. Think of helm charts as the docker compose of kubernetes. But just better in everyway.

I personally didnt want to go down this route as it would take away the flexability that you gain by going down this kubernetes route and plus i dont want to go to a shitty IP when im consuming my media i want to go to a URL where i can access my own netflix. Like a willflix.com you would say... That link goes to a venmo and i do not condone it!


For this reason and a couple others i would recommend if you are looking to use Kubernetes go with Jellyfin. Highly recommened. It isnt as 'feature rich' as plex, other people would call it bloat! Jellyfin gives you exactly whats on the tin nothing less and even a little more then plex in some areas. If you just need a media server capability Jellyfin is for you. It was built in the age of containers so you dont have to fuck around with Plexes weird limitations. Allowing you to lift and shift you infra, push it to a different node on your cluster with no headaches... Well atleast minimal ones :D
Jellyfin recommendation
But deploying and configuring Jellyfin is outside the scope of this blog post. But stay tuned if you have read this far dear reader... Or here is the post right now TK  Arr stack blog post referance

Conclusion
All in all I have zero resovasions migrating from docker to Kubernetes, just like using training wheels when learning to ride a bike docker is the perfect entry point to the container world that we now live in. Hell it is good enough for most use cases and many people will never graduate past it but if you want to grow as an engineer the training wheels need to come off at some point. How else are you going to be able to do cool BMX trick or go on awesome mountainbike trails, Ive gotten a little lost in my bike annalogy. 

anyway, i would highly recommend for anyone who is interested running their own home lab to give K3s a go Its not as crazy complicated as K8s but it doesnt need to be for a home lab usecase.

Now having no lifed this migration for longer then i would like to admit im going to go touch grass before I have a mental break talking about the differances between nginx, Trefieak and reverse proxies. Which i think we can all agree no one knows how reverse proxies work!!!!




