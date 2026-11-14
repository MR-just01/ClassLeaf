# Class Notes Notebook: Project Spec v0.1

Status: Draft for MVP. Date: 14 Nov 2026. Project name and domain: to be decided.

## 1. Overview

A web app where a student photographs handwritten class notes, an AI pipeline extracts and cleans the text, the owner reviews it, and the result is published as a fast, readable page at a stable URL that can be shared with the whole class. The product is a **shared class notebook**, not a photo-to-text converter.

Example: `<domain>/<username>/dbms-class-notes`, with DBMS as the first notebook.

## 2. Problem

Students pass around photos of notes in group chats. The photos are often blurry, rotated, or taken at awkward angles, and they need manual fixing. Spelling mistakes or misread words in the notes get learned wrongly, which costs marks. Existing tools (Google Lens, ChatGPT, Gemini, Adobe Scan) can extract text, but none of them gives a group a stable, organized, per-subject place to read the cleaned notes.

## 3. Goals and non-goals

**Goals**

- Turn a photo of handwritten notes into clean, readable, published notes with minimal effort.
- Never silently change meaning: uncertain words are flagged for the owner, not overwritten.
- Give each owner a permanent, shareable URL per notebook.
- Reach 10-15 real users within the first weeks after launch.
- Produce a project that is explainable end to end in an internship interview: problem, decisions, metrics.

**Non-goals for the MVP**

- Collaborators or multi-author notebooks.
- Summaries, practice questions, or quizzes.
- Automatic subject or topic detection.
- WhatsApp or Telegram integration.
- Native mobile apps.

## 4. Users

- **Owner (note keeper):** a student who photographs notes, reviews the cleaned text, and publishes. One owner per notebook.
- **Reader:** classmates and friends who open the shared link. Readers do not need an account.

First target group: B.Tech classmates, starting with one study group and then expanding to other branches and hostels.

## 5. Decisions made so far

| Area | Decision |
| --- | --- |
| Product shape | Shared class notebook with one page per project |
| URL scheme | Globally unique username in the path, `/<username>/<project>` (two segments, proposed) |
| Permissions | One owner per notebook; everyone else is read-only |
| Upload method | Plain web upload page for v1 |
| Frontend and backend | Next.js |
| LLM provider | Groq |
| Database, auth, authorization | Supabase |
| Session design | Short-lived access token plus long-lived refresh token, both in cookies |
| AI pipeline | Five stages (preprocess, quality gate, extract, clean, verify and flag) run as an async job; extraction sits behind one interface so the OCR approach can be swapped |

## 6. MVP functional requirements

1. **Signup and login.** Email or Google login through Supabase Auth. At signup the user picks a unique, permanent username.
2. **Create notebook.** The owner creates a notebook with a title and a URL slug (for example `dbms-class-notes`).
3. **Upload photos.** The owner uploads one or more photos. Images are stored in Supabase Storage.
4. **Extract and clean.** The server sends each image through the AI pipeline (section 10) and creates a draft note.
5. **Flag uncertain text.** Low-confidence words or regions are highlighted in the draft instead of being rewritten.
6. **Review and edit.** The owner sees the original photo beside the cleaned text, edits anything, and resolves flags.
7. **Publish.** The owner publishes a note. Only published notes appear on the public page.
8. **Public notebook page.** `/<username>/<project>` renders the published notes. The original photo can be viewed beside each note.
9. **Basic owner dashboard.** List of the owner's notebooks, with draft and published counts.
10. **Delete and unpublish.** The owner can unpublish or delete a note or notebook.

## 7. Core user flow

1. Owner logs in and creates the notebook `dbms-class-notes`.
2. Owner uploads photos of today's lecture.
3. The server stores the images, runs the pipeline, and saves a draft.
4. Owner reviews the draft against the photo, fixes flagged words, and publishes.
5. Owner copies the link `/<username>/dbms-class-notes` and shares it in the class group.
6. Classmates open the link and read the notes without logging in.

## 8. URLs and routing

- Public notebook: `/<username>/<project>`
- Optional note-level page: `/<username>/<project>/<note-slug>`
- Owner profile page (later): `/<username>`
- Reserved usernames blocked at signup: `admin`, `api`, `login`, `signup`, `settings`, `about`, `dashboard`, `new`, and similar route names.
- Username format: lowercase letters, numbers, and hyphens; length limit to be decided; usernames are permanent (no renames) so shared links never break.
- Project slugs are unique per user, not globally.
- Next.js route shape: `[username]/[project]`.

## 9. Architecture and stack

- **Next.js:** upload page, owner dashboard, public notebook pages, and server-side API routes. The Groq API key lives on the server only.
- **Rendering:** public pages are served statically and regenerated when content changes (incremental static regeneration with on-demand revalidation on publish), so new notes appear within seconds without a full redeploy.
- **Supabase Auth:** login, sessions, and token refresh.
- **Supabase Postgres:** all application data, protected by Row Level Security.
- **Supabase Storage:** original photos.
- **Groq:** LLM calls for cleanup, and possibly vision for text extraction (see section 10).
- **Hosting:** to be decided (Vercel is the common choice for Next.js).

## 10. AI pipeline

The pipeline has five stages, runs as an asynchronous job, and keeps text extraction behind one interface so the OCR approach can be chosen later without touching anything else.

**Job lifecycle.** Each upload creates a job in Supabase with status `queued`, `processing`, `draft_ready`, or `failed`. The upload page polls (or subscribes to) the job status. This avoids serverless time limits and keeps the user from staring at a spinner.

**Stages**

1. **Preprocess (code, no LLM).** Auto-rotate from EXIF data, resize, and boost contrast. This fixes most rotated or dark photos before any model sees them.
2. **Quality gate.** Compute a blur score in code (variance of the Laplacian) and check brightness. If the photo fails, the job ends with a clear retake message. This is the first agent decision: act on the image or ask the human.
3. **Extract.** One interface: `extractText(image) -> { lines: [{ text, uncertainWords[] }] }`. Output is structured JSON, not free text. Two interchangeable implementations: a Groq vision model, or a dedicated OCR service. Start with the Groq vision model; the accuracy test confirms the choice once the site works end to end.
4. **Clean and structure.** Groq turns the extracted lines into markdown (headings, lists, tables where clear) and fixes spelling and grammar. Rules: never change numbers, formulas, or technical terms, and keep uncertain words marked.
5. **Verify and flag.** Compare the cleaned text against the extraction. Anything changed beyond spelling, plus every uncertain word from stage 3, is flagged for the owner in the draft.

**How uncertain words are detected.** A vision LLM gives no reliable per-word confidence, so v1 uses two proxies: the model is told to mark unclear words as `[?word?]`, and stage 5 flags any word the cleanup changed. If the accuracy test shows too many misses, add a second extraction pass and flag words where the two runs disagree, or switch to a dedicated OCR service, which returns real per-word confidence.

**Design rules**

- Orchestration is fixed code. The LLM decides only narrow things (for example, whether a region is too unclear to trust), which is cheaper and more reliable than a free-roaming agent.
- Every run is logged: stage results, flags raised, and the owner's later corrections. These logs become accuracy data and a test set.

**OCR accuracy test (after the site works end to end).** Take 10 real photos of handwritten DBMS notes, including blurry and rotated ones, and measure how many words each approach reads correctly. Record the numbers: they are a resume metric and decide whether the extraction implementation stays or is swapped.

## 11. Data model (initial)

| Table | Key columns |
| --- | --- |
| `profiles` | `id` (matches auth user), `username` (unique, permanent), `created_at` |
| `notebooks` | `id`, `owner_id`, `slug`, `title`, `description`, `created_at`; unique on (`owner_id`, `slug`) |
| `notes` | `id`, `notebook_id`, `title`, `content` (markdown), `flags` (JSON of uncertain words and positions), `status` (`draft` or `published`), `created_at`, `published_at` |
| `images` | `id`, `note_id`, `storage_path`, `order_index`, `quality_status` |
| jobs | id, notebook\_id, status (queued, processing, draft\_ready, failed), stage, error, log (JSON of stage results), created\_at |

## 12. Authentication and authorization

**Sessions.** Short-lived access token (JWT) plus long-lived refresh token, both stored in cookies. Supabase Auth issues and rotates them; use the `@supabase/ssr` package and Next.js middleware to refresh the session on each request. Refresh token rotation stays enabled.

**Server-side checks.** Authorization decisions on the server use `supabase.auth.getUser()`, not `getSession()`.

**Cookie settings.** `Secure` and `SameSite=Lax` at minimum. The default browser client needs to read the session cookie, so it is not HttpOnly; moving login and logout fully through server route handlers allows HttpOnly as a later hardening step.

**Row Level Security (the real authorization layer):**

- `profiles`: anyone can read `username`; a user can update only their own row (username immutable after creation).
- `notebooks`: owners have full access to their own; anyone can read notebooks that have at least one published note.
- `notes`: owners have full access to notes in their notebooks; anyone can read notes where `status = 'published'`.
- `images`: owners have full access; public read only for images belonging to published notes.
- Storage bucket policies mirror the same rules.

**CSRF.** State-changing actions (upload, publish, delete) use POST only, with an `Origin` header check.

## 13. Security and privacy

- Groq API key and Supabase service role key are server-side only and never exposed to the browser.
- Validate uploads: allowed image types, maximum file size, maximum images per request.
- Rate-limit upload and AI endpoints per user to control cost and abuse.
- Sanitize rendered markdown to prevent script injection on public pages.
- Be explicit with users that published notes and their photos are public to anyone with the link.
- Notes may contain personal handwriting; allow owners to delete images and notes permanently.

## 14. Non-functional requirements

- Public pages load fast (static or cached) and are readable on mobile, since most readers will open links from a phone.
- Pipeline turnaround for one photo: target under 30 seconds (to be measured).
- Free-tier friendly: stay within Groq and Supabase free-tier limits for the first users, and monitor usage.
- Reasonable error handling: failed extraction shows a clear message and allows retry.

## 15. Build plan (about 2 weeks)

**Days 1-2: Supabase foundation.** Schema (including the jobs table), auth, username signup, RLS policies, storage bucket.

**Days 3-4: Upload and job flow.** Upload page, job creation, status polling, image storage.

**Days 5-7: AI pipeline.** The five stages from section 10, with extraction built on a Groq vision model behind the `extractText` interface; flagged words saved into the draft.

**Days 8-9: Review and publish.** Side-by-side review screen, editing, publish and unpublish, revalidation of public pages.

**Days 10-11: Public notebook page.** `/<username>/<project>` rendering, mobile layout, original photo viewer.

**Days 12-14: Accuracy test, deploy, first users.** Run the OCR accuracy test on 10 real photos and swap the extraction implementation if needed, then deploy and give it to one study group.

## 16. Validation and success metrics

**Before building (2 days):** show 5 classmates a blurry notes photo and ask how they handle it today and whether they would use a link instead.

**Metrics to track:**

- Registered owners and active owners (uploaded at least one note).
- Notes published and unique readers per notebook.
- Target: 10-15 real users (owners plus readers) using the product.
- OCR accuracy from the post-build test, and the share of draft words flagged versus corrected by owners.
- Time from upload to published note.
- Feature requests received (for example, requests to let others contribute), as input for the next version.

**Case study output:** problem, 5-8 user conversations, what was cut from scope, accuracy numbers, usage data, and what users asked for next.

## 17. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| LLM introduces errors into notes | Flag uncertainty, keep the original photo beside the text, require owner review before publishing |
| Handwriting recognition is too weak | Run the early test; fall back to a dedicated OCR service |
| Competition from Google Lens, ChatGPT and similar tools | Compete on the group workflow: stable per-subject URLs and a shared notebook |
| Low adoption | Start with one study group, reach people directly, keep upload friction low |
| Free-tier limits hit by heavy use | Rate limits, image size limits, usage monitoring |
| Public pages expose personal content | Clear public-by-link messaging, easy unpublish and delete |

## 18. Open questions

- Project name and domain.
- Username length limit and exact reserved-word list.
- Hosting platform.
- OCR approach (decided by the accuracy test after the site works end to end).
- Whether to add a Telegram bot after the first 5 users, if upload friction comes up.
- Whether readers should be able to search across a notebook.

## 19. Future scope (after the MVP, only if users ask)

- Collaborators on a notebook (owner invites others), keeping the same URL structure.
- Automatic subject and topic detection and filing.
- Multi-photo stitching into one ordered note.
- Summaries and practice questions per note.
- Telegram or WhatsApp upload.
- MCP server exposing notebooks to AI assistants.
