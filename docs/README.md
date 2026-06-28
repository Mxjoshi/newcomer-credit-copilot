# Case-study landing page (GitHub Pages)

A single-page case study for the Newcomer Credit Copilot. One `index.html`, inline CSS, tiny
vanilla JS, no framework or build step.

## Deploy (one time)
In the repo on GitHub: **Settings → Pages → Source: `Deploy from a branch` → Branch: `main` / `/docs`**.
It then publishes at **https://mxjoshi.github.io/newcomer-credit-copilot/**. `.nojekyll` keeps Pages
from processing the files.

## Files
- `index.html`, the landing page: pitch film in the hero, an interactive approve / refer / decline
  decision panel below it, problem / product / the-calls-I-made, a result callout, and a footer.
- `newcomer-credit-copilot-pitch-film.mp4`, the pitch film shown in the hero.
- `poster.jpg`, the video poster frame.

## Editing
- **Swap the screenshot:** in `index.html`, find the `<!-- SWAP ME -->` comment and replace the
  `.shot` placeholder with a real `<img class="shot" src="screenshot.png" ...>`.
- **Decision panel content** lives in the `STATES` object in the `<script>` at the bottom of
  `index.html`.
- Design tokens (fonts, colors, spacing) are in the `:root` block at the top. They match the
  KYC Onboarding Agent case-study page.
