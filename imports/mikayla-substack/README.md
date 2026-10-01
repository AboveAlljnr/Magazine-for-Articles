# Mikayla Substack text import

Copied with the site owner's authorization from the public publication on 2026-09-30.

- `posts.json` preserves the 11 source records, their visible text, subtitles, URLs, and exact publication timestamps from the public page's time element.
- `import-preview.json` records the duplicate check and proposed category assignments.
- `import-result.json` records the eight drafts created and verified in Supabase.
- Coconut man and The fisherman already existed and were left unchanged. The Coming soon announcement was excluded.
- Images, embedded media, image captions, inline styling, comments, likes, and subscribers were not imported. Article paragraphs and headings were retained. Series subtitles were appended to article titles so the entries are distinguishable.
- Each draft has the original article URL appended to its body. All eight remain unpublished for editorial review; category assignments can be adjusted in the article editor.

The importer defaults to a read-only preview and requires server credentials from the local environment. It never updates existing records. To check for new or missing records:

```sh
node --env-file=.env --env-file=.env.local scripts/import-mikayla-substack.mjs
```

Add `--apply` to insert missing drafts. The batch uses one atomic insert and verifies saved text, timestamps, author and draft status. Credentials are not included in these files.
