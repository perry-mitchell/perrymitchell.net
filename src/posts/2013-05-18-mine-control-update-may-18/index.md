---
layout: post
title: Mine Control Update - May 18th
excerpt: The new release of the Mine Control app is well underway, and I'm
  finding an increasing number of improvements I've been able to make in the
  general l...
slug: mine-control-update-may-18
permalink: article/mine-control-update-may-18/index.html
date: 2013-05-18
updatedDate: 2013-05-18
tags:
  - post
  - mine control
  - minecraft
---

The new release of the Mine Control app is well underway, and I'm finding an increasing number of improvements I've been able to make in the general look and feel of the app. Already the opening screen is much more useful (and a little more attractive as well). Here's some quick items that have been added to the new version so far:

*   Better server checking for adding servers - Checks to see if the server is both contactable and accepting of RCON connections.
*   Both Minecraft vanilla and Bukkit configurations for servers (more to come).
*   Unlimited number of servers manageable from the main screen (instead of the single one in the previous versions).
*   Player stats (online and total allowed) displayed on each server in the menu.
The server checking involves a preliminary ping to check that the server is available, and prevents the saving of the server until it is found. When adding, it also checks to see if RCON is available, but will add it regardless. The menu will display, per server, whether each one is accessible or not. At this current stage, the app requests the password for a new server and stores it. I may add functionality to have the password not remembered (prompted) in the next version (or perhaps this one), but it's not a priority just yet.

I think the ability to select either vanilla or Bukkit servers when adding a new one will make the app more practical for a lot of people. There is quite a huge audience for the Bukkit server mod and it would be a mistake not to support it this release. Most of the RCON commands are completely compatible between the two versions, though there are a few that work differently (player **list**) and a few ones that only exist for Bukkit servers. Other server mods may be supported in future releases.

There are some other features that are on my immediate to do list:

*   The ability to share servers, via email or link, to other iOS users (without server passwords, of course) - The primary function of this will allow texting or emailing of the link to someone.
*   A 'console' to execute commands*****.
*   A new and improved command menu.
*   A new and improved player list.
*   A better item index, updateable from my website. This means that the items used in-app will always be up-to-date (you won't have to get a new version of the app when new items are released).
*   Support for enchantments and other new game features.
<div>There'll most likely be another couple of updates before the new version is released, so check back here soon to see how it's going.</div>
*** Important note:** Some users of my app, and mostly that of Minecraft as well, seem to thing that the RCON that Minecraft uses supports "watching" the server console (and therefore that of the chat going on between the users). This is impossible. The RCON protocol for Minecraft is very basic: It works by sending a request, which in turn sends back a response. For example, sending "list" (the command for seeing a list of online players) will return something like "There are 0/20 players online:". This is not a solid connection, so you cannot just sit there and listen for all the console traffic on the server - And because Minecraft can't do it, my app can't either.

I have a huge interest in development of tools and apps, and also of Minecraft - If it can be made and would be found useful, I'll do my best to include it as a feature.