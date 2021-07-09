---
layout: post
title: "Buttercup: A NodeJS password manager"
excerpt: I've been using KeePass as a password manager for some time now. It has
  a lot of benefits; It's open-source, has free clients, and is widely used.
  Unf...
slug: buttercup-a-nodejs-password-manager
permalink: article/buttercup-a-nodejs-password-manager/index.html
date: 2015-10-18
updatedDate: 2015-10-18
tags:
  - post
  - nodejs
  - buttercup
  - password
---

I've been using [KeePass](http://keepass.info/) as a password manager for some time now. It has a lot of benefits; It's open-source, has free clients, and is widely used. Unfortunately, the user experience of KeePass is very inconsistent between platforms and mobile devices. The Mac OS apps that are free are unreliable and have some weird UI glitches and the Linux ones work alright aside from window management problems and clipboard issues.

On the whole, the KeePass clients are a pain to use with no unified interface or experience.

I started developing [Buttercup][1], a NodeJS password manager, because of my displeasure with using KeePass on a daily basis. I wanted something I would enjoy to use, while feeling safe that all of my passwords were security stored. On top of that, I wanted my archives accessible - I'm constantly on the move and not having an easily accessible password archive is an issue I don't feel I should have to deal with in this day and age.

Buttercup encompasses some of the key concepts I want from my password manager.

### Strong security

Archives are encrypted using Node's crypto library with the AES 256bit GCM method, so the sensitive contents are handled in a very secure manner.

Buttercup's internal password generator provides a large number of options for generating strong, unique passwords.

### Reliable

Password archives are composed of a series of deltas that when run, construct the actual archive. By using deltas, archives can be merged together in the event of a potential save conflict.

_I've frequently dealt with save conflicts using KeePass on my home and work PCs. Leaving one of the apps open with unsaved changes could create a situation where saving would mean losing password entries._

### Accessible

I'm always on the go, and don't like being tied down to one machine. I use [ownCloud](https://owncloud.org/) (personal cloud storage) to keep my files accessible, and I want my password archive file to be stored in the same way.

One concentration for Buttercup has been on archive accessibility, and the ability to load and save archives from many different types of data sources.

### Cross-platform

I've been developing on Linux, Mac and Windows for a variety of different projects, and I notice when there's an application or usability-experience that's lacking when performing common tasks.

Buttercup is built on [Electron](http://electron.atom.io/) and NodeJS, and will be built for all three platforms. Additional features and patches will reach every platform at the same time, unlike the KeePass ecosystem.

With JavaScript being such a popular language, both on the front-end and back-end, accessibility for contributing to Buttercup is very high. Have a recommendation or an addition? Don't be afraid to say hi on [Github][1].

### Work in progress

As of _25/10/2015_, [Buttercup's core library][1] is in alpha. We're gradually integrating it into the [desktop application][2], and an alpha release will be available in 2015.

## Library usage

Although Buttercup is primarily targeted towards desktop, end-user usage, it can easily be incorporated into other applications requiring a secure datastore:

```javascript
var Buttercup = require("buttercup");

var archive = new Buttercup.Archive(),
    datasource = new Buttercup.FileDatasource("/var/tmp/session.bcup"),
    recordGroup = archive.createGroup("state");

recordGroup.createEntry("user")
	.setMeta("namepsace", "com.application.system")
	.setMeta("timestamp", Date.now().toString());

datasource.save(archive, "secure-password");
```

You can even use it to build your own password manager: The _property_ and _meta_ storage Buttercup provides makes it suitable to store any style of data structure that can be adapted to a key-value list. Buttercup is **MIT** - if you build an extension or use it in an application, please let me know so that I can talk about it here!

[1]: https://github.com/perry-mitchell/buttercup-core
[2]: https://github.com/perry-mitchell/buttercup
