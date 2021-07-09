---
layout: post
title: Stop polluting my prototypes
excerpt: >-
  I'm looking at you, Prototype.js.


  I write JavaScript for a living, and my company's product is delivered as a script to our clients. Once asynchronou...
slug: stop-polluting-my-prototypes
permalink: article/stop-polluting-my-prototypes/index.html
date: 2015-05-03
updatedDate: 2015-05-03
tags:
  - post
  - compatibility
  - prototype
  - quirks
---

## I'm looking at you, [Prototype.js](http://prototypejs.org/).

I write JavaScript for a living, and my company's product is delivered as a script to our clients. Once asynchronously requested from their page, our library loads and does its business as quickly and efficiently as it can, all while supporting browsers including and much better than IE 9\. Our script is playing in the same playground as many others, sometimes tens or hundreds, and it plays nice - it has to.

It's completely naive to think you've written the library to rule them all.. some end-to-end solution that can help people build intelligent web pages. Prototype is one example of this naivety, and it's becoming a real pain in the arse. Prototype exists to do exactly as its name implies, to provide "handy" prototype functions that your objects and nodes will inherit. The problem with an approach such as this is that it won't play nicely with other scripts, and ends up crippling pages that want to run multiple 3rd-party tools and libraries.

We've seen several clients' pages throw some strange errors when applying our library, and as it's turned out Prototype was to blame. In our first encounter (Prototype 1.6), the JSON functions had been overwritten (which our library makes heavy use of), and we were unable to communicate with our API. Another time, lower-level Array functions had been tampered with and handling HTMLCollections was problematic.

> DOM extension is one of the biggest mistakes Prototype.js has ever done

_What's wrong with extending the DOM_

Checking out StackOverflow for information on what others have tried didn't really help:

![prototype_delete](http://perrymitchell.net/wp-content/uploads/2015/04/prototype_delete-1024x276.png)

Once a library like Prototype has done its work, anything you try to do after that stage is a workaround - a workaround for something completely unnecessary.

## Whose fault is it?

That's the question: Who do I have to blame when I'm fighting with errors such as `this.each` being an undefined function on a client's webpage on a Friday afternoon? Well, the client...

The developers employed by the client to build their website decided on a set of tools and software that would help get the job done, but they made a terrible error in judgement when choosing a utility that would make it difficult (if not impossible) to integrate a 3rd-party script into their site at a later stage. Every video player and ad framework that the client may want to use at some stage now has to run on the flimsy base that Prototype provides.

## Thoughts on building a web application

Research is important here - look into libraries that provide the bare minimum functionality that will make sure build process easier, and avoid solutions that reduce 3rd-party compatibility. If you know that you'll require 3rd-party integrations at a later stage, then you should either avoid or integrate carefully things like:

*   Built-in class extensions (Prototype)
*   Lazy loaders (LazyLoad.js, Echo, Unveil)
*   Script cachers (CloudFlare RocketLoader)

If you want helper/utility libraries, look at solutions like [Underscore](http://underscorejs.org/), [Lo-Dash](https://lodash.com/) or [Lazy.js](http://danieltao.com/lazy.js/). Even [jQuery](https://jquery.com/) has a decent amount of utilities alongside its query engine. Build the structures and functionality that **you** need, but remember that other scripts may use `Object` and `HTMLElement` too.

## Using your script on polluted websites

Due to the dependence one of my libraries has on JSON functionality, I've had to drop support for websites running Prototype 1.6 and earlier. There will be cases where the cleanest solution is to just walk away, but for those you can't, there's a couple of things you can try.

Firstly, you could try fetching clean copies of functions you need from a dynamic iframe, like so:

```
var frame = document.createElement("iframe");
document.body.appendChild(frame);
var cleanStringify = frame.contentWindow.JSON.stringify;

console.log(cleanStringify({ test: 3 })); // {"test":3}
```

These functions will be untainted by whatever libraries are running in the current window.

As a worst-case scenario, you could also polyfill the functionality you're looking for, so that you no longer need to rely on the base functions. Sites like [HTML5 Please](http://html5please.com/) provide a nice starting point for looking for polyfills. Keep in mind that this will usually add a substantial amount of content to your scripts, so if size is an issue, perhaps look elsewhere.

## Lead by example

Don't use libraries or methods that disturb the built in objects and prototypes - it's not good practise and will only cause you or others pain in the long term. If you're facing integration with a broken site or page, try to avoid hacking your way into stability by deleting or overriding methods. If you polyfill, keep the method to yourself and don't overwrite any global methods.

Remember to think of others!
