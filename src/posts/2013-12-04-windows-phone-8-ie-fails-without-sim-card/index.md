---
layout: post
title: Windows Phone 8 IE fails without SIM card
excerpt: During some recent testing of several webpages, colleagues of mine
  discovered that they wouldn't loa...
date: 2013-12-04
updatedDate: 2013-12-04
tags:
  - post
  - ie
  - nokia
  - windows phone
---

During some recent testing of several webpages, colleagues of mine discovered that they wouldn't load on a Nokia Lumia 520. No visible errors, just a blank page. When testing the same page on our other phones (iPhone 5, Nokia Lumia 925 etc.), everything worked correctly. For some reason, there was a difference between the other phones and the 520 - What was most puzzling was that there must have been a difference between the other **Nokia** phones and this one.

The issue arose when we were testing links from within the Twitter application. When opening links from Twitter in Internet Explorer, we'd see the dead page. Looking as though it was almost certainly a code issue (JavaScript or PHP redirects etc.), we set out attempting to debug out page. Without getting into how difficult it is to even start debugging IE mobile on a Windows Phone, we failed to find anything that could lend a clue as to why the pages would fail specifically on the 520. The Nokia phones were all fully updated (OS and Apps), their IE settings were identical, the caches had been cleared, and the 520 had been reset (full wipe).

While working in another area weeks ago, a problem had been solved on mobile devices that involved requiring a SIM card to be inserted into the phone before the webpage would finish loading. I don't know what prompted us at that stage to think of the SIM card, but this issue came to my mind during the testing of this issue on the 520. As it turns out, adding the SIM card to the phone **solved the problem**. Once the SIM card was inserted, the webpage would load normally (by refreshing and from the Twitter application). No code changes were necessary, and no ugly hacks.

I've had it suggested to me that this is a bug, but I still have a gut feeling that this may be a security "feature" that restricts some functionality of IE mobile when there isn't a SIM card in the device. If anyone has had this issue, or know why it occurs, I'd love to hear from you in the comments.