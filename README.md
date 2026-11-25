# The Lost Protocol

The Lost Protocol is a browser game that teaches programming. Players repair a broken archive by writing small programs — dragging blocks, filling boxes, repeating steps, making decisions — and face a guardian at the end of each section. Beat the five story guardians to finish the story; the Mastery section is optional practice.

**Play it:** https://the-lost-protocol.vercel.app

## What's inside

- Five story sections (The Basics, Data, Tools, Structure, Bits and Bytes), each with four chapters and a boss, plus a bonus Mastery section with four missions and a sixth guardian.
- Four learning paths — Grades 1–6, Grades 7–10, Grades 11–12, and College & Adult — with their own wording, art and music, each in Beginner, Intermediate or Professional difficulty.
- A block editor that works with mouse, touch or keyboard, with hints, a guide that reacts to mistakes, and per-mission stars.
- Story scenes, spoken narration, procedural music and four separate volume channels.
- Streaks with year-long milestones, daily missions and achievements.
- Leaderboards and a friend list.
- Parent dashboard for creating learner accounts, setting names and passwords, and reviewing progress; separate admin tools for story and level management.
- Offline play: the service worker caches the site, so a lesson already opened keeps working without a connection.

## Pages

| Page | Purpose |
| --- | --- |
| `index.html` | Home page and story opening |
| `webgame.html` | Chapter map, missions and the block editor |
| `auth.html` | Sign in, sign up and password reset |
| `leaderboard.html` | Public and per-path score boards |
| `friends.html` | Friend list and presence |
| `bonus.html` | Mastery missions and practice levels |
| `parent.html` | Parent and educator dashboard |
| `admin.html` | Owner-only admin tools |

## Running it locally

There is no build step and no package manager: the site is plain HTML, CSS and JavaScript. Serve the folder with any static server.

```sh
python -m http.server 8080
# or
npx serve .
```

Then open `http://localhost:8080`. Sign-in and scores need a network connection to Supabase; a lesson that has been opened once still plays from the cache.

## Project layout

| Path | Contents |
| --- | --- |
| `js/` | Shared scripts: auth, config, music, story, streaks and presence |
| `js/pages/` | One script per page |
| `css/` | Base styles and shared components |
| `css/pages/` | One stylesheet per page |
| `assets/` | Brand icons and section art |
| `supabase/` | Database notes, migrations and edge functions |
| `sw.js` | Service worker and offline cache |
| `manifest.webmanifest` | Installable app details |

## Backend

Accounts and scores live in Supabase (project `gkycmrivyqxknvkgdffr`, EU West). The browser only ever holds the publishable key in `js/config.js`. Scores are computed by database functions and edge functions, never trusted from the browser.

Schema notes, migration files and the edge functions are documented in [`supabase/README.md`](supabase/README.md). The live database is authoritative; the files in `supabase/migrations/` mirror it.

## Accounts

Learners sign in with a Player ID and the password a parent chose for them; the parent also types the child's display name, which is what the game and leaderboards use. Parents and educators sign in with an email address. Guest play works without any account.

## Deployment

The site is hosted on Vercel as a static project with no build command. After changing any cached file, bump `CACHE` in `sw.js` so returning visitors pick up the new shell.

## Art

The six section banners in `assets/art/` are real photographs released under CC0 or public domain, sourced from Wikimedia Commons and Openverse. Brand art lives in `assets/brand/`.
