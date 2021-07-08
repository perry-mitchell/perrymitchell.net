---
layout: post
title: Communication between JavaScript and iOS using UIWebView
excerpt: I've been powering through a 14-month iOS project and am nearing the
  end - much to my relief - but j...
date: 2015-02-03
updatedDate: 2015-02-03
tags:
  - post
  - base64
  - quirks
  - uiwebview
---

I've been powering through a 14-month iOS project and am nearing the end - much to my relief - but just like most projects, it's rife with feature-creep. There are some final points to address in terms of new features, and one of those is some interaction between buttons in a UIWebView and the iOS application. The idea is that when a user presses a button in the web view, a message is received by the iOS application and a database entry is created.

I've had to work with many a project that required some interaction between web views and the underlying application - it's a common approach for many tasks whose requirements stand firmly either side of the web-app fence. The HTML DOM is a _mature_ content platform that allows for many design and interaction benefits that sometimes are just impossible or impractical to achieve on the mobile platform. For this reason I've opted to load HTML content in several web views in my application, and some of them need 2-way communication with the application.

## From app to webpage

It's easy enough to communicate with the site in the UIWebView, once it's loaded, using:

```
NSString *someVariable = [webView stringByEvaluatingJavaScriptFromString:@"window.someGlobalVariable"];
```

This way you can execute JavaScript methods in and retrieve data from the webpage. It's very handy when you need to periodically check on the progress of something on the page, or when you need to start something running within the page. Of course this method is only safe once the page has finished loading, which you can listen for using the UIWebView delegate methods.

## From webpage to app

This is where things get a little more, custom... To get a small amount on data from the webpage to the app I usually invoke a link action. When a link is activated (changing the page) it can be caught by the UIWebView's delegate using the `shouldStartLoadWithRequest` method:

```
- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType
```

This function fires when a request from the web view is made, and the request is either allowed or denied based upon the return value. For instance, I return `YES` by default and `NO` to all captured requests that I process separately.

We can start to get really creative with our message sending at this stage. Let's say that we have some content we want to send to the app when a user touches a link on the page - We want to send the entire message in that request, which pretty much means it should be within the URL of the anchor. We can flag that the link is special (we want to handle this link internally, rather than opening it) using some prefix like `app_link:`, which can prefix the rest of the actual message. Our new delegate web view method might look like this:

```
- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
    if (navigationType == UIWebViewNavigationTypeLinkClicked) {
        NSString *destination = [request.URL absoluteString];
        NSArray *parts = [destination componentsSeparatedByString:@"/"];
        destination = [parts objectAtIndex:[parts count] - 1];
        if ([destination rangeOfString:@"app_link:"].location == 0) {
            NSString *message = [destination stringByReplacingOccurrencesOfString:@"app_link:" withString:@""];
            // do something with the message
        }
    }
    return YES;
}
```

Here, we basically do the following:

1.  Check that the navigation type was a "click"
2.  Get the destination URL and take only the last part (as there will be a large amount of content and forward-slashes in the URL _before_ our message)
3.  Check that the destination contains "**app_link:**" at the beginning of the message
4.  Strip the "app_link:" part, leaving only the message

This all means that if we had an element in the UIWebView that looked like this:

```
<a href="app_link:do_this_thing">Execute</a>
```

Clicking on it in our web view would provide us with the message "do_this_thing".

## Handling extra characters and unicode

What happens here, when we need to support sentences and unicode characters? Take for example the following link:

```
<a href="app_link:Awesome! ω">Execute</a>
```

We've got a space and a unicode character to handle - These should be URL encoded, but there's a safer way.

Enter base64 - I've used base64 to handle the sending of information in JavaScript many a time, as we can guarantee a certain character range on the output while retaining the information necessary to decode it. The problem with the default implementation of the base64 encode/decode functions in JavaScript is that they have [poor support for unicode characters](https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64.btoa#Unicode_Strings). It's best to use wrapper functions to handle the incompatibilities (taken from MDN):

```
function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}

function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
}
```

If you were to try to base64 encode and decode it without these helpers, you may see an error like this:

[![window.btoa error](http://perrymitchell.net/wp-content/uploads/2015/02/btoa_error.png)](http://perrymitchell.net/wp-content/uploads/2015/02/btoa_error.png)

Now if you base64 encode the the message and set it to the anchor, you'll be able to send a unicode message to the iOS application:

```
<a href="app_link:QXdlc29tZSEgz4k=">Execute</a>
```

## Handling the base64 messages in the app

We'll modify the `shouldStartLoadWithRequest` delegate method to send the message to a handler method:

```
- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
    if (navigationType == UIWebViewNavigationTypeLinkClicked) {
        NSString *destination = [request.URL absoluteString];
        NSArray *parts = [destination componentsSeparatedByString:@"/"];
        destination = [parts objectAtIndex:[parts count] - 1];
        if ([destination rangeOfString:@"app_link:"].location == 0) {
            NSString *message = [destination stringByReplacingOccurrencesOfString:@"app_link:" withString:@""];
            [self processEncodedMessage:message];
        }
    }
    return YES;
}
```

And now we can add our handler:

```
- (void)processEncodedMessage:(NSString *)base64Name {
    NSData *decodedData = [[NSData alloc] initWithBase64EncodedString:base64Name options:0];
    NSString *message = [[NSString alloc] initWithData:decodedData encoding:NSUTF8StringEncoding];
    NSLog(@"Message: %@", message);
}
```

Easy! This should log: `Message: Awesome! ω`. The handler function uses `NSData`'s `initWithBase64EncodedString` method to create a data object that we can use to create our decoded string (specifying UTF8 encoding).

> You can also use JavaScript properties like window.location or `window.open()` to send a message to the app, but be aware that their navigation type (UIWebViewNavigationType) may be different.

The process of handling unicode text in JavaScript is also covered in decent detail in [this article](http://monsur.hossa.in/2012/07/20/utf-8-in-javascript.html).