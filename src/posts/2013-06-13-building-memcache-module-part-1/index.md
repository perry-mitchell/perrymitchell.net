---
layout: post
title: Building a Memcache module for your site (Part 1)
excerpt: Adding memcache functionality to your custom site can be very
  beneficial for processing speed, depen...
date: 2013-06-13
updatedDate: 2013-06-13
tags:
  - post
  - memcached
---

Adding memcache functionality to your custom site can be very beneficial for processing speed, depending on what you cache. Memcache can help take the load off file hits and other time-consuming IO by keeping some important stuff in memory, easily accessible to your PHP scripts. The Memcache server will receive a connection from your scripts to either get or set values.

**NB:** I won't enter into it here, but using Memcache is solely at your discretion. I can not provide a simple answer here as to whether or not using Memcache would be beneficial to you and your site. There's a nice article [here](https://www.memcachier.com/2012/06/28/why-should-i-use-memcache/) that might help.

## Installing Memcache

For the purposes of this article, I'll assume you're using a Linux machine (specifically Ubuntu 12.04). I'll go on to assume also that you have apache2, php5 and any other modules required to run a website installed prior to following this article.

Running 'aptitude search memcache' will present quite a few items, specifically three that look very similar:**memcached,** **php5-memcache** and php5-memcached. In short, and from what I've read elsewhere, both php5-memcache and php5-memcached will get you what you want, but I can guarantee that memcached and php5-memcache work correctly, so **ignore **php5-memcached.

First, go ahead and install the php5-memcache package:
`sudo apt-get install php5-memcache`

Then you want to install the memcached package:
`sudo apt-get install memcached`

You should note that right now, all you've done is get the setup ready. Memcache is not running or available just yet - We need to install PHP's Pear library to complete the final bit of setup.

While we're installing pear, we're going to want the build-essential package as well. This provides a whole lot of compiling tools for C/C++ etc, some of which are necessary for pear installations. So let's go ahead and install both of those:
`sudo apt-get install php-pear build-essential`

Once pear is installed, we can use a **pecl** command to perform the final memcache installation:
`sudo pecl install memcache`

During installation, you will be asked to "Enable memcache session handler support?" - Just select yes. This option allows memcache to take over the handling of your PHP sessions, rather than allowing them to be written to the hard disk.

The last step to get memcache working is to add the following line to the config file "/etc/php5/conf.d/memcache.ini" (which does not exist yet):
`extension=memcache.so`

There are a number of examples of how to write this to the file via a command-line argument, but I haven't had any luck getting them to work. I used the following command, which worked perfectly:
`sudo bash -c "echo extension=memcache.so > /etc/php5/conf.d/memcache.ini"`

Finally, we want to restart apache:
`sudo service apache2 restart`

And that's it for the setup - Memcache should now be running. Check out [Part 2](http://perrymitchell.net/article/building_memcache_module_part_2) for the actual build of the module.