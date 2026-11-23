# Unwrap Web

**Unwrap** is a small, mobile-friendly reveal site for private invitations and surprises. Send someone a link in WhatsApp and let them tap to see what’s inside. The site runs on GitHub Pages without a backend, database, or custom domain.

This repository hosts the web experience for the Unwrap mobile app.



## Choose a template from Unwrap mobile

| Template | Use it for | Page | Reveal button |
| --- | --- | --- | --- |
| General | Event details, announcements, and short surprises | `/` | **Unwrap my giftee** |
| Christmas | A Secret Santa assignment | `/christmas.html` | **Unwrap my Secret Santa** |
| Valentine’s | A Valentine’s gift exchange | `/valentines.html` | **Unwrap my Valentine** |

Each template has its own WhatsApp preview title and artwork. The preview shows the template branding. The assignment or surprise is revealed in the browser after the guest taps the button.

From the repository root, start a local server with `npx --yes http-server . -a 127.0.0.1 -p 8000 -c-1`. Then generate a Valentine’s test invitation with `node tools/make-unwrap-link.mjs http://127.0.0.1:8000/ "Maru" --gifter "Paco" --valentines` and open the printed URL.



## Publish to GitHub Pages

The expected site address is `https://paco-jasso.github.io/unwrap-web/`. The pages already use that address in their WhatsApp preview metadata.

1. Put the site files listed below and this README at the repository root on your publishing branch. Include `tools/make-unwrap-link.mjs` so contributors can generate test invitations from a clone.
2. In **Settings → Pages**, select **Deploy from a branch**, choose your publishing branch and **/(root)**, and save. On GitHub Free, the repository must be public. [GitHub Pages publishing guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
3. Open the HTTPS address shown in Pages settings once deployment finishes. Generate a sample for each template, send the links to yourself in WhatsApp, and test the previews and reveals on your phone.

| Site files | Purpose |
| --- | --- |
| `index.html`, `christmas.html`, `valentines.html` | Landing pages and preview metadata |
| `unwrap.css`, `unwrap.js` | Shared styling and browser-side reveal |
| `fonts/Nonchalance-Bold.otf` | Shared display font |
| `unwrap-preview.png`, `unwrap-christmas-preview.png`, `unwrap-valentines-preview.png` | Share artwork for each template |



## What an invitation link gives access to

The browser decrypts the payload on page load to show the guest’s name, when provided. The reveal text stays hidden on the page until the guest taps the button. The URL fragment stays out of the HTTP request to GitHub Pages. It contains both the key and ciphertext, so anyone with the full link can open the reveal. Keep participant lists, assignments, and generated links off GitHub.

The v1 payload accepts an optional `gifter` string alongside `recipient`. Use 1–80 UTF-16 code units after trimming. Add `--gifter "Paco"` to a link generator command to show **Welcome Paco** in any template.

The payload also accepts an optional `budget` integer in hundredths, from 0 through 999999999. For example, `--budget 500.50` encodes `50050` and shows **Gift budget: $500.50**. Older invitations without that field still work.

AES-GCM detects changes to the ciphertext under the same key. The sending chat provides the guest’s context for who sent it, since anyone can generate a new link with their own key. Invitations are reusable and there is no individual revocation.

## Font credit

Nonchalance Bold by Colorbean is used under the Creative Commons Attribution 4.0 International license. The font file is unmodified. [Original font](https://www.dafont.com/nonchalance.font) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
