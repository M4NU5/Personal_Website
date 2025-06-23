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
So you are wanting to deploy argo CD and have your kubernetes deployment handeled and managed by argocd  but! You dont want to redeploy your clusters. We want a seemles handover argo cd can do this  but there is a problem looking at all argo cd  guides out there all of them port forward so yoiu can access what you have deployed. but this is kubernetes why the fuck would we want to port forward our pod as a perminant solution. 
If anything i want to be able to access argo cd from the subdomain argo.example.com

I want it to seemlessly deploy with and manage my home lab, so that is the goal of this post. 
To deploy argocd, give itownership of itself and my homelab cluster while the deployment must also forward to the pod when the specified url is provided.

Then we will have a fully deployable homelab instance that aligns with the gitops ethos aswell as not requiring us to portforwrad like a docker pesant 




for my home lab i want agro cd to be deployable and reach