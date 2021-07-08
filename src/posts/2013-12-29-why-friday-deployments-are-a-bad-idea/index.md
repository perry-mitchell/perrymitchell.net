---
layout: post
title: Why Friday deployments are a bad idea
excerpt: One of the first things you learn as a developer, being a member of a
  company, is that deployment on...
date: 2013-12-29
updatedDate: 2013-12-29
tags:
  - post
  - deployment
---

One of the first things you learn as a developer, being a member of a company, is that deployment on Fridays are just generally **a bad idea**. There's no upside to releasing end-of-week, and if you happen to work for one of these companies that still believe it's OK, you may have already experienced some of the issues I'm about to highlight.

Firstly, it's the end of the week, so all of your staff are looking forward to going home for the weekend. Naturally, working later on a Friday night is mentally more difficult than working late any other night, and it's easy to imagine the anxiety some would feel about getting extra work done (especially work that involves problems or bugs). Deploying on a Friday, in terms of deployment processes, should be no different to other days - There can be problems with any deployment (production environment differences, etc.), so there could potentially be issues with one released on the last day of the week. Deployment issues usually call for immediate action or a complete reversion of the deployed code, and even a simple reversion can call for follow-up work to determine the cause of the problem. On top of all of this, there's going to be pressure from management to get the job done and the new features/fixes released then and there. All of these factors together can make for a very stressful situation where employees may feel confused and rushed, potentially creating more problems.

Secondly, there's the weekend. At least 2 whole days of little to no hands-on attention from the company where new bugs can run free, causing untold customer experience damages and data corruptions. If that screwy deployment had occurred on a Wednesday, however, some developers may have seen the issue and have worked to get it fixed immediately. Deployments to production need to be tested just as staging and development builds need to be tested. Production will have different data (usually much, much more) to that on staging or dev, so new patches and features should be monitored closely. Never assume what works in staging will work in production.

Thirdly, Fridays are shorter days. People work less and go home earlier, that's just how it is (in most cases). This also helps morale, in my opinion, and keeping Fridays simple and stress-free helps create better Mondays (they're tough enough as it is). The last thing these "chilled" days need is a deployment - Possibly the single most disruptive practice in a development house. Fridays are meant to be bug-fixing days, a period where you can catch up on backlogged work and that new feature you have in a local branch. Continued releases on Fridays could possibly drop staff morale, and result in poor performance.

There are many more reasons, albeit not as major as the ones I've already listed, why Friday deployments should be considered bad practice. If you have anything you'd like to ad, we'd all benefit by hearing from you in the comments.

There are also a number of opinions supporting what I've said so far (simple Google search):

*   [http://stackoverflow.com/a/2115664](http://stackoverflow.com/a/2115664)
*   [http://www.saunderslog.com/2008/09/01/rule-1-dont-release-code-on-friday/](http://www.saunderslog.com/2008/09/01/rule-1-dont-release-code-on-friday/)
*   [http://www.techopsguys.com/2012/02/03/dont-push-code-on-a-friday-damnit/](http://www.techopsguys.com/2012/02/03/dont-push-code-on-a-friday-damnit/)
Deployments don't have to be scary.. You just need to avoid the major mistakes by:

*   **Not deploying on Fridays**
*   Testing, testing, and testing again - Code review, QA, unit tests, hands-on testing (Dev, staging and production) etc.
*   Live monitoring services - There are many utilities out there to help monitor system up-time.
*   Environment replication - Test with the same data in production by replicating databases and media in staging.
*   Strict processes - Make a procedure, and <span style="text-decoration: underline;">stick to it</span>. If something goes wrong, revert and try again later (not on Friday!).
Don't risk production stability for the sake of 2 days on the weekend!