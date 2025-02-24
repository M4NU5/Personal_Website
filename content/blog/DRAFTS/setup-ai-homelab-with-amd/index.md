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
[https://github.com/likelovewant/ROCmLibs-for-gfx1103-AMD780M-APU/releases/tag/v0.6.1.2](https://github.com/likelovewant/ROCmLibs-for-gfx1103-AMD780M-APU/releases/tag/v0.6.1.2)

[https://github.com/likelovewant/ROCmLibs-for-gfx1103-AMD780M-APU/releases/tag/v0.6.2.4](https://github.com/likelovewant/ROCmLibs-for-gfx1103-AMD780M-APU/releases/tag/v0.6.2.4)

[https://github.com/danny-avila/LibreChat](https://github.com/danny-avila/LibreChat)

Need to add static network IP NOT [localhost](http://localhost)

because ollama hosted on host machine → [localhost](http://localhost) refers to container

That age of AI is upon us. Everyone and their mother are decreeing large language models will take your jobs and end humanity as we know it.

OpenAI, Google, X and many more all provide AI chatbot capabilities that are really useful but it will cost you. And not only in moneys. You pay with all data you submit are then owned by said company and you need to pay for the privilege to use their top models consistently

Step in the open source community who have worked to provide impressive models of their own that can be run by yourself. Its what all the cool kids are doing. Install ollama and pull models that can be run locally. How cool is that, we can run LLMs locally assuming we have a strong enough machine or wel GPU if we are looking at some of the heavyer models.

Obviously as a tech curitus individual like myself why would you not want to runn a local LLM that can give you unlimited chat

All the nividia cool kids got turn key access to this world, where nividias work with cuda which results in AMD always coming off second best to nvidia for anything other then gaming.

But hot dame do AMD gpus pack a punch. and with Ollama comming out and posting a blog on March 14, 2024 saying they now support AMD GPUs

[https://ollama.com/blog/amd-preview](https://ollama.com/blog/amd-preview)

I was super excited as an AMD chad myself to give a local model a shot but it was only met with disappintment like my zulu marks in primary school. I put it to the side until now 

Thought i would give it another stab having given the AI crazy to calm a bit, drivers to mature and having completed my Sans course. 
Knowing it wouldnt be as easy as installing and getting it to run out of the gate like how NVIDIA pesants i took up the challange. 

	After a bit of research i narrowed it down to the following steps, but come on AMD couldnt you have made this easier. NOPE that would be to easy.

We got to fuck with a couple things.

To start off we need to install Ollama for AMD. There is a ledgend called likelovewant who has implemented an amd compatable ollama, spesifically with this github repo. 

[https://github.com/likelovewant/ollama-for-amd/releases](https://github.com/likelovewant/ollama-for-amd/releases)

Now it isnt the latest and greatest but tbh we just need ollama to serve the model, i dont really care for the latest bells and whistles … yet! 

Download it and install ollama

Once that is complete open terminal and type `ollama serve`

When ollama starts you will see a log about GPU not detected or using CPU

Thats becuase we need to update the ollama files to be compatable with our AMD GPU

[https://github.com/likelovewant/ROCmLibs-for-gfx1103-AMD780M-APU/releases/tag/v0.6.1.2](https://github.com/likelovewant/ROCmLibs-for-gfx1103-AMD780M-APU/releases/tag/v0.6.1.2)

This comes the ‘hard part’ We need to figure out which gfx architectiure our GPU is. To do this we run `ollama serve` in our terminal. At ollama should say our GPU is unsupported with a gfx… code this is the code for our GPU. We will want to download the corsiponding zip file. navigate to where our dirvers are for ollama and replace them with the contents of the zip file.

Once done run ollama serve again and you should see ‘Supported GPU detected’

We are now goochi and whatever AI model we run will now use our AMD GPU rather then the mesaly CPU