# Sharing previews

`npm run build` generates HTML metadata for every published article using the public Supabase client. Drafts are excluded. Missing database configuration or a query failure fails the build rather than silently shipping generic previews.

Set `SITE_URL` to the public production origin when using a custom domain. It defaults to the existing magazine-for-articles.vercel.app deployment. Each page includes an absolute canonical URL, Open Graph metadata, and Twitter metadata. Stories without photos use the site logo.

Rebuild/redeploy after publishing, unpublishing, or editing story metadata. Existing sharing-app caches may take time to refresh. Verify a deployed article URL in a sharing preview inspector before announcing the launch; localhost cannot be scraped by WhatsApp or Facebook.
