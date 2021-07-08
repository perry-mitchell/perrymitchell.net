---
layout: post
title: Node and Express as a web server
excerpt: Over at [Oddshot](http://oddshot.tv/) we've had some time to look at
  the best ways of providing an a...
date: 2015-08-22
updatedDate: 2015-08-22
tags:
  - post
  - deployment
  - expressjs
  - nodejs
  - performance
  - security
---

Over at [Oddshot](http://oddshot.tv/) we've had some time to look at the best ways of providing an awesome experience to our viewers. We've looked at things like performance, maintainability and accessibility, open-source solutions etc. and we've ended up using NodeJS with Express for our front-end (and we're very happy we did!).

Node is an amazing platform that's really helped JavaScript developers come in to their own in terms of server-side software. It's an extremely versatile platform with a hugely active community (both of which can be somewhat attributed to the popularity of the language), but we need to keep in mind that its maturity (and perhaps its performance, to some extent) isn't at the same level that say a PHP+Laravel stack is (our previous implementation).

It's been several weeks with Node in production and we're already ecstatic with its performance (and me pleasantly surprised). I've done a bit of Node development before but I've never released a server-based project at such a scale. I was a little doubtful at some points that Node+Express would handle the full brunt of our expected traffic (scaling was the temporary solution there), but this was quickly put to rest after I'd nutted out a few important points to using Node in a production environment.

## Node's NODE_ENV=production

The first and most important point is the Node environment variable, which **you should absolutely set** when deploying your production service. NODE_ENV should be set to "production" when running your services in front of clients, as it provides several perks ([check out the performance hit of not using NODE_ENV](http://apmblog.dynatrace.com/2015/07/22/the-drastic-effects-of-omitting-node_env-in-your-express-js-applications/)).

One of these perks is view template caching. When using a view templating engine (like Jade) in development, Express will not cache the rendered views and will instead render them upon each request. This makes development a ton easier, but is obviously needlessly expensive in terms of CPU usage when in production. `NODE_ENV=production` will (as part of its effects) enable view caching, saving a lot of cycles.

## Serving static content from Express

Short answer: **don't.**

A lot of guides to getting started with Express do the following in the routes specification:

```
// static files:
app.get(/^(.+)$/, function(req, res) { 
    res.sendFile(publicDir + "/" + req.params[0]); 
});
```

This will (being placed after all of the other dynamic routes) serve up static files from within Node and send them to the user. There are many changes being made to Node and Express to increase performance, including features around `sendFile` functionality that mimics Nginx's that loads static files into memory - But IMO, why dabble in uncertainty when we could just use Nginx to serve all of our static files.

There's absolutely no need to have Node load up and send all of those images, CSS, JavaScript etc. when Nginx is famous for doing just that, and doing it faster than everyone else. Make sure you invest some time and effort in setting up [decent caching rules](http://stackoverflow.com/a/12344993) for that content too.

## Handling SSL

If you're considering supporting SSL connections on your website, and you seriously should, there's little reason to have it handled by your NodeJS application.

We've already spoken about using Nginx to manage your static assets by sitting in front of Node, and it's little extra work to have Nginx also [handle your SSL connections](http://www.sitepoint.com/configuring-nginx-ssl-node-js/). This way, you get SSL to your doorstep (handled by an experienced player, Nginx), and you reduce complexity in your Node app.

## Deployment

You're using NodeJS, and you have the ability to be extremely expressive in your setup while keeping complexity to a minimum. You can continue this trend with your deployment, also, by using some existing tools to move your project into staging and production.

[Flightplan](https://www.npmjs.com/package/flightplan) is an awesome NodeJS tool for managing your deployments. It supports different configurations **and** environments:

```
plan.target('staging', {
  host: 'staging.yoursite.com',
  username: 'nodeapp',
  agent: process.env.SSH_AUTH_SOCK
});
```

You can run deployments in a very simple manner:

`fly production`

There are certainly several other options for deployment (also written for Node), but Flightplan is by far my favourite.

Auto-starting and monitoring your service is important as well in production environments. [PM2](https://github.com/Unitech/pm2) is a very popular Node app management tool that has an extensive array of features. You can write a short JSON configuration for your application (separate files for different environments) which you feed into PM2, which will then keep your application running forever if you choose.

PM2 also has integration with a beautiful dashboard and monitoring platform called [Keymetrics](https://keymetrics.io/). Keymetrics has a price tag beyond a single instance and app, which is a bit hefty for my taste, but it's an amazing solution for companies running performance-critical Node applications in the wild. It's well worth a look, and PM2 is definitely a good bet even if you choose not to use Keymetrics.

## Clustering and load balancing

Node has some great tools to clustering, and if you're planning to scale you can quite easily drop a [load balancer](https://gist.github.com/obolton/071be4c926f9cf0b6fd8) in front of your servers. Keeping your web service somewhat 'dumb' will allow you to easily scale horizontally with all of your servers behind a load balancer - You could even configure the public listening port to 80 on the LB and whatever you choose to listen on with your Node servers (eg. ext. 80 -&gt; int. 8080).

Some may choose to go as far as building a cluster of processes, and even [using that to their advantage with Express](http://rowanmanning.com/posts/node-cluster-and-express/). Depending on your project, clustering may certainly help you manage some background work. [PM2 loves working with your clusters](https://keymetrics.io/2015/03/26/pm2-clustering-made-easy/), too.

## Logging

Where would we be without a reliable logging system to capture the behaviour of our systems? Node has some powerful logging systems ready to go that you should definitely consider using. Rolling your own is always an easy choice, but it doesn't scale well and is really just re-creating the wheel.

[Bunyan](https://www.npmjs.com/package/bunyan) and [Winston](https://www.npmjs.com/package/winston) are two of the larger players in this area, and both will give you a [solid base on which to log](https://strongloop.com/strongblog/compare-node-js-logging-winston-bunyan/). At Oddshot, we use Bunyan to drop our logs where we need them:

```
{"name":"oddshot-web","hostname":"vagrant-ubuntu-trusty-64","pid":2382,"reqID":"f430ea7f-a68a-40ae-921c-1a20c4c393fe","reqURL":"/","level":30,"loggedIn":false,"msg":"controller hit","time":"2015-08-22T09:17:45.612Z","v":0}
```

We can watch these during development and store and process them in production. Obviously raw JSON isn't so easy on the eyes for larger logs, and Bunyan supports piping in your feed for a more readable output:

```
$ sudo node source/app.js | bunyan
[2015-08-22T09:19:31.053Z]  INFO: oddshot-web/2392 on vagrant-ubuntu-trusty-64: controller hit (reqID=fb77f0e2-e25d-4790-94a9-7e08e138b809, reqURL=/, loggedIn=false)
```

You can dump the logs and rotate them over a time period, pushing them to a storage medium for processing later (like Amazon's S3, for instance).

## As a whole

We use most of the components I've mentioned here at Oddshot for our web servers. Check out our [homepage](http://oddshot.tv) or any [shot page](http://oddshot.tv/shot/esl_csgo_38_201507021707587978) to see how Node copes behind a load balancer with Nginx by its side.

Building your initial stack to get all of the pieces working will definitely be time consuming on occasion, but it's well worth it when you get your project live for the first time. The easier the process is for you to develop, deploy and test, the better the experience can be for your users.