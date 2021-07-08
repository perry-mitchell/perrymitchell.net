---
layout: post
title: "lamd: Simple and fast module handling for a bundled library"
excerpt: Building websites and dashboards can sometimes mean you can relax a
  little bit when it comes to the ...
date: 2015-11-09
updatedDate: 2015-11-09
tags:
  - post
  - amd
  - kiosked
  - performance
---

Building websites and dashboards can sometimes mean you can relax a little bit when it comes to the number of requests you make, cache headers and transfer time of assets. When it comes to delivering scripts to client pages at [Kiosked](http://kiosked.com), time is of the essence. There's no room to request extra assets of scripts from the server, because there's a good chance a user may have moved on before another request makes it back. To improve the user experience and ad revenue, we need to get the script to the client in one go in as small a space as possible.

Kiosked's library is a decent collection of scripts that perform different tasks, but they're delivered collectively to the client, so there's no need to request them separately. There is a need, however, to manage the scripts (modules) separately so that they can neatly address and require each other.

Originally, many moons ago, the entire system was namespaced in a very *global* fashion. This meant that things were easy to find, easy to lookup through the IDE and speedy because there were no function calls to *define* them. Ultimately, however, this made for a very poor design for several reasons:

 * Namespaced items are not minified - They're treated as API methods and are not converted into smaller names when run through minifiers like Google's Closure Compiler.
 * Namespaced items that extend others need to be loaded in a specific order. If class `A` extends `B`, `B` needs to preceed `A` in the bundled result. This means using something like [grunt-scantree-concat](https://www.npmjs.com/package/grunt-scantree-concat) (based off of [scantree](https://www.npmjs.com/package/scantree) by [getify](https://www.npmjs.com/~getify)) to 'require' each file to preceed one other, like
    ```
    // require: source/B.js

    var A = B.extend(function() { // ...
    ```
 * Writing names of classes and tools becomes ridiculous, especially when using locator patterns: `GlobalNamespace.SpecialClassLocator.getSpecialClass().notifyChildren(data);`.
 * Most class and utility code is exposed to the `window`, which is unnecessary and somewhat of a security concern.

To address these issues, I wrote a couple of different module loaders before sitting down at home and writing what I've now published as [lamd](https://www.npmjs.com/package/lamd). I really like the [AMD](https://en.wikipedia.org/wiki/Asynchronous_module_definition) style of module handling, and I wanted to use something like that at Kiosked. Most implementations I found online were either licensed incorrectly (or not at all), or contained a substantial amount of extra code for making remote requests (which we'd never do). Instead of trying to make one of those work, I did what you normally shouldn't do (if possible) and reinvented the wheel (albeit for a more specialised purpose).

lamd provides 2 methods, `require` and `define`, to the current script (`var`) (if `require` is not already defined) as those names respectively. It also sets `lamd` in the current script to an object:

```
lamd.define();
lamd.require();
```

`require` and `define` work much the same as their cousins in AMD.js or RequireJS.

`require` takes two parameters: `require(ids, callback)`:

 * `ids` is a `String` or an `Array` of strings. This holds the ids of the modules you require for the callback function.
 * `callback` is a `Function` to run after the requirements are met. Each requirement is passed into the callback function as a parameter, in order.

`define` takes two or three parameters, depending on if it has dependencies: `define(id, [dependencies,] callback)`:

 * `id` is a `String`, which is the name of the new module.
 * `dependencies` is an optional `Array` of strings for the dependencies of the module.
 * `callback` is `Function` or other non-`undefined` value. `callback` is called with the required modules, in order. `callback` must resolve to a value **other than** `undefined`, or an exception will be thrown.

For example:

```
require(["Person", "toolkit"], function(Person, toolkit) {
    var people = [
            new Person("Bob"),
            new Person("Fred")
        ],
        favouritePeople = people.filter(toolkit.peopleNamedBob);
    console.log(favouritePeople);
});

define("Person", function() {
    var Person = function(name) {
        this.name = name;
    };
    return Person;
});

define("toolkit", function() {
    return {
        peopleNamedBob: function(person) {
            return (person.name === "Bob");
        }
    };
});
```

## Under the hood

Little `lamd` uses Promises underneath it all. Promises allow it to wait, at rest, or dependencies to be defined. There are no intervals or timeouts. Using native Promises is preferred, but if polyfilling, ensure you use a fill that supports `setImmediate` (for performance reasons).

lamd is designed for browser use, but would work in Node also (though I see absolutely no reason why you would want it to).
