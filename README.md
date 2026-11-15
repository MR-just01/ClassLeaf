# ClassLeaf — Shared Handwritten Class Notebooks

ClassLeaf turns handwritten lecture notes into clean, shareable web notebooks. Notebook owners photograph lecture notes, a five-stage AI pipeline extracts and cleans the text while flagging uncertain handwriting, owners review and publish, and classmates read the notebooks at `/<username>/<project>` without logging in.

---

## Quick Setup (< 10 Steps)

1. **Clone the repository & switch to the foundation branch:**
   ```bash
   git checkout phase-1-foundation
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env.local` file from `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   ```
   *(Aliases `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_KEY` are also automatically recognized).*

4. **Run the Database Migration in Supabase:**
   In your [Supabase Dashboard](https://supabase.com/dashboard) -> **SQL Editor**, open and execute the contents of:
   ```
   supabase/migrations/20261115000000_phase1_foundation.up.sql
   ```
   *(To roll back any changes, run `20261115000000_phase1_foundation.down.sql`).*

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

7. **Sign up & create your first notebook:**
   - Go to [http://localhost:3000/signup](http://localhost:3000/signup)
   - Choose a unique handle (e.g. `alice`)
   - Click **Create account** -> You will be redirected to the dashboard
   - Click **New notebook** to create your first class notebook.

---

## Row Level Security (RLS) Test Checklist

Run the following checks directly in the Supabase SQL Editor or via authenticated client calls:

- [ ] **Profiles Public Read:** An unauthenticated visitor can query `select username from profiles;` and receive all public usernames.
- [ ] **Profiles Owner Mutation Only:** An authenticated user can update their profile; non-owners or unauthenticated visitors cannot update another user's profile row.
- [ ] **Username Immutability:** Attempting `update profiles set username = 'newname' where id = auth.uid();` triggers an exception (`Username is permanent and cannot be modified`).
- [ ] **Notebooks Owner Isolation:** User A can read, insert, update, and delete notebooks where `owner_id = user_a.id`.
- [ ] **Notebooks Reader Isolation:** User B cannot view User A's notebook unless it contains at least one note with `status = 'published'`.
- [ ] **Notes Owner Full Access:** The owner can access draft and published notes inside their notebooks.
- [ ] **Notes Public Read:** Public/unauthenticated readers can only select notes where `status = 'published'`.
- [ ] **Images Storage Folder Isolation:** Authenticated users can only upload and delete files under `note-images/<auth.uid>/*`. Access to other user folders is rejected by storage RLS.
- [ ] **Jobs Owner Only:** Only the notebook owner can view and mutate jobs belonging to their notebooks.

---

## Phase 1 Manual Test Checklist

- [ ] **Theme Toggle:** Toggle between Light and Dark mode using the sun/moon icon in the header; verify preference persists on refresh.
- [ ] **Live Username Availability:** Type `@admin` (reserved) -> rejected. Type `@-alice` or `@alice-` -> rejected. Type `@alice` -> shows green "Available" pill and preview `classleaf.com/alice`.
- [ ] **Sign Up:** Register a new user with valid email, password, and username. Verify redirect to `/dashboard`.
- [ ] **Session Persistence:** Refresh `/dashboard` -> user remains logged in via `@supabase/ssr` cookies.
- [ ] **Create Notebook:** Open modal, enter title and slug, submit -> card appears in the dashboard.
- [ ] **Sign Out:** Click "Sign out" -> session cleared, redirected to `/login`.
- [ ] **Protected Routes:** Visit `/dashboard` while signed out -> redirected to `/login?redirectTo=/dashboard`.
- [ ] **Public Route 404:** Visit `/<non-existent-user>/<non-existent-project>` -> renders Next.js 404 page.
