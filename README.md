# Perry Mitchell

My personal website - [perrymitchell.net](https://perrymitchell.net)

## Setup

1. `git clone git@github.com:perry-mitchell/perrymitchell.net.git`
1. `cd perrymitchell.net && npm i`
1. `npm run dev` to serve the site.
1. `npm run build` to build the site.

## Tag Styling

Tags are styled in `src/styles/tags.css`. Coloring custom tags works as such:

```css
...

.tag.beer {
  @apply bg-blue-700;
}

.tag.spirituality {
  @apply bg-indigo-700;
}

.tag.orcas {
  @apply bg-purple-700;
}

...
```
