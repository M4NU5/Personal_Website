---
draft: false
title: Set up a Pi hole on your headless Raspberry Pi
date: 2024-11-09
author: William
category:
  - Tech
tags:
  - Raspberry_Pi
  - Infrastructure
  - Linux
description: Learn how to set up a Pi Hole on your home network to block ads at the DNS level and enjoy an ad-free browsing experience on all devices. This step-by-step guide covers Pi Hole installation using Docker, router configuration, and adding advanced blocklists for enhanced protection.
cover:
  image: Docker_pi_hole.png
  alt: Docker_pi_hole.png
---

## Introduction

We all hate advertisements on the internet. But sadly advertising is a very big portion of revenue of internet companies and is it just me or are they getting more predatory as time goes on? 
Think we can all agree they aren't great. You could add an ad blocker to your browser but that only works on the browser you install it on, plus its lame. 
Do you ever browse on your phone? Did you know you could block all ads on your network? What if i told you there was a way to block Ads at a lower level then just your browser. Stop the facet at the source, diverting that stream of bullshit into a hole never to be seen again! I present to you the Pi Hole.

## WTF is a pi hole

A Pi Hole is an ad blocker that operates on the DNS level. Its like the one you have in your bowser but operates on a lower level, the ads don't even make it to your computer. And because you configure it at your router it allows you to make your home network an ad free zone. Anyone of is connected to your home network after setting this up will automagically have any ads blocked on their phone or whatever else.

## Prerequisites
- [Headless Raspbian installed](/blog/tech/secure-headless-raspberry-pi-on-your-home-network)
- [Docker Installed](/blog/tech/docker-on-headless-raspberry-pi)
- Access to Web gateway with **configurable DNS**

## Step 1: Prepare docker compose

We are going to start with deploying the Pi Hole on our Raspberry Pi. I start by creating a dedicated folder to keep my docker compose file. This is just to keep running applications on my Raspberry Pi separate and manageable. 
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
- **`ports`**: Your web portal, Why 666 because you need to go to hell to find your ads :D 
- **`environment`**: Configures pi environment variables, setting including the claim token that streamlines the initial setup.
- **`volumes`**: Maps files to machine for persistence between container restarts.

## Step 2: Configure router

Now we need to configure our router to use the Pi Hole as our DNS. To do this we need to first connect our router. 
Determine the IP with `ipconfig` or `ifconfig` we can find the IP address of our **default gateway**.
```powershell
PS C:\Users\William> ipconfig
...
Wireless LAN adapter Wi-Fi:

   Connection-specific DNS Suffix  . :
   IPv4 Address. . . . . . . . . . . : 192.168.0.58
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.0.1

Ethernet adapter Bluetooth Network Connection:
...

```

Generally your IP address will be `192.168.0.1`. Typing this into the browser we will hit our gateways login portal. 

Logging in, navigate to the DNS configuration and input the IP address of the Raspberry Pi. Now we are gochie, our Pi hole will start sinking ads into a beautiful black abys.

Note some routers, believe it or not, don't support configuring a DNS! Sad I know. Hopefully you don't have this problem. If you do you will need to configure your DNS on your machine. It doesn't work as well as the Gateway level Pi-Hole but you got to work with what you have. 

## Step 3: Add more ad block lists (optional)

The default block list does the job but you might want to be more or less aggressive with your ad block. This [GitHub repository](https://github.com/hagezi/dns-blocklists) has a whole host of different block lists that you can use to tune your Pi Hole to the degree you want. I chose to go with the Pro Level with this [list](https://raw.githubusercontent.com/hagezi/dns-blocklists/main/domains/pro.txt).

To add the list go to your Pi Hole in your web browser and navigate to the `Adlists`. Paste in the link to the ad block list and add it to your Pi Hole! Just like that your Pi Hole just got that little bit better.

## Conclusion 

Congratulations! We have now successfully deployed and configured our very own Pi Hole that will block most of those pesky ads that the internet is inundated with. Sadly this wont block Youtube ads, I know its inexcusable but we have to work with what we got. 

But what can you do. Go ahead, and check if your Pi Hole is working by navigating to whatever website you like. I find these to be a good test  [CNN](https://edition.cnn.com/) , [FOX](https://www.foxnews.com/)

![awesomegif](https://i.giphy.com/glvyCVWYJ21fq.webp#center)

Smell that crisp ad free experience, god it tastes goood!


