# elah.one

The Elah website. Built with [Astro](https://astro.build) as a static site and deployed on Vercel.

## Run locally

```
npm install
npm run dev
```

## Pages

`src/pages/`: home, node, business, company, careers, quest, access, privacy, 404.
Shared layout, header and footer live in `src/layouts` and `src/components`. Styles are in `src/styles/site.css`.

## Forms

All forms send through `src/scripts/forms.js`. To deliver leads by email, get a free access key at web3forms.com and paste it into `src/scripts/config.js`. Until a key is set, forms fall back to WhatsApp.

## Status strip

Update `src/components/Status.astro` monthly. Keep every line true.
