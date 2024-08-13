---
draft: true
title: 
date: 2024-08-12
author: William
category: 
tags: 
cover:
  image: test
  alt: test
---
So you want to augment your discord server with the power of AI

# Create a Discord Application

1. Create a new application on the Discord developer portal ([https://discord.com/developers/applications](https://discord.com/developers/applications)). Give it a name and an avatar, and **note down the CLIENT ID**. Set your Bot Permissions (e.g. Administrator) and **enable** `MESSAGE CONTENT INTENT` under Privileged Gateway Intents.
2. Click on the “Bot” section on the left-hand side of the screen, then click `Add Bot`. Give your bot a name and avatar, and **note down the bot token**.
3. Set up your development environment. Install Node.js ([https://nodejs.org/](https://nodejs.org/)) and a code editor of your choice (such as Visual Studio Code).
4. Create a new directory for your bot project and open a terminal or command prompt in that directory.
5. Initialize a new Node.js project using the command `npm init`. This will create a new package.json file in your project directory.
6. Install the necessary Node.js packages using the command `npm install discord.js dotenv openai`. These packages provide libraries for interacting with the Discord API, OpenAI API, and storing your secret values.
7. Create a new JavaScript file in your project directory named `index.js`.

> **Note:** Ensure that your package.json is of **“type”: “module”**



## Setup the ChatBot
https://github.com/jakobdylanc/discord-llm-chatbot 


## Set up the LLM 

Install Docker 

https://dev.to/berk/running-ollama-and-open-webui-self-hosted-4ih5

