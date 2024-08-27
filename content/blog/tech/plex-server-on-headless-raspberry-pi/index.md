---
draft: false
title: Set Up a Plex Server on your headless Raspberry Pi
date: 2024-08-27
author: William
category:
  - Tech
tags:
  - Infrastructure
  - Linux
  - Raspberry_Pi
description: 
cover:
  image: Plex_docker_on_pi.png
  alt: Plex_docker_on_pi.png
---
## Introduction
In an era where streaming platforms are increasingly introducing ads, looking at you Amazon Prime & Disney+ even Netflix are getting their feet wet. Setting up your own Plex server on a Raspberry Pi offers an ad-free viewing experience for your movies and series. With this guide, you’ll create a Plex server on your local network, ensuring that your media is always accessible without interruptions, all while keeping your content secure within your home network.

## What is Plex
Plex is a powerful media server platform that allows you to organize and stream your personal collection of movies and TV series across multiple devices. With its sleek and intuitive interface, Plex makes accessing your media library easy and enjoyable. Unlike traditional streaming platforms, Plex is completely ad-free and highly customizable, giving you full control over your viewing experience. Setting up Plex on a Raspberry Pi enables you to create a local media server, eliminating the need for a consistent internet connection and freeing you from the increasing ads and restrictions of popular streaming services.


## Prerequisites 

- A Raspberry Pi
- [Headless Raspbian installed](/blog/tech/secure-headless-raspberry-pi-on-your-home-network)
- [Docker Installed](/blog/tech/docker-on-headless-raspberry-pi)

## Step 1:  Prepare Media Drive

Before deploying Plex, prepare your media drive, which will be used to store all your movies and series. We are going to start assuming we are wanting a fresh start, which is what I did.

### **Partition Your Drive**
In preparation to partition the drive we first need to unmount the drive.
```bash
# List all disks connected to pi
sudo fdisk -l
# Unmount drive segments that we want to format, itterate 1->N
umount /dev/sda1
umount /dev/sda2
...
umount /dev/sdaN
```


Now that the drive is prepped for formatting lets re-partition it as we want 1 big media server
```bash
sudo parted /dev/sda
```

![parted.png](https://i.imgur.com/Es0dHVy.png#center)

With the drive partitioned how we want we now need to ensure it is mounted by default when our pi reboots. We achieve this by adding it to `/etc/fstab`. For this we do the following:

```bash
sudo vim /etc/fstab
```

![fstab.png](https://i.imgur.com/BnEN8OX.png#center)

Explanation of what we are inputting is as follows 
- **/dev/sda1**: Device or partition we want to mount
- **/mnt**: Location to mount the drive to
- **ext4**: Specify the ext4 file system 
- **defaults**: Mount options 
- **0**: Backing up partition settings, 0 = disable
- **0**: Disable error checking at boot time

### **Format Your Drive**
Next, we need to format the partition we have just created.  If your drive is located at /dev/sda, the new partition will be located at /dev/sda1 (if the drive is /dev/sdb, you will use /dev/sdb1, and so on). Run this code:
```bash
# Used to create an ext4 file system
sudo mkfs.ext4 /dev/sda1

# Set volume label of extended file system
sudo e2label /dev/sda1 PlexMedia
```

With the drive partitioned, formatted and configured to mount when the headless pi boots. Reboot the Raspberry pi and you will see the media drive located at our spesified mount point.

```bash
# Restart Pi NOW!!!
sudo shutdown -r now

# Set the permissions to the media drive as our user
# sudo chown -R <USER> <MOUNT_LOCATION>
sudo chown -R pi /mnt/PlexMedia

# Set read and write permissions on drive
sudo chmod -R 775 /mnt/PlexMedia
```

### **Share Your Drive**
Now its time to share the drive on our network, so you can add your files and access them from another device in the house. This will simplify how we manage the files on the media server. To achieve this we will use a tool called [Samba](https://www.samba.org/), which is an open-source implementation of Windows' [SMB/CIFS](https://www.pcmag.com/encyclopedia/term/cifs) file-sharing protocol.

```bash
# Update repository information
sudo apt update

# Upgrade system dependancies
sudo apt upgrade

# Install Samba
sudo apt install samba samba-common -y

# Configure Samba
sudo vim /etc/samba/smb.conf
```
![Configure_Samba.png](https://i.imgur.com/yOEv294.png#center)

In the Samba config file scroll down to the bottom of the file and input the above configuration for the smb share. In your version of the config file, **plexmedia** would be the name of your share (name it whatever you want) and **/mnt/plexmedia** would be the mounted location of your drive.

### **Secure Your Drive**
Finally to secure the network share you will need to create a password for Samba. **Samba requires this for the share to become active.** 
```bash
#sudo smbpasswd -a <USER>
sudo smbpasswd -a pi

# Add other users with
sudo adduser jeff

# Give new user a password
sudo smbpasswd -a jeff
```

Now with the setup process complete, lets restart just to have a clean slate and let everything load from scratch `sudo shutdown -r now` or if you like to live life on the edge just restart the smb service `sudo systemctl restart smbd`

### **Access Your Media**
To access your Raspberry Pi’s shared media folder from a Windows PC, open File Explorer and enter your Pi’s local URL (`\\pi.local\plexmedia`) or IP address (`\\192.168.1.11\plexmedia`) into the address bar. Replace **plexmedia** with your specific share name. Press Enter, then log in with your Samba username and password. If you’re unsure of your Pi’s IP address, find it via your router settings or by running `ifconfig` on the Pi. For easy access, right-click on **This PC**, select **Add a network location**, and follow the prompts.


## Step 2: Create Docker Compose file
Docker simplifies the deployment of applications like Plex. By deploying Plex on Docker, you streamline the setup process, making it easier to manage, update, and maintain the Plex server. Aswell minimizes the chance of conflict with any other software you may want to deploy onto your Raspberry Pi. We will be using the plex image put together by [linuxserver.io](https://docs.linuxserver.io/images/docker-plex)
```yaml
services:
  plex:
    image: lscr.io/linuxserver/plex:latest
    container_name: plex
    network_mode: host
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - VERSION=docker
	  - PLEX_CLAIM= #optional - https://www.plex.tv/claim/
    volumes:
      - /home/pi/plex/config:/config
      - /mnt/plexmedia/series:/series
      - /mnt/plexmedia/movies:/movies
    restart: unless-stopped
```

To explain the components of this file:
- **`image`**: Specifies the official Plex Docker image.
- **`network_mode: host`**: Ensures Plex runs on the host network for seamless local access.
- **`environment`**: Configures essential Plex environment variables, including the claim token that streamlines the initial setup.
- **`volumes`**: Maps your media library and configuration directories to the container.

I chose the Media Drive for the content (movies and series) but chose to go with keeping the config on the local SD card where I created a **plex** specific folder. I also chose to keep the **compose.yaml** file in this folder to keep things nicely contained. 

With your Docker Compose file ready, you can deploy the Plex container by running:

```bash
docker-compose up -d
```

This command instructs Docker to download the Plex image and start the container in detached mode. Your Plex server will now be running on the Raspberry Pi, accessible through your local network.



## Step 3: Connect Your Plex Client

With the Plex server running we can connect to it from any device on our local network that can run the plex client. For now we will connect though the browser to do some inital setup.  Enter the IP followed by the port `32400` and `/web/`. For example, mine is. 
``` URL 
pi.local:32400/web/
```

You will be prompted to log in, simply sign up or sign in to an existing plex account. You can skip this by just entering by entering the address above again.

Next, you will need to set up your movie and series libraries. This process is incredibly easy and shouldn’t be too hard in getting it set up correctly.
1. Go **Account Settings > Libraries > Add Library** 


![Pi_Libraries.png](https://i.imgur.com/Psg83bl.png#center)

2. Select the type of media that is in the folder you want to add. 
![Select_Library_Type.png](https://i.imgur.com/faOdlp3.png#center)


3. Next, you will need to select the folder that has all your media in it.
![Add_Library.png](https://i.imgur.com/8r5nE9P.png#center)

4. Once you add the library, it will now organize your clips in a nice easy to browse interface. Repeat this process for each folder you want to add.

Now that we have the Plex media server configured you can go to our plex clients and add the media server as a source. And like magic you have your own media server for you to utilise.

![MAGIC](https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDczaWV1ZzlldWZjZ3gzM2Y1ZnhrZDJmcWxnZXd0MnBvcjVka2dzcCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/E3MQDZl9qsVwgnKA7b/giphy.webp#center)

## Conclusion

Setting up a Raspberry Pi Plex server provides a reliable, ad-free platform for streaming your movie and series collection. By keeping your server local, you maintain complete control over your media, ensuring privacy and uninterrupted viewing. In a time when streaming services are shifting towards ad-supported models, your personal Plex server offers a refreshing alternative that prioritizes your viewing experience.
