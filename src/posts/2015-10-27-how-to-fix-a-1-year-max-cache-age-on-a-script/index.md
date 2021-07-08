---
layout: post
title: How to fix a 1 year max cache age on a script
excerpt: Today I witnessed one of the worst sights I've seen since I started
  developing for the web - a JavaS...
date: 2015-10-27
updatedDate: 2015-10-27
tags:
  - post
  - cache
  - quirks
---

Today I witnessed one of the worst sights I've seen since I started developing for the web - a JavaScript file with a helluva lot of cache time.

![1 year cache](cache-control.png)

This occurred with a script that I was hosting publicly, which is requested at a relatively high frequency.. and it hadn't been noticed for over 7 days. This meant that every person who had requested the script, excluding users in private-browsing mode, had received instructions to **cache the script for an entire year before requesting it again**. For me, this is one of the worst things I've seen involving cache, because it's almost futile to try and solve.. almost.

## What happens next

So there's a script, cached a lot longer than it should, and clients are not going to re-request it for another year (besides when they change computer/browser or clear the cache). Luckily this static script loads a dynamic script as the next step, so I had some way of still interacting with the locked-in clients - all is not lost.

_If there was no dynamic portion to this, or no way to run code dynamically in the client browsers,_ then there'd be no other option apart from *walking away*.

I had to figure out how I could somehow undo this massive mistake - the cache had been invalidated and new clients were receiving the file with the correct cache headers, but all other clients over the 7 or so days were still stuck with the cached copy. How do you unfreeze tonnes of remote, anonymous clients from the cold, uncaring grasp of perma-cache?

![I heard you like cache](heard-you-like-cache.jpg)

## Clearing the cache remotely

The only way to really move forward was to clear the cache remotely, and this has to be done by executing some repair code in browsers where the cache is in the _broken_-state. Luckily I had a version to work with, hardcoded into the static script, which I could compare when trying to detect which clients were affected.

There are ways to "force" fetching of cached assets with JavaScript, but they're all far from ideal. I needed to trick the browser into fetching the script again, and in doing so the browser would inadvertently update the cache headers on the file.

The key to clearing the cache on the client browser is **refreshing**. If you refresh the page, either by user action or JavaScript reloading, assets on the page will be fetched from their origin (including the script!).

I had to identify the affected clients and execute the repair code accordingly, but this involved refreshing. Reloading every client's browser to fix this issue is pretty extreme, so I had to opt for a more subtle approach. If I could refresh an **iframe** on the page, containing a reference to the script, that would invalidate the cache.

### Fleshing it out

My final fix was quite complex due to the requirements of the software, but I'll go over an example here so you can see some code. Firstly, we need to create an iframe on a page that's invisible and points to a remote page:

```
// Create the iframe
var iframe = document.createElement("iframe"),
    shouldReload = true;
// Hide it from the client
iframe.style.display = "none";
// Our remote page that does the refreshing
iframe.src = "http://localhost/cache-buster.html";
iframe.onload = function() {
    if (shouldReload) {
        // When loaded, send a message telling the script to refresh the frame
        iframe.contentWindow.postMessage("refresh", "*");
    }
    // Only refresh once
    shouldReload = false;
};
document.body.appendChild(iframe);
```

The remote page being some HTML:
```
<html>
	<body>
		<!-- Our offending script, cached for 1 year: -->
		<script type="text/javascript" src="http://mysite.com/static.js"></script>

		<script type="text/javascript">
			console.log("Script loaded");
			// Wait for a message
			window.addEventListener("message", function(event) {
				var msg = event.data.toString();
				if (msg === "refresh") {
					console.log("Refresh");
					// Refresh the page
					window.location.reload();
				}
			});
		</script>
	</body>
</html>
```

Hosting the remote page somewhere accessible to all clients is the first step, then we slip the repair script to each client that has the perma-cache. The snippet creates the iframe, waits for it to load, sends it the "refresh" message and the iframe refreshes. Once the iframe has refreshed, the `static.js` script is fetched again and the cache headers updated.

![10 minute cache](cache-control-600.png)

## Luck

I got lucky here - really lucky. Had I been without the dynamic script always following the first, I'd have been without a way to even attempt to fix the blunder that is a year long cache. Had this situation arisen in a company's product, said company would have risked a lot more than should be possible on a single header.

Let this serve as a lesson to those dealing with browser caches: If you're setting a long cache time, be damn sure that you'll never need to change that asset.