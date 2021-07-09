---
layout: post
title: Interacting with overlay elements on mobile HTML5 video
excerpt: When we think of video on the Internet, we think more and more of HTML5
  video and less of Flash players. This has made supporting video playback on
  mo...
slug: interacting-with-overlay-elements-on-html5-video
permalink: article/interacting-with-overlay-elements-on-html5-video/index.html
date: 2013-11-19
updatedDate: 2013-11-19
tags:
  - post
  - mobile
  - poster
  - touch
  - video
  - youtube
---

When we think of video on the Internet, we think more and more of HTML5 video and less of Flash players. This has made supporting video playback on mobile devices somewhat seamless, as the HTML5 standard is supported on most web-facing platforms.

The video playback itself has been standardised, as most platforms support the element's parameters and some similar formats (some still have problems with the major containers like MP4 etc.), but the way in which the video element itself is handled whilst in the context of a web page differs greatly between platforms. One of the major problems is playback initiation on some mobile platforms, namely iOS and Windows Phone (8) - For instance, iPhones will prevent touch events ("clicks") from registering to any and all elements over the video's bounding box (frame). Any hope of having interactive elements placed on top (or somehow overlaying) of a HTML5 video on these mobile devices is dashed when reading Apple's documentation:

> On iOS-based devices with small screens—such as iPhone and iPod touch—video always plays in fullscreen mode, so the canvas cannot be superimposed on playing video. On iOS-based devices with larger screens, such as iPad, you can superimpose canvas graphics on playing video, just as you can on the desktop.

This is just one example (taken from [here](https://developer.apple.com/library/safari/documentation/AudioVideo/Conceptual/HTML-canvas-guide/PuttingVideoonCanvas/PuttingVideoonCanvas.html)) where Apple states that you cannot place items over video elements on iPhone and iPod.

We can demonstrate this issue with a quick test - Let's assume we have a webpage (video.html) and a video file (chipmunk.mp4). The following HTML provides an example of the issues associated with overlaid elements on HTML5 video on iPhones etc.:

```
<html>
    <head>
        <title>HTML5 Video Test</title>
    </head>
    <body>
        <div id="mediaContainer" style="position: relative">
            <div id="videoContainer">
                <video src="chipmunk.mp4" controls="controls" />
            </div>
            <div id="overlayElement" style="width: 75px; height: 75px; background-color: green; position: absolute; top: 10px; left: 10px">
                &amp;nbsp;
            </div>
        </div>
        <script type="text/javascript">
            (function() {
                var overlayElement = document.getElementById("overlayElement");
                overlayElement.onclick = function(e) {
                    var el = e.target;
                    el.style.backgroundColor = "blue";
                    window.setTimeout(function() {
                        el.style.backgroundColor = "green";
                    }, 750);
                };
            })();
        </script>
    </body>
</html>
```

You can obviously use any MP4 in-place of the chipmunk video used in this code. If you place this on a webserver and browse to it on an iPhone, you will see that you cannot interact with the green box (div) sitting over the video. If you viewed this page on a desktop computer, however, and clicked the green box, it will turn blue for a moment then go green again.

Let's imagine that the green box is actually a button designed to open something else, like an ad or a form - This button becomes useless on mobile devices, but still appears over the video item. This effect is undesirable in terms of user interactivity, and the issue appears on Windows Phones as well, carving out a good portion of the market that would not be able to use this custom "control".

## A Solution for Overlaid Elements on Video

Unfortunately, there is _absolutely no way_ around the issue of not being able to catch touch events on overlaid elements when a **video** element is concerned. We can, however, give the illusion of having overlaid elements (which is almost as good). To do this, in theory, we need to hide the video so that it cannot soak up any touch events. We then need to leave something in the void that _looks_ like the video, like a poster - The poster will allow us to place items on it, overlaid, that will be interact-able.

There is, unfortunately, another caveat when attempting to use this solution. As mentioned earlier, the video element (at least on iOS devices) soaks up **all** touch events over it, no matter what layer it's on (z-index) and what's in front of it. This means we cannot simply push it somewhere inside of a div, with overflow set to hidden, and hope that it'll just work. Wherever that video sits will be "dead space". This is where the thought of hiding it comes into play - But wait! This'll fail as well if you intend on using your overlaid elements to play the video (perhaps acting as a play button). During the testing of some of my work-arounds, I noticed that the videos refuse to play after coming out of hiding (CSS styles from "display:none" to "visibility:hidden") - I believe this issue directly relates to Apple's standing on autonomous data usage:

> In Safari on iOS (for all devices, including iPad), where the user may be on a cellular network and be charged per data unit, preload and autoplay are disabled. No data is loaded until the user initiates it. This means the JavaScript `play()` and `load()` methods are also inactive until the user initiates playback, unless the `play()` or `load()` method is triggered by user action. In other words, a user-initiated Play button works, but an `onLoad="play()"` event does not.

This standpoint of Apple's (found [here](https://developer.apple.com/library/safari/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html#//apple_ref/doc/uid/TP40009523-CH5-SW1)) seems to take affect also when the visual styles of the video element change, namely from being hidden to visible. Because of this, when the video reappears (after closing the poster) we are not able to start it's playback, which kind of ruins the user experience. So there's yet another way around this: Don't hide the video, but move it off-screen.

If we set the container of the video's overflow to **hidden**, and then move the video element's top to say -2000px (or whatever is an appropriate distance for the length of the webpage etc. - We could even move it to the left as well, but this is just for demonstration purposes), we'll have a working poster switching element that'll work on iPhones and Windows Phones. Of course this setup isn't necessary for PCs and some tablets, so you may want to filter what devices actually end up using this method.

So here we go, let's use the following as your main structure:

```
    <div id="mediaContainer" style="position: relative; width: 600px; height: 400px; overflow: hidden">
        <div id="videoContainer" style="position: relative; width: 100%; height: 100%">
            <video id="video" src="chipmunk.mp4" controls="controls" style="width: 100%; height: 100%" />
        </div>
        <div id="overlay" style="position: relative; width: 100%; height: 100%; visibility: hidden; background-color: black">
            <img src="chipmunk.jpg" style="width: 100%; height: 100%" />
            <div id="overlayElement" style="width: 75px; height: 75px; background-color: green; position: absolute; top: 10px; left: 10px">
                Play
            </div>
        </div>            
    </div>
```

Please pardon my extreme use of inline styles and IDs, and bear with me. We have a media container (mediaContainer), which is the parent container for all of the action. The important features of this container is that is has an actual size (600x400) and that its overflow is hidden. It has 2 children: videoContainer and overlay, which should be self-explanatory. The videoContainer holds the video element, and the overlay contains a poster image (img) and an element called "overlayElement" (the 'play' button).

With this knowledge, witness the JavaScript:

```
var overlayShown = false;

function showOverlay() {
    // Hide video, show poster
    var overlay = document.getElementById("overlay");
    overlay.style.visibility = "visible";
    var videoContainer = document.getElementById("videoContainer");
    videoContainer.style.position = "absolute";
    videoContainer.style.top = "-2000px";
    overlayShown = true;
}

function hideOverlay() {
    // Hide poster, show video
    var overlay = document.getElementById("overlay");
    overlay.style.visibility = "hidden";
    var videoContainer = document.getElementById("videoContainer");
    videoContainer.style.position = "relative";
    videoContainer.style.top = "0px";
    overlayShown = false;
}

// init
(function() {
    var overlayElement = document.getElementById("overlayElement");
    overlayElement.onclick = function(e) {
        var el = e.target;
        el.style.backgroundColor = "blue";
        window.setTimeout(function() {
            // "Play" button clicked
            el.style.backgroundColor = "green";
            if (overlayShown) {
                hideOverlay();
                var videoElement = document.getElementById("video");
                videoElement.play();
            } else {
                showOverlay();
            }
        }, 750);
    };

    var videoElement = document.getElementById("video");
    videoElement.addEventListener('pause', function() {
        // Paused, show poster
        showOverlay();
    });
    videoElement.addEventListener('ended', function() {
        // Ended, try to close fullscreen if possible
        if (typeof videoElement.webkitExitFullscreen !== "undefined") {
            videoElement.webkitExitFullscreen();
        }
    });

    showOverlay();
})();
```

Again, please excuse my use of globals and other potentially poor practices, as this is merely a demonstration. OK, so we have 2 functions for hiding and showing the poster (and showing and hiding the video, respectively). On initialisation we add a click event to the 'play' button, which toggles the overlay. We also add "pause" and "ended" listeners to the video, which show the overlay and hide the Quicktime player on iOS (respectively).

When we click our fake play button on the overlay, the poster disappears and shows the video, which then starts playing. When the video pauses or ends, our event listeners fire and restore the overlay (hiding the video again). If we ensure that the thumbnail ("chipmunk.jpg" here) uses an image from the video ("chipmunk.mp4"), then we end up with a believable poster image for our video player. Go ahead and test it on an iPhone - Now the overlay elements are usable!

## A Solution for Overlaid Elements on YouTube

Those of you wanting to use YouTube instead of a custom video player (or alongside one) will realise that this problem exists for YouTube players also. For YouTube, their own custom overlay appears first, and is also hidden when the video starts to play. The problem with this is that the overlay **does not return** when the video is paused or has ended. The element left on the page is a straight video element, which means it's either hidden your overlay elements or has rendered them useless.

The trick with YouTube is to allow them to show their overlay first, and then show ours every time the video is paused (or stopped) after that. There are obviously many differences between the HTML5 video element and the YouTube player, and these differences should be taken into account when dealing with them both. One such difference is the presence of an iframe to show the YouTube player, which makes it impractical to exit fullscreen mode like we did with the regular video player.

Below is the entirety of the code I used to test YouTube overlay functionality:

```
<!DOCTYPE html>
<html>
    <head>
        <title>HTML5 Video Test</title>
    </head>
    <body>
        <script type="text/javascript">
            var yt = null;

            function onYouTubeIframeAPIReady() {
                yt = new YT.Player('videoContainer', {
                    height: '315',
                    width: '420',
                    videoId: 'sVxUUotm1P4',
                    events: {
                        'onStateChange' : onPlayerStateChange
                    }
                });
            }

            (function() {
                var tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                var firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            })();
        </script>
        <div id="mediaContainer" style="position: relative; width: 420px; height: 315px; overflow: hidden">
            <div id="videoContainer" style="position: relative; width: 100%; height: 100%">
                <!-- Youtube Player -->
            </div>
            <div id="overlay" style="position: relative; width: 100%; height: 100%; visibility: hidden; background-color: black">
                <img src="aladdin.jpg" style="width: 100%; height: 100%" />
                <div id="overlayElement" style="width: 75px; height: 75px; background-color: green; position: absolute; top: 10px; left: 10px">
                    Play
                </div>
            </div>            
        </div>
        <script type="text/javascript">
            var overlayShown = false;

            function showOverlay() {
                // Hide video, show poster
                var overlay = document.getElementById("overlay");
                overlay.style.visibility = "visible";
                var videoContainer = document.getElementById("videoContainer");
                videoContainer.style.position = "absolute";
                videoContainer.style.top = "-2000px";
                overlayShown = true;
            }

            function hideOverlay() {
                // Hide poster, show video
                var overlay = document.getElementById("overlay");
                overlay.style.visibility = "hidden";
                var videoContainer = document.getElementById("videoContainer");
                videoContainer.style.position = "relative";
                videoContainer.style.top = "0px";
                overlayShown = false;
            }

            function onPlayerStateChange(event) {
                if ((event.data == YT.PlayerState.PAUSED) || (event.data == YT.PlayerState.ENDED)) {
                    showOverlay();
                }
            }

            (function() {
                var overlayElement = document.getElementById("overlayElement");
                overlayElement.onclick = function(e) {
                    var el = e.target;
                    el.style.backgroundColor = "blue";
                    window.setTimeout(function() {
                        // "Play" button clicked
                        el.style.backgroundColor = "green";
                        if (overlayShown) {
                            hideOverlay();
                            if (yt) {
                                yt.playVideo();
                            }
                        } else {
                            showOverlay();
                        }
                    }, 750);
                };
            })();
        </script>
    </body>
</html>
```

The code is quite straightforward: The YouTube initialisation is in the topmost JavaScript block, whereas the rest of the code in the second block controls the overlay etc.

## Some Final Notes

While this solution may help keep some functionality working in regards to overlaid HTML elements, it is far from ideal and just downright 'hacky'. It is not ideal, and requires an extra amount of testing (especially across different devices). I do not condone the use of such a workaround, but this is something I've had to work with for a recent project.

![video overlay html5](http://perrymitchell.net/wp-content/uploads/2013/11/video_overlay_html5.png)

![youtube overlay aladdin](http://perrymitchell.net/wp-content/uploads/2013/11/youtube_overlay_aladdin.png)

The solution, with a proper play button, looks very convincing - It should not be abused, being that the user will believe that they're interacting with a video player, and so it should act like a video player. Using the overlay poster will allow, however, the placement of ads and other objects on top of the video poster.

**NB:** Do not take verbatim, any code above, for the use with any production software. It should be thoroughly tested before use.

If you know of any better methods to perform the interaction I describe here, I'd love to hear about it.