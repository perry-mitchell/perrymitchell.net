---
layout: post
title: A load balanced website using PHP FPM, Nginx, MySQL and Varnish (Part 1)
excerpt: A recent project I was working on involved designing a web system that
  was load balanced and reliable. The quote involved using Wordpress as the
  websi...
slug: load-balanced-website-php-fpm-nginx-mysql-varnish-part-1
permalink: article/load-balanced-website-php-fpm-nginx-mysql-varnish-part-1/index.html
date: 2013-07-01
updatedDate: 2013-07-01
tags:
  - post
  - nginx
  - varnish
  - wordpress
---

A recent project I was working on involved designing a web system that was load balanced and reliable. The quote involved using [Wordpress](http://wordpress.com/) as the website's CMS, which meant a PHP webserver and MySQL database. I decided to dive right in with my design, and use [Nginx](http://nginx.org/en/) as the webserver beside a [PHP-FPM](http://php-fpm.org/) install. The php5-fpm package installs php as a daemon, so the process is constantly running and listening.

Speed was an important factor with this project, so I decided to use [Varnish](https://www.varnish-cache.org/) at the front of the system - both as a cache and load-balancer. The setup would also consist of 2 PHP Nginx webservers, running the exact same site source as each other. These webservers would be configured as load-balanced backends in Varnish's config. The webservers would also be running the [php5-xcache](http://xcache.lighttpd.net/) package, providing PHP opcode caching to improve the responsiveness. php5-xcache is a great package and requires pretty much no setup: Just install it and restart php (or the webserver in non-fpm environments).

The MySQL database would also sit out on its own server, dedicated to database operations from the 2 webservers. The memory on this box would be higher than the other servers to allow for more significant caching. Both webservers would access the database on the regular TCP port using locked-down access control. The MySQL database allows only 2 accounts to connect from external sources - These accounts are specific to the webservers and their IP addresses.

This system was proposed using [Amazon Web Services](http://aws.amazon.com/) as the infrastructure, but for the purpose of this article, I'll be reconstructing the system using VirtualBox VMs. I'll be using Ubuntu 12.04.2 LTS for the operating system with all the latest updates.

## Getting Started

First things first: We need to get some servers up and running. You can do this by creating just 1 server and cloning it, or by building them side-by-side simultaneously. Either way, we'll start by building 3 webservers:

*   A Varnish cache
*   A PHP webserver
*   A MySQL server
Run up 3 virtual machines with 512mb of RAM with bridged networking (so they get nice IP addresses) and about 8gb of HDD each (default for Ubuntu). Make sure to install the OpenSSH server on each during setup. I used an Ubuntu image, so I'll just go ahead and update everything first:
<pre>sudo apt-get update; sudo apt-get upgrade -y</pre>
I'll also install some basic packages before I start, which can be installed in each server:
<pre>sudo apt-get install zip unzip htop ntp -y</pre>

## Setting up the PHP Webservers

We'll build the webservers first, as they're the easiest to test (although not the easiest to build). A lot of the higher-level tasks performed in this post could be applied to an Apache setup, if you're that way inclined, but I've found Wordpress to work well on Nginx. That being said, the setup for Nginx so that it works well with PHP and Wordpress is quite complex at times (at least in comparison to an Apache setup).

Let's get started by installing Nginx:
`sudo apt-get install nginx -y`

This installed our webserver, which we can start it by running:
`sudo /etc/init.d/nginx start`

You should now be able to browse to the temporary webpage on your nginx host:

![Nginx welcome page](http://perrymitchell.net/wp-content/uploads/2013/11/nginx_welcome.png)

Now we can go ahead and install PHP:
`sudo apt-get install php5-fpm -y`

## PHP Configuration

We're going to jump straight in and setup Memcached to handle php's sessions. This is a little more work, but will ultimately result in a faster setup. We just need to install some prerequisites:
`sudo apt-get install php5-mysql php5-memcache memcached php-pear build-essential php5-xcache -y`

These packages give us what we need to get memcache up and running. We're installing PHP's memcache interface, the memcache daemon, pear, xcache and the build-essential library (C/C++ build tools, etc). To complete the installation, run the following command to make pear setup memcache:
`sudo pecl install memcache`

Now that we have all we need, we can configure PHP. Open the file **/etc/php5/fpm/php.ini** and find the line:
`;cgi.fix_pathinfo=1`

Uncomment the line by removing the semi-colon **and** change the 1 to a 0\. This will disable the legacy path fix support. It should look like this:
`cgi.fix_pathinfo=0`

You'll also want to change the **session.save_handler** line. It'll be set to "files", but you'll want to change it to "memcache" (note the lack of the letter '**d**'). You'll also need to set the save path for the session handler. Obviously this will no longer be a directory, but will instead be a TCP URI. The line **session.save_path** will be commented out by a semi-colon, but uncomment it and set it to something like the following:
`session.save_path="tcp://localhost:11211?persistent=1&amp;weight=1&amp;timeout=1&amp;retry_interval=15"`

This will tell PHP that the sessions can be made by accessing that location. It says that the memcache server is running locally on port 11211 (default). Our memcache servers will be running locally on each PHP machine, so this configuration is fine. In some instances you may house your memcache server off-site, in which case you'd change this address.

There are other modifications you can do in this file, like upload and memory limit increases, but I'll leave this to you to decide whether or not they're worth it.

By default PHP FPM listens on a TCP port for connections, but there's a tiny delay when using the network stack, so it's best to change it to use a socket file instead. Edit the file **/etc/php5/fpm/pool.d/www.conf** and find the line that looks like this:
`;listen = 127.0.0.1:9000`

Comment it out by placing a semi-colon at the start, and write a new line, like so:
`listen = /var/run/php5-fpm.sock`

This will tell PHP FPM to listen on the local socket.

Make sure to restart the PHP daemon:
`sudo /etc/init.d/php5-fpm restart`

## Nginx Configuration

With PHP FPM setup correctly, we can move on to finalising the setup for Nginx. At this stage, nothing will work quite right until you've finished these instructions.

The first place we want to look at is **/etc/nginx/nginx.conf**. Make sure there's a line near the top that looks like this:
`worker_processes 4;`

If it doesn't exist, create it, and if it does but has a different value, change the value to match the above line. The worker processes is the number of processes that are spawned to churn through requests. Typically nginx users will suggest that this number be equal to **2 * number-of-CPUs**, but if in doubt just leave it as 4.

Down in the **http** section, there should be a line that looks something like "keepalive_timeout 65;". This signifies that keepalives for HTTP requests will stay resident for 65 seconds - Far too long IMO. We're going to change this to 5 seconds:
`keepalive_timeout 5;`

It's time to setup your default site! Edit the file at **/etc/nginx/sites_available/default**. First things first, uncomment the 'listen' lines in the server block, so they look like this:

```
listen 80; ## listen for ipv4; this line is default and implied
listen [::]:80 default ipv6only=on; ## listen for ipv6
```
This tells Nginx to listen on port 80 for requests using both IPv4 and IPv6.

Next thing is the index line, which looks like this:
`index index.html index.htm;`

Change it to this (includes php):
`index index.php index.html index.htm;`

In the location section there's a line that starts with "try_files". We're going to comment this out with a hash and replace it - This'll help URL rewriting for Wordpress. Here's what that section should look like after you've modified it:
```
#try_files $uri $uri/ /index.html;
try_files $uri $uri/ /index.php?q=$uri&$args;
```

Now for the PHP handling section - We need to uncomment the entire block from "location ~ \.php$ {" through to the closing curly brace "}". You'll need to comment out the fastcgi_pass line with the IP address, insert the socket line and insert the fastcgi_param line for script locations. The block should look similar to this when you're done:

```
location ~ \.php$ {
	fastcgi_split_path_info ^(.+\.php)(/.+)$;
	# NOTE: You should have "cgi.fix_pathinfo = 0;" in php.ini
	# With php5-cgi alone:
	#fastcgi_pass 127.0.0.1:9000;
	# With php5-fpm:
	fastcgi_pass unix:/var/run/php5-fpm.sock;
	fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
	fastcgi_index index.php;
	include fastcgi_params;
}
```

And finally, we want to disallow access to any **.htaccess** files that may appear in our web directory due to the public's preference of using Apache for almost everything. Find the htaccess section and uncomment it so it looks like this:

```
location ~ /\.ht {
	deny all;
}
```

You can now restart Nginx by running the following command:
`sudo /etc/init.d/nginx restart`

## Intermission

You've so far successfully setup the web environment for an Nginx-based Wordpress setup, which will eventually be used in a load-balanced web system. This was the hard part - The remaining tasks to complete to have a working system are minor in comparison.

The second installment of this tutorial can be found [here](http://perrymitchell.net/article/load_balanced_website_php_fpm_nginx_mysql_varnish_part_2/).
