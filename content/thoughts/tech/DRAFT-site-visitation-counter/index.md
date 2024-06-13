---
draft: true
title: Site visitation counter
date: 2024-05-06T17:27:24+00:00
author: William
category:
  - Tech
tags: []
cover:
  image: test
  alt: test
---

So you want to add a visitation counter to your website? Thats what I'm wanting to do and I think its safe to assume you want to do the same else why are you reading this post :D

### Setup Google Analytics
https://chatgpt.com/c/75bd0b7b-939a-438c-b776-e856761cfa75 


### Add Google Analytics to Hugo go config 

Add 
```yaml
googleAnalytics = "G-NM0000000"
```



Updating baseof template with google analytics
```html
  {{ if .Site.Params.googleAnalytics }}
    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id={{ .Site.Params.googleAnalytics }}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '{{ .Site.Params.googleAnalytics }}');
    </script>
    {{ end }}
```


Going to google analytics getting the G4 code. Got to manual setup and once deployed confirm it is setup. Then give it some time to sync up

Now to fetch this data and display it on our website 

### Fetch visitor data

Setup google analytics API
Go to https://console.cloud.google.com/apis/dashboard and enable Google Analytics Reporting API. Once enabled we shall create a service account and generate a key to interact with the API. 
Downloading the JSON file we add it as a secret to our Github repository  



Writing server side script
The purpose of this script is to fetch the visitor data from the google analytics API and export it into a .JSON file that can then be consumed when Hugo builds the static pages

Write Hugo short code



### Display visitor count data

### Automate updating of visitor count
