---
draft: true
title: 
date: 
author: William
category: 
tags: 
description: 
cover:
  image: test
  alt: test
---
Based on the tasks listed in your K3S at Home project, I can help outline a technical blog post about setting up a home Kubernetes cluster:

**Setting Up a Home Kubernetes Cluster with K3S**

## Introduction
##### Overview of K3S and its benefits for home labs

##### Hardware requirements (ZULU for master, Pi for workers)
- Linux OS
- Primary machine -> Master
- Worker machines (Optional)

k3s is lightweight and built for small systems so aslong as you have 2gb RAM you should be good.


## Infrastructure Setup
##### NAS configuration and storage preparation
A network attached storage setup will allow us to serve data like media files across our local network. We can use it to store more then just the media files for the plex server but any thing else we would like. 
Think of it as your own personal cloud storage. I used my Raspberry Pi to act as my NAS. Go here XXXXTK if you want to see how i set it up. But we are going to install TK ontop of it to manage and configure our NAS

This step isnt completely necessary if you're on one machine and will just be serving files from it then just jump to the Cluster deployment. You will also need to do some editing of my helm charts to get it to work as my charts are assuming a NAS to allow for flexibility as I intend to have a multi node setup

TK

Now with the NAS setup we can look to setup our K3s cluster that will take advantage of this

##### Setting up SMB shares for persistent storage
For me I'm using the SMB protocol to manage the persistent storage. I want to setup my cluster to be modular where storage is decoupled from the pods consuming them. This is inline with industry best practice making your system more resilient to change. If you have a single node this isn't much of an issue but as soon as you add an additional node you need this flexibility for the cluster to operate effectively.






## Cluster Deployment
##### Master node deployment process

##### Adding worker nodes
##### Implementing high availability features 
- Not doing this this round. Need quorum of 3
## Application Deployment
##### Setting up media services (Plex)
##### Configuring the arr stack for automation

Would you like me to expand on any of these sections?