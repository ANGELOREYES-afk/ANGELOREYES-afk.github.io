# GitHub Pages Resume

This folder is a static resume site you can publish with **GitHub Pages**.

## Quick customize

- Edit resume content in `index.html`.
- Update your GitHub username in `script.js` (`GITHUB_USERNAME`).
- Optional: replace `resume.pdf` with your own (or remove the “Download PDF” link in `index.html`).

## Publish as a GitHub user site (recommended)

1. Create a repo named **`<your-username>.github.io`** on GitHub (example: `ANGELOREYES-afk.github.io`).
2. In this folder:
   ```bash
   git init
   git add .
   git commit -m "Add resume site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-username>.github.io.git
   git push -u origin main
   ```
3. Wait ~1–5 minutes, then visit: `https://<your-username>.github.io/`

## Publish as a project site (alternative)

If you want this inside an existing repo (example: `resume-site`):

1. Push this folder to the repo’s default branch (or put it under `/docs`).
2. On GitHub: **Settings → Pages**
3. Set:
   - **Source**: Deploy from a branch
   - **Branch**: `main`
   - **Folder**: `/ (root)` (or `/docs` if you used that)
4. GitHub will show your Pages URL.

## Notes

- “GitHub” section uses the public GitHub API to show your profile + most recently pushed repos.
- If the API rate limit is hit, the page will fall back to links.
- Anything in this repo (including `resume.pdf`, phone, and email) becomes public once published.
