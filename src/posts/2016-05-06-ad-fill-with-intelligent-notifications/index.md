---
layout: post
title: Ad fill with intelligent notifications
excerpt: There are hundreds of networks out there competing for the broadest reach and best offering...
date: 2016-05-06
updatedDate: 2016-05-06
tags:
  - post
  - adtech
---

There are [hundreds of networks](http://www.adnetworkdirectory.com/ad_networks/) out there competing for the broadest reach and best offering, and most of them use variants of the same technologies to deliver their creatives. Depending on the setup, network placements can be nested quite deeply so that they pass-back to another network for their fill. Sometimes the other network fills in the same container element, and sometimes it will draw its own iframe to contain its creative.

For ad networks this probably doesn't mean much - their job is over if they pass back to another ad, and if they're filling then they can track the [viewability](http://www.kiosked.com/downloads/kiosked-ad-viewability.pdf) of their creative using various technologies. For **ad tech** companies, however, this is a tricky problem.. and it stems from browser security.

> A Friendly IFrame is an IFrame that shares the same domain as the main page it is hosted on. This generally means that the content is trusted and hence, can ‘break out’ of the IFrame and manipulate the content on the hosting page. Friendly IFrame is some kind of interactive and communicating frame... A non-friendly IFrame is hosted under a different domain to that which the IFrame tag is hosted on. Under the 'same-origin-policy', the content of the IFrame cannot interact with the page on which it is hosted. ([AOL](http://creative.adform.com/support/documentation/good-to-know/friendly-and-non-friendly-iframes/))

Ad-tech companies that provide front-end advertising systems lose the ability to detect when parts of an ad have loaded - this effectively means that the software cannot know exactly when to show an ad, and they risk showing empty placements.

Many ads are placed statically on a page, and are located in the HTML when it's delivered to the browser, but those that are created dynamically by smarter and more dynamic applications may use animations and other vehicles to present the ad to the user. Presenting a blank ad can make it feel like the user is viewing a broken interface, especially if the ad is an interstitial unit (full-screen).

Iframes themselves fire load events when the content inside the iframe had finished loading, but the frequency at which these events are fired not only differ between browsers, but also between browser versions (Chrome has even changed this behaviour recently). Regardless of this broken functionality, even having a unified process here would mean little for detecting the **true loaded state** of an advertisement. Just load events themselves won't help in detecting if there are more creatives or networks to come.

## Bypassing the security
Seeing as we cannot peek inside of non-friendly iframes to gain an understanding of what's loaded and what hasn't (a very manual approach anyhow), we need some way to receive notifications from ads when their statuses change.

Some of our systems at [Kiosked](http://kiosked.com) use `window.postMessage` to pass messages to other frames - using this recursively on `window.parent` until `window === window.top` while sending a message to each window is a good way of ensuring the message is heard by some parent script (eg. the adtech software).

If each ad could send a message to each parent indicating its status, that would already provide us with a rather robust way of detecting the ad's status. Each event could have a different type to indicate what has happened:

 * __pass__ - Pass-back (no fill, no delegate)
 * __fill__ - Ad has filled and we have a creative (no nested tags)
 * __delegate__ - An ad will fill, but it's a network tag (should contain next network's details)

Each message would also need to include identifying factors so that the managing system could detect which placement/iframe the messages were coming from when deeply nested. For instance, if I start by loading an **OpenX** ad, the first event should have "openx" as the owning __provider__. It could also pass other identifying parameters (such as placement ID, cachebuster value) that would help to further identify the placement when it may be duplicated on a page.

A message may look like the following (JSON):

```
{
    "pr": "openx",
    "ts": 1462562373173,
    "act": "pass",
    "id": {
        "pid": "12345",
        "cb": "19847348190314"
    }
}
```

Hopefully most of the attributes are easily understood - the `id` section contains identifying information like a placement ID and cachebuster, and the packet itself has the action, timestamp and provider of the event. This event sends the `pass` action, which means that we could confidently close the banner (or perform other actions to fill it).

When delegating to another tag, that tag's information should be entered so that tracking can continue. If the next ad is not known, the message it sends is basically useless as its origin is impossible to discern. For instance:

```
{
    "pr": "openx",
    "ts": 1462562373173,
    "act": "delegate",
    "id": {
        "pid": "12345",
        "cb": "19847348190314"
    },
    "del": {
        "pr": "appnexus",
        "id": {
            "pid": "56431",
            "cb": "549285"
        }
    }
}
```

In this example the OpenX placement is going to pass back (delegate) to an AppNexus tag. If we were to receive this message, we could then start looking for the AppNexus identifying information in future messages to see what that tag does.

## Not so scalable
One thing to note with this approach is the fact that the delegate information of filling tags is sometimes not known by the managing network - The placement simply holds an ad tag with no identifying information apart from the code itself (and scraping this would be cumbersome and fraught with errors).

This could be combatted by attacking the problem from the other direction as well: If we could send some kind of identifier into each subsequent iframe, like a `stackId`, we could use this in the messages as the identifying information:

```
{
    "pr": "openx",
    "ts": 1462562373173,
    "act": "delegate",
    "stack": "2e64a3ef4a1b5ec8"
}
```

In which case we'd wait for another action from the iframe, as we received the delegate message - the child would then send a new update with the same stack ID.

## Conclusion
Unfortunately these approaches require a lot of work around a standard for all networks to start implementing, but I don't feel that it's impossible or even far from achievable. Post-messages cost nothing and would greatly help with improving software integrations for the companies responsible for showing the ads. Publishers win, more ads are shown consequently and everyone goes home happy.
