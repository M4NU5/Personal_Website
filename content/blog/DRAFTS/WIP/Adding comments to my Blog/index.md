---
draft: true
title: Adding comments to my Blog
date: 
author: William
category: 
tags: 
description: 
bsky: 
cover:
  image: test
  alt: test
---


I've been looking around the interwebs of how to add commeting functionality to my Hugo blog for my one reader. Yes you buddy i love you <3 

My requirements were that the solution needed to be simple and free. I'm not going to start paying for something  that I can engineer my way out of! 

My initial forays found me to a solution called https://utteranc.es/ which leverages githubs issues page of a repo as the storage location for commenting. A new issue is created for each of your posts and readers can login using their github profiles.
I set this up and gave it a go but it never felt quite right. The need to login, the fact that is was marked as an 'issue' being stored off on github just didnt feel quite right.

So after a few weeks I was in the pub with a pint and was pondering. The comments section of a blog is a social space. New requirement what if you leverage social media?
I whipped out my laptop and started digging. Coming accross a blog by [Emily Liu](https://emilyliu.me/blog/comments) who was one of the first 10 engineers of Bluesky. It talked about using a bluesky post as your comment section. Wierdly X was very lacking in implementation examples for a similar solution. 
This idea however fits perfectly with what I'm looking for. It makes your comments section more then just at the bottom of your blog post. It encurages engagement on my social media profile not just in the isolated corner of the internet being my blog.

As it is the comments section however I want the comments to show under the blog post. They are just sourced from bluesky like with the github issues. Sure you have the same login issue but this feels acceptable within this paradim

Little more digging got me to this post by [TK](https://www.menzel.it/post/2024/11/set-comments-experience-bluesky-posts/) where this genleman implemented exactly what im looking for...

I added some of my own personal tweeks but the core is all this mans work. 
And with out further addu. The comments section for that off chance i get that one person who wants to add their two cents to a post of mine :D
