---
layout: post
title: Add a new item to Ubuntu's Unity launcher
excerpt: Every time I install a new Ubuntu instance, and that's a lot, I find
  myself pouring over pages in Google trying to quickly find the best way to add
  a ...
slug: add-new-item-ubuntu-unity-launcher
permalink: article/add-new-item-ubuntu-unity-launcher/index.html
date: 2013-07-08
updatedDate: 2013-07-08
tags:
  - post
  - ubuntu
---

Every time I install a new Ubuntu instance, and that's a lot, I find myself pouring over pages in Google trying to quickly find the best way to add a new item to the Unity launcher. This post aims to solve that, so I hope it helps you as well.

I'm constantly having to add [Sublime Text 2](http://www.sublimetext.com/) to my launcher so I can open it without having to track down the executable. Doing this is really easy when you know how, and the process can be applied to whatever you want to run.

Firstly, browse to **/usr/share/applications** with your terminal and create a new .desktop file, such as:
`sudo vim sublime.desktop`

You'll need to open it as root. In vim, paste in the following text:

```
[Desktop Entry]
Name=Sublime Text 2
Comment=Sublime Text editor
Exec="/home/pez/Apps/Sublime Text 2/sublime_text"
Icon=/home/pez/Apps/Sublime Text 2/Icon/256x256/sublime_text.png
Terminal=false
Type=Application
StartupNotify=true
Categories=GNOME;GTK;Utility
```

Most of the entries there should be self-explanatory. I'm giving the item a name and comment, specifying its executable and icon, and a few other options which are quite generic. The important thing to note here is the **difference between Exec and Icon**. I'm often tricked up here and end up surrounding the Icon value with double quotes - This will fail and you'll not get an icon showing. Make sure the Exec value has quotes, but the Icon not.

Once you've created the .desktop file, browse to its location using your GUI browser. Drag the file on to your Unity launcher, and the icon will appear. That's all it takes!
