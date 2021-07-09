---
layout: post
title: OSX Mavericks on Virtualbox in Linux
excerpt: For a while now, I've been trying to get OSX running inside a VM on my
  Debian machine. I myself own a Macbook pro and a Mac Mini, but I still would
  li...
slug: osx-mavericks-on-virtualbox-in-linux
permalink: article/osx-mavericks-on-virtualbox-in-linux/index.html
date: 2014-10-08
updatedDate: 2014-10-08
tags:
  - post
  - debian
  - osx
  - virtualbox
---

For a while now, I've been trying to get OSX running inside a VM on my Debian machine. I myself own a Macbook pro and a Mac Mini, but I still would like access on my Debian desktop to a Mac environment, mainly for browser & Xcode testing. I've recently been struggling getting a system going in Virtualbox on Debian Wheezy, and I've just managed to get everything working.

I followed this [article on the MacBreaker site](http://www.macbreaker.com/2014/05/os-x-mavericks-in-virtualbox-with-niresh.html), which explains the process in very good detail. After obtaining an image and following the installation instructions to the letter, I was still left without internet access or any devices in the network settings. I tried reinstalling the entire system several times to try and combat this issue, but to no avail.

If I'd just spent some time and read the comments section, I would have noticed _Rote Adler_'s comment:

> I am very glad to announce that I have this issue fixed by changing the network adapter from Intel PRO/1000 T Server (82543GC) to Intel PRO/1000 MT Server (82545EM)

I shut down the machine, changed the network adapter to the **Intel PRO/1000 MT Server (82545EM)** adapter and booted up. I instantly had working internet. Below is a screenshot of my network settings in Virtualbox:

![OSX Mavericks network setup](http://perrymitchell.net/wp-content/uploads/2014/10/mavericks_network_setup-300x221.png)

My recommendation, if you're attempting to install Mavericks in a VM, is to follow the MacBreaker instructions and then update the network adapter like I've mentioned here.