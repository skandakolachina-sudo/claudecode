# First Shares

A stock market course for high schoolers who are investing small amounts. It has:

- 14 lessons, each with a quiz
- a ten-year decision game
- a math gym with unlimited practice problems
- a 20-question final exam
- a 123-term glossary
- a plan builder for your own investing plan

## How to open it

1. Download this `first-shares` folder, or the ZIP, and unzip it.
2. Double-click **`index.html`**. It opens in your web browser.

That's it. Nothing to install, and it works with no internet connection. It works in Chrome, Edge, Firefox and Safari.

Tip: bookmark the page in your browser, or drag `index.html` to your desktop as a shortcut, so it's easy to come back to.

## Your progress

Quiz results, your best game score, your budget and your plan save automatically in the browser you use. A few things to know:

- **Saves are per browser.** Progress saved in Chrome won't show up in Safari, or on a different computer.
- **Back it up.** At the bottom of the page, **Export progress** downloads a small backup file. **Import progress** loads it back, including in a different browser or on another computer.
- **Clearing browsing data wipes it.** Clearing your browser's history or site data can erase your progress, so export a backup first.
- **Starting over.** **Reset progress** clears everything after you confirm.

## What's in the folder

```
first-shares/
├── index.html              the page itself, including all 14 lessons
├── README.md               this file
└── assets/
    ├── css/styles.css      all colors, fonts and layout
    ├── fonts/              bundled fonts and their license (OFL.txt)
    ├── img/favicon.svg     the browser-tab icon
    └── js/
        ├── core.js         saving, shared helpers, the list of lessons
        ├── data/
        │   ├── glossary.js every glossary term
        │   └── quizzes.js  every quiz and exam question
        ├── charts.js       the line chart used by the calculator, price chart and game
        ├── quiz.js         how quizzes and the exam work
        ├── widgets.js      tools inside lessons: quote board, growth calculator, price chart,
        │                   headlines, budget builder, stocks/bonds comparison, glossary search
        ├── gym.js          the math gym
        ├── game.js         the ten-year test
        ├── plan.js         My investing plan
        └── app.js          the menu, progress bar, theme switch, backups and page switching
```

The scripts load in the order listed at the bottom of `index.html`. They share data through one object called `FS`.

## Editing the course

- **Lesson text** is in `index.html`. Each lesson is a `<section>` with an id from `m1` to `m14`, for example `<section class="view" id="m3">`.
- **Quiz questions** are in `assets/js/data/quizzes.js`. Each question looks like this:
  ```js
  ["Question text?", ["Correct answer", "Wrong answer", "Wrong answer", "Wrong answer"], "Explanation shown after answering."]
  ```
  Always put the correct answer **first**. The page shuffles the order when it shows the question.
- **Glossary terms** are in `assets/js/data/glossary.js`, as `["Term", "Definition", lessonNumber]`. A lesson's "Key terms" box is built from this list automatically.
- **Colors** are tokens at the top of `assets/css/styles.css`, like `--accent` and `--up`. Dark-theme values come right after the light ones.

After editing, refresh the page in your browser to see the change.

## Good to know

First Shares is for learning only and isn't financial advice. Account and tax rules describe the US and change over time. Talk with a parent or guardian before opening an account or investing real money.

Fonts: Lexend, Big Shoulders Display and IBM Plex Mono, all under the SIL Open Font License 1.1 (see `assets/fonts/OFL.txt`).
