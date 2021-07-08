---
layout: post
title: "OddshotTV: Capture and watch gaming highlights"
excerpt: A couple of months ago I helped implement the base system for an
  awesome video-game streaming servic...
date: 2015-07-18
updatedDate: 2015-07-18
tags:
  - post
  - Amazon
  - nginx
  - nodejs
  - Oddshot
  - Twitch
---

A couple of months ago I helped implement the base system for an awesome video-game streaming service called [Oddshot](http://oddshot.tv/). Oddshot captures your favourite highlights from streaming services such as [Twitch](http://www.twitch.tv/) with an easy-to-use Chrome or Firefox plugin. Activating the capture functionality by entering **!shot** in the chat will provide users with a video highlight of about the last 30 seconds of gameplay.

Here's an example of a highlight that you might see on Oddshot:

<iframe src="http://oddshot.tv/shot/LIRIK_589_201507102303143797/embed" width="640" height="360" frameborder="0"></iframe>

_(check out the [original page](http://oddshot.tv/shot/LIRIK_589_201507102303143797))_

There are already many thousands of shots taken with Oddshot, and we've only been live several weeks. It just goes to show how vibrant the spectator gaming entertainment community is, and how great an addition Oddshot has already proved to be. It's been an immense amount of fun working on it, and I've already learnt so much about the industry that it makes it really worthwhile.

## The meat and potatoes

Not only was building something so powerful very rewarding, but developing with the tools I've chosen has been an invaluable learning process. I started the system with what I thought to be quite a well-balanced stack:

*   C# servers for video handling and processing
*   MySQL for the database
*   PHP &amp; Laravel 5 for the webservers

This build worked remarkably well, and we presented at [DreamHack](http://www.dreamhack.se/) in May 2015\. A few weeks down the road with tonnes more visitors and shot-takers and we're re-thinking the stack. The video servers and database are being redeveloped to be more robust, whilst we've moved away from Laravel &amp; PHP to ExpressJS and NodeJS.

While Laravel is a **damn good framework**, it covers up its inner workings by a prohibitive layer of magic. That and the complexity around really getting your hands dirty with authentication made it a poor prospect for the continued growth of our new community. We ultimately binned Laravel for a NodeJS &amp; Express server running behind Nginx. Nginx handles all of the static files (and their caching) more efficiently than Node+Express ever could, while the actual dynamic routes are all handled in the Node server.

While PHP &amp; Laravel are arguably more performant than NodeJS and Express, the memory usage behind the Node server is practically negligible, making it a great candidate for scaling. It's also incredibly simple compared to the Laravel installation, and everything is in plain sight without the need of reading any manuals.

Adding features to the Node system has also been incredibly easy, so we're positive that this change will result in a faster release cycle.

## Get your hands dirty and take a !shot

Head on over to the [homepage](http://oddshot.tv/) and download the [Chrome plugin](https://chrome.google.com/webstore/detail/oddshot/olnoeeagkgpkplnhmnnlgodjnjgckhja?authuser=2). Once it's installed, jump on [Twitch](http://www.twitch.tv/) and find a game &amp; stream that interests you. Keep your eyes peeled for a moment in the stream that you found funny, exciting or flat-out extraordinary and type **!shot** in the chat. The necessary information will be sent to our servers and in a few moments a new tab will open with the shot you just took.

[alert type="info"]Oddshot needs the stream to play for at least 30 seconds before a !shot can be taken. A notification should pop-up in your browser window when the stream is ready.[/alert]

Be sure to share your shots with the community by either using the share buttons on the shot pages or by tweeting in [#oddshotTV](https://twitter.com/hashtag/oddshotTV) or [@oddshot_tv](https://twitter.com/oddshot_tv).
