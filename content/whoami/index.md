---
title: "whoami"
date: 2023-09-15T11:30:03+00:00
author: "William"
# author: ["Me", "You"] # multiple authors
showToc: true
TocOpen: false
draft: false
hidemeta: true
comments: false
# description: "Desc Text."
# canonicalURL: "https://canonical.url/to/page"
disableHLJS: true # to disable highlightjs
disableShare: true 
disableHLJS: false
# hideSummary: false
searchHidden: true
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true 
ShowWordCount: true
ShowRssButtonInSectionTermList: true
UseHugoToc: true

cover:
    image: "cover-photo.jpg" # image path/url
    alt: "cover-photo.jpg" # alt text
    # caption: "Perspective" # display caption under cover
    relative: false # when using page bundles set this to true
    hidden: false # only hide on current single page

---

```python
class me():
    def __init__(self):
        self.name       = "William Smale"
        self.location   = "London, UK"
        self.experience = 7
        self.profession = "Senior Product Security Engineer"
        self.languages  = ["Go", "Python", "Bash"]
        self.interests  = ["Coding", "Hacking", "Diving", "Photography", "Philosophy"]

    def favorite_quote(self):
        return random.choice([
            "There are more stars in the universe then seconds in a human life.",
            "The quieter you become, the more you can hear."
        ])

    def output_code(self, coffee):
        if coffee == "Cortado":
            return "Code crafted with perfection ☕️"
        elif not coffee:
            raise Exception("NO COFFEE!!!")
        return "Code"
```




