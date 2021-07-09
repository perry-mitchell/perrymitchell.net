---
layout: post
title: Increment npm project versions with grunt-magikarp
excerpt: We develop in a world with a vast amount of choice when it comes to
  supporting packages and tools. It's a luxury that at any time we can swiftly
  build...
slug: increment-npm-project-versions-with-grunt-magikarp
permalink: article/increment-npm-project-versions-with-grunt-magikarp/index.html
date: 2014-12-06
updatedDate: 2014-12-06
tags:
  - post
  - git
  - github
  - gruntjs
  - npm
---

We develop in a world with a vast amount of choice when it comes to supporting packages and tools. It's a luxury that at any time we can swiftly build a project where it's possible to get most of the work done by importing some open-source libraries.

When working with projects that you intend to make public, and even more-so with ones you intend on publishing to a registry system (like NPM, Bower etc.), it's important to build versions for release. These versions mark important revisions or hotfixes that are somewhat ready for consumption or reference.

npm provides a method of performing ["automated" package version incrementing](https://www.npmjs.org/doc/cli/npm-version.html), but I felt that the documentation was lacking there, and I wanted a more in-depth feel to this part of my build process. The result of that train of thought was [grunt-magikarp](https://github.com/perry-mitchell/grunt-magikarp), a plugin for GruntJS.

![](https://nodei.co/npm/grunt-magikarp.png?downloads=true&amp;downloadRank=true&amp;stars=true)

Magikarp provides a basic method for incrementing the build, minor or major portion of a version. Some examples:

*   Build: 0.1.9 => 0.1.10
*   Patch: 0.0.1 => 0.1.0
*   Patch with limit 9: 0.9.4 => 1.0.0

Limits can be applied to the build and minor numbers, which forces the rollover of parts to the right.

The default commands for incrementing are `build`, `minor` and `major`, eg `grunt magikarp:build`. You can override these in your project with your custom configuration.

Magikarp also has git integration, and allows checking for the latest tag version on a remote repository before incrementing - This way conflicts are avoided when packaging in a team, for instance. The git functionality includes pulling, tagging, commiting and pushing back to the repo.

[tagline]Increment your project's version, synchronising it with npm, git and any other text file.[/tagline]

Often times projects may refer to their current version in files other than the manifests in the project root. For instance, you may have a source file that stores the version so that it could be recognised when in production. Of course, you could use Grunt to pull the version from the package.json file and place this in the script when _compiling_, but you could also use Magikarp's config to change this version in-code each time you increment.

This new library of mine is still quite young, so I imagine its use-cases may expand to cover more integrations in the future. Check it out on [Github](https://github.com/perry-mitchell/grunt-magikarp).