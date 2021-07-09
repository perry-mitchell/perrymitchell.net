---
layout: post
title: Optimising JavaScript array map and filter with reduce
excerpt: I submitted a merge request today to colleague that rightfully pointed
  out that I was iterating over an array inefficiently. The array was a
  collectio...
slug: optimising-javascript-array-map-and-filter-with-reduce
permalink: article/optimising-javascript-array-map-and-filter-with-reduce/index.html
date: 2016-01-12
updatedDate: 2016-01-12
tags:
  - post
  - array
  - es6
---

I submitted a merge request today to colleague that rightfully pointed out that I was iterating over an array inefficiently. The array was a collection of strings; some may have whitespace and some could be empty. The method this array was being used in needed all elements to be whitespace-free, and so I'd written a function like so:

```javascript
let newArr2 = arr
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
```

That snippet of code loops over the array _twice_, with function calls, to generate the new array. The code is very succinct and probably in its most terse form, but it's definitely not the most efficient form.

I'll mention right now that the analysis and suggestions I'm making are very much **over-optimisation**. It's very unlikely that there's any benefit to be had by choosing one option over another with regards to the following interative patterns.

Let's take a look at some other ways of handling the `map` + `filter` functionality - first up we have our old friend the for-loop:

```javascript
let newArr1 = [];
for (let index = 0, arrLen = arr.length; index < arrLen; index += 1) {
    let newItem = arr[index].trim();
    if (newItem.length > 0) {
        newArr1.push(newItem);
    }
}
```

This loop can be written in several different ways, at least for this task, but you should get the idea - we get a new array thats trimmed and filtered without function calls and only a single interation. It's verbose and ugly as sin, but it's very efficient.

My 3rd and final form of code that performs the same task uses `reduce` to take the place of both `map` and `filter`:

```javascript
let newArr3 = arr
    .reduce((previous, current) => {
        if ((current = current.trim()).length > 0) {
            previous.push(current);
        }
        return previous;
    }, []);
```

I ran all three in different orders on my Macbook Pro in Chrome with 100k records and the `reduce` method won. The for-loop was marginally slower and the `filter`+`map` combination was by far the slowest. When running the same code in Firefox, both the `reduce` and for-loop methods came out at about the same, whereas the combination was still much slower.

I'd like to mention again that looking at differences like this is drastic over-optimisation. If there's a bottleneck in your codebase it'll almost certainly not be with the performance of loops like this. You'd probably never see any real-world difference between any of the three alternatives I've mentioned here.

Nevertheless: I feel that the readability, understandability and maintainability of the `reduce` alternative make it the better option here. Any performance-loss across browsers is extremely negligible, and what you gain is a chainable, elegant and scoped filtering process. There's no benefit, in this case, to using the basic for-loop - So why use it then? It's longer and less readble, and lacks the portability of our `reduce`'s callback.

So with this in mind, go forth and use array functions!