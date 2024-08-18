---
draft: true
title: "Hack the Box #6 - Sea w/o Metasploit"
date: 2024-08-16
author: William
category: 
tags: 
description: 
cover:
  image: test
  alt: test
---


## Enumeration 

Starting with a nmap

```bash
└──╼ [★]$ nmap -sV -p- 10.10.11.28 -oN nmap.scan
...
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.11 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Lets see what the whats been hosted on the webserver. In clicking around we run into a contacts page that requireds the url `sea.htb` adding this to our hosts file we hit the contacts page.
The page does post 

