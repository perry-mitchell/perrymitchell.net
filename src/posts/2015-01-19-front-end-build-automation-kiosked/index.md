---
layout: post
title: Front-end build automation at Kiosked
excerpt: "[Kiosked](http://www.kiosked.com/) is an influential web advertising
  technology company that special..."
date: 2015-01-19
updatedDate: 2015-01-19
tags:
  - post
  - BDD
  - chrome
  - code coverage
  - gruntjs
  - jasmine
  - kiosked
  - nodejs
  - npm
  - TDD
  - testing
  - vagrant
  - virtualbox
---

[Kiosked](http://www.kiosked.com/) is an influential web advertising technology company that specialises in providing its clients with automated ad placements. We manage to provide many high-profile clients with impressive ad coverage across all common devices with our tailored system. I work in their front-end team developing the JavaScript framework which delivers the placements and processes the pages. In my team we concentrate on the agile production of features whilst measuring the stability and efficiency of our framework on many popular devices and browsers.

Because we provide automation for large websites and communities, our codebase needs to work flawlessly on a variety of platforms - all while remaining highly responsive and performing better than the competition. We don't use any major 3rd party libraries like JQuery or Ember, and we don't use anything that would break our compatibility baseline of IE9 and upwards. All of the functionality we employ must be carefully considered before reaching production-ready status - fault tolerance must be of the highest priority when the code has to work in an unknown combination of environments.

[![Kiosked ad banner](http://perrymitchell.net/wp-content/uploads/2015/12/kiosked_ad_banner.png)](http://perrymitchell.net/article/front-end-build-automation-kiosked/kiosked_ad_banner/)

It's a lot of fun developing with _raw_ JavaScript rather than with some large non-thinking framework. Don't get me wrong, using JQuery or Angular is a great way to speed up web development in some cases, but they would only become a burden and a performance impediment in our case. It's always the case that the less code you have, the easier it is to maintain a well-performing tool-kit - And that's an aspect of our framework that we're very proud of.

Because we're developing with just JavaScript and what current browsers can support in terms of standard compliance, we spend more time coming up with improvements and features then we do fixing bugs or platform issues. I've seen devs spend days scratching their heads with issues when using libraries like D3 or Ember, for example, but any road-blocks in our case are easily addressed in a logical manner: either it can be done or it can't... do, or do not. Finding an issue means nothing more than perhaps scratching some code and moving in a different direction, as opposed to waiting on a patch or hacking into the library with a 3rd party framework.

I digress - while the principle of our development means a lot to me, it would be worthless if it weren't for the build and deployment process. I go on to talk about that more in detail in the following sections.

## What we deploy

We deploy both static and dynamic scripts for our front-end system. The static script is many times larger than the dynamic, as it houses all of our functionality that places ads on our client's pages. The script is a minified and compressed combination of many separate JavaScript files and 'classes'. We deploy the gzipped form of this script to Amazon, which is what is requested each time a user is to be presented with our ads.

The dynamic script is what injects our data and settings into the loading process of our system, as well as requesting and loading the static script content. Together, these scripts load our system with the correct content specifications for displaying ads in the correct areas of the webpage they're attached to.

To be ready for a deployment, there are many steps taken during our build-phase that prepare our code for packaging and delivery.

## Building our scripts

At Kiosked, we use Git and [Gitlab](https://about.gitlab.com/) to manage our repositories. This makes it nice and easy to move content around in an organised manner, such as with our front-end components. We can develop, debug, test and compile our sourcecode in these components before they're packaged up and deployed.

For our front-end static library, we use [GruntJS](http://gruntjs.com/) and [npm](https://www.npmjs.com/) to manage our tasks. Grunt is a fantastic command-line tool that allows for easy automation of common tasks, such as:

*   Cleaning
*   Compiling
*   Testing
*   Linting
*   Deploying
*   Versioning

Grunt allows us to use a manifest of sorts, coded in JavaScript, to configure our tasks and workflows. To save writing loads of unnecessary functionality, Grunt makes use of a large number of [community-developed plugins](http://gruntjs.com/plugins) that solve many trivial tasks. These plugins are installed using npm's package manifest, which are then included when Grunt runs.

Using the plugin [grunt-cli](https://www.npmjs.com/package/grunt-cli), we can run simple commands like so:

```
grunt compile
grunt jshint test
grunt clean
```

Commands can be stacked, separated by spaces to denote a chain of commands to be executed. Commands can be passed parameters, which are linked to a command using colons:

```
grunt compile:main
```

Our manifest has an array of commands that allow us to perform our build operations easily, usually with only a single line. The build process goes through all of our JavaScript files, in the _correct order_, and concatenates them into a single file. That file is then minified using [Google's Closure Compiler](https://developers.google.com/closure/compiler/), before being gzipped into its final state. Plugins for Grunt take care of this entire process, with only slight configuration necessary in our manifest.

### File dependencies

We have between 15 and 30 JavaScript files in some of our front-end repositories, and each has different requirements on the others. We need to load them in a particular order so that each file's dependencies are satisfied before it attempts to load. Because we use a class-inheritance style system for some of our library, certain classes extend others in different files which must be loaded first.

We use a custom aggregator that reads a file manifest - it uses this JSON file record to discern whether a file can be loaded or not. If dependencies of that file have not yet been output, then the aggregator moves on to the next item. The aggregator will loop until all files have been output (and their dependencies met). This process produces a single, large, JavaScript file that is either tested or used in development, or minified and gzipped for staging and production.

### Package versioning

At one stage, things were simpler. We had fewer components and fewer files, and we got by with a modest deployment system. Since then, we've increased the complexity by requiring several other components that use their own build procedures. The resulting process has meant we needed to move to a more controlled build phase with dependencies on specific versions or version ranges of components.

We recently began using npm quite heavily, and have since decided to manage our own components with it. Although npm is an open source system, we cannot release our components to the public, so we decided to [use Sinopia to manage our components in-house](http://perrymitchell.net/article/private-npm-repository-with-sinopia/). Sinopia is a private npm caching server, which not only allows you to host your own npm packages privately, but it also caches requested packages (hosted publicly on [npmjs.com](https://www.npmjs.com/)) locally.

As a part of our Grunt toolkit, we include functionality to package our component features into a parcel which is versioned and stored on the Sinopia server. Using semver ranges in our other projects, we can request _safe ranges_ of versions to install. We can also specify a specific minor version, for example, that can be deployed at a certain stage. For example, in master we always request our packages by the latest version: `*`, whereas in a release candidate we may specify a single version range: `2.3.x`. This means that if we release with `2.3.4` and it has a bug, simply creating a patch version of `2.3.5` will be enough for our release toolkit to install and deploy the fix.

## Testing

Stable libraries make people happy - stability means less troubleshooting for developers, as well as less bugs and issues, less time spent fixing these problems... Keeping your libraries stable will make both you and your organisation happier. The most important method for allowing this is **testing**. Test your code, functions, classes, processes. Monitor your code coverage and test regularly. Use linters for the languages that you develop in, and enforce strict rules when it comes to pushing and merging your repositories.

Our front-end team at Kiosked follows some strict guidelines when it comes to developing new features. All of our scripts, files and classes are unit-tested, linted and debugged using our Grunt setup. For a revision to be classified as stable, all the tests must pass with no lint errors.

### Linting

We use JSHint for our JavaScript lint testing, which is also available through Grunt and npm. We have a simple task that gathers up all of our source files and runs them through JSHint at the strictest settings (all checks **on**). If there is some small section of code that absolutely requires some feature that is _illegal_ in JSHint strict mode (such as bitwise operations for speed), we allow that single case with a JSHint command in the code.

Our tests fail if there is a single lint error in any of our files. Not only does this keep our code in good shape and helps prevent easy-to-make mistakes, it also helps keep our developers writing good quality code with a consistent style. No one argues as to whether semi-colons are required or not (of course they are!), and we all use `+=1` over `++` (less readable and can cause confusion - [++ incrementing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Arithmetic_Operators#Increment), [JSHint plusplus rule](http://jshint.com/docs/options/#plusplus)).

While we strive for strictness in this area, we do not use any JSLint options. Some of these are just too much, and they provide no real benefit.

### Unit tests

We write a lot of unit tests at Kiosked, and some tasks are even undertaken using [TDD](http://en.wikipedia.org/wiki/Test-driven_development). As a result, we have quite a healthy number of tests and a code coverage of over 50% for most areas. It hasn't always been that way, as the library was in existence well before a decent unit-testing framework was introduced. I helped Kiosked adopt [Jasmine](http://jasmine.github.io/) for our unit-testing framework in the early days, and we've had a lot of success with tying-down our framework with [BDD](http://behaviour-driven.org/)-style tests.

Jasmine is a Behaviour-Driven-Development (BDD) style testing framework for JavaScript, and we use it for all of our front-end testing needs. The clean, though powerful and feature-rich syntax allows us to quickly write tests for new or existing features. We use it to test everything from large asynchronous methods and loading functions, through to testing inheritance with some custom spec helpers. The easy-to-learn syntax also makes it appealing for new developers to get involved, with little to nothing to teach them as the [documentation](http://jasmine.github.io/2.0/introduction.html) is so thorough. It's as easy as:

```
describe("Banana", function() {
    it("is yellow", function() {
        expect(banana).toBe("yellow");
    });
});
```

We write both integration and unit tests, separated into separate files for either classes/namespaces or features. To run the tests, we can either use the browser or the command line.

When running in the browser we use [grunt-contrib-connect](https://github.com/gruntjs/grunt-contrib-connect) to run a listener on a html file - The file contains the Jasmine scripts and all of our test specs, which then run in the browser.

When running on the command line (what we use for our Jenkins CI server) we use [PhantomJS](http://phantomjs.org/), managed through the [grunt-contrib-jasmine](https://github.com/gruntjs/grunt-contrib-jasmine) package. This allows us to run all of the tests in a headless browser on the command line, which makes testing faster and automation easier when we can offload the responsibility of continuous testing onto the CI server. Although most of the time this is enough, we do still have to manually run tests on different browsers to ensure there are no quirks across different setups. This is usually only an issue with Internet Explorer, but thankfully we only support version 9 and newer.

### Code coverage

As the number of tests have increased dramatically in recent times, we've played with several different code coverage tools to see where our coverage is at. We ended up going with a coverage tool called [istanbul](http://gotwarlost.github.io/istanbul/), which processes code coverage for JavaScript. To get istanbul working in our grunt setup correctly we needed 2 packages:

*   [grunt-template-jasmine-istanbul](https://github.com/maenu/grunt-template-jasmine-istanbul) - hooks istanbul into our Jasmine tests
*   [grunt-istanbul-coverage](https://github.com/daniellmb/grunt-istanbul-coverage) - runs coverage tests after the unit tests to ensure certain coverage levels are met or exceeded

istanbul even gives us a nice output page:

[![istanbul code coverage report](http://perrymitchell.net/wp-content/uploads/2015/12/frontend_code_coverage.png)](http://perrymitchell.net/wp-content/uploads/2015/12/frontend_code_coverage.png)

Diving deeper into the html output will produce a line-by-line, statement-by-statement review of coverage - a perfect way to find areas of coverage weakness.

## Documentation

We proudly document **all** of our code, using JSDoc comment style, and enforce this in our code reviews.

```
/**
 * Clone the settings class with SettingsOBC wrapper
 * @public
 * @instance
 * @memberof ITGS.SettingsOBC
 * @returns {ITGS.SettingsOBC}
 */
```

This generates us a load of useful and well-linked API documentation that we can host internally. It also helps for some auto-completion in PHPStorm from time to time. Besides, if you're reading someone else's code, wouldn't it help dramatically if the description of the function was immediately available in-code?

Comments may also inflate the size of the file, but this is a non-issue as most IDEs minimise comments (with an option) and minification strips them. It's best to include them with every method and property.

Git may offer annotations for all code in a project, but sometimes you need to speak with the original implementor being a file or class to see what they were thinking when they wrote it - We also comment every file and class with an **@author** and **@created** tag.

## Assets

There was a time where we required a substantial amount of image assets for our front-end components and their elaborate design. That time has passed and we currently only require several small images for buttons and logos. These images are small enough that base64-encoding them and including them in our source is a far better option than requesting them from a CDN.

[![base64 image](http://perrymitchell.net/wp-content/uploads/2015/12/base64.png)](http://perrymitchell.net/wp-content/uploads/2015/12/base64.png)

Our library's most important aspect is its speed. The most important stage of execution is the time period between when our script is requested and when the first ad is being presented on the page - There are many other important aspects of our system that take place before and after this period, but the actions and delays that occur within can make quite a significant difference in the number of collected ad impressions. Although total size is a factor, it's somewhat less important than the number of resources requested during loading.

We request no external resources, which reduces our network footprint and the time we spend in the browser loading queue.

## Developing

We develop using [Vagrant](https://www.vagrantup.com/) with [Virtualbox](https://www.virtualbox.org/) or [Parallels](http://www.parallels.com/eu/products/desktop/), which makes booting up a working server with our codebase a very simple process. Vagrant makes developing with VM hypervisors a practical task, as it hands the control of the procedure to the configuration manifests that are also version controlled. Managing a large team of developers would be impossible without such tools.

Vagrant also changes the way we treat virtual machines. Prior to using Vagrant, we all treasured our individual machine states and the data we had created over months of testing. Little did we realise that the drifting states of each VM created a vast array of problems that made it close to impossible to reproduce bugs that a QA engineer might be experiencing. Using Vagrant and it's ability to support a volatile workflow removed our protectiveness over our virtual machines, and now building and destroying machines can occur several times a day without delays in development.

## Where are we? Where are we going?

We're constantly on the look out for new ideas and strategies that could help better our product or process. Not only does that make our employer happy, but it means we're given free reign over research into bleeding-edge software and projects that help us to work and to learn - and that makes **us** happy.

[tagline]The best developers are the ones with a desire to learn at every chance they get. The best companies are the ones that use this to their advantage.[/tagline]

If you're a developer and you're not enjoying the constant inflow of new open-source projects, you're **doing it wrong**. Using package managers like npm and Bower allow you to trial new systems that could potentially better your work environment in a number of ways, like I've mentioned in this post. Don't re-invent the wheel: chances are that it's already been done before, and usually better than you would have made it. Most projects available through registries like npm have been built to suit a purpose quite perfectly.

We're doing our best to make the Kiosked platform wildly efficient and robust, and we have the tools to make that an easily achievable mark.

[project_action]![Kiosked Logo (small)](http://perrymitchell.net/wp-content/uploads/2015/12/kiosked_small.jpg)
Speaking of developing, we're actually looking for front-end developers right now! Here's your chance to join our team and work in an environment that furthers your experience and supports your learning.

[Check out the Front-end Developer position!](http://www.kiosked.com/jobs/front-end-developer-2/)[/project_action]