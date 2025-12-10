---
draft: true
title: 
date: 
author: William
category: 
tags: 
description: 
bskyid: 
cover:
  image: test
  alt: test
---
I have had the opportunity to pitch Wiz Code against Cycode and thought i would put together its little writeup to for anyone interested

Wiz have a reputation for being a heavy hitter in the cloud posture management space and now they are diving headfirst into the apsec world looking to create a complete code to. cloud view. Wiz code links in very nicely to their existing offering. Enabling your cloud view to shift left into your git repositorys.

Some disclamers

Wiz Code at the point of my review supported SCA and had not yet release any SAST capability (atleast publically)

[https://pulse.latio.tech/p/what-do-i-think-about-wiz-code](https://pulse.latio.tech/p/what-do-i-think-about-wiz-code)

As stated by other big commentators Wiz is squarely focused on attacking SCA first. Aiming to help wrangly your supplychain

**CNAPP**

Cycode

The more I used cycode the more it become apparent of how ridged it feels to use the tool. there are spesific ways the developers expect you to use it and some other things tacked on because they can not because you are meant to use it. Take Sensitive Data that is Identified in a repository

I have heard many people say they prefer cycode to wiz because it is more developer focused. Perhaps it is… but i will propose a hypothisis that cycode is liked because the few things SCA, SAST are straight forward to find and given cycodes ridged structure you dont and really cant go out of that structure. For people who only use the tool intermitantly it is great because you get what you want and leave. but if you are a maintainer or want to explore the cracks start to show. TK HYPOTHISUS

## Wiz Code

If youre already a Wiz customer it gives you a one stop shop for your App Sec and who wouldnt want that! No need to teach another tool, you just need to teach a new part of the existing tool

Fuck devs can run their own scans! Cycode you need to be admin to do this. Dont know who thought giving devs more autonamy to do what they do best. I continue to hold the belief that security needs to get out of the way. Happy dev happy life

Wiz Code seemed to peform really well when it came to Python dont know why. But come on Cycode how is a preview SAST scanner that is still immature outperforming you at all?!

## Cycode

Cycode feels inflexable and weirdly inconsistant.

Im sorry but if i apply a filter at the top i expect it to apply to all widgets on the page. Not some widgets being filtered and others thinking they are better then youre stupidly imposed restrctions dont hold no widget back! MAKE WIDGETS GREAT AGAIN!!!!!!

Sensitive data view.

Now think for a second what you would want from a code scanning tool when it comes to anythign snstive data related. For me, i would wnt the tool to identify any sensitive data that might be in code and flag it to me? I ask you to think of what you would want… now lets look at what cycode does and what wiz does when it comes to this problem

Cycode provides a sensitive data view for each code repository. Now pause and think of all the possible things that it could be and how it could be useful. Now the reality is cycode in their own words “Provides a list of potentially sensitive data types based on the context of the code where they are detected”… Now that feels unsatisfying for me. I mean thanks cycode for highliughting in the companies payments hub where all the potental locations sensitive data types could be… But when its 100 locaitons that i cant explore it is just useless noise.

Cool to know but is that data useful. I would say no not in its current form

Wiz on the otherhand takes the approach of identifying sensitive data that has occured in the code. It then provides that data masked with the location that that data is located within the repo. thats it! fullstop! Now which one did you have in mind when you first thought of the sensitive data problem

Conclusion

You are not going to purchase Wiz code on its own. It falls short as a standalone tool.

but used in conjunciton with the code cloud offering of wiz you start to see the power it can offer

Cycode is first and formose an ASPM tool. That is what they excel at and you can see that in how they outpeform Wiz code at the point of my review

Wiz being less ridged can be overwelming for developers and users who dont use it everyday. Sure this is a detraction but this can be mitigated by the security team taking ownership, educating and enabling teams to use such a powerful tool