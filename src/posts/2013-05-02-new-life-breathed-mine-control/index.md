---
layout: post
title: New life breathed into Mine Control
excerpt: "So it's been a while since I released my first app, Mine Control: An
  iOS app designed to provide an ..."
date: 2013-05-02
updatedDate: 2013-05-02
tags:
  - post
  - mine control
  - minecraft
---

So it's been a while since I released my first app, Mine Control: An iOS app designed to provide an easy-to-use interface for administrating Minecraft servers through the RCON protocol. With support for RCON having been added to Minecraft, I set out to build an app that server moderators could use to control running games. The moderators had a variety of functions they could perform, like player control (banning, booting and op'ing), weather control, time control, item provisioning, player teleportation and other operations.

Mine Control has been on the market for many months now, and the response has been great. I've had lots of great feedback, and much more in the way of requests to add support for mods like Bukkit. I also feel the interface needs a change - I can offer a more streamlined experience to users, along with more useful functionality.

The next version is currently under development, and I expect to have it completed in a matter of weeks. My site is also still "in progress", so features like commenting don't quite work yet. When that's sorted, I'd love to hear what suggestions you may have - Just post a comment to this article or leave me a message in the Contact form.

Many users have provided feedback regarding features and functionality which are not supported by the RCON implementation that Minecraft users, such as:

*   Monitoring the chat log
*   Retrieving player information
*   Retrieving information regarding the environment
Minecraft's RCON does not provide a feed of the server log, so the app is unable to monitor any log or chat traffic. Mine Control works on all vanilla Minecraft servers without modification, and it achieves this by using the provided RCON functionality. I will most likely not be adding extra functionality beyond the protocol (aside from QUERY at some later stage).

Regarding the same note, other data like player information (aside from their name) and environment data is also irretrievable. The data available to the app is provided purely from the [server commands in Minecraft's console](http://www.minecraftwiki.net/wiki/commands).

There'll be much more to see with the new release of Mine Control. Keep an eye out for the update!