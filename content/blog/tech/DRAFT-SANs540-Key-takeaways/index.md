---
draft: true
title: 
date: 2024-09-12
author: William
category: 
tags: 
description: 
cover:
  image: test
  alt: test
---
5 take aways from the sans 540

I just completed the sans 540 course in person and by god was it a ride. 
Working as a product security engineer i am familiar with pipelines and implementing security controls and tools into pipelines but building from scratch everything end to end was a fantastic experiance. Not to mention a full day of just kubernetes fried my brain and humbled me.

Im starting with my study regimine but thoought i would put together a small post talking over what I found to be 5 key take aways from the course right off the bat that will improve your day to day operations with pipelines, automation and everything devsecops


# 1: Keep your pipelines simple and modular

You might wonder how the hell people manage these get these super complicated pipelines that execute a plethora of things and dont go mad in the process. spesifically in the .yaml file
Its simple dont write it directly in the pipeline .yml file, write it in a bash script, or a go script. and then have the pipeline call the script and do the thing. Gone are the days of writing everything out in your pipeline file making it an absolute monster. 
Instead have a pipeline that calls a series of bash scripts that do stuff. This has 2 primary benifits. 
1. it makes your pipeline more readable to any poor soul who has to pick up where you left off
2. Your pipeline becomes modular in that you have a single line that executes 20 commands in the cli that you can plug and play alot easier
3. It enables multiple people work on different parts of the pipeline at the same time without have to worry about merging code

# 2: Check your tool versions

Or as my friend group would say. Check yourself before you rech yourself. Put simply at the beginning of your pipeline run a version check on all the programs that you will be using in the pipeline.
This helps in a number of reasons
1. You have a dedicated stage to check the versions of your software in case of troubleshooting
2. but most importantly you check if that software is even there. If it is not, fail the pipeline right away. No need to run through 3 stages to only fail on your 4th step.

# 3:  Leverage your secrets store

Secrets are these problematic little things that everyone says keep out of everything and should only ever be locked up in a safe with an AK wielding arm guard that will 360 no scope you for stepping to close. 
But in all seriousness we know that you want to keep your secrets out of code and in a vault to only be injected when needed at run time. This leads us to think of a secrets store like hashicorp vault to only be used for storing secret material that we dont want anyone to get access to. 
Vault can be used for way more then just that. It can be used as a common variable repository that allows all your pipelines to coordinate with each other. 
Have an infastructure change currently running. Update a flag in vault and that your webapp pipeline can check to ensure both are not deployed simaltainiously and cause some weird madness. 
1 more example here please

But a secrets store like hashicorp vault can be used in more ways then that


# 4: Scan at all stages. Redundancy is good!

I find companies often saying "We have x capability so therefore we dont need Y".
An example of this if your scanning your built images in the pipeline why would you scan the image repository that you are posting the built image to.

Take a swiss cheese method to security or in other words REDUNDANCY!
If you have been in security for any length of time you know that there is no silver bullet to security. This sure doesnt prevent people from saying things like MFA is the silver bullet that will solve 95% of problems. or Just scan infastructure not webaps because that is what attackers will ultimitly get to. If we secure that it will solve 80% of any serious hacking attempts. 

I hope this isnt news to you but reality is very different. which is why its advised to take a defence in depth approach, taking a note from the milatary. Dont rely on a single control to solve all your problems because an attacker will always find a way round. That is what they do. Look at how they can jump through the hoops just right or find a way around that hedge that is in their way.





# Conclusion 

At the end of the day i feel like my understanding of devsecops has already improved enormasly