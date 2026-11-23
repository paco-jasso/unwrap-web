# Unwrap Web

**Unwrap** is a small, mobile-friendly reveal site for private invitations and surprises. Send someone a link in WhatsApp and let them tap to see what’s inside. The site runs on GitHub Pages without a backend, database, or custom domain.

This repository hosts the web experience for the Unwrap mobile app.



## Choose a template from Unwrap mobile

| Template | Use it for | Page | Reveal button |
| --- | --- | --- | --- |
| General | Event details, announcements, and short surprises | `/` | **Unwrap my giftee** |
| Christmas | A Secret Santa assignment | `/christmas.html` | **Unwrap my Secret Santa** |
| Valentine's | Valentine's day events | `/valentines.html` | **Unwrap my Valentine** |

Each template has its own WhatsApp preview title and artwork. The preview shows the template branding. The assignment or surprise is revealed in the browser after the guest taps the button.



## Publish to GitHub Pages

The expected site address is `https://paco-jasso.github.io/unwrap-web/`. The pages already use that address in their WhatsApp preview metadata.

1. Put the six site files listed below and this README at the repository root on `main`. Include `tools/make-unwrap-link.mjs` so contributors can generate test invitations from a clone.
2. In **Settings → Pages**, select **Deploy from a branch**, then **main → /(root)**, and save. On GitHub Free, the repository must be public. [GitHub Pages publishing guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
3. Open the HTTPS address shown in Pages settings once deployment finishes. Generate a sample for each template, send both links to yourself in WhatsApp, and test the preview and reveal on your phone.

| Site files | Purpose |
| --- | --- |
| `index.html`, `christmas.html` | General and Christmas landing pages and preview metadata |
| `unwrap.css`, `unwrap.js` | Shared styling and browser-side reveal |
| `unwrap-preview.png`, `unwrap-christmas-preview.png` | Share artwork for the two templates |



## What an invitation link gives access to

The browser decrypts the payload after the guest taps the button. The URL fragment stays out of the HTTP request to GitHub Pages. It contains both the key and ciphertext, so anyone with the full link can open the reveal. Keep participant lists, assignments, and generated links off GitHub.

AES-GCM detects changes to the ciphertext under the same key. The sending chat provides the guest’s context for who sent it, since anyone can generate a new link with their own key. Invitations are reusable and there is no individual revocation.
