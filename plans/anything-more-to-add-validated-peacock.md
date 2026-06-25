# Context

Ubuntu Essence is a fully functional African-culture magazine app with auth, article reading, category filtering, search, bookmarks, and a profile page. The UI is solid but several features would meaningfully complete the experience and make it feel like a real publication platform rather than a prototype.

---

## Proposed Additions (4 features)

### 1. Dark Mode Toggle
The theme already has a full `.dark` token set in `src/styles/theme.css`. Just needs a toggle button wired up.

**Files:**
- `src/app/App.tsx` — add a `darkMode` boolean state, toggle `document.documentElement.classList` between `''` and `'dark'`, add a Sun/Moon icon button to the header next to search.
- No new files needed.

---

### 2. Author Profile Pages
Clicking an author name/avatar anywhere in the app (ArticleCard, ArticleDetailPage, FeaturedArticle) navigates to a page listing all articles by that author.

**New file:** `src/app/pages/AuthorPage.tsx`
- Header: large initial avatar (primary color), author name, bio pulled from first matching article, article count badge.
- Grid of all articles by that author using `ArticleCard`.
- Back button → returns to previous view.

**Files to update:**
- `src/app/App.tsx` — add `'author'` to `AppView` type, add `selectedAuthor` state, handle `onAuthorClick` callback.
- `src/app/components/ArticleCard.tsx` — make author byline a clickable `<button>` that calls `onAuthorClick` (stop propagation so card click still opens article).
- `src/app/components/FeaturedArticle.tsx` — same treatment for author row.
- `src/app/pages/ArticleDetailPage.tsx` — make author name/avatar in the bio card clickable.

---

### 3. Comments Section (mock UI)
Add a comments section below the author bio in `ArticleDetailPage`. No backend — pre-seed 3–4 realistic comments per article using a deterministic seed from `article.id`. Users can submit a new comment (appended to local state, shown immediately).

**New file:** `src/app/components/CommentsSection.tsx`
- Section title "Conversation" with comment count.
- Comment card: avatar initial + name, timestamp, body text, thumbs-up reaction count with click-to-increment.
- Compose area: textarea + "Post comment" button. On submit, adds comment to local list (no auth check needed — use the logged-in user's name if available, else "Reader").
- Pre-seeded comments generated from a small static array rotated by `article.id % comments.length`.

**Files to update:**
- `src/app/pages/ArticleDetailPage.tsx` — import and render `<CommentsSection articleId={article.id} userName={…} />` below the author bio card.

---

### 4. Page Transition Animations
Use the `motion/react` library (already installed) to animate page entry/exit for a polished feel.

**Pattern:** Wrap each top-level page/view in a `<motion.div>` with `initial={{ opacity: 0, y: 12 }}`, `animate={{ opacity: 1, y: 0 }}`, `exit={{ opacity: 0, y: -8 }}` and `transition={{ duration: 0.25, ease: 'easeOut' }}`.

**Files to update:**
- `src/app/App.tsx` — wrap the returned JSX of each view branch (`main`, `article`, `profile`) with `<motion.div key={appView} ...>`.
- `src/app/pages/ArticleDetailPage.tsx` — wrap outermost div.
- `src/app/pages/LoginPage.tsx`, `RegisterPage.tsx`, `ForgotPasswordPage.tsx` — wrap form panels with subtle entry animation.
- `src/app/Root.tsx` — wrap each view return value with motion.

Import: `import { motion } from 'motion/react'` (already installed, do NOT use `framer-motion`).

---

### 5. Admin Dashboard
A separate protected view accessible from the user menu (or a dedicated `/admin` route via state). Gives editors a bird's-eye view of the magazine's content and simulated engagement metrics.

**New file:** `src/app/pages/AdminDashboard.tsx`

**Layout:** Sidebar (left, collapsible on mobile) + main content area. Sidebar has sections: Overview, Articles, Authors, Categories, Subscribers.

**Tabs / sections:**

**Overview** — 4 stat cards at the top:
- Total Articles (count from articles array)
- Total Authors (unique author count)
- Saved (bookmark) count — passed as a prop
- Newsletter Subscribers (mock number)

Then two charts using `recharts` (already installed):
- `AreaChart` — "Monthly Readership" (12 months of mock data, terracotta fill)
- `BarChart` — "Articles by Category" (derived from real articles data, showing count per category)

**Articles** — searchable, sortable table of all 18 articles with columns: Title, Category, Subcategory, Author, Date, Read Time, and an Edit / Feature button (UI only). Includes a "Mark as Featured" toggle per article.

**Authors** — card grid of unique authors, each showing name, article count, and categories covered. Click → filter Articles tab to that author.

**Categories** — visual breakdown using a `PieChart` (recharts) of article distribution per category, plus a small table of subcategory counts.

**Subscribers** — mock subscription table with 10 fake subscribers (name, email, join date, plan), plus a "Send newsletter" button (non-functional UI).

**Access:** Add an "Admin" link to the `UserMenu` dropdown in `App.tsx` that sets `appView` to `'admin'`. Also add it to the `MobileSidebar`. Guard it with a simple `isAdmin` boolean on the user object (set to `true` after login for demo purposes in `Root.tsx`).

**Files to update:**
- `src/app/Root.tsx` — set `user.isAdmin = true` on login/register.
- `src/app/App.tsx` — add `'admin'` to `AppView` type; render `<AdminDashboard>` when active; pass `savedCount` and `articles` as props; add Admin link in `UserMenu` and update `AppProps` interface.
- `src/app/components/MobileSidebar.tsx` — add Admin link (conditional on `user.isAdmin`).

---

## Verification

1. **Dark mode** — click Moon icon → background turns dark, all text and borders flip; click Sun → reverts. Check header, article cards, auth pages.
2. **Author pages** — click any author name on an ArticleCard → AuthorPage renders with correct articles filtered. Back button returns to article list. Click article from author page → ArticleDetail opens.
3. **Comments** — open any article → comments appear below author bio. Click thumbs-up → count increments. Type in textarea + Post → comment appears immediately with user name.
4. **Animations** — navigate between views (main ↔ article ↔ profile, login ↔ register ↔ forgot) → smooth fade+slide transitions visible.
5. **Admin dashboard** — click "Admin" in user dropdown → dashboard renders with stat cards, readership area chart, articles-by-category bar chart, and sortable articles table. Sidebar navigation switches between Overview / Articles / Authors / Categories / Subscribers sections correctly.
