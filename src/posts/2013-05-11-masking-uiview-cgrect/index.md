---
layout: post
title: Masking a UIView with a CGRect
excerpt: While working on the next major update for my app, Mine Control, I
  found I needed to set up a masked UIView to get the effect I needed. In the
  main me...
slug: masking-uiview-cgrect
permalink: article/masking-uiview-cgrect/index.html
date: 2013-05-11
updatedDate: 2013-05-11
tags:
  - post
  - uiview
---

While working on the next major update for my app, Mine Control, I found I needed to set up a masked UIView to get the effect I needed. In the main menu of the app, the UITableView slides down from the top of the screen, seemingly from behind the logo-block. Before I managed any masking effects, the UITableView and the UIImageView holding the logo were both in the same containing view. To get the UITableView to slide out from under the logo block I'd need to set up a mask so that the table wouldn't appear at all above the logo block, but still be visible below it. This would mean that when it slid down from the top of the screen (off-screen), it wouldn't be visible until it emerged out from below the logo block.

Firstly, I had to separate the views. I created a new view solely for containing the table, and placed it behind the logo block. I would mask the top of the view, so that the UITableView would be visible in a rectangle consisting of the entire screen below the block. To achieve the mask, you must specify a CGRect representing the visible portion of the view that you want to mask. Create a path using the CGRect and set it to a CAShapeLayer. You can then set the view's layer.mask property to this shape layer, which will give you your mask. Here's the code I ended up with:

```
// Masking for the menu animation
CAShapeLayer *maskLayer = [[CAShapeLayer alloc] init];
CGRect maskRect = CGRectMake(0, top-20, screenWidth, height+20);
CGMutablePathRef path = CGPathCreateMutable();
CGPathAddRect(path, nil, maskRect);
[maskLayer setPath:path];
CGPathRelease(path);

menuView.layer.mask = maskLayer;
```

The sizing in the maskRect CGRect is not important, but this is me specifying the area of the menuView UIView that I want visible. The actual masked effect can be seen in the opening sequence of my [Mine Control](http://perrymitchell.net/software/mine_control) app (from version 1.1.0 onwards).

In terms of my use of it, the same effect could be achieved by using a shorter UIView with [clipsToBounds](http://www.perrymitchell.net/site-2012/uiview-hide-overflow/) turned on. Something to keep in mind when you're looking to mask a view.
