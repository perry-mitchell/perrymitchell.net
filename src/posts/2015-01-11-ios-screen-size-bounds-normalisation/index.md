---
layout: post
title: iOS screen size & bounds normalisation
excerpt: When iOS 8 came to be, Apple made some changes in how the OS returned
  the size and bounds of the screen. The size (width & height) returned by a
  comma...
slug: ios-screen-size-bounds-normalisation
permalink: article/ios-screen-size-bounds-normalisation/index.html
date: 2015-01-11
updatedDate: 2015-01-11
tags:
  - post
  - mobile
  - quirks
---

When iOS 8 came to be, Apple made some changes in how the OS returned the size and bounds of the screen. The size (width & height) returned by a command such as `[UIScreen mainScreen].bounds.size` was changed to be [orientation dependent](https://developer.apple.com/library/ios/releasenotes/General/WhatsNewIniOS/Articles/iOS8.html#//apple_ref/doc/uid/TP40014205-SW44). Obviously they meant this to be a feature, but I was completely comfortable with how it was on every version before 8.0. Because of this, I tweaked and tested and cobbled together my own helper methods to get around this issue when writing apps that bridge versions before and after iOS 8.0.

The first helper method to address was the **screen size**, which I solved using the following class method:

```
+ (CGSize)screenSize {
    CGSize screenSize = [UIScreen mainScreen].bounds.size;
    if ((NSFoundationVersionNumber > NSFoundationVersionNumber_iOS_7_1) && UIInterfaceOrientationIsLandscape([UIApplication sharedApplication].statusBarOrientation)) {
        return CGSizeMake(screenSize.height, screenSize.width);
    } else {
        return screenSize;
    }
}
```

This method returns a CGSize representing the screen size in **portrait orientation**. No matter which way the device/simulator is rotated, the width and height will remain constant (this differs to the natural output on iOS 8). We've achieved this here by checking the OS version number - If it's newer that 7.1, we can assume it's using the new orientation functionality, so we need to flip the width & height if it's in landscape orientation. If it's in portrait, it will be the same size across all versions, so we can just return it.

The next helper method provides the same sane normalisation of the screen size, but in a form that allows for specification of the orientation:

```
+ (CGSize)screenSizeForOrientation:(UIInterfaceOrientation)orientation {
    CGSize screenSize = [UIScreen mainScreen].bounds.size;
    if (NSFoundationVersionNumber > NSFoundationVersionNumber_iOS_7_1) {
        UIInterfaceOrientation current = [UIApplication sharedApplication].statusBarOrientation;
        if (UIInterfaceOrientationIsLandscape(current)) {
            return (UIInterfaceOrientationIsLandscape(orientation)) ? screenSize : CGSizeMake(screenSize.height, screenSize.width);
        } else {
            return (UIInterfaceOrientationIsLandscape(orientation)) ? CGSizeMake(screenSize.height, screenSize.width) : screenSize;
        }
    } else {
        return (UIInterfaceOrientationIsLandscape(orientation)) ? CGSizeMake(screenSize.height, screenSize.width) : screenSize;
    }
}
```

Here we can specify an orientation, which will provide us with the screen size for that particular rotation. It uses the same `NSFoundationVersionNumber` check that the screenSize method used.

[alert type="info"]NSFoundationVersionNumber can be checked to see what version of iOS is running on the current device. This is commonly checked against properties like 'NSFoundationVersionNumber_iOS_7_1', but as of this post, there is no constant for iOS 8. The version should be tested for equivalence against the 7.1 constant 'NSFoundationVersionNumber_iOS_7_1'.[/alert]

This covers most of the use-cases I've come across in my development for working with the screen's dimensions, but there are another couple of handy-helpers to get the bounds as well (CGRect):

```
+ (CGRect)screenBounds {
    CGRect bounds = CGRectMake(0, 0, 0, 0);
    bounds.size = [self screenSize];
    return bounds;
}

+ (CGRect)screenBoundsForOrientation:(UIInterfaceOrientation)orientation {
    CGRect bounds = CGRectMake(0, 0, 0, 0);
    bounds.size = [self screenSizeForOrientation:orientation];
    return bounds;
}
```

I wrap these functions up in a helper class and use them in all of my new projects. I'll most likely continue to use them even when I stop supporting iOS 7 and below, as I'd rather my screen dimensions to come orientation-agnostic.
