---
layout: post
title: A load balanced website using PHP FPM, Nginx, MySQL and Varnish (Part 3)
excerpt: In the [previous
  post](http://perrymitchell.net/article/load_balanced_website_php_fpm_nginx_mysql_va...
date: 2014-05-08
updatedDate: 2014-05-08
tags:
  - post
  - nginx
  - varnish
---

In the [previous post](http://perrymitchell.net/article/load_balanced_website_php_fpm_nginx_mysql_varnish_part_2/) we setup our Wordpress installation on 2 PHP servers for load balancing. We also setup the MySQL database to accept connections only from our 2 PHP webservers. We now need to setup our Varnish server to manage the load-balancing, which will (hopefully) divide traffic equally among our webservers. Before we get started, however, let's take a look at what we currently have:

*   1 MySQL server with a Wordpress database and external access control for 2 servers
*   2 PHP/Nginx webservers with the 'same' Wordpress setup on both, their databases pointing to the MySQL server
At this stage, you should <span style="text-decoration: underline;">build your Varnish server</span>. Start by setting up a vanilla Ubuntu server, and we will go through the Varnish installation and setup shortly.

We need to place the webservers under the Varnish umbrella to hide their addresses, so we should only refer to the Varnish server. We'll give it a domain name to make this easier: "wordpress.demo". You can obviously name this whatever you like, but the rest of this article will refer to this name. We can set it up in our local hosts file so our dev machine knows where to look. Simply add the following line, assuming you know the IP address of your Varnish server:
`192.168.0.67    wordpress.demo`
Where '192.168.0.67' would be the IP address of the Varnish box. This will allow us to refer to our Varnish server (and soon our load-balanced website) by a nice domain name.

## Setting up the Varnish server

On your shiny new Ubuntu server, we'll start by installing the Varnish package:
`sudo apt-get install varnish -y`
This will install the Varnish package with all of its defaults - executing the daemon to run on it's default port of 6081 (and management interface on 6082). We'll be switching the requests port for Varnish to port 80, the standard HTTP port.

Edit the Varnish configuration file:
`sudo vim /etc/default/varnish`

Find the block that resembles the following (not commented out):

```
DAEMON_OPTS="-a :6081 \
             -T localhost:6082 \
             -f /etc/varnish/default.vcl \
             -S /etc/varnish/secret \
             -s malloc,256m"
```

And change it to the following (notice the port change for the **-a** flag):

```
DAEMON_OPTS="-a :80 \
             -T localhost:6082 \
             -f /etc/varnish/default.vcl \
             -S /etc/varnish/secret \
             -s malloc,256m"
```

Save the file and exit the editor. Now we should restart Varnish:
`sudo service varnish restart`

You can check that Varnish is now running on the correct port (80) by running the following:
`sudo netstat -plutn | grep "varnishd"`

This command **should** produce 3 entries - Varnish on port 80 (IPv4), port 80 for IPv6 and the management interface (6082).

At this point you should try testing your Varnish server - simply pop "http://wordpress.demo/" into your browser. You should see the following:

[![Varnish -503 service unavailable](http://perrymitchell.net/wp-content/uploads/2014/04/varnish_cache_503_service_unavailable.png)](http://perrymitchell.net/wp-content/uploads/2014/04/varnish_cache_503_service_unavailable.png)
This means it's working!

We haven't setup any backends for Varnish yet, so this is what you'll see until we've linked up the PHP webservers.

### Configuring the Back-Ends

Varnish is typically a cache, commonly used to cache static files and media. It also acts as an excellent load balancer, allowing us to configure multiple end-points (backend servers) for the same website (host). In this manner, we'll configure Varnish to use a round-robin approach to load-balancing our 2 PHP servers.

First-off, let's dive into the configuration. Open **/etc/varnish/default.vcl** with VIM or your favourite editor, and find the section that resembles the following:

```
backend default {
    .host = "127.0.0.1";
    .port = "8080";
}
```

This is the default setup provided by Varnish, and the reason you may have seen the 503 error page mentioned earlier.

Now change the default backend to the following:

```
backend php1 {
    .host = "192.168.1.209";
    .post = "80";
}
```

Substitute the **.host** address with the IP of your first PHP/Nginx server. After you've done this and written out the file, restart the Varnish daemon:
`sudo service varnish restart`

Now you can refresh your wordpress.demo page - you should see (albeit in an uglier, less complete state) the front page of your blog. You're currently viewing your first PHP webserver through Varnish - let's continue and add the other. We'll add a bit more configuration to setup the round-robin functionality.

Again modify your default.vcl file to match this configuration (changing the IPs in doing so, obviously):

```
backend php1 {
    .host = "192.168.1.209";
    .port = "80";
}
backend php2 {
    .host = "192.168.1.164";
    .port = "80";
}

director default_director round-robin {
    { .backend = php1; }
    { .backend = php2; }
}

sub vcl_recv {
    set req.backend = default_director;
}
```

So we've added the second backend here, as well as a director to manage the round-robin functionality. We've also setup the handler for received requests, and have specified the backend to handle the request as the director (funnelling requests into the round-robin handler). To test this you'll need to restart your Varnish daemon again.

## Wordpress configuration

At this stage we need to reconfigure our Wordpress installation to account for the Varnish server. The first thing we need to do is to update the domain name stored in the Wordpress database. Log on to the MySQL server and run the following queries:

```
use wordpress;
SELECT option_name, option_value FROM wp_options WHERE option_value LIKE "%192.168%";
```

You should see a read-out of options:
```
    +-----------------------------------+
    | option_name | option_value        |
    +-------------+---------------------+
    | site_url    | http://192.168.0.35 |
    | home        | http://192.168.0.35 |
    +-------------+---------------------+
```

So Wordpress at this stage is still configured to be reached by one of our PHP servers, which could post a problem when navigating through our website. We'll update these to be the Varnish domain name by running a query:
```
UPDATE wp_options SET option_value="http://wordpress.demo" WHERE option_name="siteurl" OR option_name="home";
```

The previous SELECT query should now return an empty set, and the following should return our new setting values:
```
mysql> SELECT option_name, option_value FROM wp_options WHERE option_value LIKE "%wordpress.demo%";
+-------------------------------------+
| option_name | option_value          |
+-------------+-----------------------+
| site_url    | http://wordpress.demo |
| home        | http://wordpress.demo |
+-------------+-----------------------+
```

Now refreshing your wordpress.demo page should reveal a more lively-looking installation:

[![wordpress.demo setting updated](http://perrymitchell.net/wp-content/uploads/2014/04/wordpress.demo_setting_update.png)](http://perrymitchell.net/wp-content/uploads/2014/04/wordpress.demo_setting_update.png)All of the links should work, and we should now be able to log into our administration area. Browse to "http://wordpress.demo/wp-admin" and login using your credentials.

Jump straight into the Settings area and browse to the Permalink settings page. Update the settings to use the "Post name" option:

[![Wordpress permalink post name option](http://perrymitchell.net/wp-content/uploads/2014/04/wordpress_permalink_post_name.png)](http://perrymitchell.net/wp-content/uploads/2014/04/wordpress_permalink_post_name.png)Save this page to use the new permalink structure.

[![Wordpress permalinks updated](http://perrymitchell.net/wp-content/uploads/2014/04/wordpress_permalink_settings_updated.png)](http://perrymitchell.net/wp-content/uploads/2014/04/wordpress_permalink_settings_updated.png)Now all of the URLs should be of a more-attractive standard (eg. "http://wordpress.demo/hello-world/").

### Duplicated filesystem content

So as some of you might have guessed earlier, at some stage we were going to run into an issue with duplicating files across multiple Wordpress installations. We have 2 PHP servers with (currently) the same files - but when we start installing plugins and uploading media, we're going to run into a synchronisation issue where the servers do not contain the same files.

We don't have this issue with the database, of course, as it's hosted as a single instance shared across the servers. We don't have this luxury with the files, so we need to come up with a way to share the files across the servers.

If you're building this into a production environment then the answer is easy: use a CDN. You'll need to host files like **plugins** and **media** in a location that is accessible by the other servers. Although this fetch is more expensive, Varnish should take care of the cache for those more 'static' files.

If you're just playing in dev-land, you can be a little lazier if you choose. Many articles and forums recommend mounting these volatile directories on another server to 'share' the files, as uploading to a symlinked or mounted path would allow the files to be constantly reachable from any of our webservers. You could also try setting up a CRON job (or similar) to rsync media across the servers. This would provide some lag when new media is added (servers becoming out of sync), but would be manageable.

For this experiment, however, I'll be taking the lazy approach. I merely want to demonstrate the possibility of efficiently load-balancing a Wordpress website, but in practise you should be choosing the smartest solution here, not the quickest.

#### Mounting the wp-content directory (testing only)

_I do not recommend doing this outside of testing and experimenting. Using a CDN to host volatile directories is, in my opinion, the smarter way to manage the issue mentioned earlier. This is purely for demonstration purposes._

We're going to mount the wp-content directory on the server "php1" inside the server "php2". Log in to php2 and install SSHFS:
`sudo apt-get install sshfs -y`

Next, edit the Fuse configuration to allow for simpler permissions handling:
`sudo vim /etc/fuse.conf`

In fuse.conf, uncomment the line: "#user_allow_other" so it reads "user_allow_other". Save this file.

Next, browse to your web root, presumably at "/usr/share/nginx/www". Rename the old wp-content directory:
`mv wp-content wp-content-old`

And then mount the new one:
```
mkdir wp-content
sshfs -o allow_other perry@192.168.1.209:/usr/share/nginx/www/wp-content ./wp-content
```

In the above example, we recreate the wp-content directory for mounting with SSHFS. We then mount, using SSHFS, the wp-content directory on the php1 server in this newly created (empty) directory. Replace the username and IP address here with the details of the php1 server.

At this stage, we should have a 'shared' wp-content directory. You can now test this by uploading an image, for example, to our Hello-World post:

[![Wordpress tute image upload success](http://perrymitchell.net/wp-content/uploads/2014/04/wordpress_image_upload_success-245x300.png)](http://perrymitchell.net/wp-content/uploads/2014/04/wordpress_image_upload_success.png)

### Write permission

You may need to setup write access to your wp-content directory, or uploads of media or plugins may fail. Normally this is at the discretion of the one managing the webserver, as it's sometimes a security concern - but I merely had to add group write access to the wp-content folder for everything to continue working. Providing write access will allow the webserver (Wordpress) to upload new files to the directory.

On php1 (or whichever servers are hosting the wp-content directory - not php2 in our case), browse to the root web directory (www). Run the following command to provide write access:
`chmod -R g+w wp-content`

### Helpful Wordpress plugins

It is a good idea to install the plugin labelled "Nginx" (also referred to as "Nginx Helper"). It adds better support for various Nginx functions that would otherwise go unused.

Another important one is "Wordpress Varnish" (WPVarnish), which manages cache clearing when blog changes occur. We'll be configuring this one a little later.

## Further optimisations

So we're not done yet - there's still quite a few things to add and tweak before our setup is running optimally. Things like cookies will interrupt Varnish on its mission to cache static data from Wordpress, so we need to take care of those loose ends.

### Varnish optimisation

There are a number of great articles on how to optimise a Wordpress + Varnish setup, some of them even including Nginx and PHP-FPM in the mix like we are. The following solution is one I've cobbled together, and tested, from segments of those articles ([1](http://blog.david-jensen.com/install-varnish-cache-centos-speed-up-wordpress-apache/) [2](https://scalr-wiki.atlassian.net/wiki/display/docs/Install+Varnish+HTTP+Accelerator+with+WordPress) [3](https://www.varnish-cache.org/trac/wiki/VarnishAndWordpress) [4](https://www.varnish-cache.org/docs/trunk/users-guide/vcl-backends.html)).

Dive back into the default.vcl file and edit your "sub vcl_recv" section to look like this:
```
sub vcl_recv {
    if (!(req.url ~ "wp-(login|admin)")) {
        unset req.http.cookie;
    }

    set req.backend = default_director;
}
```

This snippet prevents cookies from being sent to the backend (provided they're not trying to reach the login pages). We also want to stop cookies coming **from** the backend, so add the following "vcl_fetch" block (or append the contents to yours if you already have one):
```
sub vcl_fetch {
    if (!(req.url ~ "wp-(login|admin)")) {
        unset beresp.http.set-cookie;
    }
}
```

This will prevent cookies being sent from the backend through its response (beresp).

While we're here, we're also going to add a couple of probes (health checks) to our backends. These will intermittently poll our backends to make sure they're still alive, and adjust accordingly if they aren't. Change your backend blocks to match the following:

```
backend php1 {
    .host = "192.168.1.209";
    .port = "80";
    .probe = {
        .url = "/";
        .interval = 15s;
        .timeout = 5s;
        .window = 5;
        .threshold = 3;
    }
}
backend php2 {
    .host = "192.168.1.164";
    .port = "80";
    .probe = {
        .url = "/";
        .interval = 15s;
        .timeout = 5s;
        .window = 5;
        .threshold = 3;
    }
}
```

We've added a ".probe" block to both of our backends. This configuration polls the root of our webservers every 15 seconds to check they're alright. The properties are as follows:

*   **.url** - The URL at the backend to poll
*   **.interval** - The delay between polls
*   **.timeout** - The timeout delay for the probe
*   **.window** - The number of probes Varnish will retain when considering the health of a backend
*   **.threshold** - The number of polls (within the window) that must have succeeded for the backend to be considered healthy
At this stage, there really isn't a huge necessity to continue optimising Varnish. The settings above will drastically improve the effectiveness of Varnish running in front of Wordpress, but there are more tweaks you can perform to gain a better caching pattern.

### Extra Varnish configuration for Wordpress

The following is my current configuration file, with a few extra pieces taken from the posts I mentioned earlier.

```
backend php1 {
    .host = "192.168.1.209";
    .port = "80";
    .probe = {
        .url = "/";
        .interval = 15s;
        .timeout = 5s;
        .window = 5;
        .threshold = 3;
    }
}
backend php2 {
    .host = "192.168.1.164";
    .port = "80";
    .probe = {
        .url = "/";
        .interval = 15s;
        .timeout = 5s;
        .window = 5;
        .threshold = 3;
    }
}

director default_director round-robin {
    { .backend = php1; }
    { .backend = php2; }
}

acl purge {
    "192.168.1.209";
    "192.168.1.164";
}

sub vcl_recv {
    if (req.request == "BAN") {
        if (!client.ip ~ purge) {
            error 405 "Not allowed.";
        }
        ban("req.url ~ " + req.url + " &amp;&amp; req.http.host == " + req.http.host);
        error 200 "Banned.";
    }

    if (!(req.url ~ "wp-(login|admin)")) {
        unset req.http.cookie;
    }

    set req.backend = default_director;

    if (req.request != "GET" &amp;&amp;
        req.request != "HEAD" &amp;&amp;
        req.request != "PUT" &amp;&amp;
        req.request != "POST" &amp;&amp;
        req.request != "TRACE" &amp;&amp;
        req.request != "OPTIONS" &amp;&amp;
        req.request != "DELETE") {
        return (pipe);
    }

    if (req.request != "GET" &amp;&amp; req.request != "HEAD") {
        return (pass);
    }

    # Don't cache ajax
    if (req.http.X-Requested-With == "XMLHttpRequest" || req.url ~ "nocache" || req.url ~ "(control.php|wp-comments-post.php|wp-login.php|bb-login.php|bb-reset-password.php|register.php)") {
        return (pass);
    }

    # Don't cache previews
    if (req.url ~ "preview=true") {
        return (pass);
    }

    return (lookup);
}

sub vcl_fetch {
    if (beresp.status == 404) {
        set beresp.ttl = 0m;
        return (hit_for_pass);
    }

    if (req.url ~ "wp-(login|admin)" || req.url ~ "preview=true") {
        return (hit_for_pass);
    }

    return (deliver);
}
```

If you use the config above, be sure to change the necessary IP addresses. The "acl purge" section lists IPs that are **allowed** to send BAN requests, so be sure to change those to the addresses of the PHP servers.

Now if you installed the Wordpress Varnish plugin earlier, we'll begin configuring it now. If not, you can skip this section.

Edit the Varnish configuration at "/etc/default/varnish". Take note of the administrative port, which is specified by the "-T" flag. It'll be in the DAEMON_OPTS specification:

```
DAEMON_OPTS="-a :80 \
             -T localhost:6082 \
             -f /etc/varnish/default.vcl \
             -S /etc/varnish/secret \
             -s malloc,256m"
```

As you can see in ours, it is **6082**, the default set by Varnish.

You'll also need the Varnish 'secret', located at "/etc/varnish/secret". Copy down the string in that file and head to the configuration page of the Varnish plugin:

[![Wordpress Varnish plugin administration](http://perrymitchell.net/wp-content/uploads/2014/04/wordpress_varnish_plugin_admin-300x190.png)](http://perrymitchell.net/wp-content/uploads/2014/04/wordpress_varnish_plugin_admin.png)Enter in the IP address of the Varnish server (relative to the PHP servers - useful to note if you're operating these on a VPN, which you should be on when in production-land), as well as the port and secret. Save the configuration and you're right to go.

### Benchmarking

As I'm running my little setup locally, any benchmark I perform will not be an accurate representation of how this setup would perform in production. You should not take any numbers mentioned here as what you should expect in terms of response times and performance. In fact, the following 'benches' cannot be extrapolated from at all. That being said, here's a couple of Apache Bench processes I ran:

**Run of 1 webserver (no Varnish)
**Run using: "ab -n 1000 -c 4 http://192.168.1.209/"

```
$ ab -n 1000 -c 4 http://192.168.1.209/
This is ApacheBench, Version 2.3 &lt;$Revision: 655654 $&gt;
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking 192.168.1.209 (be patient)
Completed 100 requests
Completed 200 requests
Completed 300 requests
Completed 400 requests
Completed 500 requests
Completed 600 requests
Completed 700 requests
Completed 800 requests
Completed 900 requests
Completed 1000 requests
Finished 1000 requests

Server Software:        nginx/1.1.19
Server Hostname:        192.168.1.209
Server Port:            80

Document Path:          /
Document Length:        7870 bytes

Concurrency Level:      4
Time taken for tests:   74.413 seconds
Complete requests:      1000
Failed requests:        0
Write errors:           0
Total transferred:      8091000 bytes
HTML transferred:       7870000 bytes
Requests per second:    13.44 [#/sec] (mean)
Time per request:       297.652 [ms] (mean)
Time per request:       74.413 [ms] (mean, across all concurrent requests)
Transfer rate:          106.18 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.3      0       4
Processing:   137  297  39.1    291     492
Waiting:      135  292  39.5    286     482
Total:        137  297  39.1    291     492

Percentage of the requests served within a certain time (ms)
  50%    291
  66%    309
  75%    321
  80%    327
  90%    349
  95%    373
  98%    396
  99%    409
 100%    492 (longest request)
```

**Run of wordpress.demo (Varnish server)
**Run using: "ab -n 1000 -c 4 http://wordpress.demo/"

```
$ ab -n 1000 -c 4 http://wordpress.demo/
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking wordpress.demo (be patient)
Completed 100 requests
Completed 200 requests
Completed 300 requests
Completed 400 requests
Completed 500 requests
Completed 600 requests
Completed 700 requests
Completed 800 requests
Completed 900 requests
Completed 1000 requests
Finished 1000 requests

Server Software:        nginx/1.1.19
Server Hostname:        wordpress.demo
Server Port:            80

Document Path:          /
Document Length:        7870 bytes

Concurrency Level:      4
Time taken for tests:   0.614 seconds
Complete requests:      1000
Failed requests:        0
Write errors:           0
Total transferred:      8150989 bytes
HTML transferred:       7870000 bytes
Requests per second:    1629.70 [#/sec] (mean)
Time per request:       2.454 [ms] (mean)
Time per request:       0.614 [ms] (mean, across all concurrent requests)
Transfer rate:          12972.37 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.4      0       6
Processing:     0    2   6.3      1      98
Waiting:        0    2   6.3      0      98
Total:          0    2   6.4      1      98

Percentage of the requests served within a certain time (ms)
  50%      1
  66%      2
  75%      3
  80%      4
  90%      5
  95%      7
  98%      9
  99%     11
 100%     98 (longest request)
```

Without over-analysing the output, we can see a significant increase in requests-per-second, as the Varnish cache is just throwing back the cached data. There are many factors which will affect the difference in performance when running these servers in production, that are not present when running the machines locally.

## Going forward

There are endless possibilities when it comes to this level of customisation - Expanding in every direction becomes possible with a bit of planning, and your website benefits greatly from the increased efficiently and decrease in server load (less reprocessing of the same information, for instance).

There are also many issues and caveats with doing this, especially when working with some CMS' like Wordpress.

### Possibilities

As mentioned earlier, moving the content directory to a CDN is a great idea. It centralises your content, making it accessible to each server. The load on each server is also (for the most part) equal, as they all have to fetch media from the same location. It's also a lot more sane than setting up a web of rsync processes or something similar. Wordpress offers some promising plugins that utilise CDNs like Amazon's S3 or Rackspace.

Security is also an important factor here, seeing as the website is strewn across several servers. In essence, only the Varnish server should be publicly exposed - all other servers (PHP servers, MySQL) should be hidden behind a VPN that connects them all together. Varnish should access the webservers privately, as well as the webservers accessing the database in the same manner.

You could also expand the number of webservers - They're intended to be identical, so extending them horizontally would be beneficial to scaling. The same can be done with the Varnish servers, with perhaps a DNS round-robin on top of that to distribute the initial request load.

The database could also be expanded to provide several read-nodes with a single write-node, or something to that effect. Database expansion to this degree may be overkill for Wordpress, depending on the demand.

### Caveats

The first major caveat (with the setup referred to in this article) is the inability to effectively update the Wordpress system. Plugins are easier when they're stored on a CDN or a shared mount point, but in our case there are as many Wordpress installations to update as their are webservers. A method to cleanly update Wordpress on each node would need to be devised before going live with such a platform.

Cost is a big deal here. When you add up the cost-per-server of your installation, including the CDN, you could end up forking out a hefty sum of cash. The truth here is that there are some more efficient and less costly approaches to improving the availability of your site.. Especially if your traffic is at a manageable level. Mixing Varnish, Nginx and PHP-FPM like this is something I'd recommend for the groundwork of a more major service.

### Wrapping up

That's all there is to this article - I hope it managed to provide some insight into what I regard as a very exciting area of web infrastructure development. It's very rewarding when you finish such a project to find that it works extremely well. Something like this could make for a great project base to develop with, potentially giving rise to a mirrored production setup.

I'd love to push this article's content into a Vagrant + Puppet setup, maybe even on Github. If I venture down that path I'll make sure to update here.

Thanks!
