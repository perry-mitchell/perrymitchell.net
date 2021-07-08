---
layout: post
title: Element innerText/textContent for all browsers
excerpt: We do a lot of content scraping at my day job - parsing large blocks of
  content on thousands of page...
date: 2014-07-25
updatedDate: 2014-07-25
tags:
  - post
  - chrome
  - ie
---

We do a lot of content scraping at my day job - parsing large blocks of content on thousands of pages - and most of this is done client-side with JavaScript. For this particular use, using the client to do the scraping for us is infinitely more efficient then queuing scrape jobs in the backend.

No two browsers are the same, and that's something that all web developers understand all too well. This is especially true in the case of needing to get _plain_ text from an element in the DOM. The built in functions in JavaScript to get the textual content of a DOM node are as follows:

*   innerText
*   textContent

`innerText` is supported (supposedly) in every major browser aside from Firefox. textContent is supported in every major browser, including IE from version 9 onwards (check this out on [QuirksMode](http://www.quirksmode.org/dom/w3c_html.html#t04)) - this is good, because we only support from 9 onwards, but it still doesn't suit our needs (I'll outline why in a moment).

`innerText` is ideal, because it handles the node contents with one major advantage over `textContent`:

> Internet Explorer introduced `element.innerText`. The intention is pretty much the same with a couple of differences:
>
>  *  Note that while `textContent` gets the content of all elements, including [`<script>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script "The HTML <script> element is used to embed or reference an executable script within an HTML or XHTML document.") and[`<style>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/style "The HTML <style> element contains style information for a document, or a part of document. The specific style information is contained inside of this element, usually in the CSS.") elements, the mostly equivalent IE-specific property, `innerText`, does not.
>  * `innerText` is also aware of style and will not return the text of hidden elements, whereas textContent will.
>  * As `innerText` is aware of CSS styling, it will trigger a reflow, whereas `textContent` will not.

_[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Node.textContent#Differences_from_innerText)_

What this means is that when analysing a particular node, all of the scripts and styles contained within are also retrieved. This is impossible to work with in a practical manner - and without the full support of the innerText property, we'll need to find another alternative.

_Be wary when using innerText, as it does not always return consistent results across browsers. I discovered that even certain versions of Chrome differ in implementation to each other. Unless you're OK with having JavaScript and CSS in your text, then textContent won't be of much help for you either._

I spent a significant amount of time trawling through Google search results when stumbling onto this problem, but most people that attempted to address the problem had much shallower requirements than I did. No one wrote about the "accidental" inclusion of script and style content, except for [this post](http://clubajax.org/plain-text-vs-innertext-vs-textcontent/). Mike over at Club Ajax runs through the uses and discrepancies around innerText and textContent, eventually proposing a solution with a function that will behave in the same way across all major browsers. That function, and some examples, can be found [here](http://clubajax.org/examples/plain-text-vs-textcontent-vs-innertext/).

**Disclaimer:** The function provided uses DOM recursion and element cloning to achieve its clean, formulaic output. It should not be used in certain areas where calls may be made in a loop or interval. The pros will far outweigh the cons, however, and this function is currently the only one I've seen to achieve a consistent result across all of the major browsers. I tested in the latest versions of Chrome, Firefox and IE.

I made modifications to the function for my personal use, to include a parameter to specify an array of custom element tags. This array is used to strip elements from the output, in addition to the script and style tags.
