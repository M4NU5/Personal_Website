---
draft: false
title: How to Fix Common Steam Issues on Linux
date: 2025-04-26
author: William
category:
  - Tech
tags:
  - Linux
  - Gaming
description: Struggling with Steam on Linux? Learn how to properly mount your NTFS drive, fix Proton issues, and start gaming smoothly with this step-by-step guide.
cover:
  image: Steam-Linux.webp
  alt: Steam-Linux.webp
bskyid: 3lnpz3zwtts2n
---
So you want to join the cool kids club and be a Linux gamer. You have found your distro of choice and installed it. In your infinite wisdom you still have that second hard drive to store all your data keeping it separate from your OS install files.

After installing Steam you have run into countless stupid seemingly unexplainable problems and your can't seem to find a clear guide on how to get it all working smoothly. Well worry no more intrepid cyber traveller I put together this guide after piecing together and overcoming the many problems that I faced and you are probably experiencing.

---

Let's start with the foundation: getting your NTFS data drive mounted properly so Steam can recognise and access it. If this part isn't done right, you'll run into all sorts of issues later so take a breath, and let's go step by step.

## **Mounting Your NTFS Drive (The Right Way)**

Yes it starts here. We cant just mount the drive. We need to mount the drive correctly. By default Linux tries to play nice with NTFS drives and mounts it with read-only permissions. We don't want this as we want to be able to execute and manage the files.

But I'm getting ahead of myself first lets identify the drive we want to mount with `lsblk`

```bash
- lsblk

NAME        MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
nvme0n1     259:0    0 931.5G  0 disk  
├─nvme0n1p1 259:1    0   100M  0 part /boot/efi
├─nvme0n1p2 259:2    0    16M  0 part  
├─nvme0n1p3 259:3    0 487.6G  0 part  
├─nvme0n1p4 259:4    0   650M  0 part  
├─nvme0n1p5 259:5    0     1G  0 part /boot
└─nvme0n1p6 259:6    0 442.1G  0 part /home /
                                      
nvme1n1     259:7    0   3.6T  0 disk  
├─nvme1n1p1 259:8    0    16M  0 part  
└─nvme1n1p2 259:9    0   3.6T  0 part 
```

I personally have 2 NVME drives, one acting as a data drive and the other holding both a Windows and Linux install on a split partition. The partition I’m interested in is `nvme1n1p1`

On a side note... You will come across a lot of people saying "EWWWW never use NTFS" and their points are valid. However windows only supports FAT32, exFAT, and NTFS. If you want interoperability with windows your data drive will need to be exFAT or NTFS. Of the two NTFS is a more robust and feature rich format that supports journaling allowing you to recover and restore if your drive corrupts. If exFAT goes bad kiss your data goodbye. Hence I'm using NTFS.

Now that we know what we are looking for we need to get the UUID of the drive with `sudo blkid`

```bash
- sudo blkid
...
/dev/nvme1n1p2: LABEL="Data" BLOCK_SIZE="512" UUID="24F46B67F46B39E6" TYPE="ntfs" PARTLABEL="Basic data partition" PARTUUID="5c46af3c-19d9-407c-af93-12781130ee1b"

/dev/nvme1n1p1: PARTLABEL="Microsoft reserved partition" PARTUUID="20100944-2a07-4603-b9b6-45cb5b6e0a8a"
```

The UUID of my drive is `24F46B67F46B39E6` this is what we need to specify in the mounting file. Lets get into the file and see what we need to add.

**Edit `fstab` to Automount**

Editing this file ensures the drive shall be mounted every time we start our system.

`vim /etc/fstab`

Here we enter in the mounting information for the drive we have identified.

```bash
UUID=24F46B67F46B39E6   /media/data  ntfs-3g  uid=1000,gid=1000,umask=022,windows_names,exec,permissions,big_writes 0 0
```

You might be thinking WTF does this mean. Let me highlight some interesting points

- `/media/data` → Sets the mount location.
    - `/media` will show up in your [folder tab](https://askubuntu.com/questions/22215/why-have-both-mnt-and-media) where `/mnt` wont
- `ntfs-3g` → NTFS driver with read & write support
- `uid=1000, gid=1000` → Assigns the user account with permissions
    - `id -u` and `id -g` can be used to double check
- `umask=022` → Specifies 755: owner full, others read+execute
- `exec` → Allows execution of binary file
- `permissions` → Without this, NTFS partitions would not honor file-level permissions.
- `big_writes` → Enables larger write buffers to improve performance.

With the **fstab** updated lets reload it into our terminal and mount the drive. 

```bash
systemctl daemon-reload
sudo mount -a

reboot # If you want to be extra sure
```

You may get the following error `ntfs-3g-mount: failed to access mountpoint /media/data: No such file or directory`, when you encounter this simply create the folder you're looking to mount to with `mkdir`

Congratulations! With your NTFS drive successfully mounted, Steam can now interact with your game files. Let’s fire up Steam and dive into its configuration to make sure everything is running smoothly on the Linux side.

## Steam Configuration (Correctly)

Start by typing into terminal `Steam`, this will start Steam with our terminal allowing us to see all the logs behind the scenes of what the Steam client is doing, making it much easier to troubleshoot when we run into any errors.

Now go to **settings** and add the library on the newly mounted windows drive. Also **enable compatibility mode**, this is important for running windows game binaries on Linux.

You should now see all your games installed in your library, even the games on the windows drive. Choose a small indie game and click PLAY. Then keep an eye on your terminal. If the game starts then no problem you’re done and can skip this section, enjoy your game. If your game doesn't launch we got a little more troubleshooting to do. The next common problem is that the Proton compatibility layer isn’t kicking in properly. Let's check whether Steam is generating the necessary `compatdata`.

Dig into your **Steam files** located under your `~/.Steam/xxx/Steamapps/` (where xxx is either root or Steam), look for a file called **compatdata**. This file should be generated by Steam but sometimes it is just not. In my case it had not and no matter how hard I tried I couldn’t get Steam to create the file!

![https://i.giphy.com/BWW2uoPRkiseixOsiF.webp](https://i.giphy.com/BWW2uoPRkiseixOsiF.webp#center)

So I did it manually! We want to create a link between our NTFS drive with all the game files and our Linux system where compatibility data for Linux is stored.

First create the file on our Linux system if it hasn’t been already, I created it in the root folder as follows.

```bash
mkdir /home/USERNAME/.Steam/root/Steamapps/compatdata
```

Next we need to create a link on the mounted NTFS drive for Steam to utilise

```bash
sudo ln -s ~/.Steam/root/Steamapps/compatdata  /media/data/Steam LIBRARY IN NTFS DISK/Steamapps/
```

Once you've linked up the compatibility data properly, your game should finally launch. Success! But even if it doesn’t, you’re not alone. This is where the wider Linux gaming community really shines.

## Linux Gaming Community (Protondb)

There is a thriving Linux gaming community that work together to figure out the best configuration for any game of your choosing. Check them out here at [protondb](https://www.protondb.com/) You can search for any game you like and see the recommendations of many other users.

You can find some additional information at this git repo from Valve themselves here [Valve Github](https://github.com/ValveSoftware/Proton/wiki/Using-a-NTFS-disk-with-Linux-and-Windows).

Hope this was of great help to you, I’m going to go touch some grass and play some games on my Linux machine.
If you do have any additional questions drop a comment below and we can enrich this resource for any other weary travelers that dare to walk this path.
