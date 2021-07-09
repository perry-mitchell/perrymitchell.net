---
layout: post
title: "IE8 Javascript: Console"
excerpt: In my previous post, I neglected to mention IE8's inability to work
  with the console object. It does work, but only if the debug tools are open
  when l...
slug: ie8-javascript-console
permalink: article/ie8-javascript-console/index.html
date: 2013-05-28
updatedDate: 2013-05-28
tags:
  - post
  - ie
---

In my [previous post](http://perrymitchell.net/article/ie8_javascript_indexof_hasownproperty), I neglected to mention IE8's inability to work with the console object. It does work, but only if the debug tools are open when loading the page. As far as I know, there's no way to get it functioning with the tools closed. The best way to move forward to prevent the console functions breaking your script is to instantiate them all one-by-one, setting them to an empty function. Obviously this is useless in terms of logging, but that's many times better than breaking anything.

Again, I don't take any credit for the following code. This segment was taken from "[plugins.js](https://github.com/h5bp/html5-boilerplate/blob/master/js/plugins.js)" of the [html5 boiler plate project](https://github.com/h5bp/html5-boilerplate) on github:

```
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());
```

The function simply checks the presence of each "function" on console object and instantiates it. We use a variation of this code in most of our projects at my work. Unfortunately IE8 support is imperative for a lot of our clients.
