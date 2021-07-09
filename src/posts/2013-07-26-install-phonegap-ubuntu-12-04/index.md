---
layout: post
title: Installing Phonegap on Ubuntu 12.04
excerpt: Attempting to install Phonegap on your Ubuntu workstation? Well guess
  again. At the time of writing this post, users following the steps on the
  Phoneg...
slug: install-phonegap-ubuntu-12-04
permalink: article/install-phonegap-ubuntu-12-04/index.html
date: 2013-07-26
updatedDate: 2013-07-26
tags:
  - post
  - nodejs
  - phonegap
---

Attempting to install Phonegap on your Ubuntu workstation? Well guess again. At the time of writing this post, users following the steps on the Phonegap website to install would receive version errors stating that the version of nodejs may be unsuitable.

_Please note that this is not a tutorial, but merely an account of an issue I encountered when attempting to install PhoneGap._

The setup starts by installing nodejs and npm: `sudo apt-get install nodejs npm -y`

Entering the following command, like on the Phonegap website, will present the user with the following error:
`sudo npm install -g phonegap`

```
npm http GET https://registry.npmjs.org/phonegap
npm http 200 https://registry.npmjs.org/phonegap

npm ERR! Error: No compatible version found: phonegap
npm ERR! No valid targets found.
npm ERR! Perhaps not compatible with your version of node?
npm ERR!     at installTargetsError (/usr/share/npm/lib/cache.js:488:10)
npm ERR!     at next_ (/usr/share/npm/lib/cache.js:438:17)
npm ERR!     at next (/usr/share/npm/lib/cache.js:415:44)
npm ERR!     at /usr/share/npm/lib/cache.js:408:5
npm ERR!     at saved (/usr/share/npm/lib/utils/npm-registry-client/get.js:147:7)
npm ERR!     at Object.oncomplete (/usr/lib/nodejs/graceful-fs.js:230:7)
npm ERR! You may report this log at:
npm ERR!     
npm ERR! or use
npm ERR!     reportbug --attach /var/www/dbwrap/npm-debug.log npm
npm ERR! 
npm ERR! System Linux 3.2.0-48-generic
npm ERR! command "node" "/usr/bin/npm" "install" "-g" "phonegap"
npm ERR! cwd /var/www/dbwrap
npm ERR! node -v v0.6.12
npm ERR! npm -v 1.1.4
npm ERR! message No compatible version found: phonegap
npm ERR! message No valid targets found.
npm ERR! message Perhaps not compatible with your version of node?
npm ERR! 
npm ERR! Additional logging details can be found in:
npm ERR!     /var/www/dbwrap/npm-debug.log
npm not ok
```

Simply force the install by adding the **f** flag: `sudo npm install -gf phonegap`
That should result in a successfully installed copy of Phonegap - Enjoy!