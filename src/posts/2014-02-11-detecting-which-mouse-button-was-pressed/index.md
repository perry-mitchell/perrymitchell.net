---
layout: post
title: Detecting which mouse button was pressed
excerpt: I recently completed a task that required dragging functionality on a
  web element. The element had to support dragging on the Y axis, using
  JavaScript...
slug: detecting-which-mouse-button-was-pressed
permalink: article/detecting-which-mouse-button-was-pressed/index.html
date: 2014-02-11
updatedDate: 2014-02-11
tags:
  - post
  - quirks
---

I recently completed a task that required dragging functionality on a web element. The element had to support dragging on the Y axis, using JavaScript mouseup, mousemove and mousedown events to capture the action. The problem with this, and the actual task I completed, was catering for the right mouse button on this component. The drag functionality worked for both mouse buttons, but this was undesirable.

When using right-click to drag the component, a context menu appears and causes issues with "letting go" of the element (as well as appearing messy and somewhat unfinished). A simple detection as to which mouse button was pressed was required, so that we could only accept events from the left button.

I started digging in to the detection of which mouse button was pressed for an event, and found a huge difference between browsers (mainly in regards to older versions). JavaScript mouse events hold a couple of properties: **button** and **which**. Some browsers only have 1 of these, many these-days have both - But the problem is, they hold different values! To properly support as many browsers as possible, which keeping detection implementation _sane_, we should check for both of these. [This great article](http://unixpapa.com/js/mouse.html) discusses the differences between the values on the two properties, and presents a very handy table that clearly shows what we're dealing with:

[![JS Event mousebutton code](http://perrymitchell.net/wp-content/uploads/2014/02/event_mouse_btn_code.png)](http://perrymitchell.net/wp-content/uploads/2014/02/event_mouse_btn_code.png)

In this table, you can see the difference between the two properties, and how much they differ between browser systems and versions. You should note that these codes are only applicable for **mousedown and mouseup** - 0 will be returned for _click_, _dblclick_ and _contextmenu_ events.

In the project I'm working on, we're not supporting anything below IE 9.0, so that saves us __a little__ trouble. I wrote a little function to handle the basics for us:

```
function getMouseButton(event) {
    var buttonPressed = "none";
    if (event) {
        if (event.which) { // preferrable
            if (event.which === 1) {
                buttonPressed = "left";
            } else if (event.which === 3) {
                buttonPressed = "right";
            }
        } else if (event.button) {
            if (event.button === 0) {
                buttonPressed = "left";
            } else if (event.button === 2) {
                buttonPressed = "right";
            }
        }
    }
    return buttonPressed;
}
```

Let's have a quick look at what we've got here:

*   It takes a JavaScript event object
*   Default output is "none"
*   The 'which' property is checked first in preference
*   It checks the codes 1 &amp; 3 for left and right buttons (respectively)
*   The 'button' property is checked second
*   It checks the codes 0 &amp; 2 for left and right buttons (respectively)

These codes I've used, judging by the information in the table above, will support the following browsers (though no guarantees are made):

*   IE 9.0 and newer
*   Chrome
*   Firefox
*   Opera 8.0 and newer
*   Konqueror 4.3 and newer

_If you need to support earlier than IE 9, you could possibly accomplish this by adding an 'attachEvent' window property detection for the 'button' property, which would allow you to detect if it's IE 8 or lower. If that's the case, use the first column of the table above for the event.button property._

This was a quick solution - If you have any recommendations, or have done this before, I'd be interested to hear how you solved it.

## Update:

After some time of using this solution, we discovered several inaccuracies with how it detected mouse buttons on browsers like IE 9 and 10. Since we still support these _fantastic_ browsers, it was required to rework the function. This is what we're using now:

```
function getMouseButton(event) {
    var buttonPressed = "none";
    if (event) {
        if ((event.which === null) || (event.which === 'undefined') || (!event.hasOwnProperty("which"))) {
            buttonPressed = (event.button < 2) ? 'left' :
                ((event.button === 4) ? 'middle' : 'right');
        } else {
            buttonPressed = (event.which < 2) ? 'left' :
                ((event.which === 2) ? 'middle' : 'right');
        }
    }
    return buttonPressed;
}
```

The credit for this more complete solution goes to [this article](http://www.thonky.com/javascript-and-css-guide/detect-mouse-button/).