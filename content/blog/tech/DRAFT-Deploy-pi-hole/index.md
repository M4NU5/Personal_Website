---
draft: true
title: Set up a Pi hole on your headless Raspberry Pi
date: 2024-08-18
author: William
category:
  - Tech
tags: 
description: 
cover:
  image: test
  alt: test
---

## Introduction

We all hate adverts on the internet. But sadly advertising is a very big portion of revenue of internet companies. We hate it and either have to pay for no ads or install an ad blocker. These block ads that make it to our browser and that doesn't even solve the problem of doing this with your phone. What if i told you there was a way to block Ads at the DNS level. Stop the focit at the source before it even gets to your machine! If you haven't heard of it already I present you the Pi Hole.

## WTF is a pi hole

A Pihole is an ad blocker like the one you have in your bowser but it operates on the network-level. This allows your home network to be an ad free zone for anyone who is connected to it no matter if they are on their phone or whatever else. 


## Prerequisites
- Docker / Containerized environment to deploy to.
- Access to Web gateway with **configurable DNS** 


## Step 1: Prepare docker compose

We are going to start with deploying the PiHole on our Pi then do the respecive


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
      # - "67:67/udp" # Only required if you are using Pi-hole as your DHCP server
      - "666:80/tcp"
    environment:
      TZ: 'America/Chicago'
      WEBPASSWORD: 'set a secure password here or it will be random'
    # Volumes store your data between container upgrades
    volumes:
      - './etc-pihole:/etc/pihole'
      - './etc-dnsmasq.d:/etc/dnsmasq.d'
    #   https://github.com/pi-hole/docker-pi-hole#note-on-capabilities
    #cap_add:
    #  - NET_ADMIN # Required if you are using Pi-hole as your DHCP server, else not needed
    restart: unless-stopped
	```



## Step 2: Configure router

Now we need to configure our router to use the Pi Hole as our DNS. To do this we need to connect our router. 
With `ipconfig` or `ifconfig` we can find the IP address of our default gateway. Generally your IP address will be `192.168.0.1`. Typing this into the browser we will hit our gateways login portal. 

Logging in, navigate to the DNS configuration and input the IP address on the Raspberry Pi. 

Note some routers, believe it or not, don't support configuring a DNS sad I know. Hopefully you don't have this problem. If you do you will need to configure your 




## Step 3: Add more ad block lists (optional)


## Conclusion 





