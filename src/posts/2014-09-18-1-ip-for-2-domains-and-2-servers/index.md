---
layout: post
title: 1 IP for 2 domains and 2 servers
excerpt: Recently I've been using GitLab a lot for work, and have found it to be
  a wonderful platform on which to manage our repositories and branches. I've
  en...
slug: 1-ip-for-2-domains-and-2-servers
permalink: article/1-ip-for-2-domains-and-2-servers/index.html
date: 2014-09-18
updatedDate: 2014-09-18
tags:
  - post
  - gitlab
  - ownCloud
  - varnish
---

Recently I've been using [GitLab](https://about.gitlab.com/) a lot for work, and have found it to be a wonderful platform on which to manage our repositories and branches. I've enjoyed using it so much, that I decided that I want to use it at home as well (on a brand new server). The problem there is that I'm on a regular home internet connection with a single IP address, which is made worse by the fact that I already have a heavily laden server that I intend to keep running. I want some services to remain on my original server, with some others being on the new one.

I also want to have both GitLab and ownCloud using HTTP port 80 (none of that domain.com:81 rubbish). I have 2 domain names (DynDNS) pointed to my IP - 1 for ownCloud and 1 for GitLab.

The services I want to have on my two servers are as follows:

**Server 1 (existing):**

*   Plex Media Server
*   ownCloud
*   Minecraft

**Server 2 (new):**

*   GitLab

I'm sure this type of problem has been dealt with by many others before me, but here's how I did it:

1.  Setup the new server, basic packages and installed Varnish (left with default config for now)
2.  Changed port 80 on the router to forward to the new server instead of the old (thus breaking ownCloud for now)
3.  Setup Varnish to listen on port 80
4.  Tested that Varnish responds to requests for both domain names (Guru meditation for now)
5.  Added a backend in my Varnish config to point to the ownCloud instance (old server), testing that it works
6.  [Installed GitLab](https://about.gitlab.com/downloads/) on the new server
7.  Set GitLab to use port 81
8.  Added another backend in Varnish to point the second domain to localhost (GitLab) on port 81

Following these steps lead to a fully functional GitLab server, whilst keeping my ownCloud instance up and running. I now have 2 servers that I can use to share the load of some of my daily tasks. Varnish is a fantastically versatile tool that I can thoroughly recommend.

## Configuration

Below is my Varnish configuration:

```
backend default {
    .host = "127.0.0.1";
    .port = "81";
}

backend cloud {
    .host = "192.168.0.200";
    .port = "80";
}

sub vcl_recv {
    if (req.http.host == "owncloud.com") {
        set req.backend_hint = cloud;
        set req.http.host = "owncloud.com";
    } else {
        set req.backend_hint = default;
        set req.http.host = "gitlab.com";
    }
}
```

It contains 2 backends for my ownCloud and GitLab instances (I've replaced my domain names for privacy). "default" is the Gitlab instance, which is on the new server with Varnish, and "cloud" is the ownCloud instance on the old server. _Note that this is VCL version 4 syntax._

For GitLab, I also had to change the port it listens on. By default GitLab occupies port 80, but I switched it to 81 by editing the file "/etc/gitlab/gitlab.rb":

```
# Change the external_url to the address your users will type in their browser
external_url 'http://gitlab.com:81'
```

Don't be fooled by the URL syntax - you won't have to enter "...:81" in your browser - GitLab uses this to configure its embedded copy of nginx to use port 81 instead of 80 - freeing it up for Varnish.

After these changes you should reconfigure GitLab (first):

`sudo gitlab-ctl reconfigure`

As well as restarting the Varnish daemon:

`sudo service varnish restart`

That should do the trick :)