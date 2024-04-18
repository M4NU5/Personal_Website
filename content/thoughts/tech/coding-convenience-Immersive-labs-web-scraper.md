---
draft: true

title: 'Coding Convenience: Immersive labs web scraper'
date: '2024-04-17T12:09:31+00:00'
author: William

category:
    - Tech
tag:
    - Automation

cover:
    image: /thoughts/tech/auto_expensing_solution_architecture.png
    alt: "EpicSolutionArchitecture.png"

---

You ever look at your achievements page on X Y or Z website and think "I would love to show this whole page and not just piece meal my linkedin account resulting in just unprofessional noise on my public profile"... No? Well thats what I was thinking. So to solve this I built a web scrapping bot that extracts all the essential details and [outputs this webpage for my site](https://williamsmale.com/learned). Heres how I did it.


Ingest Webpage -> Scrape out each badge -> Fetch shareable badge page for each achievement [Title, Share_url, image_url] -> Generate markdown file -> copy into hugo project



## Making the soup
Lets get started with importing the achievements webpage into our python script. Now this achievements page is locked behind a login EWWWW. Now I could automate this login process but Ima work smart and do this part of the process manually. This isn't much of a problem as this page itself doesn't change. So I'll only need to fetch the achievements page when I'm wanting to apply an update to my website.

So simply logging in, going to the achievements page and saving it to the project file on my computer. This will be enough to get us where we need to go.

![EpicGif](https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3FzZ245bmYwNzRjcGlqNmdzY3F3bDRkOTJtOW85bzB4OWoxdGZyZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/r8I7tDl75QLfh2SkpE/giphy.gif#center)


```
Test Code
```




## Fetching each page
Now that we have our soup and extracted the chunks of interest we need to go to the shared page and extract what we need.
I want to have the image of the badge and when clicked the user will be taken to the shared achievement page. So for this we want to extract 3 things: `Title`, `img`, `share_url`

Digging into what the achievements page lets look at the components mentioned. `Title` is pretty straight forward. looks like it seems that the image is hosted on some aws instance 

There is some weird variation of how immersive labs constructs their share_url so i chose to be a heathen and made some nested try except statements... I know I know burn me at the stake, I could loop through the different url permutations until I get a 200 response. But I am writing this as a quick and dirty script not a production grade web scraper. but methods  I have been a hethen and created some nested try, except clauses that will try all variations that I have seen.



## Generating markdown
Fantastic we have all the achievement pages extracted and we are ready to generate our webpage. First I need to prepare Hugo and write a custom shortcode

`Careers Shortcode`


`Badge Shortcode`

Now we can call this shortcode in our markdown file because hugo go IS AWESOME and we get this output
[outputs this webpage for my site](https://williamsmale.com/learned)


