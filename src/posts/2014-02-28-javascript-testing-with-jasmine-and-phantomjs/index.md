---
layout: post
title: JavaScript testing with Jasmine and PhantomJS
excerpt: JavaScript testing has always been something of a neglected process at
  work. Nobody really knows how to write them, and nobody cares to learn.
  There's...
slug: javascript-testing-with-jasmine-and-phantomjs
permalink: article/javascript-testing-with-jasmine-and-phantomjs/index.html
date: 2014-02-28
updatedDate: 2014-02-28
tags:
  - post
  - jasmine
  - phantomjs
  - testing
---

JavaScript testing has always been something of a neglected process at work. Nobody really knows how to write them, and nobody cares to learn. There's also no formal requirement to write them, as well as there being no penalisation if some tests were to fail (not like our PHP tests, which lock the branch if they fail). I feel that because of this, the quality of our JavaScript code base decreases over time as more functionality is added and modified.

We recently got the green light to spend some more effort on setting up a JavaScript testing system, and were told the chosen library to use would be [Jasmine](http://jasmine.github.io/) (we were originally using CasperJS - significantly more complicated and a steeper learning curve when compared with Jasmine). I'll start by saying that I love how Jasmine works, and it's incredibly easy to get started - This is very important when it comes to writing tests (which have the same pitfalls as writing documentation). If the process is not easy, developers won't waste their time trying to do it. Make things like documentation and writing tests easy so that developers feel more motivated to contribute.

Well it doesn't get much easier than Jasmine:

```
describe("some context", function() {

	var a = 3,
		b = 4,
		c = null,
		d = false;

	it("simple addition works", function() {
		expect(a+b).toBe(7);
	});

	it("recognise null", function() {
		expect(c).toBeNull();
	});

	it("recognise defined variables", function() {
		expect(d).toBeDefined();
		expect(e).not.toBeDefined();
	});

});
```

You can find a good introduction to the framework [here](http://jasmine.github.io/2.0/introduction.html).

Earlier I mentioned that Jasmine tests are run in the browser, which presents a clean UI to display the output of the tests:

[![Jasmine test](http://perrymitchell.net/wp-content/uploads/2014/02/jasmine_test_example.png)](http://perrymitchell.net/wp-content/uploads/2014/02/jasmine_test_example.png)

This is great for continual testing as you develop and complete tasks, but it poses a problem for integration with automated testing environments (like we have). All tests, including JavaScript tests, need to be able to be run from the command line on our testing server. For this to be possible, we'd need some way of passing these Jasmine tests to a utility that could execute them, against our entire library, and act accordingly based on the outcome.

Enter [PhantomJS](http://phantomjs.org/). For those of you that don't know what PhantomJS is, it's a headless web browser - meaning it doesn't render pages on your screen (more or less). It's also built into CasperJS, but for Jasmine we unfortunately need to tweak our setup a little more to get a headless setup functioning correctly.

What we want, is to be able to execute our tests, preferably from the same test files, on our command line rather than in the browser. We want the tests to function in the same way, and we'd like a readable output to work into whatever system we're using to perform automated test cycles. There are several custom kits out there to work with Jasmine and PhantomJS, but after trying several of them, I found most of them to either not work at all (with a default setup) or to require major workarounds to get them functioning. Thankfully, the guys over at PhantomJS have created a [script](https://github.com/ariya/phantomjs/blob/master/examples/run-jasmine.js) to neatly support Jasmine spec runners. Unfortunately this script only works with version 1.2 of Jasmine, but [this one](https://github.com/tkaplan/PhantomJS-Jasmine) works with 2.0.

With that in place, you can build your spec runner up to run all of your tests in-browser, as well as knowing that they'll function properly when run in the console as well.

_**Important note about**_**_ PhantomJS_:** PhantomJS does not, as of writing this post, support the bind method (`Function.prototype.bind`). You can read more about it [here](https://code.google.com/p/phantomjs/issues/detail?id=522). I got around this issue by simply replacing my bind statements with wrapper functions - Not as clean, but I'd rather use that method than code a workaround.

I will be working to rewrite the **run-jasmine.js** script at some stage, and will update this post with my solution when completed.