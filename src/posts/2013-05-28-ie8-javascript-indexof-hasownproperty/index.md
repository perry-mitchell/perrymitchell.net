---
layout: post
title: "IE8 Javascript: indexOf and hasOwnProperty"
excerpt: "I'll cut to the chase on this one: IE8 has a few problems handling
  some Javascript features a lot of programmers, like myself, have taken for
  granted ..."
slug: ie8-javascript-indexof-hasownproperty
permalink: article/ie8-javascript-indexof-hasownproperty/index.html
date: 2013-05-28
updatedDate: 2013-05-28
tags:
  - post
  - ie
  - quirks
---

I'll cut to the chase on this one: IE8 has a few problems handling some Javascript features a lot of programmers, like myself, have taken for granted in other browsers. For instance, the indexOf and hasOwnProperty functions - Two very handy tools that don't work in IE8\. I'll be including some "fixes" for these 2 functions in this post.

I'd firstly like to point out **Quirks Mode** on IE8: A setting in the browser debug area that allows for some crazy script processing and rendering. The topic is covered on [Wikipedia](http://en.wikipedia.org/wiki/Quirks_mode):
> "In computing, quirks mode refers to a technique used by some web browsers for the sake of maintaining backward compatibility with web pages designed for older browsers, instead of strictly complying with W3C and IETF standards in standards mode."
My first tip is to turn this damn 'tool' off before it ruins your day. If left on, your sh*t won't work.

Let's begin with fixing the problem of these two functions not being recognised. The trouble with **hasOwnProperty** is that it does exist in IE8, but is not usable on the **window** object. If you've gone and written tonnes of code using commands like 'window.hasOwnProperty("somevar")', you might break down at the sight of it all failing in IE8. There's a nice little fix for this:

```
window.hasOwnProperty = window.hasOwnProperty || Object.prototype.hasOwnProperty;
```

This snippet ensures that there is in fact a _hasOwnProperty_ method on the window object, so it'll behave like every other object. When you execute a command like:

```
if (window.hasOwnProperty("test")) {
	// do something
}
```

It'll work fine with the above code defined somewhere. Nice and simple.

Now we tackle the **indexOf** function. This one's tricky because it's non-existent. We need to prototype the function for the Array type:

```
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
		"use strict";
		if (this == null) {
			throw new TypeError();
		}
		var t = Object(this);
		var len = t.length >>> 0;
		if (len === 0) {
			return -1;
		}
		var n = 0;
		if (arguments.length >; 1) {
			n = Number(arguments[1]);
			if (n != n) { // shortcut for verifying if it's NaN
				n = 0;
			} else if (n != 0 && n != Infinity && n != -Infinity) {
				n = (n > 0 || -1) * Math.floor(Math.abs(n));
			}
		}
		if (n >= len) {
			return -1;
		}
		var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
		for (; k < len; k++) {
			if (k in t && t[k] === searchElement) {
				return k;
			}
		}
		return -1;
	}
}
```

This will add the functionality to allow the use of the indexOf function on arrays. I cannot take credit for the above function, as it's been cobbled together with examples found on Google and co-workers' discoveries.

**Edit:** I forgot to mention the console errors in IE8, which I've posted about [here](http://perrymitchell.net/article/ie8_javascript_console).
