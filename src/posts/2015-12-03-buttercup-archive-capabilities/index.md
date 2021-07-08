---
layout: post
title: Buttercup - a look at the archive
excerpt: When thinking of how the format of a [Buttercup][1] archive should be,
  I spent some time trying to s...
date: 2015-12-03
updatedDate: 2015-12-03
tags:
  - post
  - nodejs
  - buttercup
  - password
---

When thinking of how the format of a [Buttercup][1] archive should be, I spent some time trying to solve some common issues I have with other password managers. The main issue that I wanted to keep in mind when designing Buttercup was synchronisation and archive conflicts - issues that occur when reading & writing to an acrhive that's shared or stored on cloud hosting. The format I was to choose for Buttercup should work to alleviate issues like this.

In common archive formats like KeePass, the actual archive contents are represented in XML:

```
<pwlist>
    <pwentry>
        <group>General</group>
        <title>Sample Entry</title>
        <username>Greg</username>
        <url>http://www.web.com</url>
        <password>sVoVd2HohmC7hpKYV5Bs</password>
        <notes>This entry is stored in the &#39;General&#39; group.</notes>
        <uuid>4d9a9420ac7c4a8ae688762eac8871a9</uuid>
        <image>0</image>
        <creationtime>2006-12-31T11:52:01</creationtime>
        <lastmodtime>2006-12-31T11:52:01</lastmodtime>
        <lastaccesstime>2006-12-31T11:52:01</lastaccesstime>
        <expiretime expires="false">2999-12-28T23:59:59</expiretime>
    </pwentry>
</pwlist>
```

In Buttercup, I opted for a more robust approach that records history and changes. Buttercup employs a delta-based approach to storing archive information:

```
cgr 0 69c20658-7983-4c5e-900c-2bf490d38925
tgr 69c20658-7983-4c5e-900c-2bf490d38925 General
cen 69c20658-7983-4c5e-900c-2bf490d38925 513cd469-3c21-403e-a3ea-403080578fe3
sep 513cd469-3c21-403e-a3ea-403080578fe3 title "Sample Entry"
sep 513cd469-3c21-403e-a3ea-403080578fe3 username Greg
sep 513cd469-3c21-403e-a3ea-403080578fe3 password sVoVd2HohmC7hpKYV5Bs
sem 513cd469-3c21-403e-a3ea-403080578fe3 url "http://www.web.com"
sem 513cd469-3c21-403e-a3ea-403080578fe3 notes "This entry is stored in the 'General' group."
```

_Of course, there's also padding information that I haven't shown in this example._

These deltas, when played in order, create an archive structure in memory that's optimised for reading:

```
{
    "groups": [
        {
            "title": "General",
            "entries": [
                {
                    "title": "Sample Entry",
                    "username": "Greg",
                    "password": "sVoVd2HohmC7hpKYV5Bs",
                    "meta": {
                        "url": "http://www.web.com",
                        "notes": "This entry is stored in the 'General' group."
                    }
                }
            ]
        }
    ]
}
```

When an operation is performed on a Buttercup interface, the action taken is converted into a delta command and applied through the history management system. It then:

1. Modifies the live object
2. Saves the new command to the delta history

When the archive is saved, only the delta history list is encrypted and written out.

## Conflict resolution

When saving archives to a remote source (or local which synchronises remotely) like Dropbox or ownCloud, there's always the potential issue of a conflict. What if you left your archive open at home, with unsaved changes, and you made additions or deletions while at work on the same archive?

With a regular password manager like KeePass, _you're stuck_. Saving will bring about a conflict, and even if you're lucky and retain both copies, you still need to merge the entries that changed manually. Buttercup handles this by always checking the remote copy first, and if it's different, it merges the deltas that it can. Buttercup finds a common point between the two archives and merges from there on - removing all delete commands (groups/entries) - so in the worst case scenario, some deleted entries will make it back after the conflict is resolved.

The overall process around conflict resolution may change in the future, as new (more complex) situations are discovered, but the intended outcome (no lost data) should remain the same. Since each entry and group have their own unique identifier, tracking their movements and modifications is trivial.

## Archive growth

One caveat with using a delta-based system to address information storage is the ever-growing size of the data. Buttercup provides internal functionality to frequently flatten the archive by removing superfluous commands. When the history reaches a certain length, the first n number of entries are reviewed (flattened), with some entries being removed if they're determined to have been deleted later. Take for instance the following set of commands:

```
cgr 0 1
cen 1 1000
sep 1000 title "My entry"
den 1000
```

In order, we:

1. Create a group (`cgr`), in the root, with ID 1
2. Create an entry (`cen`), in group 1, with ID 1000
3. Set an entry's property (`sep`), in entry 1000, called "title", to "My entry"
4. Delete an entry (`den`), with ID 1000

After flattening, we can reduce this block to:

```
cgr 0 1
```

The entry was created and deleted, so we can just remove everything relating to that entry.

The whole process is more complex than this explanation, as it takes into account other factors that may influence the level of confidence Buttercup needs to be able to remove lines of history, but I'm sure you get the idea. Over time growth is stifled because we're constantly removing information that's no longer needed.

Buttercup also employs text-based compression to reduce the space taken up by repeated items, such as UUIDs.

## What's next

Some current features to be added are in-memory data protection and shared resources. While using the application in a desktop environment, it's important to remember that it's impossible to predict what environments Buttercup will be used it. There's no easy way to tell what software or malware is running, or if the system has been tampered with. Encrypting the contents of the archive while in memory is a safer option to leaving it stored as plain text.

Many companies use password managered to share credentials with employees - and Buttercup will provide this functionality in the future too. Having the ability to share certain groups of password entries with certain individuals makes for a powerful mechanic when securing sites and systems.

We're excited to be working on Buttercup, but we're constantly aware of the necessity for stability and security. We're open-source for transparency. We want Buttercup to be trustworthy and secure, so we can all benefit from using a free, open-source, and safe product.

[1]: http://buttercup.pw