---
layout: post
title: Concatenate your JavaScript library using ScanTree and GruntJS
excerpt: "I'm working on a couple of different libraries currently that share
  some common ground: They both ar..."
date: 2015-07-26
updatedDate: 2015-07-26
tags:
  - post
  - compile
  - dependency
  - nodejs
  - npm
---

I'm working on a couple of different libraries currently that share some common ground: They both are _compiled_ into a single file, and they both have dependencies within themselves (file to file). I've explored the idea of using an AMD design (such as with [tinyamd](https://github.com/briancray/tinyamd)), but this doesn't suit every case.

One of the libraries I'm playing with is quite simple and doesn't warrant using AMD, but it still needs a nice folder structure and file dependencies. To accommodate these dependencies, I chose to work with a tool by [Kyle Simpson](https://github.com/getify) called [ScanTree](https://github.com/getify/ScanTree).

**ScanTree** works by reading the annotated dependencies in the source files with something like `// require: module.js`. By requiring these files, ScanTree knows that they should be executed before the file they're read in. Using this system is a very easy way to manage a simple dependency tree within your library without the need for any complex setup.

Of course, ScanTree only provides a list of files as output, and I'd like to get to having a single _compiled_ JavaScript file from this system. That's why I wrote [grunt-scantree-concat](https://github.com/perry-mitchell/grunt-scantree-concat) (also on npm), a simple wrapper for ScanTree that also performs the concatenation of the files listed in the output of ScanTree.

[![](https://nodei.co/npm/grunt-scantree-concat.png)](https://nodei.co/npm/grunt-scantree-concat/)

**grunt-scantree-concat** concatenates each file from the output of ScanTree using Grunt. The configuration is really simple:

```
scantreeConcat: {
    main: {
        baseDir: "source/",
        scanDir: "source/",
        output: "output.js",
        options: {
            recursive: true,
            header: false,
            footer: false
        }
    }
}
```

`baseDir` and `scanDir` specify the directory for relative path mapping and file searching respectively. When requiring files in annotations, grunt-scantree-concat will use `baseDir` (mapped to ScanTree) to specify the directory that should be considered the 'base' for all relative paths. `scanDir` is simply the directory to scan for JavaScript files.

`output` is the location of the final output file (with all the found files concatenated inside). Inside the options, `header` and `footer` default to boolean `false`, but can be specified as JavaScript files that would be added to the start or the end of the output file. This is useful for capping the library inside a closure.

`recursive` tells ScanTree to search the `scanDir` recursively, which is usually what you'd want to happen.

grunt-scantree-concat could be used nicely to prep a library for minification and gzip'ing in your Grunt config, or for building a single file from all of those pesky unit tests.