---
layout: post
title: NES to Universal Games Console conversion (Part 1)
excerpt: Some time ago I started a Super Nintendo conversion project designed to
  provide me with an all-in-on...
date: 2013-12-13
updatedDate: 2013-12-13
tags:
  - post
  - nintendo
  - retro
  - roms
---

Some time ago I started a Super Nintendo conversion project designed to provide me with an all-in-one gaming console of the retro variety. The idea was to have a single custom build console, in some old-school console chassis, that could play games from all the old consoles (like Nintendo, Super Nintendo, Sega, Dreamcast etc.) on modern hardware with modern ports (like HDMI). I managed to build a completed console, [documented on this forum](http://forums.overclockers.com.au/showthread.php?t=1076308), but that's as far as I got. The console didn't work in the end (dead motherboard), and I've since abandoned the hardware used.

Recently, I've felt I've wanted to try again. One of the issues I had with the original project was a lack of space inside the case, so I'll be using a NES instead this time. I'll document the entire process here so you can watch the progression. All software I use here is licensed or free, so please do not request copies of anything (especially ROMs!) - I will however be glad to answer any questions regarding what I used and in what configuration.

## Setting up the operating system

I've decided to try [GameEx](http://www.gameex.com/) for the frontend to the console (I was originally using [Hyperspin](http://www.hyperspin-fe.com/)), running on Windows 7 64 bit. The OS will be customised to an extent where it barely (or not at all) resembles Windows. I've used a VirtualBox VM to get the experimentation started.

![Install Win 7 VM](http://perrymitchell.net/wp-content/uploads/2013/12/win7installvm-300x222.png)

A virtual machine will be sufficient to get a working configuration going, and perhaps even some basic gameplay with some NES games. Once the setup has finished, we can begin customising.

![Win 7 Desktop vm](http://perrymitchell.net/wp-content/uploads/2013/12/win7vm_desktop-300x243.png)

Firstly, we'll install the Virtualbox Guest additions - They'll be needed for shared folder support and clipboard access. We'll then head to the Control Panel to disable the User Access Control (UAC) setting, as those fullscreen modal lock-outs get very annoying (and we don't want those popping up at any stage later):

![Win 7 Disable UAC](http://perrymitchell.net/wp-content/uploads/2013/12/win7_disable_uac-300x226.png)

Now that we have some sanity restored to our OS, let's first change the boot animation. First we'll head over to the [Windows 7 Boot Updater download page](http://www.coderforlife.com/projects/win7boot/) and get a copy of the software (save it locally). There are [instructions here](http://www.door2windows.com/how-to-change-windows-7-boot-screen-animation/) on how to use the software, and I looked on [DeviantArt](http://www.deviantart.com/?q=windows+7+boot&amp;offset=0) to find some boot animations. I chose a [Space Invaders animation](http://medi-dadu.deviantart.com/art/Win-Boot-Screen-16-9-289976798) to start with.

![NES Boot Win7](http://perrymitchell.net/wp-content/uploads/2013/12/nes_boot_win7.png)

Obviously this has nothing to do with Nintendo, but to keep with the theme I'll stay consistent with the naming. The software is great and allows for easily modification of the entire boot screen and animation. This version even allows you to change the text for both the status title and the copyright.

The next thing to tweak is the desktop - [Ultimate Windows Tweaker](http://www.thewindowsclub.com/ultimate-windows-tweaker-v2-a-tweak-ui-for-windows-7-vista) will help tweak some finer options, if you feel you really want to turn a lot of excess functionality off. At this stage we should also change the background image on the desktop, as well as hiding the icons (right click on Desktop, View->Show Desktop Icons).

![Win 7 NES Background](http://perrymitchell.net/wp-content/uploads/2013/12/win7_nes_desktop-300x224.png)

We'll also change the login screen to get rid of the default image using [Logon Changer](http://www.techspot.com/downloads/4902-logon-changer-windows7.html). I just used a black image, but you could get creative here. We could now also make the taskbar auto-hide.

### Setting up GameEx

Let's get started on our game system. I'll be installing GameEx, and setting up each emulation system one at a time. I won't install all the game systems on the virtual machine, but I'll get one working so I know what to expect when replicating the same outcome on the actual NES. GameEx is free, has a great community, and can be downloaded [here](http://www.gameex.com/).

![Win 7 GameEx first start](http://perrymitchell.net/wp-content/uploads/2013/12/win7_nes_gameex-300x224.png)

If you get an error when running GameEx for the first time, then it'll most likely be to do with DirectX and your video drivers. This is almost guaranteed when testing in VirtualBox, so make sure to:

*   Install a fully updated copy of DirectX from the Microsoft website
*   Reboot into Safe-mode and reinstall the VirtualBox Guest Additions **with** Direct3D support (important)
Once that's done, we can play around with GameEx. It might also be worth noting that it's quite easy to end up with an unstable setup on the virtual machine. My setup started crashing when exiting emulators and returning to GameEx, which turned out to be the theme I'd installed. When testing with the virtual machine, it might be advantageous to keep it simple.

Once GameEx was setup correctly and running as it should, I installed a NES emulator (Jnes) and copied my NES roms into "C:\Roms" (default GameEx configuration).

![GameEx consoles Jnes](http://perrymitchell.net/wp-content/uploads/2013/12/win7_nes_gameex_consoles-300x225.png)

![GameEx NES games](http://perrymitchell.net/wp-content/uploads/2013/12/win7_nes_gameex_games-300x226.png)

There's always a thrill in booting up a new emulation system with some ROMs... And then to test that it's functioning properly:

![GameEx Jnes Double Dragon](http://perrymitchell.net/wp-content/uploads/2013/12/win7_nes_gameex_doubledragon.png)

So in a short amount of time, it's incredibly easy to get a test system up and running with a customised interface to some extent.

## The plan

So to get this off the ground, we need a console. I purchased a broken (not working, or faulty) NES from eBay for quite cheap, which will become the housing for the console system.

![NES ebay](http://perrymitchell.net/wp-content/uploads/2013/12/nes_ebay_faulty.jpg)

The console body looks in good shape, which is important, as only its aesthetically pleasing look will remain after it's stripped. I'll remove all of the internals (aside from the buttons, lights and controller ports) and will give the outside a good clean. I've tried using a [Retr0bright](http://retr0bright.wikispaces.com/) solution on the SNES project I originally undertook, but providing this one isn't "yellowed" too much, I won't bother disassembling the exterior too much.

I aim to have the front buttons working, power and status lights, and the controller ports with the original controllers. I'll convert the controller ports to USB internally, as well has providing HDMI video out somewhere on the back of the chassis. Ideally the device would have as much drive space as possible (>=2TB), but I'll use what I currently have in parts to start with:

*   1TB 2.5" HDD
*   60GB 2.5" SSD
Having originally attempted this with a US-type SNES chassis, I'm space-conscious when it comes to planning work with the NES. Obviously it shouldn't be as cramped as the SNES, but the console needs to be heat-effective and relatively portable. The next part will continue, with the arrival of the console.