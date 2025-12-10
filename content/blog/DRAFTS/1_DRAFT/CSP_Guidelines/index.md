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
Today I want to talk about something near and dear to no ones heart Content Security Policies (CSPs). CSPs are just that right intercection of techincal engeneering meeting the nontechnical arm of most probably the businesses marketing department. Where things change on a wim and it is always an external tool that is being used because noone in marketing wants to do things themselves.

Combine this with the lovely fact that CSPs …

W

# Where did they come from

CSPs first itterations were the X-XSS-Protection header that aims to protect people from XSS. The fact that this is now deprecated can tell you all you need to know about how successful it was. But its ok, it was a V1 CSPs are our V2.

Already you can see the first problem here. The goal of the CSP is to protect the client from cross site scripting. Companies security teams can very easily take the opinion fuck the customer and hence we dont really see CSP implemented even within large companies

⇒ insert Google headers

⇒ Netflix

⇒ Apple

⇒ Bank>?



# So why do it

Because we as security engineers are evangilists for a safer world. But we need to imlement things in a way that doesnt make devs howl into the night in pain. and by fuck the way you do this in the AWS cloudfront world made me pause and question whether best practice was actually best practice or was it a hack thrown together by an engineer at 4am that has been repeated so many times that it has become best practice. 

Long story short its implemented on the cloudfront either through cloudformation for static allow listing or using a lambda edge function that injects your nonce into a placeholder value right before your scripts leave your network.



Nonce Limitations

SAFARI DOEST SUPPORT IT!!!!

Im sorry by what the fuck apple. The company who is a bastian of securty and really cares about their users. They dont support a nonce or hash implementation.

Which makes sense if you go to apples website you get the header mentioned above

# What are their limitiations


Nonce Limitations

SAFARI DOEST SUPPORT IT!!!!

Im sorry by what the fuck apple. The company who is a bastian of securty and really cares about their users. They dont support a nonce or hash implementation.

Which makes sense if you go to apples website you get the header mentioned above


# How is this impemented in AWS Cloudfront

⇒ How AWS implements it - Cloud formation allow list implementation

Character limitation

⇒ Nonce lambda implementation

Cost implication

# What is actully realistic for most teams?

This is where push comes to shuv. What is realistic for teams to implement.

There seem to be two approaches. One is a quick easy solution that will ofcourse result in busy work that adds up over time. and a more complete implementation that requires a more holistic implementation that requires a little bit more heavy lifting initially but will result in more secure and wholesome implementation.

Ultimitly your choices boil down to the following options

Implement CSP on