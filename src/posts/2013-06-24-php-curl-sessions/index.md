---
layout: post
title: PHP cURL with Sessions
excerpt: There are often times when you need to pull remote content in your PHP
  script from another server. T...
date: 2013-06-24
updatedDate: 2013-06-24
tags:
  - post
  - curl
---

There are often times when you need to pull remote content in your PHP script from another server. There are numerous ways you can do this, but the best and most feature-endowed way is with cURL. A regular PHP cURL request may resemble the following:

```
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
$content = curl_exec($ch);
curl_close($ch);
```

This code will fetch the remote page using POST, but it has no knowledge of remote sessions or cookies. This means that any further requests will not share the same session data. To add session support to your cURL calls, you'll need to specify a 'cookie file', like so:

```
$cookieFile = "cookies.txt";
if(!file_exists($cookieFile)) {
	$fh = fopen($cookieFile, "w");
	fwrite($fh, "");
	fclose($fh);
}
```

You must make sure that the **file is writable** by the webserver. Once you've done this, you can add a couple of new lines to your cURL procedure:

```
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
curl_setopt($ch, CURLOPT_COOKIEFILE, $cookieFile); // Cookie aware
curl_setopt($ch, CURLOPT_COOKIEJAR, $cookieFile); // Cookie aware
$content = curl_exec($ch);
curl_close($ch);
```

And that's it - All of your cURL calls that utilise this cookie file will share sessions on the remote server.