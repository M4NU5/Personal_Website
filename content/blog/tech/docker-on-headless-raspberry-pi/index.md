---
draft: false
title: Docker on headless Raspberry pi
date: 2024-08-16
author: William
category:
  - Tech
tags:
  - Infrastructure
  - Linux
  - Raspberry_Pi
cover:
  image: Docker_on_pi.png
  alt: Docker_on_pi.png
description: Learn how to install Docker on a headless Raspberry Pi with this step-by-step guide. Avoid common errors in official Docker documentation by following our tailored instructions for Raspbian OS. Discover the benefits of using a headless OS and understand Docker's role in containerization. This guide covers prerequisites, adding the correct Docker repository, and successfully installing Docker without a GUI. Perfect for Raspberry Pi users looking to deploy containerized apps on a minimal, efficient setup. Start your headless Docker journey now!
---
## Introduction 

This guide outlines the steps required to install docker on a headless Raspberry Pi. Reason I'm putting this together is the generally found [official documentation](https://docs.docker.com/engine/install/raspberry-pi-os/#install-using-the-repository) doesn't work for the Headless variant of the Raspbian OS. 

By following its guidance you can find yourself running into the following errors
```bash
root@pi:/ sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-
...
E: Package 'docker-ce' has no installation candidate
E: Package 'docker-ce-cli' has no installation candidate
E: Unable to locate package containerd.io
E: Couldn't find any package by glob 'containerd.io'
E: Couldn't find any package by regex 'containerd.io'
E: Unable to locate package docker-buildx-plugin
E: Unable to locate package docker-compose-plugin
```

The solution is a pretty easy one, find it below. But first!!!

#### What is a headless OS?

Headless OS refers to a operating system that does not have Graphical User Interface (GUI) functionality. Used for systems that you only want to interact with on the terminal with no intention of plugging in a monitor. This greatly reduces the size of the operating system while maintain all its core functionality.

#### What is a Docker

Docker is a containerization software that allows for you to run a contained piece of software that has everything required to run the software contained within. Removing the need to install custom libraries on the host machine that can become messy and have the potential to conflict with one another. 

## Prerequisites 

- A Raspberry Pi
- [Headless Raspbian installed](/blog/tech/secure-headless-raspberry-pi-on-your-home-network)

Assuming our system isn't a fresh install run this just to be sure we don't run into any conflicts.

```bash
for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do sudo apt-get remove $pkg; done
```

**What does this this command do??** It looks for any occurrence of docker programs installed on your system and removes them!

## Adding docker repository & install

Now that we are fresh and ready to go let start by adding the docker repository. Here we are going to add the Debian docker repo. Reason for this is we are going back to the root. Raspbian is built on the Debian kernel and has a headless version of docker that it can install unlike the Raspbian specific docker repo.

```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository to Apt sources:
echo \
	"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
	$(lsb_release -cs) stable" | \ 
	sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
# Check if any updates to repo data needed
sudo apt-get update

# INSTALL THE DOCKER
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

And just like that you are goochi to go, its a simple change I know but it makes all the difference.

## Conclusion

To wrap things up the issue with the [docker docs](https://docs.docker.com/engine/install/raspberry-pi-os/#install-using-the-repository) is that its focused on the Raspbian repo which seems to only accommodate the GUI version of docker for the operating system install weirdly. 
We resolved this issue by adding the Docker repo for the core kernel Debian that Raspbian is built on. 

Now we can go ahead and deploy containerized apps on our headless raspberry with ease using docker compose. The sky is the limit! Well that and the resources available on the device.


![SkyUnicorn.png](https://i.giphy.com/L2UdIWuCRbUL6.webp#center)