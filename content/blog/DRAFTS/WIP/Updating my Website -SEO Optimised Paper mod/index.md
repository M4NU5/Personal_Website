---
draft: true
title: 
date: 2024-08-14
author: William
category: 
tags: 
description: 
cover:
  image: test
  alt: test
---


## File introduction

- `content`: used to put blog content
- `layouts`: custom HTML
- `assets`: custom CSS and JavaScript
- `public`: project export file
- `static`: storage pictures
- `themes`: theme

Files inside `themes/Papermod`are the relevant code of PaperMod. The main directory is:

- `assets`: CSS and JavaScript code of Papermod
- `layouts`: HTML of Papermod

**NOTE**: 
1. Custom additions must follow theme file structure.
2. Any custom HTML, CSS and JavaScript will overwrite the theme being used. 

## Local preview

1. Enter the `hugo server -d` in the terminal. I created `start.bat` to make it easier.
2. After starting, the servers local preview URL is `localhost:1313`.

## Website deployment

I use [Cloudflare Pages](https://pages.cloudflare.com/).

1. Create a repository in GitHub.
2. To link Cloudflare Pages to your repository to automate the deployment. Go to the **Cloudflare Panel > Workers & Pages > Create > Pages > Connect to Git**.
3. Connect your account and select the repository you create previously, **Begin Setup**.
4. Name the project what you want and select the branch, if your not going for default. 
5. Click the dropdown **Environment Variables (advanced)** and add the variables
	- `HUGO_ENV = production`
	- `HUGO_VERSION = <YOUR_VERSION>` Found in terminal type `hugo version`
6.  Click **Save and Deploy**. Each time we push an update to our specified branch Cloudflare will pull and deploy the updates to the website.




## Custom CSS Themes added


```css
.logo a:hover {
    transition: 0.15s;
    color: gray;
}

svg:hover {
    transition: 0.15s;
}

.social-icons a:nth-child(1) svg:hover{
    color: #C84370 !important;
}

.social-icons a:nth-child(2) svg:hover {
    color: grey !important;
}
...
```

## Custom CSS Hover

To override papermod create your CSS file here `/assets/css/extended/custom.css`.

- Home button hover:

```css
.logo a:hover {
    transition: 0.15s;
    color: grey;
}
```

- Social media hover:

```css
svg:hover {
    transition: 0.15s;
}

.social-icons a:nth-child(1) svg:hover{
    color: grey !important;
}

.social-icons a:nth-child(2) svg:hover {
    color: #0072b1 !important;
}
...
```

`nth-child` can set the hover color of each icon.

- Night mode and day mode hover:

```css
#moon:hover {
    transition: 0.15s;
    color: deepskyblue;
}

#sun:hover {
    transition: 0.15s;
    color: gold;
}
```

- Hover of links in menu:

```css
#menu a:hover {
    transition: 0.15s;
    color: grey;
}
```

- Button hover:

```css
.button:hover {
    -webkit-transform: scale(1.1);
    -moz-transform: scale(1.1);
    -ms-transform: scale(1.1);
    -o-transform: scale(1.1);
    /* box-shadow: 0 0 0 1px grey; */
    transform: scale(1.1) translateZ(0) translate3d(0, 0, 0) rotate(0.01deg);
}
```





https://busuanzi.ibruce.info/