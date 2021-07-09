---
layout: post
title: Ubuntu One and other cloud storage options
excerpt: Ubuntu One is one of many cloud storage options on the market today.
  Like Dropbox and other alternatives, it offers free storage upfront, along
  with m...
slug: ubuntu-one-cloud-storage
permalink: article/ubuntu-one-cloud-storage/index.html
date: 2013-05-12
updatedDate: 2013-05-12
tags:
  - post
  - ubuntu
---

[Ubuntu One](https://one.ubuntu.com/) is one of many cloud storage options on the market today. Like [Dropbox](https://www.dropbox.com/) and other alternatives, it offers free storage upfront, along with multi-platform agent support, a pretty web interface and mobile apps. Other options I'd like to mention in this discussion include [LogMeIn](https://secure.logmein.com/)'s [Cubby](https://www.cubby.com/) and [ownCloud](http://owncloud.org/) (the host-your-own cloud storage solution).

I've used Dropbox since highschool - It got me through uni and I've still found myself using it for moving dev assests around and retrieving media from clients at work. Dropbox is a fast, universal cloud storage solution that's just worked, from day one. However I disagree with several management decisions they've made (as well as their pitiful 2gb free storage :P), and have decided I want out.

My first port-of-call was ownCloud - The personal cloud hosting solution (free) that allows you to host your cloud on your own hardware. There is no remote server/service with it, you set it up yourself and build your own network of synchronised data. It's great, and I love it, even though I've experienced a few quirks with the Linux sync clients. The web interface is amazing and the app (iOS) isn't bad either. I'll speak more on ownCloud in another post.

I tried LogMeIn's Cubby as well as Microsoft's [Skydrive](https://skydrive.live.com/) at about the same time. Cubby is great, and had no hitches as far as I could see. It comes with a free 5gb and a pretty client and web interface. I use their log-me-in service to access my computers from everywhere as well, including the iOS app (amazing - got it for free too!). I uninstalled this because I had so many different storage accounts at that stage. Skydrive was cute, but ultimately useless. Slow transfers,**rubbish** interface and just a general lack of polish everywhere. Microsoft made it harder than it needed to be.

I eventually found Ubuntu One - The cloud storage solution from [Canonical](http://www.canonical.com/), the makers of the [Ubuntu operating system](http://www.ubuntu.com/). It's a great little system - Again, free, pretty interface, mobile apps and sync clients for every major OS.

I've been using it for several weeks now without a hitch, but have since run in to problems with it not syncing. I have certain files and whole folders that just refuse to show up in other locations. I believe the issue is primarily concentrated to my Mac Mini running Snow Leopard, but I can't be sure (haven't done enough thorough testing). The files are just PNG images along with folders of them. I use every corner of the room when it comes to OS' (Windows, Mac and Linux), so I think I have a pretty good test case. There are lots of bugs registered for non-syncing items with Ubuntu One - Which is a bit of a showstopper for me. The synchronisation of these files are critical for me, so I'll be removing my Ubuntu One stuff until I can be sure they've address all of their issues.

Though I'm leaving U1 for now, that doesn't mean anyone should follow suit. This has been my own experience, and may not reflect yours in the slightest. I advise any readers looking for a decent cloud storage solution to try all of the available options, even those I haven't mentioned here (Google [Drive](https://drive.google.com/), [JustCloud](http://www.justcloud.com/), etc). Install a few, sync a set of files and form your own opinion. Your needs may lead you to pick up another provider altogether.

For those looking for just a recommendation, here you go:

*   If you don't want to, or can't host your own cloud storage system, I'd recommend LogMeIn's Cubby. It comes with 5gb free, and awesome app and great sync clients. The provider is a massive entity with truckloads of experience.
*   If you have the infrastructure at home, definitely take a look at ownCloud. I've been running it on my own little dedicated Linux box (Ubuntu 12.04 server) for 6 or so months now. It gives me ~200gb of "cloud storage" and has a mobile app to go with it. It supports pretty much all of the same features of the other hosted cloud storage options, including file sharing, file versioning and calendar/contact syncing. It also has an array of features that no other host can boast, including webdav and other connection options, plugins and user account management.