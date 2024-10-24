---
draft: true
title: Set up a Pi hole on your headless Raspberry Pi
date: 2024-10-22
author: William
category:
  - Tech
tags: 
description: 
cover:
  image: Docker_pi_hole.png
  alt: Docker_pi_hole.png
---

## Introduction

We all hate adverts on the internet. But sadly advertising is a very big portion of revenue of internet companies. We hate it and either have to pay for no ads or install an ad blocker. These block ads that make it to our browser and that doesn't even solve the problem of doing this with your phone. What if i told you there was a way to block Ads at the DNS level. Stop the focit at the source before it even gets to your machine! If you haven't heard of it already I present you the Pi Hole.

## WTF is a pi hole

A Pihole is an ad blocker like the one you have in your bowser but it operates on the network-level. This allows your home network to be an ad free zone for anyone who is connected to it no matter if they are on their phone or whatever else. 


## Prerequisites
- Docker / Containerized environment to deploy to.
- Access to Web gateway with **configurable DNS** 


## Step 1: Prepare docker compose

We are going to start with deploying the Pi-Hole on our Pi. I start by creating a dedicated folder to keep my docker compose file. This is just to keep running applications on my raspberry pi separate and manageable. 
```mkdir pi_hole && cd pi_hole```
Now we make the compose file and input the following.
```vim compose.yaml```

```bash
# More info at https://github.com/pi-hole/docker-pi-hole/ and https://docs.pi-hole.net/
services:
  pihole:
    container_name: pihole
    image: pihole/pihole:latest
    # For DHCP it is recommended to remove these ports and instead add: network_mode: "host"
    ports:
      - "53:53/tcp"
      - "53:53/udp"
        #- "67:67/udp" # Only required if you are using Pi-hole as your DHCP server
      - "666:80/tcp"
    environment:
      TZ: 'America/Chicago'
      WEBPASSWORD: '<PASSWORD>'
    # Volumes store your data between container upgrades
    volumes:
      - './etc-pihole:/etc/pihole'
      - './etc-dnsmasq.d:/etc/dnsmasq.d'
    #   https://github.com/pi-hole/docker-pi-hole#note-on-capabilities
    #cap_add:
      #  - NET_ADMIN # Required if you are using Pi-hole as your DHCP server, else not needed
    restart: unless-stopped
	```

To explain the components of this file: 
- **`image`**: Specifies the official Pi-Hole docker image.
- **`ports`**: Set port to 666 because I want to send all ads to hell :D
- **`environment`**: Configures pi environment variables, setting including the claim token that streamlines the initial setup.
- **`volumes`**: Maps files to machine for persistence between container restarts.



## Step 2: Configure router

Now we need to configure our router to use the Pi Hole as our DNS. To do this we need to connect our router. 
With `ipconfig` or `ifconfig` we can find the IP address of our default gateway. Generally your IP address will be `192.168.0.1`. Typing this into the browser we will hit our gateways login portal. 

Logging in, navigate to the DNS configuration and input the IP address of the Raspberry Pi. Now we are gochie, our Pi hole will start sinking ads into a beautiful black abys.

Note some routers, believe it or not, don't support configuring a DNS! Sad I know. Hopefully you don't have this problem. If you do you will need to configure your DNS on your machine. It doesn't work as well as the Gateway level Pi-Hole but you got to work with what you have. 


## Step 3: Add more ad block lists (optional)






## Conclusion 


Congratulations! We have now successfully deployed and configured our very own Pi-Hole that will block most of those pesky ads that the internet is inundated with. You can check if your Pi-Hole is working by going to whatever site you might fancy to see if ads are being blocked.
Personlly I used cnn.com and fox
Saddly this wont block Youtube ads, I know its inexcusable


