---
layout: post
title: Feature documentation and testing is easy
excerpt: At Kiosked, in my Front-end development team, we've just starting using
  BBC Sport's ShouldIT to run tests against our feature documentation. Testing
  a...
slug: feature-documentation-and-testing-is-easy
permalink: article/feature-documentation-and-testing-is-easy/index.html
date: 2015-09-12
updatedDate: 2015-09-12
tags:
  - post
  - documentation
  - jasmine
  - testing
---

At [Kiosked](http://www.kiosked.com/), in my Front-end development team, we've just starting using BBC Sport's [ShouldIT](http://bbc-sport.github.io/ShouldIT/) to run tests against our feature documentation. Testing against well-defined features is a fantastic way to prove commitment to specifications, and it'll keep both management and QA happy in the long-term.

Until recently, we didn't use any proper feature specification. Everybody knows what our product is and what it should do, but this knowledge wasn't written down in any meaningful form. When something goes wrong, and things will **always** go wrong, there are always disagreements about the exact behaviour of some feature. If we'd written down the feature specification at some acceptable level of detail, we could have avoided many futile discussions about how it _should have worked_.

In light of recent experiences and a drive to make our processes smarter, I decided to introduce [feature files](http://trelford.com/blog/post/Feature.aspx) to my team. We're now writing out our products features in markdown format, aligning the syntax with that of ShouldIT. The markdown-formatted features make it easy for developers to read and edit them, as well as making it possible to render them to some pretty HTML for management to read. ShouldIT provides us the method with which we'll be testing these new features.

We use [Jasmine](http://jasmine.github.io/) to run our test suite, which outputs JUnit XML reports - ShouldIT takes these reports to assess feature coverage and status. You can use any testing framework that outputs JUnit with ShouldIT.

Enough talk! Let's check out some code - here's my sample application:

```
window.MyFunction = function(a, b) {
    return a * b;
};
```

Exciting, right? Yes! But if we make the system more complex later on, one might forget exactly how it's supposed to operate unless we document it. We can keep all of our documentation in one place, within feature files in the repository. We can commit them with the project and your added changes so our features are completely version-controlled. Let's write a feature:

```
# My system

## My function

 + IT Should perform multiplication
```

We're documenting a section called "My system", and a component called "MyFunction". By reading this simple definition, we can understand that `MyFunction` should do some multiplication - no one could misconstrue this.

To ensure the component functions correctly, we should write a unit test:

```
describe("My system", function() {
    "use strict";

    describe("My function", function() {

        it("Should perform multiplication", function() {
            var result = window.MyFunction(2, 4);
            expect(result).toBe(8);
        });

    });

});
```

To tie this altogether, I'll use a simple Gruntfile to get a build process going:

```
module.exports = function(grunt) {

    "use strict";

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        jasmine: {
            all: {
                src: 'src/**/*.js',
                options: {
                    specs: 'tests/**/*.spec.js'
                }
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'source/**/*.js', 'tests/**/*.js']
        }
    });

    grunt.registerTask("default", ["test"]);

    grunt.registerTask("test", ["jshint", "jasmine:all"]);

};
```

Running `grunt test` produces the following results:

```
Running "jshint:files" (jshint) task
>> 2 files lint free.

Running "jasmine:all" (jasmine) task
Testing jasmine specs via PhantomJS

 My system
   My function
     ✓ Should perform multiplication

1 spec in 0.008s.
>> 0 failures

Done, without errors.
```

Great, but we've only got our unit test - there's nothing tying this to our feature specification. External parties to our product won't just take our word that it works, we need to prove it. Let's integrate ShouldIT into our process - we will reconfigure our jasmine tests to output JUnit results:

```
jasmine: {
    all: {
        src: 'src/**/*.js',
        options: {
            specs: 'tests/**/*.spec.js',
            junit: {
                path: "./",
                consolidate: true
            }
        }
    }
}
```

Running the tests again will place a file called `TEST-Mysystem.xml` in the root directory. We can feed this into ShouldIT, but let's make sure it's installed first using `sudo npm install -g shouldit`. Configuration for ShouldIT is held in a JSON file called `shouldit.conf.json`:

```
{
    "specs": "features/*.md",
    "results": "TEST-*.xml"
}
```

You can then run ShouldIT using `shouldit`:

[![shouldit-success](http://perrymitchell.net/wp-content/uploads/2015/09/Screen-Shot-2015-09-12-at-2.20.22-pm.png)](http://perrymitchell.net/wp-content/uploads/2015/09/Screen-Shot-2015-09-12-at-2.20.22-pm.png)

That's it! You're now feature testing... It's that easy. You can (and probably should) run your feature tests alongside your unit and integration tests. Feature testing is important, but it's not a replacement for granular unit tests.

ShouldIT also produces a Junit XML results file, so its results can also be monitored by other testing environments and CI servers. ShouldIT tests should compliment your existing testing procedure.

## Sample workflow

I created a [Github repo for this post](https://github.com/perry-mitchell/sample-shouldit-testing) which contains all of the example code I've shown here. Please submit an issue if you notice any mistakes or areas for improvement.

## Takeaway

Specifying features is certainly more work, as is any documentation, but it's an important asset to have in your arsenal. Feature specs help you to:

*   Analyse separate components of your system from a high level
*   Prove points when discussing intended functionality
*   Test user-understandable application features
*   Refactor and rebuild portions of your product with a checklist

Feature files should be considered an integral part of everyone's testing suite.