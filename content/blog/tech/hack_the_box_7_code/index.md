---
draft: false
title: "Hack the Box #7 - Code without Metasploit"
date: 2025-04-07
author: William
category: Tech
tags:
  - Linux
  - Security
  - Hacking
description: 
cover:
  image: Code.png
  alt: Code.png
---

This was a fun little box that was on the season 7 rotation of Hack the Box that involved some python manipulation. 

## Enumeration
After starting up the box lets see what we are dealing with.


```bash
└─$ nmap -sV -p- 10.10.11.62
Starting Nmap 7.95 ( https://nmap.org ) at 2025-03-28 10:42 EDT
...
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.12 (Ubuntu Linux; protocol 2.0)
5000/tcp open  http    Gunicorn 20.0.4
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
...
```

So we got 2 ports, namely 22 and 5000. 22 will be for the SSH to the box so what does this seeming http server on 5000 have in store?

![Helloworld](https://imgur.com/t3iyuZ1.png#center)

We have a Python environment where we can execute code. Trying to execute some `os.system` commands are blocked so there is some keyword filtering going on. We can however explore the python environment with the following functions `globals()` & `dir()`.
With `globals().keys()` we can see what objects exist in the environment. We get:
```
dict_keys(['__name__', '__doc__', '__package__', '__loader__', '__spec__', '__file__', '__cached__', '__builtins__', 'Flask', 'render_template', 'render_template_string', 'request', 'jsonify', 'redirect', 'url_for', 'session', 'flash', 'SQLAlchemy', 'sys', 'io', 'os', 'hashlib', 'app', 'db', 'User', 'Code', 'index', 'register', 'login', 'logout', 'run_code', 'load_code', 'save_code', 'codes', 'about']) 
```

We got some interesting objects to use here, namely `User`. We can use `dir(User)` to explore what the object has to offer and it is exactly what you think it would be...
```
['__abstract__', '__annotations__', '__class__', '__delattr__', '__dict__', '__dir__', '__doc__', '__eq__', '__format__', '__fsa__', '__ge__', '__getattribute__', '__gt__', '__hash__', '__init__', '__init_subclass__', '__le__', '__lt__', '__mapper__', '__module__', '__ne__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__', '__table__', '__tablename__', '__weakref__', '_sa_class_manager', '_sa_registry', 'codes', 'id', 'metadata', 'password', 'query', 'query_class', 'registry', 'username'] 
```

And there we have a few lovely attributes `query`, `username`, `password`. With a little more poking around we are able to extract the usernames and passwords with the following script.

![code](https://imgur.com/P7zBudp.png#center)

Giving us:

| User        | Password           | Password (MD5)                   |
| ----------- | ------------------ | -------------------------------- |
| development | development        | 759b74ce43947f5f4c91aeddc3e5bad3 |
| martin      | nafeelswordsmaster | 3de6f30c4a09c27fc71932bfc68474be |
And with this we are able to login to the box as martin to see what awaits us on the otherside. 

## Exploitation
With the credentials we found we can now ssh into the box and start poking around...
![login](https://imgur.com/cJpxzaJ.png#center)

After poking around for a bit we are able find an interesting script that can be run by the martin user with sudo privileges.

![sudo](https://imgur.com/D03pAIV.png#center)

Lets have a look at the code that resides in `/usr/bin/backy.sh`

![Bash](https://imgur.com/7c12gwY.png#center)
Analysing this script it looks to do the following:
- Give `.json` config file
- Must be in path `/var` or `/home`
- The specified file is archived in the provided location 


By editing the `.json` file we are able to backup the root file and the production application getting both flags!
Pretty easy box all round. I'm going to go enjoy the Sun on my face and the grass on my feet! Until the next! Oh and [achivement](https://www.hackthebox.com/achievement/machine/1695260/653) card



