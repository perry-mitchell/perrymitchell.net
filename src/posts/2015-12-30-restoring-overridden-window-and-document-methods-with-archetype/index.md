---
layout: post
title: Restoring overridden window and document methods with archetype
excerpt: Some scripts are built with the intention that they'll be used on some
  corporate site or personal bl...
date: 2015-12-30
updatedDate: 2015-12-30
tags:
  - post
  - quirks
  - DOM
  - prototype
  - rant
  - polyfill
---

Some scripts are built with the intention that they'll be used on some corporate site or personal blog - a relatively controlled environment with little external interaction in the way of scripts and styles. Some of these scripts make **bold** changes to core DOM and window built-in objects and methods - these changes being intended to affect everything using them.

The intentions are obviously positive ones, but I feel that far less consideration is given to these changes than should be. There's no fool-proof way to modify core system constructs in a way that can be guaranteed to have no negative side-effects, just as there's no completely logical reason why you ever should. You should not be modifying core objects and functions, and if you need extra functionality, keep it contained to your script.

There are plenty of ways to provide polyfill-style support for newly added core functionality in browsers that don't involve doing something like `Object.prototype.bind = function() {`. Instead of having:

```
Object.prototype.bind = function(thisValue) {
	// polyfill code
}
```

You could keep a self-contained bind function:

```
function bindMethod(method, thisValue) {
	// polyfill code
}
```

The sacrifice is coding standards and come consistency, but it makes for a safer footprint.

## Bold mistakes

Getting back to my point on scripts being written for a narrow purpose - providing functionality beyond what the current browser engine supports by extending built-in objects and methods is a bad idea. This approach disregards the needs of the site owner and any third-party script that assumes some fair points:

 * If the window/document provides a method, the method will work as the current browser vendor has specified it to work (disregarding known quirks etc.).
 * If the browser is too old, certain methods will not be available to use, and the script should be implemented to do the work in another way.

By patching "missing" functionality, we're all to trust that the patch works as intended. At [Kiosked](http://kiosked.com) where I work, we deliver an advertising script tens-of-millions of times daily across hundreds of sites. We could have several thousand different configurations that we need to take into account at any one time with out script.

Unfortunately, at these numbers, prototype pollution is inevitable and we simply need to provide our own polyfilled functionality internally for everything that we rely on. This makes for unnecessary bloat, but with scripts out there like [Prototype.js](http://prototypejs.org/) and [CloudFlare](https://www.cloudflare.com/)'s [RocketLoader](https://support.cloudflare.com/hc/en-us/articles/200168056-What-does-Rocket-Loader-do), we don't have many options.

_For those interested, Prototype.js overrides many low-level prototype methods (hence the name) (with known bugs), and RocketLoader breaks querySelector and querySelectorAll when used with complex queries (long, and that contain multiple ":not" references and other pseudo-selectors)._

## A solution where there shouldn't need to be one

I recently wrote a helper script called [archetype](https://github.com/perry-mitchell/archetype) that tries to overcome the issues associated with overridden methods. It's widely known that if certain window and document properties are overridden in the top `window`, clean copies can be had by instantiating an iframe and retrieving the properties from there instead:

```
var iframe = document.createElement("iframe");
document.body.appendChild(iframe);
var querySelector = iframe.contentWindow.document.querySelector;
```

Of course there is more to it than that: the `querySelector` in this example is bound to the iframe's document and not the top window's, amongst other things.

**archetype** handles all of this complexity under-the-hood, and provides a straightfoward interface to securing working methods:

```
var querySelector = archetype.getNativeMethod("document.querySelector");
// querySelector is automatically bound to the top window
```

Although archetype also provides the ability to patch (override) window & document methods back to their default functionality through the use of `archetype.patchMethod()`, I would recommend playing it safe by simply keeping a reference to the methods you need.

You could also just an ES6 destructuring block to neatly grab all the functions you need:

```
var [myQuerySelector, myQuerySelectorAll, mySetTimeout, mySetInterval] = [
	"document.querySelector",
	"document.querySelectorAll",
	"window.setTimeout",
	"window.setInterval"
].map(archetype.getNativeMethod);
```

archetype will return the current methods from the top window if they are still running native code.
