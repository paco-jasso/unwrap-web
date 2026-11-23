import { createCipheriv, randomBytes } from "node:crypto";
import { parseArgs } from "node:util";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    christmas: { type: "boolean" },
    valentines: { type: "boolean" },
    gifter: { type: "string" },
    budget: { type: "string" },
  },
});
const [page, revealText] = positionals;
const recipient = revealText?.trim();
const gifter = values.gifter?.trim();
const amount = values.budget?.trim();

if (positionals.length !== 2 || !page || !recipient || recipient.length > 200 ||
    (values.christmas && values.valentines) ||
    (values.gifter !== undefined && (!gifter || gifter.length > 80)) ||
    (amount !== undefined && !/^\d{1,7}(?:\.\d{1,2})?$/.test(amount))) {
  console.error('Usage: node tools/make-unwrap-link.mjs <site-root-url> "Reveal text" [--gifter "Guest Name"] [--budget 500.50] [--christmas | --valentines]');
  process.exit(1);
}
let budget;
if (amount !== undefined) {
  const [whole, cents = ""] = amount.split(".");
  budget = Number(whole) * 100 + Number(cents.padEnd(2, "0"));
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
  cipher.update(JSON.stringify({ recipient, gifter, budget }), "utf8"),
  cipher.final(),
  cipher.getAuthTag(),
]);

url.hash = ["v1", ...[key, iv, sealed].map(bytes => bytes.toString("base64url"))].join(".");
console.log(url.href);
