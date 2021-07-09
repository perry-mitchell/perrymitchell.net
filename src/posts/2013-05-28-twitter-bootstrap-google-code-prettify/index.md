---
layout: post
title: Twitter bootstrap with Google's code prettify
excerpt: If you're like me, love bootstrap, and love programming, you may end up
  with a similar situation to me. This site runs google's code prettifier on
  top...
slug: twitter-bootstrap-google-code-prettify
permalink: article/twitter-bootstrap-google-code-prettify/index.html
date: 2013-05-28
updatedDate: 2013-05-28
tags:
  - post
  - bootstrap
---

If you're like me, love bootstrap, and love programming, you may end up with a similar situation to me. This site runs [google's code prettifier](https://code.google.com/p/google-code-prettify/) on top of the [twitter bootstrap](http://twitter.github.io/bootstrap/).  Some styles in the bootstrap clash with prettifying css, which throws off the linenums formatting. This can be fixed by simply adding the following CSS to your site:

```
ol.linenums {
	margin-left: 0px !important;
	padding-left: 40px !important;
}
```

Easy!

**Edit:** This site no longer runs "Google Code Prettify" or "Twitter Bootstrap", though I do still thoroughly recommend them.
