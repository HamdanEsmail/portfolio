# Hamdan Esmail

My personal site. Nine live builds, each shown in its own colours, with a small 3D guide who walks you through them, and a page about me underneath.

## What is on it

- **The worlds.** My name holds two corners of the screen. Scroll, and the whole page turns into each build's own colours, one world after another, with a hard edge between two. Keys 1 to 9 jump straight to a world, and every world opens the real live site.
- **The guide.** A small blocky figure of me in a kandura and ghutra. He walks in, jumps between worlds, and says one line about each. His head follows your pointer. Click him and he says it again.
- **About.** Who I am, how I got here, and a portrait.

## Run it on your own computer

The site is plain files, so any static server will do. From this folder:

```bash
python -m http.server 4173
```

Then open `http://localhost:4173`.

## How it is built

- No framework and no build step: `index.html`, `css/site.css` and `js/site.js`.
- `js/guide.js` draws the guide with [three.js](https://threejs.org), which is bundled in `vendor/` with its MIT licence.
- The page is complete without JavaScript: the nine worlds become a plain list of pictures, each with its words.
- People who ask their system for less motion get the same page without the jumping and typing.
- The typeface is Bricolage Grotesque, from Google Fonts.

## Adding a world

Each world is one `<a class="frame">` block in `index.html`. It carries the build's name, its two colours, its address and the line the guide says. Add a 1200 by 750 screenshot to `img/` (and a 720-wide copy named `-720`), and the page works out the rest.

Built by Hamdan Esmail.
