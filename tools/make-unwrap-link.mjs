import { createCipheriv, randomBytes } from "node:crypto";
import { parseArgs } from "node:util";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    christmas: { type: "boolean" },
    valentines: { type: "boolean" },
    gifter: { type: "string" },
  },
});
const [page, revealText] = positionals;
const recipient = revealText?.trim();
const gifter = values.gifter?.trim();

if (positionals.length !== 2 || !page || !recipient || recipient.length > 200 ||
    (values.christmas && values.valentines) ||
    (values.gifter !== undefined && (!gifter || gifter.length > 80))) {
  console.error('Usage: node tools/make-unwrap-link.mjs <site-root-url> "Reveal text" [--gifter "Guest Name"] [--christmas | --valentines]');
  process.exit(1);
}

const url = new URL(page);
if (url.protocol !== "https:" &&
    !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) {
  throw new Error("Use HTTPS for a hosted page or HTTP on localhost for testing.");
}
if (url.username || url.password || url.search || url.hash || !url.pathname.endsWith("/")) {
  throw new Error("Use the site root URL with a trailing slash and without credentials, query, or fragment.");
}
if (values.christmas) url.pathname += "christmas.html";
if (values.valentines) url.pathname += "valentines.html";

const key = randomBytes(32);
const iv = randomBytes(12);
const cipher = createCipheriv("aes-256-gcm", key, iv);
cipher.setAAD(Buffer.from("secret-santa:v1", "utf8"));
const sealed = Buffer.concat([
  cipher.update(JSON.stringify({ recipient, gifter }), "utf8"),
  cipher.final(),
  cipher.getAuthTag(),
]);

url.hash = ["v1", ...[key, iv, sealed].map(bytes => bytes.toString("base64url"))].join(".");
console.log(url.href);
