---
layout: post
title: How Buttercup creates an encrypted password archive
excerpt: I've had a great time writing the [Buttercup password
  manager](http://buttercup.pw/) with [Sallar](h...
date: 2015-12-15
updatedDate: 2015-12-15
tags:
  - post
  - nodejs
  - buttercup
  - password
---

I've had a great time writing the [Buttercup password manager](http://buttercup.pw/) with [Sallar](http://sallar.me/), and we've both learnt alot about how the system behind a credentials vault should work; But even before the thousands of lines of code, I had an idea about how **I'd** make a password manager.

> **TLDR;** This is a long discussion on how Buttercup functions: How the encryption works, what data structures and used, how information is handled and moved around within the application. It may take some minutes to read through!

Buttercup is designed to store credentials, like any decent manager, but in a way that makes it easy to remotely access and avoid conflicts when being used from multiple locations or interfaces. The internal system uses a list of commands ([delta](https://en.wikipedia.org/wiki/Delta_encoding) changes) that when run, make up an in-memory object that constitutes an archive (groups and entries).

Credentials (entries) are stored within groups in the archive, which can be nested. Credentials have properties (title, username, password etc.) and meta data (notes, URLs, user-entered key-value pairs). An archive when in memory may look like the following:

```
{
    "format": "buttercup/a",
    "groups": [
        {
            "id": "cd773fa8-9530-4dec-9c65-910ed6679e4f",
            "title": "Email",
            "entries": [
                {
                    "id": "9bb70ce4-b154-47ef-a2d8-617ad27b5cc7",
                    "title": "My email account",
                    "username": "user@email.com",
                    "password": "34n9#aO91-mcD5",
                    "meta": {
                        "notes": "Personal email account"
                    }
                }
            ]
        }
    ]
}
```

_**Hey!** That looks a lot like JSON, doesn't it? Buttercup started life as a NodeJS project - this allows for rapid development that produces executables for each platform with ease. The in-memory representation of the archive (after the deltas are run) is a JavaScript object, which is what is interacted with when your archive is open._

## At the system's core

There are two main classes that make up a usable Buttercup archive: The archive class, and _Westley_.

The archive class, formerly named "Buttercup", represents an instantiated archive instance ready to take commands and return credentials. With an instance you can do things like `archive.createGroup("Email")` and `archive.getEntryByID(exactEntryID)`.

The archive instance, behind the scenes, holds an instance of a class named `Westley`. This class is responsble for holding both the history array (of delta commands) and the _dataset_ (the in-memory archive object discussed earlier).

These two classes work together to provide the core of an archive's functionality. When you open an archive instance with the Buttercup application on desktop or mobile, you make use of a third class called `Workspace`. This instance holds three things:

 1. An archive instance
 2. The password
 3. An archive datasource (discussed later)

The workspace is a convenience class to manage loading and saving of archives, as well as performing merges when the archive that's open differs from the one on disk (or stored remotely). Preparing a workspace (in JavaScript) is quite trivial:

```
var Buttercup = require("buttercup");

var workspace = new Buttercup.Workspace(),
    archive = new Buttercup.Archive(),
    datasource = new Buttercup.FileDatasource("~/myArchive.bcup");

datasource
    .load("password")
    .then(function(archive) {
        workspace
            .setArchive(archive)
            .setDatasource(datasource)
            .setPassword("Fezzik, tear his arms off");
    });
```

## Entries and groups

Like most password managers - and I feel that at least here, being similar is a good thing - Buttercup uses a simple data architecture to store information. An archive is entirely made up of groups and entries, both of which can be moved around within each other recursively.

Take for instance the following example:

```
var generalGroup = archive.createGroup("General"),
    websitesGroup = generalGroup.createGroup("Websites"),
    myLogin = generalGroup.createEntry("A website");

myLogin.setProperty("username", "user@site.org");

myLogin.moveToGroup(websitesGroup);
```

Entries are created and moved within groups. Groups are nestable, so they can be created on the root level (`archive.createGroup()`) or inside an existing group (`group.createGroup()`).

## Datasources, local and remote

Archives can be located anywhere, and I wanted Buttercup to address that head-on. It's up to the user where and how they store their encrypted archive, and it's simple enough to provide interfaces to allow them to connect to any archive datasource easily.

Buttercup comes with some basic datasources out of the box:

 * Text (read from various sources etc.)
 * File (local filesystem, USB disk etc.)
 * WebDAV (cloud/remote storage that supports the WebDAV protocol)
 * ownCloud (the best open-source cloud storage system, IMHO)

Providing the datasource is valid and the underlying data exists, proving this and a password to a `Workspace` instance will yield an `Archive` instance. Implementing support for new datasources is trivial as they all support the same interface.

## Operations and command generation

When an archive is being worked with (items being created, edited and destroyed), commands are generated and stored in the delta history so that the next time the archive is opened, the same state can be reached.

```
var groupA = archive.createGroup("Group A");
// This generates:
//     cgr 0 70db6628-703f-411f-a799-00a8c72e51a7
//     tgr 70db6628-703f-411f-a799-00a8c72e51a7 "Group A"

var entryA = groupA.createEntry("My Entry");
entryA.setProperty("password", "abcDEF123");
// This generates:
//     cen 70db6628-703f-411f-a799-00a8c72e51a7 02452080-3ed9-4eec-9e31-6caa82d8413c
//     sep 02452080-3ed9-4eec-9e31-6caa82d8413c title
//     sep 02452080-3ed9-4eec-9e31-6caa82d8413c password "abcDEF123"

groupA.delete();
// This generates:
//     dgr 70db6628-703f-411f-a799-00a8c72e51a7
```

The first part of the command is the name of the operation: `cgr` means create-group and `sep` means set-entry-property. Commands operate on items (groups or entries), which have IDs. Items are identified by UUIDs (v4) in Buttercup archives so they can be referenced directly from the deltas (flat structure).

Notice the `groupA.delete()` command in the example - We can delete a group without deleting the entries inside of it. Since the in-memory archive is a tree, all _leaves_ on a branch are removed by deleting the parent. As the archive grows in size (history length) it can eventually be flattened so that created-and-deleted items can be removed from the history altogether.

Let's see an example going the other direction:

```
cgr 0 4b38b5d0-8cbd-44fc-a1f3-51d18c5b929e
tgr 4b38b5d0-8cbd-44fc-a1f3-51d18c5b929e "Item 1"
cgr 0 ada063ca-a9c9-439e-aaae-42f4adfd6e30
tgr ada063ca-a9c9-439e-aaae-42f4adfd6e30 "Item 2"
cen ada063ca-a9c9-439e-aaae-42f4adfd6e30 4886fd72-e873-4e0f-a786-2fac9f6ae665
sep 4886fd72-e873-4e0f-a786-2fac9f6ae665 title "The only entry"
mgr ada063ca-a9c9-439e-aaae-42f4adfd6e30 4b38b5d0-8cbd-44fc-a1f3-51d18c5b929e
```

The tree structure that this set of deltas forms is this:

```
{
    "groups": [
        {
            "id": "4b38b5d0-8cbd-44fc-a1f3-51d18c5b929e",
            "title": "Item 1",
            "groups": [
                {
                    "id": "ada063ca-a9c9-439e-aaae-42f4adfd6e30",
                    "title": "Item 2",
                    "entries": [
                        {
                            "id": "4886fd72-e873-4e0f-a786-2fac9f6ae665",
                            "title": "The only entry"
                        }
                    ]
                }
            ]
        }
    ]
}
```

The sequence of actions here is quite straightforward:

 1. Create a group, in root, title it "Item 1"
 2. Create a group, in root, title it "Item 2"
 3. Create an entry in "Item 2", title it "The only entry"
 4. Move "Item 2" into "Item 1"

This process is how Buttercup interacts with the saved state of archives.

## Saving an archive to an encrypted state

The process of storing the credentials of a user is perhaps one of the most important aspects of how a password manager works.

From memory to disk, Buttercup starts by optimising the history list - it strips all superfluous commands from early on in the history, and ensures the resulting archive remains the name. For instance, if an archive has 1500 lines of historical commands, Buttercup will _flatten_ the first 1000 and leave the last 500 untouched.

Once the archive has been cleaned up, it's convered into a text file (in memory) and compressed using GZIP. This drastically reduces the size of the archive.

After compression, Buttercup performs text encryption using the AES [Cipher-Block-Chaining algorithm](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation) with a 256bit key. The key is salted and prepared with many rounds of [PBKDF2](https://en.wikipedia.org/wiki/PBKDF2) before being passed to the encryption method, and a SHA-256 HMAC is prepared over all of the stored & encrypted data.

```
encryptTools.encrypt(compressedArchiveHistory, userPassword);
```

Before writing the encrypted contents to their destination, a header prefixed to the file contents. This is the final phase of encryption, and decryption obviously occurs in reverse order.

## In the very near future

Buttercup will be a cross-platform solution to password archive management, and NodeJS can help us cover the desktop environments. Where NodeJS current falters is the mobile application realm, where we'll most likely build native applications and frameworks for Buttercup. Keep an eye out for my posts on building Buttercup in Objective-C and possibly Java.

As technologies progress we may eventually see decent mobile platforms built on Node, and when that time arrives we'll attempt to publish new apps based on the JavaScript code I've mentioned here. Maintaining fewer codebases for such a large application is of particular interest to us.

I hope you enjoyed reading about how Buttercup works - Constructive criticism and suggestions are most welcome, so please reply below or message me [@perry_mitchell](https://twitter.com/perry_mitchell) / [@buttercup_pw](https://twitter.com/buttercup_pw).