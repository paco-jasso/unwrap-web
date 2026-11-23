# Unwrap Web

**Unwrap** is a small, mobile-friendly reveal site for private invitations and surprises. Send someone a link in WhatsApp and let them tap to see what’s inside. The site runs on GitHub Pages without a backend, database, or custom domain.

This repository hosts the web experience. The planned `unwrap-android` organizer app will generate invitations and open a prefilled WhatsApp message for the organizer to review and send.

![Unwrap preview with a wrapped gift](./unwrap-preview.png)

## Choose a template

| Template | Use it for | Page | Reveal button |
| --- | --- | --- | --- |
| General | Event details, announcements, and short surprises | `/` | **Unwrap my invitation** |
| Christmas | A Secret Santa assignment | `/christmas.html` | **Reveal my match** |

Each template has its own WhatsApp preview title and artwork. The preview shows the template branding. The assignment or surprise is revealed in the browser after the guest taps the button.

## Run locally

1. Install Node.js and open a terminal in the project folder. If you’re starting from GitHub, clone the repo and enter it.

   ```sh
   git clone https://github.com/paco-jasso/unwrap-web.git
   cd unwrap-web
   ```

2. Start a local server and leave the terminal open. This downloads the test server on first use. If you already have Python on Windows, you can use `py -m http.server 8000 --bind 127.0.0.1` instead.

   ```sh
   npx --yes http-server . -a 127.0.0.1 -p 8000
   ```

3. In a second terminal, run one or both commands. Each prints a complete invitation URL.

   ```sh
   node tools/make-unwrap-link.mjs http://127.0.0.1:8000/ "Meet at the rooftop at 7 PM"
   node tools/make-unwrap-link.mjs http://127.0.0.1:8000/ "Alex Rivera" --christmas
   ```

4. Open the full URL in your browser and tap the reveal button. Open the page without the fragment to check the landing state.

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

## Send an invitation

Generate a link using the published site root with its trailing slash. Add `--christmas` for Secret Santa.

```sh
node tools/make-unwrap-link.mjs https://paco-jasso.github.io/unwrap-web/ "Meet at the rooftop at 7 PM"
node tools/make-unwrap-link.mjs https://paco-jasso.github.io/unwrap-web/ "Alex Rivera" --christmas
```

Send the complete URL in a one-to-one WhatsApp chat. For a Secret Santa exchange, the name in the command is the person the guest will shop for.

```text
*Unwrap your invitation* 🎁
Tap to see what’s inside!
<paste the full invitation link here>
```

## Invitation format for the organizer app

An invitation has the form `PAGE_URL#v1.KEY.IV.SEALED`. Use `/unwrap-web/` for the general template or `/unwrap-web/christmas.html` for Christmas.

| Field | Encoding |
| --- | --- |
| `KEY` | Fresh 32-byte cryptographically random AES key per invitation |
| `IV` | Fresh 12-byte cryptographically random AES-GCM nonce |
| `SEALED` | AES-256-GCM ciphertext followed immediately by the 16-byte authentication tag |

1. Trim the reveal text and limit it to 1–200 UTF-16 code units. Encode it as UTF-8 JSON, for example `{"recipient":"Alex Rivera"}`. The v1 field is named `recipient` for both templates.
2. Encrypt with AES-256-GCM using the UTF-8 bytes of `secret-santa:v1` as additional authenticated data. Keep that literal value for compatibility with existing v1 fragments.
3. Encode each binary field separately using Base64URL without padding. Join the version and fields with dots and set the result as the URL fragment.
4. To prefill a message, use `https://wa.me/<number>?text=<encoded-message>`. Use the guest’s international phone number in digits and URL-encode the full message so the invitation’s `#` stays inside the message. The organizer reviews it and sends it from WhatsApp. [WhatsApp click-to-chat format](https://faq.whatsapp.com/5913398998672934)

## What an invitation link gives access to

The browser decrypts the payload after the guest taps the button. The URL fragment stays out of the HTTP request to GitHub Pages. It contains both the key and ciphertext, so anyone with the full link can open the reveal. Keep participant lists, assignments, and generated links off GitHub.

AES-GCM detects changes to the ciphertext under the same key. The sending chat provides the guest’s context for who sent it, since anyone can generate a new link with their own key. Invitations are reusable and there is no individual revocation.
