---
layout: post
title: Working with npm and symlinks through Vagrant on Windows
excerpt: I grew up playing games on DOS and Windows for Workgroups 3.11\. I
  stuck with Windows until I went to university, where I promptly installed
  Ubuntu ev...
slug: npm-symlinks-through-vagrant-windows
permalink: article/npm-symlinks-through-vagrant-windows/index.html
date: 2015-01-20
updatedDate: 2015-01-20
tags:
  - post
  - npm
  - osx
  - vagrant
  - windows
---

I grew up playing games on DOS and Windows for Workgroups 3.11\. I stuck with Windows until I went to university, where I promptly installed Ubuntu everywhere I could. I kept my main rig a gaming, Windows machine, and all of my laptops became Linux dev devices. Eventually my gaming machine was neglected to the point where it wasn't used at all, and I found I had no more time for gaming. If I'm at a computer, I'm programming something.

After being exposed to Linux and Mac OSX, I learned that development on Windows machines (besides developing ASP.NET or pure Windows executables) was painful, problematic and cumbersome when compared to development on Linix or OSX. The similarities that OSX and Linix environments share make them interchangeable in my areas (Web and app development), and so I've come to really loathe Windows when it comes to having to use or support it during my job or projects.

We do web development, at my place of employment, and we have a substantial team of developers. Most of us are sane and use Ubuntu, Debian, or OSX on our machines... but we still have a couple of Windows users. We had issues with Windows in my previous workplace, and we have issues here as well. The problem is that off-the-bat, Windows doesn't support a fraction of what OSX and Linux do when it comes to handy OS features that you don't even think about when doing an average-day's work.

Enter Vagrant and our front-end project that uses npm. We use npm for our package management and 3rd party build tools ([I've written an article about our setup](http://perrymitchell.net/article/front-end-build-automation-kiosked/)), and we couldn't work without it. It's made developing a professional JavaScript library a breeze, but there are some caveats:

*   npm can generate <span style="text-decoration: underline;">REALLY</span> long path names as it recursively installs dependencies:
<pre>vagrant/kiosked/node_modules/kiosked-js/node_modules/grunt-contrib-jasmine/node_modules/grunt-lib-phantomjs/node_modules/phantomjs/node_modules/request/node_modules/form-data/node_modules/combined-stream/node_modules/delayed-stream/lib</pre>

*   npm uses a lot of symlinks, including when making references to binaries (bin links). Although you're supposed to be able to disable these with `--no-bin-links`, it doesn't catch all of the symlinks being generated.

These caveats are non-issues on Linux and OSX systems, but they pose a big problem if you're working on Windows.

Windows has a limit of 260 characters for a typical path string, which is ridiculous ([it's a problem](http://stackoverflow.com/questions/1880321/why-does-the-260-character-path-length-limit-exist-in-windows)). This makes development using 3rd party npm packages a real pain-in-the-arse on Windows, because it just **doesn't work**.

Another issue is the lack of support for proper symlinks in Windows, and a default Vagrant setup won't allow you to create symlinks in shared/sync'd folders when running on a Windows host. Thankfully, we've found a way _around_ these issues. I can't say that we've really solved them, but we're able to continue working and developing on all of our platforms.

[alert type=""]A word of warning: We trialled a lot of different fixes and tweaks, and we're not exactly sure which ones contributed to the final successful outcome. Thankfully they're all quite simple, so test and tweak them as necessary until you find a configuration that works for you.[/alert]

## Step 1: Vagrant configuration

The Vagrant configuration probably plays the biggest part in this issue, so there's a couple of things here we need to ensure are correct before we continue.

[alert type="info"]We use Virtualbox for all of our Linux and Windows users - we've had no issues with Parallels. This section concerns Windows users working with Vagrant and Virtualbox.[/alert]

First off, the Vagrant synced folder (`/vagrant`) must be mounted using the default type - mounting using `smb` (Samba) for instance, will not work (and Windows doesn't support `nfs`) as it won't allow us to create symlinks. Leave the `type` parameter **off** the mount line in the Vagrantfile.

Secondly, **you may** have to tell Virtualbox to allow symlink creation - we can't confirm if this step is necessary, but it's not a bad idea to try and use it. You can use something like the following:

```
config.vm.provider :virtualbox do |vm|
    vm.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/vagrant", "1"]
end
```

There are [posts covering this](https://github.com/mitchellh/vagrant/issues/713#issuecomment-4416384) littered across Google when searching for this issue. Some posts mention that the `vagrant` at the end of the command may be substituted with `v-root` or any other share name.

## Step 2: Windows configuration

After doing some reading, we found that there may be a security policy in Windows that affects the ability to create "symlinks". A couple of articles metion a privilege called `SeCreateSymbolicLinkPrivilege` that controls this, which can be edited using the `secpol.msc` executable or [Polsedit](http://www.southsoftware.com/) (freeware). In fact, [this article](http://kmile.nl/post/73956428426/npm-vagrant-and-symlinks-on-windows) covers most of the ideas that we attempted to get our setup to work, and I'd highly recommend having a quick read.

Once you've added your current user and/or groups to the privilege on your Windows system, you will need to logout to apply the changes.

## Step 3: npm and its massive paths

By this stage the symlinks should already be working, but you may still get errors from within the Vagrant box. We were seeing "UNKNOWN" errors with different packages, which we've come to assume were path length issues. Regardless of the exact cause, moving the npm node_modules directory out of our shared folders was the key to finally getting our development setup working on Windows hosts.

We managed to symlink the `node_modules directly` to another location within the VM that does not get sync'd to the host via a shared directory. By doing this, none of the npm packages make it to the Windows host, but are still available inside the machine. It's important to note that these files are obviously **not accessible** outside the Vagrant box.

The steps are simple:

1.  Delete the node_modules directory if it exists.
2.  Create a directory called, say "node_modules_projectname" in the VM's home directory (`~`) (Some articles and posts recommend making the directory in /tmp, but obviously this is cleared on reboot, so it may not be an optimal experience for this type of thing).
3.  **Link** a local node_modules dir from within the project's directory:
<pre>ln -s ~/node_modules_projectname node_modules</pre>

4.  Install the packages in the project directory:
<pre>npm install</pre>

We bundled these steps into our project setup scripts for easy management on Windows hosts.

## In conclusion

**Don't develop like this on Windows**. Just don't do it: Windows is FAR behind the mark when it comes to real web & server development. Ultimately it's a smarter, more efficient choice to enforce operating-system level requirements on your development teams. There are certain features that, in my opinion, should be used to decide whether or not an operating system is fit for use in a dev environment:

*   Native symlink support, fully compatible with the "industry standard" that can be found in some major Git repositories or npm packages, for instance.
*   No/large path length limits: In this day and age, paths can be impossibly long... But this does not mean that they're bad practice. Computers handle a lot of data not fit for human consumption, but that doesn't mean it should change. npm has a way of working, with recursive dependencies, that generates incredibly long path names - restricting this has no real benefit and is only reminiscent of the days of DOS.
*   Bash/sh support: Come on, most operating systems come with these bundled. They offer a wide variety of tools and syntax that make handling the file-system a breeze. Don't give me that Windows PowerShell crap, it's still DOS.
*   Support for the majority of tools that make your job easier. Where are the majority of dev tools and packages used today? My guess is Linux, well and truly.
*   Decent package manager: Even OSX falls down here, as homebrew and fink etc. are not as smooth as apt-get.

There are countless other points I'm sure I could make, but you may get the point by this stage (especially seeing as you're reading this post). Yes, we found a way around Windows' limitations this time, but was it really worth it?