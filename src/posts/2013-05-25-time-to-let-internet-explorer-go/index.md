---
layout: post
title: Time to let Internet Explorer go
excerpt: Working with websites every day really opens ones eyes to the
  inconsistencies in protocol and feature support with browsers, devices and
  operating sys...
slug: time-to-let-internet-explorer-go
permalink: article/time-to-let-internet-explorer-go/index.html
date: 2013-05-25
updatedDate: 2013-05-25
tags:
  - post
  - ie
  - microsoft
---

Working with websites every day really opens ones eyes to the inconsistencies in protocol and feature support with browsers, devices and operating systems. It's an irritating battle of compatibility when it comes to developing cross-browser websites with a little flair. It's a struggle my team and I face with Internet Explorer every day.

Our company has agreed to wipe IE6 from the support list, which is the first big step to a faster development cycle (especially seeing as some of our previous clients have relied on the prehistoric browser). We've also added extra costs around IE7 support if it's required. Unfortunately, we still support IE8 for several of our products - But even IE9 causes massive problems because of it's ineptitude as a web page rendering engine.

I can't take a stand against the browser at work, as it's still money coming in for the extra work. But for my personal sites and web endeavours, I no longer want to have to deal with the discrepancies surrounding Microsoft's application. I'm going to block Microsoft's Internet Explorer from viewing this website and all future sites that I build. I can achieve this simply by plugging in some PHP:

```
if (strpos($_SERVER['HTTP_USER_AGENT'], 'MSIE') !== false) {
    // Redirect to an error page
}
```

This will, providing there's no user agent spoofing going on, render an error message for the user. I'm yet to decide on the content of the message, but it'll clearly state they're using an inferior product, providing links to Chrome, Firefox and Opera.

I remember when [Kogan implemented the IE7 tax](http://www.kogan.com/au/blog/new-internet-explorer-7-tax/) for anyone buying products on the website using the browser. We need to force these companies to pick up their game or get out.