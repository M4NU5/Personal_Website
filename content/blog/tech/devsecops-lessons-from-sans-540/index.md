---
draft: false
title: "SANS 540 DevSecOps Review: 5 Lessons for Building Secure and Efficient Pipelines"
date: 2024-09-17
author: William
category:
  - Tech
tags:
  - Automation
  - Security
description: Thinking about taking the SANS 540 DevSecOps course? Read this review with 5 practical lessons, exam prep tips, and real-world pipeline security insights.
cover:
  image: SANS_540_DevSecOps_course_pipeline.webp 
  alt: SANS_540_DevSecOps_course_pipeline.webp
---
## Introduction

I recently completed the SANS 540 course in person, and what an intense and rewarding journey it was! 

[SANS 540](https://www.sans.org/cyber-security-courses/cloud-native-security-devsecops-automation), officially titled “Cloud Security and DevSecOps Automation,” is a five-day, hands-on course from the SANS Institute designed for security engineers, DevOps teams, and cloud professionals. It focuses on building secure, automated CI/CD pipelines, integrating security controls, and applying real-world DevSecOps principles across cloud and containerized environments. The training blends lectures, labs, and practical exercises, making it one of the most applied courses in the SANS curriculum.

As a product security engineer, I’m no stranger to pipelines and the intricacies of implementing security controls and tools. However, building everything from scratch, end-to-end, was an eye-opening experience. The course pushed me out of my comfort zone, especially the full day dedicated to Kubernetes, which completely fried my brain and reminded me just how much there is to learn in this field.

As I'm knuckling down in preparation for my exam, I wanted to first highlight five key takeaways from the course that can be applied everywhere. Helping to augment your daily operations in pipelines, automation, and all things DevSecOps. 

A nice little bonus at the end of the week I was able to acquire the challenge coin for the course. Check it out in my conclusion and without further a due... 

## SANS 540.1 – Keep Pipelines Simple and Modular

Ever wonder how some people manage to create those incredibly complex pipelines that execute a multitude of tasks without losing their sanity! The secret is simple: don't write everything directly in the pipeline `.yaml` file. Instead, use bash scripts, Go scripts, or similar tools to handle the heavy lifting. Let the pipeline simply call these scripts to get the job done.

Gone are the days of cramming every command into a massive pipeline file that ends in a monstrosity of a `.yaml` file. By modularizing your pipeline to call a series of scripts, you gain three major advantages:

1. **Improved Readability:** Your pipeline becomes much cleaner and more understandable for anyone who has the honour to work on your code after you.
2. **Enhanced Modularity:** By consolidating complex commands into a single-line script call, you create a plug-and-play structure. This makes it easier to swap out or update parts of your pipeline without having to worry about monstrous git merges. No more falling down the conflict resolution rabbit hole... as much.
3. **Better Collaboration:** With a modular approach, multiple team members can work on different aspects of the pipeline simultaneously, without the headache of code merging conflicts.

By keeping your pipelines simple and modular, you not only streamline your workflow but also make it more maintainable for everyone involved. It also enabled easier collaboration on the same project, minimizing conflicts.

![Simple](https://i.giphy.com/NLuX3GCUdfltpCdFGW.webp#center)

## SANS 540.2 – Always Check Tool Versions

Or, as my friends like to say: "Check yourself before you wreck yourself." 
In other words, make sure to perform a version check on all the tools and programs used in your pipeline right at the beginning. This simple step can save you from a host of issues down the line. Here's why this is crucial:

1. **Easier Troubleshooting:** Having a dedicated stage to check the versions of your software makes it much simpler to pinpoint versioning issues when things go wrong. You'll know exactly what versions you're working with, which is invaluable for debugging.
2. **Prevent Wasted Effort:** Most importantly, you verify that all necessary software is installed and accessible. If something is missing, the pipeline can fail immediately. This prevents you from running through multiple stages only to have the pipeline crash on a missing tool or incorrect version later on.

By incorporating a tool version check step at the start, you make your pipelines more robust, efficient, and much less prone to frustrating, time-wasting errors.

## SANS 540.3 – Leverage your Secrets Store

Secrets are those tricky little things everyone warns you about. You should keep them out of your codebase, locked up like they’re in a high-security vault guarded by an armed sentry. Jokes aside, the advice is clear: secrets should be stored securely and only injected into your pipeline at runtime. This is where a secrets store, like HashiCorp Vault, comes into play. While it’s common to use Vault solely for storing sensitive information, its capabilities go far beyond that.

Vault can serve as a centralized variable repository, allowing your pipelines to coordinate and share information seamlessly. For instance, imagine you have an infrastructure change running. You can update a flag in Vault that your web application pipeline checks to ensure the two aren't deployed simultaneously, preventing potential conflicts and chaos.

Another example is managing feature toggles or environment-specific configurations. By storing these variables in Vault, you can dynamically inject them into your pipelines based on the current environment or deployment stage. This not only enhances security but also adds a layer of flexibility and coordination to your workflows.

By leveraging a secrets store like HashiCorp Vault, you transform it from a mere safe for sensitive data into a powerful tool for managing variables and orchestrating complex pipeline operations.

![secrets](https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTkxbWVvcXdxbjh4NjF3Nmt0NTlkNHNwMGQzbnZndmV3NjQzbDI4dyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oKIP7vCPcUz3RNMgU/giphy.webp#center)

## SANS 540.4 – Scan at All Stages. Redundancy is Good!

I often hear companies say, "We have X capability, so we don't need Y." A common example is: if you're already scanning your built images in the pipeline, why bother scanning the image repository where you store those built images?

The answer lies in adopting a Swiss cheese model of security—in other words, _redundancy_. If you've been in the security field for any length of time, you know there is no silver bullet. Yet, you’ll still hear claims like "MFA is the silver bullet that will solve 95% of problems," or "Just scan the infrastructure, not the web apps, because that's what attackers will ultimately target."

If this isn't news to you, then you understand that reality is far more complex. This is why a defense-in-depth approach is crucial. Borrowing a page from military strategy, don't rely on a single control to protect your systems. Attackers are constantly finding ways to bypass security measures, whether by jumping through hoops or finding a way around obstacles. It's their job to think creatively and exploit any gaps in your defenses.

By scanning at multiple stages—whether in the pipeline, in the image repository, or even in the production environment—you create layers of security that make it harder for critical vulnerabilities from slipping through that attackers can exploit. Redundancy ensures that if one layer fails, another is there to catch what was missed. Security isn't about finding a single, perfect solution; it's about building a resilient, layered defense that can adapt to evolving threats.

![defense](https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTRhem1rdW10bXpwcWJrNjhhZXVldmhhZ3VodGw2MTlyYzA3Y2J0aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/56wdZ4gYcwRvU7rJiY/giphy.webp#center)

## SANS 540.5 – Automate, But Don't Forget to Monitor

Automation is the backbone of modern DevSecOps pipelines. Automating security checks, deployments, and compliance tasks can significantly reduce human error and free up your team to focus on more strategic initiatives. However, automation isn't a "set it and forget it" solution. It's crucial to actively monitor your automated processes to ensure they’re functioning as intended.

Automated tools can sometimes miss subtle issues or encounter unexpected errors that could compromise your security posture. For example, an automated scan might fail silently due to a configuration change or a network hiccup. If you're not monitoring these processes, you might never realize a security check was skipped, leaving your pipeline vulnerable.

Set up robust logging and alerting mechanisms to track the performance of your automated tasks. Regularly review these logs and create alerts for any anomalies, such as a failed scan or a misconfiguration. This proactive monitoring ensures that your automation is not only running smoothly but also actually protecting your environment as intended.

By combining automation with vigilant monitoring, you create a more reliable and secure pipeline that can quickly adapt to and address issues as they arise. Automation maximizes efficiency, while monitoring ensures the integrity and effectiveness of those automated processes.

![allthethings.webp](allthethings.webp#center)
## Conclusion

At the end of the day, my understanding of DevSecOps has grown tremendously through the SANS 540 course. It was an eye-opener, providing new strategies and a deeper appreciation for building secure, efficient pipelines. From keeping pipelines simple and modular to leveraging secrets stores and implementing redundancy at every stage, these key takeaways have already started to reshape how I approach pipeline security.

The highlight of the week was earning the coveted challenge coin for the course — a symbol of the hard work and dedication I put into mastering these concepts. Winning this coin was not just an achievement; it gave me a significant boost of confidence as I prepare for the exam. It serves as a reminder that with the right mindset and approach, even the most complex DevSecOps challenges can be tackled head-on.

![Challange_Coin](https://i.imgur.com/nuD3pPo.png#center)

DevSecOps is a continuously evolving field with no one-size-fits-all solution. It's about finding the right balance between automation, security, and monitoring while staying adaptable to emerging threats. By integrating these practices into your daily operations, you can strengthen your security posture and streamline your workflow, making DevSecOps an integral and seamless part of your development process.