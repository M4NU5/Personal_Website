---
draft: false
title: "Coding Convenience: Immersive labs achievements scraper"
date: 2024-04-17T12:09:31+00:00
author: William
category:
  - Tech
tags:
  - Automation
cover:
  image: immersive_labs_achievements_scraper.png
  alt: EpicSolutionArchitecture.png
description: Create a personalized achievements page for your website using a Python web-scraping bot to extract and display your accomplishments. This guide walks you through saving your achievements page, parsing it with Beautiful Soup, and generating a custom webpage using Hugo Go shortcodes. Learn how to fetch, process, and display your achievements effectively, and discover how to solve common issues like expired image URLs by downloading and locally hosting images. Perfect for showcasing your milestones in a professional, visually appealing way.
---
## Introduction
You ever look at your achievements page on X Y or Z website and think "I would love to show this whole page and not just piece meal my linkedin account resulting in just unprofessional noise on my public profile"... No? Maybe it's just me... Anyway Ima build my own achievements page, with blackjack and hookers, using a [web scrapping bot](https://github.com/M4NU5/Immersivelabs_Achievements_Scrapper) that extracts all the essential details and outputs this [webpage for my site](/learned). Heres how I did it.

## Making the soup
Lets get started with importing the achievements webpage into our python script. Now this achievements page is locked behind a login EWWWW. Now I could automate this login process but Ima work smart and do this part of the process manually. This isn't much of a problem as this page itself doesn't change. So I'll only need to fetch the achievements page when I'm wanting to apply an update to my website.

So simply logging in, going to the achievements page and saving it to the project file on my computer. This will be enough to get us where we need to go.

![EpicGif](https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3FzZ245bmYwNzRjcGlqNmdzY3F3bDRkOTJtOW85bzB4OWoxdGZyZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/r8I7tDl75QLfh2SkpE/giphy.gif#center)

We then open the file and pass it using beautiful soup.

## Fetching each page
Now that we have our soup and extracted the chunks of interest we need to go to each achievements page and extract what we need.
I want to have the image of the badge and when clicked the user will be taken to the shared achievement page. So for this we want to extract 3 things: `Title`, `img`, `share_url`

Digging into each achievements page we extract what we want. There is some weird variation of how immersive labs constructs their share_url so I chose to be a heathen and made some nested try except statements... I know I know burn me at the stake, I could loop through the different url permutations until I get a 200 response. But I am writing this as a quick and dirty script not a production grade web scraper.

The output after this stage of this script is an array with each achievement as a dictionary element within the array.

## Generating markdown
Fantastic we have all the achievement pages extracted and in a consumable format. Now we are ready to generate our webpage. First I need to prepare Hugo go and write a custom short code that will facilitate the generation of the page. After a little bit of research into how Hugo go and short codes work. I came up with the following code snippet...

```html
{{- $url := (.Get "url") }}
{{- $height := (.Get "height") }}
{{- $alt := (.Get "alt") }}
{{- $link := (.Get "link") }}


<a href="{{$link}}" target="_blank">
<img  height="{{ $height | default `180` }}" src="{{$url}}" alt="{{$alt}}" loading="lazy" style="float:left"/>
</a>
```

What is a short code you might ask? A short code in Hugo go put simply is snippet of html code that you can call as a function within your markdown page template. You invoke this function using the following convention... Just add and additional `{}` to the code below.

```go
{< shortcode_name pram1="XYZ" pram2="XYZ" pram3="XYZ" >}
```

When Hugo go builds the page the markdown file specifies the short code piece for each badge element. The page is then generated from parsing the markdown and populating it with these short code elements.


With some trial and error I've made it so that the python script generates the appropriate markdown elements inline with how I want it to look. That file can be taken in lock stock and barrel into the content portion of my website. [This results in the following page](/learned). 

At present I'm just copying it into the file but if I wanted to completely automate this I would have the python script execute in a pipeline and automatically write to the appropriate file in my websites repository. Maybe I'll loop back around one day and do this but today is not that day.

Now I'm going to touch some grass and so should you!!!

![Touch grass](https://media1.tenor.com/m/CW-0A0q-6ksAAAAd/touching-grass.gif#center)

## Script Update

Future William here fixing past Williams mistakes. After a few weeks this is what my custom page looked like...

![broken_badges](broken_badges.png#center)

Looks so professional right?! Look at me and my personal website that is completely broken, I'm so skilled at code!

Some of you may already know what the problem is given the method I went with in the post above. But for those at the back that missed it the image URL that I'm pulling contains within it a token that allows access to get the image. This token obviously expires after a given period of time. I did suspect that this would happen resulting in the links to the images breaking but wanted to test to see if it actually would... and it did 😁

To solve this I've gone ahead and expanded my scripts functionality to download the image with the discovered URL. 
```python
import urllib.request as get_image

def __save_image(self, badge_title, image_url):
        try:
            image_path = os.path.join(f'./badge_images/', f'{badge_title}.png')
            get_image.urlretrieve(image_url, image_path)
            return image_path
        except BaseException as e:
            print(e)
```
The image is saved and the location of the image is passed back instead of the URL. This then seamlessly plugs into the page generation function I have written. [Now it looks so pretty again](/learned) and will never ever break again... right? 






