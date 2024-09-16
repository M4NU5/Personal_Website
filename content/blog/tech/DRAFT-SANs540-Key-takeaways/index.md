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


# Introduction

I recently completed the SANS 540 course in person, and what an intense and rewarding journey it was! As a Product Security Engineer, I’m no stranger to pipelines and the intricacies of implementing security controls and tools. However, building everything from scratch, end-to-end, was an eye-opening experience. The course pushed me out of my comfort zone, especially the full day dedicated to Kubernetes, which completely fried my brain and reminded me just how much there is to learn in this field.

As I'm knuckling down in preparation for my exam, I wanted to first highlight five key takeaways from the course that can be applied everywhere. These insights have the potential to significantly enhance your daily operations in pipelines, automation, and all things DevSecOps. Whether you're looking to streamline your processes or strengthen your security posture, these lessons are sure to make an impact.

# 1: Keep your pipelines simple and modular

Ever wonder how some people manage to create those incredibly complex pipelines that execute a multitude of tasks without losing their sanity! The secret is simple: don't write everything directly in the pipeline `.yaml` file. Instead, use bash scripts, Go scripts, or similar tools to handle the heavy lifting. Let the pipeline simply call these scripts to get the job done.

Gone are the days of cramming every command into a massive pipeline file that ends in a monstrosity of a `yaml` file. By modularizing your pipeline to call a series of scripts, you gain three major advantages:

1. **Improved Readability:** Your pipeline becomes much cleaner and more understandable for anyone who has the honour to work on your code after you.
2. **Enhanced Modularity:** By consolidating complex commands into a single-line script call, you create a plug-and-play structure. This makes it easier to swap out or update parts of your pipeline without having to worry about monstrous git merges. No more falling down the conflict resolution rabbit hole... as much.
3. **Better Collaboration:** With a modular approach, multiple team members can work on different aspects of the pipeline simultaneously, without the headache of code merging conflicts.

By keeping your pipelines simple and modular, you not only streamline your workflow but also make it more maintainable for everyone involved. It also enabled easier collaberation on the same project, minimizing conflicts.

# 2: Check your tool versions

Or, as my friends like to say: "Check yourself before you wreck yourself." 
In other words, make sure to perform a version check on all the tools and programs used in your pipeline right at the beginning. This simple step can save you from a host of issues down the line. Here's why this is crucial:

1. **Easier Troubleshooting:** Having a dedicated stage to check the versions of your software makes it much simpler to pinpoint versioning issues when things go wrong. You'll know exactly what versions you're working with, which is invaluable for debugging.
2. **Prevent Wasted Effort:** Most importantly, you verify that all necessary software is installed and accessible. If something is missing, the pipeline can fail immediately. This prevents you from running through multiple stages only to have the pipeline crash on a missing tool or incorrect version later on.

By incorporating a tool version check step at the start, you make your pipelines more robust, efficient, and much less prone to frustrating, time-wasting errors.

# 3:  Leverage your secrets store

Secrets are those tricky little things everyone warns you about. You should keep them out of your codebase, locked up like they’re in a high-security vault guarded by an armed sentry. Jokes aside, the advice is clear: secrets should be stored securely and only injected into your pipeline at runtime. This is where a secrets store, like HashiCorp Vault, comes into play. While it’s common to use Vault solely for storing sensitive information, its capabilities go far beyond that.

Vault can serve as a centralized variable repository, allowing your pipelines to coordinate and share information seamlessly. For instance, imagine you have an infrastructure change running. You can update a flag in Vault that your web application pipeline checks to ensure the two aren't deployed simultaneously, preventing potential conflicts and chaos.

Another example is managing feature toggles or environment-specific configurations. By storing these variables in Vault, you can dynamically inject them into your pipelines based on the current environment or deployment stage. This not only enhances security but also adds a layer of flexibility and coordination to your workflows.

By leveraging a secrets store like HashiCorp Vault, you transform it from a mere safe for sensitive data into a powerful tool for managing variables and orchestrating complex pipeline operations.


# 4: Scan at all stages. Redundancy is good!

I find companies often saying "We have x capability so therefore we dont need Y".
An example of this if your scanning your built images in the pipeline why would you scan the image repository that you are posting the built image to.

Take a swiss cheese method to security or in other words REDUNDANCY!
If you have been in security for any length of time you know that there is no silver bullet to security. This sure doesnt prevent people from saying things like MFA is the silver bullet that will solve 95% of problems. or Just scan infastructure not webaps because that is what attackers will ultimitly get to. If we secure that it will solve 80% of any serious hacking attempts. 

I hope this isnt news to you but reality is very different. which is why its advised to take a defence in depth approach, taking a note from the milatary. Dont rely on a single control to solve all your problems because an attacker will always find a way round. That is what they do. Look at how they can jump through the hoops just right or find a way around that hedge that is in their way.





# Conclusion 

At the end of the day i feel like my understanding of devsecops has already improved enormasly