---
layout: post
title: Making the most of Promises
excerpt: Promises are a nifty little addition to JavaScript that arrived with
  the ES6 (ES2015) specification. These gadgets, when used properly, provide a
  powe...
slug: making-the-most-of-promises
permalink: article/making-the-most-of-promises/index.html
date: 2015-11-18
updatedDate: 2015-11-18
tags:
  - post
  - performance
  - promise
  - chrome
  - polyfill
---

Promises are a nifty little addition to JavaScript that arrived with the [ES6 (ES2015) specification][1]. These gadgets, when used properly, provide a powerful method to reshape system architectures by changing how asynchronous operations occur in written code. Let's dive right in to a quick example.

Take the following code, using our tried-and-true friend, callbacks:

```javascript
fetchRemoteData("/endpoint", function(data) {
    syncLocalStore(data, function(syncData) {
        sortByMetric(syncData, function(sorted) {
            renderItems(sorted);
        });
    });
});
```

Lots of async happening here, with a little sideways creep... It's not a total mess, and it's still somewhat readable. This style of managing asynchronous functions, dependent processing and chainging is the norm - JavaScript is evolving, albeit at a very slow pace, and features that address this particular style are adopted very gradually. Promises tackle complex callback-setups with ease:

```javascript
fetchRemoteData("endpoint")
    .then(syncLocalStore)
    .then(sortByMetric)
    .then(renderItems);
```

Straight away, we've gained an enormous amount of readability (not to mention guaranteed asynchronicity). The execution chain is clearly visible, and we're using a more clear approach to filtering using somewhat-pure functions.

The initiating function - in a chain like this - must return a promise:

```javascript
function initiator() {
    // Instantiate a new promise
    return new Promise(function(resolve, reject) {
        // call resolve() or reject()
    });
}

// or

function initiator() {
    return Promise.resolve(); // resolve instantly using a static method
}
```

But the subsequent _links_ in the chain do not necessarily have to generate promises. When you look at the thenables in a promise chain, they're often wrapped up as `.then(function() { /* something */ })`. The link usually performs a simple, synchronous task and then moves on. These functions can also return a new promise, or be another promise altogether:

```javascript
function getData() {
    // Simulating a request
    return Promise.resolve({
        title: "Entry",
        value: "$14.93"
    });
}

function dataToString(data) {
    return data.title + " (" + data.value + ")";
}

getData()
    // Function reference to pass the object into, which is called
    // when the execution of the chain arrives at that point. The
    // function is not executed in place by using dataToString(),
    // because that would place the value into the chain (a string),
    // which wouldn't work.
    .then(dataToString)
    // ES6 fat-arrow for upper-case conversion
    .then(entry => entry.toUpperCase())
    // Another fat-arrow for converting the period to a comma
    .then(entry => entry.replace(/\$(\d+)\.(\d+)/, "$$$1,$2"))
    // We can drop promises into the chain
    .then(entry => Promise.resolve(entry))
    // We can use functions to insert a promise call
    .then(function(entry) {
        return new Promise(function(resolve, reject) {
            // async process entry
            (resolve)(entry);
        });
    })
    // Always catch errors when you're done!
    .catch(function(error) {
        // handle error
    });
```

This style of writing promise chains and functions is great for readability, and requires some much-needed discipline when it comes to writing side-effect-free functions (purity). I've used short-hand fat arrow functions for demonstration purposes here, but anything more complicated than these examples would warrant an entire method. If you plan to potentially have your method used with promises (which you should strive for), the method should take a single input, and either return a value or a promise that resolves with one (or rejects).

## Promise.all

Rarely do dependent tasks have only 1 dependency. Often times, you need to pipe results from a couple of different areas into one chain to one end - `Promise.all` was made to handle situations such as these. Take the following example:

```javascript
/**
 * Add an array of items
 * @param {Number[]} items An array of numbers
 * @returns {Number}
 */
function add(items) {
    return items.reduce((previous, current) => previous + current);
}

function part2() {
    return new Promise(function(resolve) {
        setTimeout(function() {
            (resolve)(3);
        }, 30);
    });
}

Promise
    // Run all of these promises
    .all([
        // Resolve with 1
        Promise.resolve(1),
        // This should return a promise that resolves,
        // eventually, with 2
        part2(),
        new Promise(function(resolve) { (resolve)(2); })
    ])
    // Send all the results to the add function
    .then(add)
    // Handle the final result
    .then(function(total) {
        // do something with total (6)
    })
    .catch(function(error) {
        // handle error
    });
```

The example pipes 3 promises and their output into a single add function, designed for a single input (array of numbers) and a single output (perfect for promise usage, and also pure). Notice that the function does not return a promise, but works with regular input and output.

It's important to remember not to overuse promises, and not to use them where they're not specifically required. For fetching data asynchronously and chaining output-to-input promises make for a great solution, but none of the links in the chain (apart from in iterables for `.all` and `.race`) need to be promises unless they perform an asynchronous action.

## Promise.race

The `.race()` method of `Promise` allows you to resolve after the first of a group of promises resolves. Imagine it to work like `.all()`, but only one promise resolves to provide the output value.

Take the following example for instance:

```javascript
// A couple of promises for our race
var item1 = new Promise(function(resolve) {
        setTimeout(function() {
            (resolve)("a");
        }, 200);
    }),
    item2 = new Promise(function(resolve) {
        setTimeout(function() {
            (resolve)("b");
        }, 100);
    });

Promise
    // Same style as .all()
    .race([item1, item2])
    // The winner wil provide the output
    .then(function(winner) {
        // winner will be "b"
    })
    .catch(function(error) {
        // handle error
    });
```

Two promises are fed into a race method that resolves when the **first** promise-argument resolves - Due to the fact that `item2` has the shorter timeout, it will resolve first and `"b"` will be provided as the resolution value. Subsequent resolutions from the other promises in the race will have no effect.

I recently had a task at work where a promise race was required - We had to show an iframe when the first of two events occured:

 * The contents of the iframe finished loading
 * A timer of n milliseconds expired

There are numerous ways to implement this, but none as clear or eloquent as one using `Promise.race()`. By making both checks for this task promises, we simply used `race` to resolve once the first completes.

## When to make a promise

Promises are, without a doubt, an extremely powerful tool that fits many applications (and one of my favourite features of ES6/7)... But it's very easy to overuse them. There are a few of areas I use them frequently, which I feel are valid use-cases:

 * For asynchronous requests that return a response
 * For deferred loading of components or elements (ie. iframe onload callbacks)
 * For breaking up large portions of processing that would otherwise hog CPU time

There are obviously many others I could mention, but in my day-to-day these are the most common situations in which I choose to use promises. Helper functions and other adapters that surround the promises are kept simple and mostly pure so that they can be fed into the promise chain when required.

It's important to leverage a couple of main aspects of promises when using them:

 1. They provide an asynchronous interface that breaks up execution into chunks
 2. They provide a readable structure when used correctly

I'm as guilty as the rest when it comes to writing lengthy promise chains with functions jammed in the middle - These functions could as well be separate, static methods that are separately testable. By extracting them away from the promise chain it makes the structure cleaner and more readable.

### Notes on performance

Promises aren't terribly complex - they're simple enough that [their implementation is in JavaScript, within the V8 engine][2]. That being said, there's still a performance hit from using _standard_ promises (as defined by the [ES6 spec][1]). This becomes somewhat important when your promise usage increases in the critical path of your application, althrough it is important to remember that _unless you're creating hundreds or thousands of promises_, **it's probably not worth micro-optimising by removing promises**.

Promises are supported in most major browsers, but they're far from being available for most clients. There's numerous different polyfills for ES6 promises, and I use [this one][3] at work by [Taylor Hakes][5] (it's [on npm][4] too). It's worth noting that many promise implementations use `setTimeout(fn, 0)` to execute handlers, which is not ideal in terms of performance. Using a promise implementation that utilises `setImmediate(fn)` functionality is ideal, and you can use the same polyfill I do by coupling [YuzuJS's setImmediate][6] implementation with the promise polyfill.

> ... setTimeout enforces a minimum delay, even with a specified period of zero, that isn't uniformly implemented across user agents. Removing this minimum delay from setTimeout runs the risk of causing existing webpages, that have come to rely on the minimum delay, to break by going into a seemingly hung state while also significantly increasing the power consumption of the browser.

> This specification defines a new method, setImmediate, which will run a callback function immediately after the user agent events and display updates have occurred. This interface will not enforce a minimum delay and will attempt to run the callback as soon as it can.

_From w3c's ["Efficient Script Yielding" draft][7], initiated by Microsoft._

## In conclusion

Promises are a fantastic way to express the flow of data within your application, along with providing a consistent method of breaking up long-running processes. Most asynchronous methods would benefit, in terms of clarity and error handling ability, by using promises to standardise their output.

The polyfills available currently are fantastic, and some even beat the stock ES6 Promise in terms of speed and memory (checkout [this great post][9] and [Bluebird's benchmark list][8]). Promises **are production ready** and a great way to keep the browser responsive when doing large amounts of work during the lifetime of the page.

It's possible to both overuse and underuse every facet of JavaScript, and it's no different with Promises. Get your feet wet and start using them - You'll learn quickly enough when it's too much, but chances are it'll be from an architectural standpoint and not stability related.

Promises will change the way to think about your application, and how you expect control to flow through it. You'll hold everything to the same stable, readable standard.. and the quality of your application will improve because of this.

[1]: http://www.ecma-international.org/ecma-262/6.0/#sec-promise-objects
[2]: https://github.com/v8/v8/blob/4.3.66/src/promise.js
[3]: https://github.com/taylorhakes/promise-polyfill
[4]: https://www.npmjs.com/package/promise-polyfill
[5]: https://www.npmjs.com/~taylorhakes
[6]: https://github.com/YuzuJS/setImmediate
[7]: https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html#introduction
[8]: https://github.com/petkaantonov/bluebird/tree/master/benchmark
[9]: https://spion.github.io/posts/why-i-am-switching-to-promises.html
