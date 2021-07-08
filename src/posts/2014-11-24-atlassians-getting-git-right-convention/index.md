---
layout: post
title: Atlassian's 'Getting Git Right' convention
excerpt: I attended the [Getting Git Right
  conference](https://www.atlassian.com/getting-git-right) in Helsin...
date: 2014-11-24
updatedDate: 2014-11-24
tags:
  - post
  - git
---

I attended the [Getting Git Right conference](https://www.atlassian.com/getting-git-right) in Helsinki today - The code versioning tool discussion held by [Atlassian](https://www.atlassian.com/) all over the world. Atlassian are the blokes that made Jira, Confluence, Bitbucket, Hipchat and a few others, and they seem to have a firm handle on the technology that's driving the development-side of their consumer endpoint. Our business uses Atlassian products for a couple of our needs, and for the most part they're great: easy to use (intuitive, no need to get help) and quite powerful. The good vibe we got from their products (why we considered attending the event) was reflected by the event - polished and nerdy.

<blockquote class="twitter-tweet" lang="en"><p lang="en" dir="ltr"><a href="https://twitter.com/hashtag/git?src=hash">#git</a> merge types on <a href="https://twitter.com/hashtag/GettingGitRight?src=hash">#GettingGitRight</a> by <a href="https://twitter.com/hashtag/atlassian?src=hash">#atlassian</a> <a href="http://t.co/kdbzUzSU2E">pic.twitter.com/kdbzUzSU2E</a></p>&mdash; Vladimir Grigor (@voukka) <a href="https://twitter.com/voukka/status/536888619106324480">November 24, 2014</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

The event was held by [Sven Peters](https://twitter.com/svenpet) and [Nicola Paolucci](https://twitter.com/durdn), who enlightened the audience with detailed information about the inner workings of Git itself and how Atlassian caters for development teams of all sizes. Nicola covered some of the basic behaviour of Git when it's recording new content, and Sven went into team and branch workflows and how they fit into the Atlassian suite.

Overall I was extremely impressed, though I admit that beyond my job, I'm not massively interested in what Atlassian provides. To me, the products are well-suited to enterprise environments and not small teams down to single developers - Although there are countless features which validate them being paid applications and services, I just don't feel that there's room in my areas of work for any licensed software or services (at least while I'm able to setup or host them myself). That being said, I thoroughly condone the use of Atlassian's offerings over their competitors and much higher-priced alternatives.

One of the main reasons I attended the conference was for information and advice regarding git merging/rebasing patterns and ideas around how to address hotfixes for release candidates. At my place of employment we use a new RC every couple of weeks to release new features, with patches on the current RC in the meantime. Sometimes, due to the earlier creation of the next RC, we end up having to patch 2 RCs as well as master when a bug arises. This complexity is compounded by the fact that we use [Composer](https://getcomposer.org/doc/00-intro.md) to manage our internal components, along with its _composer.lock_ file to secure versions in the RCs. Each time we fix a bug and make a patch, we need to consider the possibility of patching the root project (that requires the components) to bring the composer.lock components versions up to date for the next build.

> A branch for the patch and a branch for the composer lock = 2 merge requests minimum for a bug

If that sounds needless complex, that's because it is. The process we follow with the release candidates is solid, in my opinion (albeit maybe not suited for our project), but the requirement to keep the RC stable while using composer creates **a development environment that punishes you for fixing issues**. We've already addressed the issue of using composer by [changing some of our front-end tools](http://perrymitchell.net/article/private-npm-repository-with-sinopia/ "Private NPM repository with Sinopia") (please don't ask why we were using it for front-end components), but the talk given by Sven and Nicola really helped to get me thinking on what needs to change.

Some of the ideas were so simple, too - One which I'd completely overlooked in everyday development is the fact that you can "merge downwards" from a hotfix branch, through the RC(s) and into the master (merging hotfix into RC and RC into master). This completes the fix, patches the RC and fixes the issue in master all at the same time.

One of the best items (most relevant to my team and I) I found was the discussion of merging vs rebasing, in which Nicola spoke about when either route should be taken and the precautions necessary for both.

Due to the current structure of the product we're developing on, we're never more than 1 developer per issue (so therefore one developer per branch). Because of this, I maintain that **rebasing** is the best option for us:

*   No other developers, meaning no risk in losing history or work
*   Clean history, no merge-commit

I recently had a discussion with a colleague on when to use merge or rebase, and it was difficult for me to really drive home the point at which you should choose one or the other.

<blockquote class="twitter-tweet" lang="en"><p lang="en" dir="ltr"><a href="https://twitter.com/hashtag/git?src=hash">#git</a> merge pollutes your history - rebase instead on one-man branches <a href="https://twitter.com/hashtag/GettingGitRight?src=hash">#GettingGitRight</a></p>&mdash; Perry Mitchell (@perry_mitchell) <a href="https://twitter.com/perry_mitchell/status/536887145752178689">November 24, 2014</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

But after the presentation, I feel the issue here is a much less complicated one: Rebasing is the best option for unpublished branches where you can guarantee the safety of the work being done on it. Atlassian have a great article on this particular topic here: [The Golden Rule of Rebasing](https://www.atlassian.com/git/tutorials/merging-vs-rebasing/the-golden-rule-of-rebasing). The only issue here is that rebasing changes the history of the feature branch (the rebased commits have different identifiers and different parent commits), which can no longer be pushed back onto its remote counterpart because they conflict. Using `git push --force` will allow the push to continue, but this will overwrite the branch that was there previously (hence why it should be done on unpublished branches or branches where you can ensure there is only one developer working on it).

For all other cases, like when there could be other developers working on the same feature, a merge is probably the safest bet. Though if you have any lasting confusion, I'd recommend Nicola's post about which to choose: "[Git team workflows: merge or rebase?](https://www.atlassian.com/git/articles/git-team-workflows-merge-or-rebase/)"

All in all, I'm feeling much less confused about my work situation than before. That's one of the biggest benefits of having such a large community around git - There's always some other developer that's figured it out before you... Some other team that's implemented it in the same way you want to.

Keep an eye out for these guys in your area!
