---
draft: true
title: 
date: 
author: William
category:
  - Tech
tags:
  - Windows
  - Infrastructure
  - AI
description: 
cover:
  image: test
  alt: test
---
[https://github.com/likelovewant/ROCmLibs-for-gfx1103-AMD780M-APU/releases/tag/v0.6.1.2](https://github.com/likelovewant/ROCmLibs-for-gfx1103-AMD780M-APU/releases/tag/v0.6.1.2)

[https://github.com/likelovewant/ROCmLibs-for-gfx1103-AMD780M-APU/releases/tag/v0.6.2.4](https://github.com/likelovewant/ROCmLibs-for-gfx1103-AMD780M-APU/releases/tag/v0.6.2.4)

[https://github.com/danny-avila/LibreChat](https://github.com/danny-avila/LibreChat)

Need to add static network IP NOT [localhost](http://localhost)

because Ollama hosted on host machine → [localhost](http://localhost) refers to container


## Introduction

OpenAI, Google, X and many more all provide AI chatbot capabilities that are really useful to a point and that point is how much they know. There is a prevailing consensus that the more data you give a model the better it is. You can even customise and get the chat bot to know you better by uploading your personal data. By doing so however you are seeding all your data to be owned by which ever company you are uploading to. Oh and you want to use our top models consistently without rate limits cough up some money as well boy! 

![https://media1.tenor.com/m/dW-Pb6qvsq8AAAAd/thanos-infinity-war.gif](https://media1.tenor.com/m/dW-Pb6qvsq8AAAAd/thanos-infinity-war.gif#center)

This is not to say its a bad thing, its just good to know what we are working with and consider the trade-offs.

Step in the open source side of the equation, there are companies and communities out there are arent being tightfisted about the whole AI revolution. Ones that come to mind immediately are llama from meta, Mistral from XXX and Deepseek from XXX. These models are holding their own against the close source models of the tech giants and its pretty straight forward to run them yourself. Install ollama and pull models that can be run locally. How cool is that, we can run LLMs locally assuming we have a strong enough machine or wel GPU if we are looking at some of the heavyer models.

Step in the open source community who have worked to provide impressive models of their own that can be run by yourself. Its what all the cool kids are doing. Install Ollama, pull models that can be run locally and bobs your uncle. How cool is that we can run local LLMs, how big a model just depends on how strong a system you are sporting.

Obviously as a tech nerd myself why would I not want to run a local LLM that can give you unlimited chat capabilities. Sure not to the sophistication of GPT but that isnt always needed, plus less guardrails.

![Getinloser.gif](https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExOTNxdWJtaXBuY2VndnNkeGpjZmM5cjdkaG81dHNqemdrYnQwcDUyNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/pyTkBNVthpwp0WVFw0/giphy.gif#center)

As this is cutting edge the ecosystem is still evolving. Nvidia has a real leg up due to its CUDA ecosystem for non-gaming related GPU tasks. So when AI exploded all the Nividia cool kids got turn key access to this world and all us AMD pesants who just wanted raw power for gaming have been left in the dust.

That was until Ollama dropped this blog post announcing support for AMD GPUs on March 14, 2024 [https://ollama.com/blog/amd-preview](https://ollama.com/blog/amd-preview)

I was super excited as an AMD chad myself to give a local model a shot but sadly I was only met with disappointment. Ollama was only able to detect my CPU and all research pointed me toward the need to install Linux to be like the cool kids. Now i'm familiar with the Linux ecosystem and am looking to migrate to it but the one thing that i holding me back is its gaming ecosystem. That was a lot as I was studying for my GCSA having finished my SANS 540 course, [checkout post highlighting my takeaways](./blog/tech/devsecops-lessons-from-sans-540/).

Now its time to give this another stab and with AMDs drivers more mature the time is now. I have gotten it working and saddly the one click life for Nvidia users does not exist for us AMD users. But come young paddyone let me show you the way.

## Install AMD Drivers
The AMD drivers that we will be needing a part of AMDs ROCm Platform. Since we are talking windows it is specifically [AMDs HIP SDK](https://www.amd.com/en/developer/resources/rocm-hub/hip-sdk.html) that we will be installing.

## Install the CORRECT Ollama

Eeyup you heard me right, there is a legend called likelovewant who has implemented an AMD compatible Ollama, specifically with this [github repo](https://github.com/likelovewant/ollama-for-amd/releases).

Now it isn't the latest and greatest but to be honest we just need Ollama to serve the model, I don't really care for the latest bells and whistles… yet! 

1. Download Ollama package.
2. Install the Ollama package.
3. Open terminal and type `ollama serve`

When Ollama starts and you see `GPU Detected` you are good to go, but more likely you see a log mentioning `GPU not detected` or `using CPU`.

This means that Ollama doesn't have the correct drivers to utilise our GPU. Now I hear you asking 
"but William isn't this Ollama AMD compatible"
It is but we need to update the Ollama install files with the correct ROCm Library files to enable compatibility. For that you will need to go here:
[https://github.com/likelovewant/ROCmLibs-for-gfx1103-AMD780M-APU/releases/tag/v0.6.1.2](https://github.com/likelovewant/ROCmLibs-for-gfx1103-AMD780M-APU/releases/tag/v0.6.1.2)

Now for the hard part. To determine what GPU model you are working with. If only the names were that of what it says on the box but saddly not. For this we run `ollama serve` in our terminal.
If Ollama detects the GPU but it isnt supported we get a message "**GPU is unsupported with a gfx**" that code is the code for our GPU. I have a RTX 7900 XT which when I run the above mentioned command I can see my GPU is classed as **gfx1100**. 

We can go ahead and download the corresponding zip file. Navigate to where our drivers are for Ollama and replace them with the contents of the zip file.
These files are generally located at `C:\Program Files\AMD\ROCm\5.7\bin` or something similar.
Have a closer look at these [installation guidelines](https://github.com/likelovewant/ROCmLibs-for-gfx1103-AMD780M-APU) and remember before replacing anything make a backup copy so you can always rollback and restart.

This is the point where you might be thinking fuck me this is complicated! You would be correct because I thought the same. Messing with drivers is the price to pay to use an AMD card!

Once done run `ollama serve` again and you should see ‘Supported GPU detected’

![PartyTime](https://i.giphy.com/zINs6k7lwfawSbLOIc.webp)

We are now goochi and whatever AI model we run will now use our AMD GPU rather then the measly processing unit called a CPU