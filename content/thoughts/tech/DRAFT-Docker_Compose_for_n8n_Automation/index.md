---
draft: true
title: Docker Compose for n8n Automation
date: 2024-08-15
author: William
category: 
tags: 
description: 
cover:
  image: test
  alt: test
---
## Introduction

This guide will show you how to use Docker Compose to deploy and run n8n in a self-hosted containerized environment.

## WTF is n8n?

n8n is a free Zapier or Make alternative.

What even is a Zapier? Zapier is a tool that allows you to connect apps you use every day together to automate tasks and save time.

For example you want to automatically reply to all emails received on a particular email address and get notified that you need to follow up on it while tracking everything in a google sheet.

Zapier allows you to do that - but it's not free to do at scale.

n8n is free - but with a catch. You need to host it yourself... Or pay them to host it for you like Zapier

Today we will see how to deploy our own n8n using Docker Compose. 

If you're interested in other methods of deployment check out their [docs](https://docs.n8n.io/hosting/installation/server-setups/)

## Prerequisites

- Docker
- Docker Compose

**LINK TO INSTALLING DOCKER ON HEADLESS PI**




https://www.mdfaisal.com/blog/using-n8n-with-docker-compose



## Step 1: Create a Docker Compose file

Create a new file called `docker-compose.yml` and add the following content. Don't worry about what it does, we will explain it later.

```yaml
version: '3'
version: '3.8'

services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=user
      - N8N_BASIC_AUTH_PASSWORD=password
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=db
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=n8n
      - NODE_FUNCTION_ALLOW_EXTERNAL=axios,qs
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:12
    volumes:
      - db-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=n8n
      - POSTGRES_DB=n8n
    restart: unless-stopped

volumes:
  db-data:
```

This file defines two services: `n8n` and `db`. The `n8n` service runs the n8n container, and the `db` service runs a PostgreSQL database.



