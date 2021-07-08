---
layout: post
title: How to mismanage a development team
excerpt: Managing or directing a team of people is hard, especially if you lack
  experience in doing so or are...
date: 2016-04-05
updatedDate: 2016-04-05
tags:
  - post
  - dev work
  - rant
---

Managing or directing a team of people is hard, especially if you lack experience in doing so or aren't of the same expertise. Managing development teams is tricky business because you need to keep each developer working as effectively as possible while keeping business goals in mind - each of these ideas are trivial by themselves, but can be a nightmare to marry-up.

I'll mention right now that what I'm about to explain is not a reflection of my job right now nor my wonderful team (both management and colleagues). I have, however, experienced a variety of issues in my short career as a developer that I feel could have easily been dealt with - but rarely were.

## Simple mistakes
I call the following mistakes, as I feel that they're just a subconscious drift in the wrong direction, but they're actually harmful influences on teams that would otherwise be delivering more effectively.

### Provide many tasks to run parallel
Every company has a lot of work to do and many goals to achieve. Cramming as many of these goals and tasks as you can into engineering at once is a sure-fire way of inciting burnout and just generally slowing things down. People lose track of the finer details of tasks and the potential for problems or incomplete projects rises.

On top of business-orientated projects, the development teams should also be engaging in refactoring and maintenance, and this adds to the general pool of work. Often times maintenance is simply expected but not budgeted for.

### Provide conflicting priorities
Having tasks and scheduling information coming from more than one source can easily make for conflicting priorities (or at very least confusion as to what's more important). It's not unusual to have several individuals in a company interested in getting work through development - When you let these individuals make free demands of the development teams outside of any thought-through processes, you end up with mayhem.

### Push from multiple directions
There may be widespread company interest (especially from high-level management) in certain tasks, and requests for progress and status updates can come from every direction. This sometimes borders on mild harassment and affects both the efficiency and mental wellbeing of employees.

### Assign arbitrary due dates to large projects
Sometimes you hear something like _"and it's due by the end of September"_, and when you ask *why*, the answer ends up being "that's when it was planned to go live" (AKA _"just because"_).

An arbitrary due date is exactly that - random and usually useless. Someone picks a 'safe' timeframe and signs development up for a marathon. Shit rolls downhill, and development will probably be blamed for missing deadlines.

### Disregard necessity for maintenance and refactoring
Refactoring, as a word, feels like taboo in many organisations. To suggest such a thing is often met with swift denial and criticism of its necessity. When those in charge don't provide time and resources for refactoring and general maintenance, bugs go on the rise and employee morale drops. Project complexity rises and spaghetti code procreates _vigorously_ in the once-sacred womb of the ╔╣monolith╠╗.

At no point in the lifecycle of a company does anyone in any non-technical managerial position attribute the poor product stability or multiple deadline failures to the lack of refactoring and maintenance schedules.

### Start and stop tasks mid-way
Riddle me this: What's better than regular interruptions and useless meetings to derail a developer's train of thought? The answer is task-switching. Take any developer off their current set of tasks and immediately assign them something new and completely unrelated.

This one is sometimes necessary, I understand, as high-level priorities can change and bugs don't wait for anyone... But if it happens more regularly, however, then it should be considered toxic.

### Change specifications mid-way
Changing specifications mid-way is often referred to as _moving the goal posts_, as it involves changing the work necessary to complete a task. Doing this means wasting a lot of time and effort, as well as frustrating the developer and damaging the quality of the codebase (unless rewriting is performed for the modified feature).

Specifications should always be clarified before beginning a project, but changing them in the middle of its progress means scattering the thoughts of everyone involved; this includes the motivation of the developer to continue working on the project.

## Simple fix
I may come off a bit heavy-handed on some points, but that's only because I'm passionate that those kinds of situations are avoided. You can really tell the aptitude and maturity of a company by how few of these points, if any, apply to their engineering structure.

I can start by saying **don't do any of the above**, but there's more..

You should **establish a single point of contact** between your product steering committee and your developers. This 'single point' doesn't necessarily have to be a single person, but one entity that won't send conflicting messages to developers or incorrectly report progress and issues to management.

Development work should be a **negotiation between the developers and those in charge of the product** - Devs need to know the company's direction, and products need to know what's feasible and what will incur terrible technical debt (and they should be afraid of this).

There should be a **refactoring _and_ maintenance budget** which allows developers to secure the stability of the product. This should be an approximate percentage of overall development time, such as 25%. Having a hard-set amount makes it easy to schedule in refactoring when specifying tasks.

Improve the planning and grooming process so that **no features are interrupted and scope creep is prevented**. Get smaller chunks of work done so the developers feel they're achieving something, and the originally planned modifications are kept clean (free of pivoting).

Introduce **feature freezes** where needed - Holiday periods and major releases are ideal times to prevent new features from being implemented and released. This time can be spent on architectural analysis and maybe some refactoring.

_Overall_, it's not a hard task to manage engineering properly, but having everyone doing the right thing can be thoroughly challenging. Be open to helping without being abrasive when things go wrong - change through example, that sort of thing :)
