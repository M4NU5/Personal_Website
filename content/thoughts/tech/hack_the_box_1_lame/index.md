---
draft: true
title: "Hack the Box #1 - Lame without Metasploit"
date: 2023-11-24T17:27:24+00:00
author: William
category:
  - Tech
tags:
  - Hacking
cover:
  image: hack_the_box_1_lame.png
  alt: hack_the_box_1_lame.png
---


---
### Recon

Lets kick off with a port scan to get a better idea of our target. 
![Basic_Port_Scan](https://i.imgur.com/RfzJ50B.png#center)
There are a couple of interesting finds here. So lets start digging!

### Enumeration
#### FTP - port 21

![FTP_Scan.png](https://i.imgur.com/Z6CiOaR.png#center)

FTP Exploit attempt

FTP allows for anonymous login but nothing seems to be in the hosted file server

Looking into the detected software vsftpd 2.3.4 with searchsploit reviles these two known exploits

![FTP_exploits.png](https://i.imgur.com/hpgB4LR.png#center)

These however, when I try to execute the exploit, don't seem to execute successfully. Which is a bummer but lets move on to the other ports.

#### SMB - port 129, 445
![SMB_Image.png](https://i.imgur.com/0uL6sOv.png#center)

Performing a deeper inspection of the open SMB ports we are able to determine the software version. There are a number of known exploits when we dig into searchsploit for this version of Samba. I'm intentionally not using metasploit but we can look for a PoC for **cve-2007-2447**.

![samba_details.png](https://i.imgur.com/dEQ0I2h.png#center)

We find this [GitHub](https://github.com/amriunix/CVE-2007-2447) gem to do all the heavy lifting for us. Reviewing the code it is a perfect python reproduction of the metasploit exploit! Love you amriunix <3


Lets prep for running the python script
```shell
pyhton3 -m venv venv
source venv/bin/activate
pip install pysmb
```

And prepare our netcat listener
```shell
nc -nlvp 1234
```

Now we run the exploit python script and pray to the tech gods that it works.

![Exploiation.png](https://i.imgur.com/5rnAPY9.png#center)

Looking at our listener we go shell baby and a root shell at that!

![SHELL](https://i.imgur.com/GVpV7Nr.png#center)

The root flag can be found at 
`cat /root/root.txt`

![FLAG_ROOT](https://i.imgur.com/PiGOfQm.png#center)

Funnily enough it was harder for me to find the user flag. But a cheeky find script did the trick.

![FLAG_USER](https://i.imgur.com/5u2kTGT.png#center)

And that's a wrap folks. Now go touch some grass but first look at my [achievement](https://www.hackthebox.com/achievement/machine/1695260/1) thing!

