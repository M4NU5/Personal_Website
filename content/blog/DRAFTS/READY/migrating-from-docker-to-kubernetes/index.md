---
draft: true
title: Docker Just Isn't Cutting It
date: 2025-08-06
author: William
category:
  - Tech
tags:
  - Linux
  - Kubernetes
  - Docker
  - Home-Lab
description: 
cover:
  image: test
  alt: test
---
The time has come
## Docker Just Isn't Cutting It
That's right. I’ve crossed over. Docker just isn’t doing it for me anymore.  
The limitations, the lack of flexibility, the industry drift it’s all driven me to the dark side.

It’s Kubernetes time, baby.

I’ve always wanted to learn Kubernetes. People act like it’s dark magic, but like all complicated things a bit of effort goes a long way. After diving into the rabbit hole, I’d say it’s pretty straightforward _if_ you’re already comfy with containers. It’s just Docker Compose with extra bells, knobs, and the ability to do kickflips. Nothing you can’t learn.

Let me put it another way: Docker feels like level one. Maybe level two if you count Swarm (lol). Kubernetes? It’s a whole-ass galaxy. A black hole of features powered by gnomes and arcane scheduling spells. And I am here. For. It.

## Why Migrate?

### Limitations, mostly.

Want to mount a Network Attached Storage (NAS)?  
Docker makes this _weirdly_ painful and brittle.

Want to move a container to another machine on the fly?  
Sure, Docker Swarm _exists_, but using it just feels... off. You know?

Also, industry relevance. I don’t use Kubernetes daily, but I’m often one step away. Sometimes I have to get my hands dirty. And there’s _nothing_ more embarrassing than blanking on basic `kubectl` commands in front of the Principal SRE.

![https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHNmdWFrd3ZseHo4bnZuOXE4MDNpejY0MzR2ZDg1dXRkMHM1eTM4ayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/XZVLh9Mq9HY0ww6wnm/giphy.gif](https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHNmdWFrd3ZseHo4bnZuOXE4MDNpejY0MzR2ZDg1dXRkMHM1eTM4ayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/XZVLh9Mq9HY0ww6wnm/giphy.gif#center)

### Also... WSL broke me.

Docker on Windows via WSL is a cursed abstraction that gave me endless headaches. That eventually pushed me to switch to Linux as my daily driver honestly, best decision I’ve made.  
I documented thoughts and the chaos [in this post](/blog/tech/linux-gaming-in-2025/).

And you know [my Plex server](/blog/tech/plex-server-on-headless-raspberry-pi/)? It runs on a Raspberry Pi, which means limited CPU. I wanted to migrate it to my main machine...  
But then came the hell-storm:

- Windows + Docker via WSL
- NAS hosted through the Pi
- GPU hardware acceleration
- And Plex being Plex...

It was a nightmare. A hair-pulling, time-sucking mess I wouldn’t wish on my worst enemy.

Docker is solid but it's single-host at heart.  
Swarm?

![https://en.meming.world/images/en/thumb/a/a3/We_Don%27t_Do_That_Here.jpg/450px-We_Don%27t_Do_That_Here.jpg](https://en.meming.world/images/en/thumb/a/a3/We_Don%27t_Do_That_Here.jpg/450px-We_Don%27t_Do_That_Here.jpg#center)

## Why Kubernetes?

Kubernetes is designed for modularity and flexibility. That makes all the above issues easier:
- Mount a NAS? Easy.
- Dynamically move containers? Duh.
- Cluster management? Built-in.

Honestly, Linux just _makes more sense_. Every time I touch Windows or macOS these days I get irrationally angry but that’s a rant for another post.

## Why K3s Over K8s?

I went with [K3s](https://docs.k3s.io/quick-start), the lightweight Kubernetes distro built for smaller systems.

“But William,” I hear you squeal, “aren’t you running this on your main PC?”

Yes. But I want a _multi-node_ cluster not just for resiliency, but because it’s cool and I get to learn more. And K3s runs beautifully on a Raspberry Pi. That makes it super easy to add nodes.

Installation is stupid simple really, just go [here](https://docs.k3s.io/quick-start) and follow the guide. You will be ready to go in minutes!

## Plex on Kubernetes... Is Rough

Migrating Plex was more of a headache than I expected and it’s Plex’s fault.

On Docker? Expose a few ports and you’re done.  
On Kubernetes, where networking is more dynamic? You hit snags.

To _configure_ Plex, you need direct access to port `32500`.  
Your TV also connects via that port, and if it can't, it falls back to indirect mode using Plex's weird cloud proxy thing—hello terrible quality, or no playback at all.

So what do you do?

Well, you can expose port `32500` using `nodePort` in your Helm chart. That bypasses the Kubernetes load balancer and binds directly to your host port just like Docker.

It works. But it feels... wrong.

Plex is old-school. It was built in 2007 six years before Docker was even a thing. So yeah, it assumes everything runs on one box.

And yes, I’m using Helm Charts—think of them as Docker Compose for Kubernetes, just better in every way. Moving on. 😄


### Maybe Use Jellyfin Instead?

Jellyfin isn’t quite as _feature-rich_ as Plex but that’s a plus in my book. Some people would say Plex is bloated anyway.

Jellyfin was born in the age of containers. That means it Just Works™ with Kubernetes.  
Want to redeploy to a different node? No problem.  
No weird port forwarding. No proxy black magic.
Want to expose it behind a URL instead of an IP? 
We all want our own Netflix like a **willflix.com** in my case
_(Note: that domain currently links to a random Venmo. I do not condone it. But I respect the hustle.)_

For these reasons and a few more... I _highly_ recommend Jellyfin if you’re planning a Kubernetes-based media server.

(And yes, I’m working on a full Jellyfin-on-Kubernetes guide. Stay tuned!)

## Conclusion: No Regrets

I have zero regrets about moving from Docker to Kubernetes even if it meant switching from Windows to Linux.

Docker is the training wheels of the container world.  
It’s good enough for many use cases and if that’s all you need, awesome.  
But if you want to grow as an engineer... eventually, the wheels need to come off.

That’s how you start doing BMX tricks or mountain biking.  

Anyway if you’re looking to build a home lab and want something more powerful and dynamic, give K3s a shot. It’s not as scary as full-blown Kubernetes, but it gives you _almost_ everything you’d want.

Now, after no-lifeing this migration longer than I care to admit, I’m off to touch some grass before I spiral into a monologue about ingress controllers or the true nature of reverse proxies (which, let’s be real, no one actually understands).