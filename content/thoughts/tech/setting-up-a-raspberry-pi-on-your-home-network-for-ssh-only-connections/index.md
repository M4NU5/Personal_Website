---
draft: false

title: 'Set up a Raspberry Pi that only accepts SSH connections'
date: '2024-03-23T12:04:48+00:00'
author: William

category:
    - Tech
tag:
    - Infrastructure
    - Security

cover:
    image: configuring_ssh_pi.png
    alt: 'AwesomeRaspberryPi.png'
---

A couple of years ago I bought a [Raspberry Pi 4](https://www.raspberrypi.com/products/raspberry-pi-4-model-b/) and have used it in several ways. I set up a Pi-Hole for my home. It worked ok but not as well as I would have hoped, probably some miss misconfigurations on my behalf. Anyhow today I thought I would tear it all down and start building from scratch again. Setting it up better than I did in the past given the knowledge I have gained over the past few years. Here’s how I set up my Raspberry Pi 4.

### Step 1: Burn that Pi

First things first, have a pi! Great now that we have gotten past that obvious piece next let’s download the Imager and set up our SD card.

Once you have the image installed, slot in your SD card and select what pi you’re burning for along with the OS of choice.

Configure the installation like this and yes I am blocking out details shame on you!

![PiSetup](https://i.imgur.com/WlAfhx2.png?ssl=1#center)
![PiSetup](https://i.imgur.com/2bAqVUo.png?ssl=1#center)

You want to set the hostname your user and password. As well as configure your Wifi, If you want to access it that way.  
The next step is to configure SSH. Generate a key if you don’t already have one and throw your public key in here.

Now burn that OS you sexy beast!

### Step 2: Configure Powershell

While that is burning let’s configure our PowerShell so we can easily connect to the PI when we want to. I would step you through this but I used the following [blog post](https://blog.anurut.com/ssh-with-private-key-in-windows-terminal/) to achieve this and man has outlined the process well. Following step 3 of the guide we add the terminal command by doing the following:

Open Powershell, click the drop-down and open settings:

![TerminalConfig](https://i.imgur.com/GbiLiGm.png?ssl=1#center)

In the settings click on “open JSON file” where we will put our custom terminal startup commands:

![TerminalConfig](https://i.imgur.com/wnPeyYn.png?ssl=1#center)

Going down to the profiles portion of the settings file, we are going to add the following dictionary element to the list:

![TerminalConfig](https://i.imgur.com/W48EubL.png?ssl=1#center)

As you can see, we are executing the shh command when starting the terminal. This will spawn an ssh session with our Raspberry Pi using the public-private key pair we have set up.

Now when we click on the new terminal element. We find a beautiful shell spawned on our pi! CONGRATULATIONS!

![TerminalConfig](https://i.imgur.com/vqUglWS.png?ssl=1#center)

### Step 3: Lock that Pi down

Now that we have a shell on the Pi let’s lock it down so only users with our SSH Key can connect to the Pi. The alternative is we have a ‘rogue’ device on the network and we don’t want that!

Become root with the casual `sudo -s` and now let’s lock down our config.

Going into the SSH config with `vim /etc/ssh/sshd_config`

You want to set `PasswordAuthentication no`. I also set `AllowedUsers` to just me 😀

Now restart the service `service ssh restart`

If you’re getting stuck at this stage here are some links that I found of use

- [Setup SSH keys for login only](https://raspberrypi.stackexchange.com/questions/1686/how-do-i-set-up-ssh-keys-to-log-into-my-rpi)
- [Users with SSH](https://askubuntu.com/questions/984912/how-to-get-the-list-of-all-users-who-can-access-a-server-via-ssh)
 
### Conclusion

BOOM DIGIDY!!! We have successfully set up a Pi that only accepts SSH access from my specified user. Cool stuff right?   
Now to do many wild and wonderful things with this little bad boy. Don’t worry I’ll keep you updated!

Now go touch some grass 😀