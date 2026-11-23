"use strict";

const button = document.querySelector("#reveal");
const instruction = document.querySelector("#instruction");
const result = document.querySelector("#result");
const fragment = location.hash.slice(1);

function decodeBase64Url(value) {
  const bytes = Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/")),
    character => character.charCodeAt(0));
  const canonical = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  if (canonical !== value) throw new Error("Invalid encoding");
  return bytes;
}

function showError() {
  instruction.hidden = true;
  button.hidden = true;
  result.textContent = "This invitation could not be opened. Ask your organizer to resend the full link.";
}

async function reveal(match) {
  button.disabled = true;
  try {
    const [, encodedKey, encodedIv, encodedPayload] = match;
    const key = await crypto.subtle.importKey(
      "raw", decodeBase64Url(encodedKey), "AES-GCM", false, ["decrypt"]
    );
    const plaintext = await crypto.subtle.decrypt({
      name: "AES-GCM",
      iv: decodeBase64Url(encodedIv),
      additionalData: new TextEncoder().encode("secret-santa:v1"),
      tagLength: 128,
    }, key, decodeBase64Url(encodedPayload));
    const payload = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(plaintext));
    if (typeof payload?.recipient !== "string" ||
        payload.recipient.trim().length === 0 || payload.recipient.length > 200) {
      throw new Error("Invalid recipient");
    }

    const revealedText = document.createElement("strong");
    revealedText.textContent = payload.recipient.trim();
    instruction.hidden = true;
    button.hidden = true;
    result.replaceChildren(document.body.dataset.revealLabel || "Your surprise", revealedText);
  } catch {
    showError();
  }
}

if (!fragment) {
  instruction.textContent = "Open the personal invitation your organizer sent you to see what’s inside.";
} else {
  const match = /^v1\.([A-Za-z0-9_-]{43})\.([A-Za-z0-9_-]{16})\.([A-Za-z0-9_-]{22,2048})$/.exec(fragment);
  if (!match) {
    showError();
  } else if (!globalThis.crypto?.subtle) {
    instruction.textContent = "Open the invitation in a browser using its HTTPS link.";
  } else {
    button.hidden = false;
    button.addEventListener("click", () => reveal(match), { once: true });
  }
}
