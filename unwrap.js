"use strict";

const button = document.querySelector("#reveal");
const hideButton = document.querySelector("#hide-reveal");
const instruction = document.querySelector("#instruction");
const result = document.querySelector("#result");
const guestName = document.querySelector("#guest-name");
const budget = document.querySelector("#budget");
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

function startCelebration() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !Element.prototype.animate) return;

  let effect = "confetti";
  if (document.body.classList.contains("christmas")) effect = "snowfall";
  if (document.body.classList.contains("valentines")) effect = "hearts";
  const slowFall = effect !== "confetti";
  const layer = document.createElement("div");
  layer.className = `celebration ${effect}`;
  layer.setAttribute("aria-hidden", "true");
  document.body.append(layer);

  const particleCount = slowFall ? 60 : 36;
  for (let index = 0; index < particleCount; index++) {
    const particle = document.createElement("span");
    const start = Math.random() * 100;
    const drift = Math.random() * 16 - 8;
    const scale = 0.5 + Math.random() * 0.9;
    const spin = slowFall ? 0 : 180 + Math.random() * 540;
    if (effect === "hearts") particle.textContent = "♥";
    layer.append(particle);
    particle.animate([
      { transform: `translate(${start}vw, -1rem) scale(${scale})`, opacity: 0 },
      { opacity: 0.85, offset: 0.15 },
      { opacity: 0.85, offset: 0.8 },
      { transform: `translate(${start + drift}vw, calc(100vh + 1rem)) scale(${scale}) rotate(${spin}deg)`, opacity: 0 },
    ], {
      duration: slowFall ? 4000 + Math.random() * 2300 : 1600 + Math.random() * 1100,
      delay: Math.random() * (slowFall ? 2300 : 450),
    });
  }
  setTimeout(() => layer.remove(), slowFall ? 8700 : 3250);
  return layer;
}

async function prepareInvitation(match) {
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

    if (typeof payload.gifter === "string" && payload.gifter.length <= 80 && payload.gifter.trim()) {
      guestName.textContent = " " + payload.gifter.trim();
    }
    if (Number.isSafeInteger(payload.budget) && payload.budget >= 0 && payload.budget <= 999999999) {
      const amount = payload.budget / 100;
      budget.textContent = "Gift budget: $" + amount.toFixed(payload.budget % 100 === 0 ? 0 : 2);
      budget.hidden = false;
    }
    let celebration;
    button.hidden = false;
    button.addEventListener("click", () => {
      const revealedText = document.createElement("strong");
      revealedText.textContent = payload.recipient.trim();
      instruction.hidden = true;
      button.hidden = true;
      result.replaceChildren("You’re shopping for", revealedText);
      hideButton.hidden = false;
      hideButton.focus();
      celebration = startCelebration();
    });
    hideButton.addEventListener("click", () => {
      result.replaceChildren();
      celebration?.remove();
      hideButton.hidden = true;
      instruction.hidden = false;
      button.hidden = false;
      button.focus();
    });
  } catch {
    showError();
  }
}

if (!fragment) {
  instruction.textContent = "Open the personal invitation your organizer sent you to see what’s inside.";
} else {
  const match = /^v1\.([A-Za-z0-9_-]{43})\.([A-Za-z0-9_-]{16})\.([A-Za-z0-9_-]{22,2400})$/.exec(fragment);
  if (!match) {
    showError();
  } else if (!globalThis.crypto?.subtle) {
    instruction.textContent = "Open the invitation in a browser using its HTTPS link.";
  } else {
    prepareInvitation(match);
  }
}
