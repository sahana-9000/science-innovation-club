# Science & Innovation Club

Vite site prepared for Cloudflare Workers Static Assets. The hourly Worker task
checks NASA JPL, ESA, NSF, and arXiv RSS feeds. The site displays headlines and
short summaries with links to the original publisher.

## Publish on Cloudflare

1. Push the updated project files to the GitHub repository's `main` branch.
2. Sign in to Cloudflare and open **Workers & Pages**.
3. Choose **Create application** → **Workers** → **Import a repository**, then
   connect GitHub and select `science-innovation-club`.
4. Set the build command to `npm run build` and the deploy command to
   `npx wrangler deploy`. Keep the project root as `/`.
5. After the first deploy, open the Worker **Settings** → **Bindings** and add a
   **Workers KV** binding named `NEWS_CACHE`. Create a namespace for it, save,
   and redeploy. The app can fetch feeds without KV, but KV lets the hourly
   scheduled refresh save the latest results for visitors.
6. Open the Worker URL shown by Cloudflare. The scheduled refresh runs hourly;
   the first visit also loads the latest feeds immediately.

Cloudflare Workers Builds will redeploy the site when new commits are pushed to
`main`.

## Local preview

Run `npm install`, then `npm run dev`. The `/api/news` endpoint is provided by
the deployed Cloudflare Worker, so the local Vite preview does not include the
live feed unless the Worker is run locally with Wrangler.
