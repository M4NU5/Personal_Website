---
draft: false
title: "Coding Convenience: How I Automated Our Digs Expenses with Python and Zapier"
date: 2024-01-09T12:09:31+00:00
author: William
category:
  - Tech
tags:
  - Automation
  - Python
cover:
  image: auto_expensing_solution_architecture.png
  alt: EpicSolutionArchitecture.png
description: Automate your utility expenses with a Python script that integrates bank transactions, Google Sheets, and Zapier to streamline bill splitting with your housemates. This guide details the architecture and setup, including how to fetch direct debits, sync with Google Sheets, and trigger automated Splitwise expenses. Perfect for anyone looking to simplify group expenses and free up time for more enjoyable activities. Explore the full project on [GitHub](https://github.com/M4NU5/ExpenseAutomation/tree/master) and consider future enhancements like automated payment notifications.
---
## Introduction
I’ve recently moved in with some mates. As with all things moving you need to setup debit orders and subscriptions with your respective utility providers and whatever monthly things you all want to add to the expenses docket.

I’ve been toying with the idea of automating my finances more. Many banks provide ways for you to do this through scheduling payments, direct debits etc. Some new digital banks even expose their APIs for you to use directly in whatever way you choose. My bank has this functionality available to me. So why not put together a fun little project to automate the expensing?

## Solution Architecture

Look above for that bad boy.

## Python Script

Let me explain the components outlined above. Let’s start with the juicy part, the Python script. The script when executed will fetch the latest direct debits on my account. Extracting those I have whitelisted for Splitwise. It then fetches the Google sheet and filters out all rows that are not the current month.  
A quick delta between the Google Sheets results and bank function appending any discrepancies to the Google sheet and we are golden. Throwing this puppy in a GitHub action that executes every Monday and stage one is complete.

## Zapier

Now for stage two part of the solution, the Zapier zap. This is relatively simple, just build a two-stage trigger &gt; action. The zap waits for a new row to be appended to the Google sheet. This triggers the automated workflow and creates the expense in our digs Splitwise.

That’s how I automated the expensing of utilities of my Digs. I did consider interfacing directly with the Splitwise API but creating an API key required me to supply a URL and some other bollocks that I didn’t want to deal with. Plus this way I get my own itemized expense book through google sheets.

Check out my [git project](https://github.com/M4NU5/ExpenseAutomation/tree/master). It may be of interest to you.

Some additional functionality I’ll be looking to add if I ever circle back around to this would be:

1. Automate payment notifications and followups.
2. Add AI functionality because that’s what all the cool kids are doing these days 😀

## Conclusion 
Put this together for you and your friends, and free up time for funner tasks... Like touching grass! Now go do that!!!

![EpicBemo](https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExazd6cWJuZjE1bTdpc2VtdGZlY3V2eWZoeHlkMGd6ejg4MnZrbmpqZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ILjkBExIzBhrFzqDVP/giphy.gif#center)