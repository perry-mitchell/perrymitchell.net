---
layout: post
title: Host alias style dev testing on your iPhone/iPad
excerpt: At my work, we have quite an extensive development environment setup
  with a number of domain aliases in our hosts file. We use a Vagrant plugin to
  dyn...
slug: host-alias-style-dev-testing-iphone-ipad
permalink: article/host-alias-style-dev-testing-iphone-ipad/index.html
date: 2014-11-19
updatedDate: 2014-11-19
tags:
  - post
  - mobile
  - testing
---

At my work, we have quite an extensive development environment setup with a number of domain aliases in our hosts file. We use a Vagrant plugin to dynamically set them when booting our dev machines up, so now we pretty much don't even think about it. The environment, under the hood, is still sufficiently complicated that developing on it with just the IP address is a massive pain and produces unreliable results during testing.

During a recent, terribly inefficient attempt at fixing a bug, I broke away from the regular process and went in search of another way of solving the issue. I found what I was looking for with a neat little proxy server called [TinyProxy](https://banu.com/tinyproxy/). I've used the proxy server before on my home servers, and it's proved incredibly easy to set-up and configure. Using it as a reverse proxy, somewhat, it can help us take care of some of those pesky aliases that we would otherwise not be able to use on our iOS devices (unless they were jailbroken).

## Installing TinyProxy

These steps which I'm about to discuss were taken on a Debian machine, but should be easily followed on other Linux boxes with minor command and config changes.

TinyProxy is in apt, you simply install it like so:
`sudo apt-get install tinyproxy`

Once installed, we can dive right into the configuration. Open the TinyProxy configuration:
`sudo vim /etc/tinyproxy.conf`

And locate a section that looks like this:

```
#
# Allow: Customization of authorization controls. If there are any # access control keywords then the default action is to DENY. Otherwise,
# the default action is ALLOW.
#
# The order of the controls are important. All incoming connections are # tested against the controls based on order.
# Allow 127.0.0.1
#Allow 192.168.0.0/16
#Allow 172.16.0.0/12
#Allow 10.0.0.0/8
```

For now, we want to allow everything, so **comment out** the "Allow 127.0.0.1" line. This should be enough to allow your device to connect through TinyProxy, which will allow your device to route using the host machine's hosts aliases (this means having the correct aliases that you want to use stored here).

_**Update 05-12-2014**: One of the readers noticed that some previous information that was recorded here was incorrect - It is not necessary to configure reverse path options for this technique to work._

You should now write and close the file, and restart TinyProxy:
[syntax_prettify linenums=""]sudo service tinyproxy restart[/syntax_prettify]
Your proxy should now be running on port **8888** ready to receive requests. Please be wary of having this port publically available, as currently the proxy server would be completely insecure and would allow any and all traffic coming through it.

## Setting up a proxy on an iPhone

This is the easy part. Jump into the Wi-Fi settings page on your device:

![iphone_wifi](http://perrymitchell.net/wp-content/uploads/2014/11/iphone_wifi-169x300.jpg)

On the network you're currently connected to, touch the (i) icon to view the settings. Scroll down to the bottom of the settings page to find the HTTP Proxy setup area:

![iphone_wifi_proxy](http://perrymitchell.net/wp-content/uploads/2014/11/iphone_wifi_proxy-169x300.jpg)

Enter your PC's IP address and the TinyProxy port (should be 8888 by default). You should now be connected to the web through your computer's proxy server. Test it to make sure it's working by browsing to a couple of external pages.

## In closing

When entering the dev domain you placed in the hosts file into your phone, you should be routed into your dev environment (as if you'd edited your hosts file on your phone). This process has helped me a lot in my job, as web development is almost primarily on mobile devices for certain clients. Testing purely in-browser will never produce completely accurate results, as years of UI bugs and graphical glitches have taught me. Chrome Dev-tools is powerful and feature-rich, but it'll never be completely reliable in the device-testing sense; it's not intended to emulate anything other than the user agent string, the screen size and DPI, and a few other small easily-mockable properties.