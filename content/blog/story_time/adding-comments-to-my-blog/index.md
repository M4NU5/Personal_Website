---
draft: false
title: Adding comments to my Blog
date: 2025-07-24
author: William
category:
  - Story Time
tags:
  - Blog
description: 
bsky: 
cover:
  image: speechbubble.png
  alt: speechbubble.png
---


I've been looking around the interwebs of how to add commenting functionality to my Hugo blog for my one reader. Yes you buddy I love you ❤️

My requirements were simple, the solution needed to be free. I'm not going to start paying for something that I can engineer my way out of! 

#### V1
My initial forays found me using, https://utteranc.es/.

Utterances leverages Githubs issues page of a repo as the storage location for commenting. A new issue is created for each of your posts and readers can login using their Github profiles and leave comments.
I set this up and gave it a go but it never felt quite right. The prompting for login felt like a scam and the fact that is was marked as an 'issue' being stored off on Github just didn't feel quite right.
I don't want to go to Github issues to respond to a commentor.

#### Retrospective
A few weeks on I was in the pub with a pint, pondering. 
![https://i.giphy.com/qr2nV97iLSE9X1k4E4.webp](https://i.giphy.com/qr2nV97iLSE9X1k4E4.webp#center)

The comments section of a blog is a social space so wouldn't you want to make is social? New requirement what if you leverage social media?

I whipped out my laptop and started digging. Coming across a blog by [Emily Liu](https://emilyliu.me/blog/comments) who was one of the first 10 engineers of Bluesky. she talked about using a bluesky post as your comment section. This idea however fits perfectly with what I'm looking for. It makes the comments section more then just at the bottom of your blog post. It encourages engagement on my social media profile not just in my little the isolated corner of the internet.

Obviously we want the comments section to show up under the blog post. So the comments will exist in two locations with bluesky acting as my database like Utterances Github issues. Sure you have the same login issue but this feels acceptable within this paradigm where you redirect users to a social media platform.

Little more digging got me to this post by [Oliver Menzel](https://www.menzel.it/post/2024/11/set-comments-experience-bluesky-posts/). This gentleman is the real MVP, he had gone ahead and implemented a robust component that could be added to Hugo enabling comments and it was exactly what I was looking for. 

Weirdly X was lacking in implementation examples for such a solution.
![https://i.giphy.com/bupsZiBKn7vAk.webp](https://i.giphy.com/bupsZiBKn7vAk.webp#center)

#### V2
[Check out his post here](https://www.menzel.it/post/2024/11/set-comments-experience-bluesky-posts/) it goes into all the detail you need. I added some of my own personal tweaks but the core is all this mans work. All you need to do is add the partial, link it into your equivalent `post.html` and add `blueskyid` to your post metadata.
With out further addu the comments section for that off chance where one person wants to add their two cents to any post of mine!

