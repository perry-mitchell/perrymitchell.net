---
layout: post
title: XDomainRequest and CORS on IE9
excerpt: I have a JavaScript project that makes a sizeable number of requests to
  the back-end using XMLHttpRequest, which I recently discovered breaks when
  usi...
slug: xdomainrequest-cors-ie9
permalink: article/xdomainrequest-cors-ie9/index.html
date: 2015-02-16
updatedDate: 2015-02-16
tags:
  - post
  - ajax
  - ie
  - quirks
---

I have a JavaScript project that makes a sizeable number of requests to the back-end using `XMLHttpRequest`, which I recently discovered breaks when using CORS on IE9.

[tagline]Worst, browser, ever.[/tagline]

By breaks, I mean it throws security errors like "Access is denied"... Terribly insightful as always. The solution to this quirk, after a little searching, was to revert to using `XDomainRequest` when on IE9\. [XDomainRequest](https://developer.mozilla.org/en-US/docs/Web/API/XDomainRequest) was removed in IE10 in favour of [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest):

> XDomainRequest is an implementation of HTTP access control (CORS) that worked in Internet Explorer 8 and 9\. It was removed in Internet Explorer 10 in favor of using XMLHttpRequest with proper CORS;

A basic implementation of using XDomainRequest could look like this:

```
var appliance = new window.XDomainRequest();
appliance.onload = function() {
    // do something with appliance.responseText
};
appliance.onerror = function() {
    // error handling
};
appliance.open("POST", "http://somewhere.com/endpoint", true);
appliance.send(data);
```

I started using this new _compatibility block_ for IE9, but noticed immediately that some requests (about a third) were being "**aborted**" - No reason or error.

Jumping back into the Googles, I found several (many, many) articles mentioning the same problem. A co-worker also found [this article](http://cypressnorth.com/programming/internet-explorer-aborting-ajax-requests-fixed/), which sums it up nicely:

> The problem has to do with IE timing out the request even though data is being transmitted. By defining some additional event handlers and specifying a timeout value of 0, IE will not abort the request prematurely.

Which means you should use something closer to this:

```
var appliance = new window.XDomainRequest();
appliance.onprogress = function() {}; // no aborting
appliance.ontimeout = function() {}; // "
appliance.onload = function() {
    // do something with appliance.responseText
};
appliance.onerror = function() {
    // error handling
};
appliance.open("POST", "http://somewhere.com/endpoint", true);
appliance.send(data);
```

Now IE9 will magically complete all (hopefully) requests, without timing out like a coward.

This has obviously been covered before, and by many, but I wanted to add my voice of frustration to the collective. These quirks are numerous and spread across the browser's history, and so it remains the bane of my cross-browser compatibility testing both in my job and on personal projects. With each new version of IE released I look forward to deprecating an earlier one, but they don't ever seem to improve.

Developing for Internet Explorer is like programming on a typewriter; both are ancient and provide little-to-no intelligent debugging information.

## Compatibility with <del>newer</del> better browsers

If you're stuck, like me, with supporting Internet Explorer version 9 and later (I feel pity for you if you must support earlier), then you're going to have to be conditional about this situation. When sending CORS requests with better browsers you'll have to support `XMLHttpRequest` and the use of the `withCredentials` flag (boolean) and the `onreadystatechange` callback. For these browsers, something like the following should resemble your basic request method:

```
var appliance = new window.XMLHttpRequest();
appliance.onreadystatechange = function() {
    if (appliance.readyState === 4) {
        if (appliance.status === 200) {
            // success, use appliance.responseText
        } else {
            // error        
        }
    }
};
appliance.open("POST", "http://somewhere.com/endpoint", true);
appliance.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
appliance.withCredentials = true; // to support sending cookies with CORS
appliance.send(data);
```

So between the two, you'll need to handle the callbacks (primary concern) as well as the `setRequestHeader` and `withCredentials` statements. I'll leave the integration of the two methods up to you ;)