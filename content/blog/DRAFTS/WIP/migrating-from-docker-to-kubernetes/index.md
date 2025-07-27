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
Its limitations and lack of industry application has driven me to the dark side, thats right its Kubernetes time baby.

I have always wanted to learn Kubernetes, people freak out about how complicated it is but with a little effort it can be understood like all things.
After diving down this rabbit hole, I would say it is pretty straight forward if you're familiar with containers. There are just some additional pieces you need to learn about that turn your small docker compose environment to a dynamic reconfigurable cluster that can do kickflips. But is nothing that cant be overcome.

Let me put it another way, docker feels like one level, maybe two if you count docker swarm. Compare that to Kubernetes it feels like I'm staring down a black hole of complexity that works with black magic and gnomes... and oh am I excited to dive down it!

### Why migrate?
Limitations!
Main reason was I wanted to integrate a Network Attached Storage (NAS) to your container? 
In dockers world this is weirdly difficult and brittle to implement.
Want to dynamically move containers to another machine? 
You can use swarm but that just doesnt feel right you know.

Relevant industry training. I was wanting to familiarize myself more with the Kubernetes ecosystem. Not that I use it in my day to day professional life but I'm a step away and sometimes do need to get my hands dirty with Kubernetes. And there is nothing more embarrassing then forgetting basic kubectl usage in front of the principle SRE.

![https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHNmdWFrd3ZseHo4bnZuOXE4MDNpejY0MzR2ZDg1dXRkMHM1eTM4ayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/XZVLh9Mq9HY0ww6wnm/giphy.gif](https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHNmdWFrd3ZseHo4bnZuOXE4MDNpejY0MzR2ZDg1dXRkMHM1eTM4ayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/XZVLh9Mq9HY0ww6wnm/giphy.gif#center)

Also don't get me started on the WSL abstraction Docker uses to function that was causing me weird abstraction headaches which made me jump to using Linux as my daily driver. Check out ranting about that here my post about that experience TK

As you know [my plex server](/blog/tech/plex-server-on-headless-raspberry-pi/) hosted on my raspberry pi has limited CPU capacity. This made me want to migrate the plex server to my primary machine but couple a windows machine running docker through WSL, a NAS hosted through the raspberry pi with a sprinkle of GPU hardware acceleration... It was a hair pulling mess that I lost to many hours that I would care to admit to. 

Docker wasnt really built with multihost in mind. It runs on one machine and it does that well. Sure you can docker swarm it but we dont talk about that.

![https://en.meming.world/images/en/thumb/a/a3/We_Don%27t_Do_That_Here.jpg/450px-We_Don%27t_Do_That_Here.jpg](https://en.meming.world/images/en/thumb/a/a3/We_Don%27t_Do_That_Here.jpg/450px-We_Don%27t_Do_That_Here.jpg#center)

Kubernetes on the other hand is built with flexibility and modularity in mind. Making all these listed issues pretty easily to deal with. Mounting a NAS, Kubernetes has got you covered. Dynamically moving containers between nodes in your cluster? Bitch do you even know what Kubernetes is?

Hell everything on Linux is just easier, I just get weirdly frustrated with Windows and macOS ecosystems these days... But thats a rant for another day

So the question comes what flavour of Kubernetes? I decided on K3s and heres why.

### Why k3s over k8s?
k3s is light weight and built for running on smaller systems. "but William" I here you squeal "aren't you running the cluster on your main PC". I want a multi node cluster not only because of resiliency but the experience gained configuring it and its cool. That is why k3s is well suited to run on my existing pi allowing me to easily add a node to my cluster.


### kubernetese only works on linux
This migration was a bigger inititave then just deploying kubernetes. I needed to change my whole daily driver from windows to linux. I had other reasons check them out here TK 
 eeyup which is another reason why i wanted to migrate away from windows



### Setting up K3s on linux
Installing K3s is super straight forward. Just go here TK and follow the installation guide.



#### Migrating Plex capability
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

### Conclusion
All in all I have zero resovasions migrating from docker to Kubernetes, just like using training wheels when learning to ride a bike docker is the perfect entry point to the container world that we now live in. Hell it is good enough for most use cases and many people will never graduate past it but if you want to grow as an engineer the training wheels need to come off at some point. How else are you going to be able to do cool BMX trick or go on awesome mountainbike trails, Ive gotten a little lost in my bike annalogy. 

anyway, i would highly recommend for anyone who is interested running their own home lab to give K3s a go Its not as crazy complicated as K8s but it doesnt need to be for a home lab usecase.

Now having no lifed this migration for longer then i would like to admit im going to go touch grass before I have a mental break talking about the differances between nginx, Trefieak and reverse proxies. Which i think we can all agree no one knows how reverse proxies work!!!!




