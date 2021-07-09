---
layout: post
title: Private NPM repository with Sinopia
excerpt: I've spent the last 6 months venturing into the deepest recesses of
  front-end build automation and package management, and I've returned with some
  tre...
slug: private-npm-repository-with-sinopia
permalink: article/private-npm-repository-with-sinopia/index.html
date: 2014-11-21
updatedDate: 2014-11-21
tags:
  - post
  - gitlab
  - nodejs
  - npm
---

I've spent the last 6 months venturing into the deepest recesses of front-end build automation and package management, and I've returned with some treasures: NPM, Grunt, Bower and [Sinopia](https://www.npmjs.org/package/sinopia). Currently except for Bower, we use all of these at my current place of employment; we use these amazingly versatile tools to produce production-ready code from configuration manifests that do **all** of the heavy lifting for us. I'm so impressed with how our workflow is developing, that I'd go as far to say that _**you're mad**_ if you're not using something similar.

[tagline]Public dependencies in NPM, private in Sinopia, Grunt building and testing.[/tagline]

It's taken a little while to get the process down, and I still feel we have a way to go, but right now -- things are looking up, as managing our private packages has been a bit of a pain until just now. Because our projects centre around a web presence, we house both substantial front-end and back-end services - both of which need intensive testing and handling to get out the door. Long story short, we used to run subversion with one giant repository - and now we run Git with many components. All of these components, including our JavaScript frameworks, were being requested using Composer.

I'm well aware that Composer is commonly a PHP project utility, so we won't go into discussion why it was a bad idea. We were quite happy utilising its _composer.lock_ functionality for our release candidates until the whole process of patching became more difficult than branching and merging in our giant svn repository. We've been due to move to something more suitable for some time.

Enter NPM: Because we use Grunt to do some nifty compilation and testing stuff, we needed NPM to install its dependencies and tools. NPM actually has [fantastic version handling](https://www.npmjs.org/doc/misc/semver.html), and was ultimately chosen over Bower because of its friendliness with Gitlab cloning and ease-of-use server-wise; thanks to Sinopia for the latter (Bower's private servers didn't measure up when it came to private repositories). So now we have NPM managing both our public and private packages, all in one happy place. That also means fewer 3rd party requirements and less complexity.

## Getting started

I'd like to walk you through the setup process of what we did with Sinopia and NPM. We have a private package, called 'loader' in this case, and we want it included as a node module in our main project (also private). The loader package requires Grunt and many other **public** packages.

We'll install Sinopia on a new server and use it to manage all of our dependencies in our projects.

## Installing Sinopia

I used a vanilla Ubuntu 12.04 server for Sinopia, but you can use anything really. Just make sure you have NPM and NodeJS installed (I won't cover that here).

You can run this command to ensure you have up to date versions:

```
$ npm --version; nodejs --version
1.4.28
v0.10.33
```

Basically you want the latest copies, which means not installing from apt.

You can install Sinopia by following the instructions on [their page](https://www.npmjs.org/package/sinopia), but I found them somewhat vague in places. I'll do my best to make it as clear as possible here. Install it globally and start it:

```
sudo npm install -g sinopia@0.13.2
sinopia
```

Take note of the authentication output:

![sinopia startup](http://perrymitchell.net/wp-content/uploads/2014/11/sinopia_start.png)

You'll need the user and password for publishing private packages to your new registry.

[alert type="error"]Be aware that the default setup of Sinopia may be to listen on localhost only, which is not good if you want to connect to your server externally at any stage. Edit the config file and browse to the "Advanced settings" section. Ensure the listen value is like so: "listen: 0.0.0.0:4873". '0.0.0.0' will allow it to listen on all network adapters.[/alert]

[alert type="info"]Update: You might have noticed the `npm install` command specifying the sinopia version - `sinopia@0.13.2`. Sinopia was recently updated to version 1.0.0, which is untested on my part and seems to have changed quite a bit of the functionality and behaviour. Version 0.13.2 works fantastically well.[/alert]

## Registering your package

Checkout/clone your package somewhere locally and create a basic NPM package.json manifest (you can use 'npm init' for that). Specify a version, set 'private' to false, and specify a publishConfig block:

`"publishConfig": { "registry": "http://192.168.0.10:4873/" }`

Insert the IP address or domain of your Sinopia server.

Next we want to register the address of the registry and turn 'always_auth' on:

```
npm set registry http://192.168.0.10:4873/
npm set always-auth true
```

Don't forget to **commit and tag** your version before pushing it up to your repository.

Now we want to **authenticate** with our registry by running something like this:

`npm adduser --registry http://192.168.0.10:4873/1

But again, with the address of _your_ server. It'll ask you for a username and password - enter those that Sinopia gave you in the console when starting it for the first time - and set the email to anything you desire. This will confirm the user is valid and link your local user to that registry. Now it's time to publish (from the root of your package you wish to publish privately):

`npm publish`

You should get a single line output like "+ loader@0.1.1" or something - That means your package is in the registry!

## Using your private package as a dependency

Jump into your parent repository and create/edit the NPM package.json file - Insert your dependency with the version you tagged (or an applicable semver pattern) and save the file. Running "npm install" at this stage should install your package, as well as its packages and dependencies.

_Commit and tag each patch/feature version before publishing to your private NPM registry.

And that's all there is to it. You can now specify version patterns that work for you, say "0.1.x" to handle all patch versions of a minor version. You also have no extra requirements beyond your VCS and Sinopia services, so NPM is really all you need at the command line.

If you're doing something similar, I'd love to hear about it.

_**2015-01-03**: The folks over at npmjs.org have recently updated their website, and now also support private npm modules stored in their registry. You can read more about them here: https://www.npmjs.com/private-npm_
