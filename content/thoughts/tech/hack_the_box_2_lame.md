---
draft: true

title: 'Hack the Box #2 - Lame without Metasploit'
date: '2024-05-07T17:27:24+00:00'
author: William

category:
    - Tech

tag:
    - Hacking
cover:
    image: thoughts/tech/hack_the_box_2_lame.png
    alt: 'hack_the_box_2_lame.png'
---


### Recon

From our basic port scan to start us off, we have a list of open ports on our target. Lets start digging!

### Enumeration
#### FTP - port 21

![FTP_Scan.png]()

FTP Exploit attempt

ftp allows for anonymous login but nothing seems to be in the hosted file

Looking up vsftpd 2.3.4 with searchsploit reviles these two known exploits

![FTP_exploits.png]()

These however dont work as they have been patched (Show patch)





#### SMB - port 129, 445
![SMB_Image.png]
Performing a deeper inspection of the open smb ports we determine the software version

![samba_details.png]

And there are a number of known exploits for this version of Samba. 
Im not using metasploit but we can look for the cve-2007-2447

we find this gem https://github.com/amriunix/CVE-2007-2447 to do all the heavy lifting for us

Reviewing the code it is a perfect python reproduction of the metasploit exploit <3

Lets prep for running the python script

pyhton3 -m venv venv

source venv/bin/activate

pip install pysmb

Prepare our netcat listener

Running the exploit, dont forget to enable your listener before executing

![Exploiation.png]

SHELL

![]

and we have root!

the root flag can be found at 

cat /root/root.txt

![]

funnily enough it was harder for me to find the user flag.

a cheeky find script did the trick

![]

https://www.hackthebox.com/achievement/machine/1695260/1
