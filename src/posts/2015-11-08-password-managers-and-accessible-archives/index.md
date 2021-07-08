---
layout: post
title: Password managers and accessible archives
excerpt: "Password managers are not a new concept: Many individuals that make
  somewhat frequent use of a compu..."
date: 2015-11-08
updatedDate: 2015-11-08
tags:
  - post
  - password
  - ownCloud
---

Password managers are not a new concept: Many individuals that make somewhat frequent use of a computer utilise a password manager to store their passwords for different services under one master password. These pieces of software usually fall in to one of two categories:

1. Offline file-based archive - The password manager (desktop/mobile application) interacts with a local file to save and load the password archive.
2. Online hosted archive servive - The client-side password manager applications interface with a secure, remote service (along with a web interface usually).

Applications like [LastPass](https://lastpass.com/), [PASSPACK](https://www.passpack.com/), [DashLane](https://www.dashlane.com/) etc. use an online service to store and manage your passwords - This is great for accessibility, but they usually cost something for the peace-of-mind.

Software like [KeePass](http://keepass.info/), [1Password](https://agilebits.com/onepassword), [RoboForm](http://www.roboform.com/) (also offers online hosting) etc. use a local password archive with strong encryption to keep your credentials safe. Local password managers are sometimes free (and maybe open-source), and leave us to chose where we want our archive. Offline password managers can sometimes make it difficult to use archives both on desktop and mobile devices as synchronisation becomes a problem. Some managers may support tools like Dropbox and other cloud hosting tools, and this is where the sweet-spot lies.

## One file to store them all

The average user with a handful of passwords may want to use a single archive with a single master password to store all of there valuable authentication details (like me). Said user may also want to use a free or open-source alternative to do so - and if that's the case, they'd have some trouble finding an application that works well on each operative system and mobile device. There's also the issue of synchronisation of the archive between desktop and mobile devices when making additions or changes. Several password manager applications I've used have downloaded the archive for changes from a cloud storage service, but would not update the remote copy when changes were made.

The very idea of having a password manager is having a secure vault to store, in one place, all of your account credentials for various services and portals. The responsibility of the password manager is somewhat abused when the archive isn't accessible on the common platforms that the user is frequenting.

I'm writing [Buttercup](https://www.npmjs.com/package/buttercup) with the intension of providing a cross-platform password manager that utilises cloud storage in such a way that accessibility is not an issue. Besides security, accessibility to the actual archive file is my main concern.

## Buttercup archives

Archives in Buttercup are designed in a way to make them more flexible when it comes to reading and writing from local and remote locations. Instead of storing the final structure of the password archive in the file, Buttercup stores a full delta set of all changes to the archive.

Some lines may look like:

```
cgr 0 1
tgr 1 "Email accounts"
```

*This example creates a group with ID '1' under the root level, and then titles it "Email accounts".*

Performing changes in this manner actually make it more robust when writing changes to a remote file. When storing files in cloud storage, I've often left an application open at home when I'm at work, and to my dismay I'm left with save conflicts when I arrive home after making changes to some files. This is particularly painful when it comes to password archives (like Keepass), so Buttercup was designed to address this.

Buttercup will detect conflicts on save, by first reading the remote archive and detecting differences. If differences are found, Buttercup finds the last common point between the two archives and merges delta commands between the two. Often times this will result in **delete** commands being removed from the delta set, but this is a safer option than predicting which archive to delete on and which to write.

When using the Buttercup library, I utilise a `Workspace` to take care of the merging:

```
var Buttercup = require("Buttercup"),
	Workspace = Buttercup.Workspace,
	FileDatasource = Buttercup.FileDatasource,
	Archive = Buttercup.Archive;

// Load the archive from a file
var fileSource = new FileDatasource("my-archive.bcup");
fileSource.load("password")
	.then(function(archive) {
		var workspace = new Workspace();
		// Setup workspace
		workspace
			.setDatasource(fileSource)
			.setArchive(archive)
			.setPassword("password");
		// Check if the local file differs from the archive in memory
		return workspace.archiveDiffersFromDatasource()
			.then(function(differs) {
				if (differs) {
					// Merge the changes
					return workspace.mergeFromDatasource()
						.then(function() {
							// Save to disk
							return workspace.save();
						});
				} else {
					// No conflicts, save anyway
					workspace.save();
				}
			});
	});
```

Buttercup avoids overwriting remote changes by simply merging them into the working copy. The `Workspace` instance is just a helper to manage archives from a higher level, but in essence it's not actually needed for regular tasks or read-only.

This same process is available across all datasources that support writing, including WebDAV and ownCloud. When Dropbox support is added, it'll gain the same ability also.

### Mobile applications

Currently Buttercup is being built for desktop use, but very soon after its stable release (1.0) we'll be starting work on an app for it. The app will make use of remote storage methods like WebDAV and Dropbox, primarily, and will have all the same abilities that the desktop clients have.

### Desktop applications

The [desktop version](http://perry-mitchell.github.io/buttercup/) of the application, build for Linux, Windows and MacOS, will be available before Christmas 2015. It's being built on Electron for Node, and will provide a unified user interface design across all three platforms.
