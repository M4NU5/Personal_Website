---
draft: true
title: Installing Docker on headless Raspberry pi
date: 2024-08-14
author: William
category: 
tags: 
cover:
  image: test
  alt: test
---
## Introduction 

This guide outlines the steps required to install docker on a headless Raspberry Pi. Reason im putting this together is the generally found [official documentation](https://docs.docker.com/engine/install/raspberry-pi-os/#install-using-the-repository) doesnt work for the Headless variant of the Raspbin OS. 

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
- [Headless Raspin Installed]() Refer to other post

## Step 1: Adding docker repository

Assuming our system isn't a fresh install run this just to be sure we don't run into any conflicts[
```bash
cool remcalcrtipsids
```


Now that we are fresh and ready to go let start by adding the docker repository. Here we are going to add the Debian docker repo. Reason for this is we are going back to the root. Rasbin is built on the Debian kernel and has a headless version of docker that it can install unlike the Rasbin specific docker repo
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

sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```


And just like that you are goochi to go, its a simple change i know but it makes all the difference

## Conclusion

To wrap things up the issue with the [docker docs](https://docs.docker.com/engine/install/raspberry-pi-os/#install-using-the-repository) is that its focused on the Raspbian repo which seems to only acomidate the GUI version of docker for the operating system install weirdly. 
We resolved this issue by adding the Docker repo for the core kernel Debian that Raspbian is built on. 

Now we can go ahead and deploy containerized apps on our headless raspberry with ease using docker compose. The sky is the limit! Well that and the resources available on the device.
