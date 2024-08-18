---
draft: true
title: 
date: 2024-08-18
author: William
category: 
tags: 
description: 
cover:
  image: test
  alt: test
---

## Introduction

We all hate adverts on the internet. But saddly advertising is a very big portion of revinue of internet companies. We hate it and either have to pay for no ads or install an ad blocker. These block ads that make it to our browser and that doesnt even solve the problem of doing this with your phone. What if i told you there was a way to block Ads at the DNS level. Stop the focit at the source before it even gets to your machine! If you havent heard of it already i present you the Pi Hole

## Prerequisites
- Docker / Containerized environment to deploy to.
- Access to Web gateway 


__

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