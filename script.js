const GITHUB_USERNAME = "ANGELOREYES-afk";
const MAX_REPOS = 6;

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("theme", theme);
}

function initThemeToggle() {
  const btn = document.querySelector("[data-theme-toggle]");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === "dark" ? "light" : "dark");
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatCompactNumber(n) {
  try {
    return Intl.NumberFormat(undefined, { notation: "compact" }).format(n);
  } catch {
    return String(n);
  }
}

function formatDate(iso) {
  try {
    const date = new Date(iso);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

async function fetchJson(url) {
  const resp = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
    },
  });
  const remaining = resp.headers.get("x-ratelimit-remaining");
  const reset = resp.headers.get("x-ratelimit-reset");
  const rateLimit = {
    remaining: remaining ? Number(remaining) : null,
    reset: reset ? Number(reset) : null,
  };

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    const err = new Error(`GitHub request failed: ${resp.status}`);
    err.details = text;
    err.rateLimit = rateLimit;
    throw err;
  }

  const data = await resp.json();
  return { data, rateLimit };
}

function setStatus(el, message) {
  if (!el) return;
  el.textContent = message;
}

function rateLimitHint(err) {
  const remaining = err?.rateLimit?.remaining;
  const reset = err?.rateLimit?.reset;
  if (typeof remaining === "number" && remaining === 0 && typeof reset === "number") {
    const resetDate = new Date(reset * 1000);
    return `Rate limit reached. Try again after ${resetDate.toLocaleTimeString()}.`;
  }
  return "Couldn’t load live GitHub data right now.";
}

async function renderGitHubProfile() {
  const wrap = document.querySelector("[data-github-profile]");
  const status = document.querySelector("[data-github-profile-status]");
  if (!wrap) return;

  try {
    const { data } = await fetchJson(`https://api.github.com/users/${encodeURIComponent(GITHUB_USERNAME)}`);

    const name = data.name || GITHUB_USERNAME;
    const bio = data.bio || "";
    const followers = Number.isFinite(data.followers) ? data.followers : 0;
    const following = Number.isFinite(data.following) ? data.following : 0;
    const publicRepos = Number.isFinite(data.public_repos) ? data.public_repos : 0;

    wrap.innerHTML = `
      <img class="avatar" src="${escapeHtml(data.avatar_url)}" alt="${escapeHtml(name)} avatar" loading="lazy" />
      <div>
        <div style="font-weight:740">${escapeHtml(name)}</div>
        <div class="muted small">${escapeHtml(bio)}</div>
        <div class="muted small" style="margin-top:6px;font-family:var(--mono)">
          ${formatCompactNumber(publicRepos)} repos • ${formatCompactNumber(followers)} followers • ${formatCompactNumber(following)} following
        </div>
      </div>
    `;

    setStatus(status, "");
  } catch (err) {
    wrap.innerHTML = `
      <div class="muted small">
        Visit: <a href="https://github.com/${escapeHtml(GITHUB_USERNAME)}" target="_blank" rel="noopener">github.com/${escapeHtml(
          GITHUB_USERNAME,
        )}</a>
      </div>
    `;
    setStatus(status, rateLimitHint(err));
  }
}

function pickRepos(repos) {
  return repos
    .filter((r) => !r.fork && !r.archived && !r.disabled)
    .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
    .slice(0, MAX_REPOS);
}

async function renderGitHubRepos() {
  const wrap = document.querySelector("[data-github-repos]");
  const status = document.querySelector("[data-github-repos-status]");
  if (!wrap) return;

  try {
    const { data } = await fetchJson(
      `https://api.github.com/users/${encodeURIComponent(GITHUB_USERNAME)}/repos?per_page=100&sort=pushed`,
    );
    const repos = pickRepos(Array.isArray(data) ? data : []);

    if (repos.length === 0) {
      wrap.innerHTML = `<div class="muted small">No public repos found.</div>`;
      setStatus(status, "");
      return;
    }

    wrap.innerHTML = repos
      .map((r) => {
        const stars = Number.isFinite(r.stargazers_count) ? r.stargazers_count : 0;
        const lang = r.language ? String(r.language) : "";
        const updated = r.pushed_at ? formatDate(r.pushed_at) : "";
        return `
          <a class="repo" href="${escapeHtml(r.html_url)}" target="_blank" rel="noopener">
            <div class="repo-top">
              <div class="repo-name">${escapeHtml(r.name)}</div>
              <div class="repo-stats"><span>★ ${formatCompactNumber(stars)}</span><span>Updated ${escapeHtml(
                updated,
              )}</span></div>
            </div>
            <div class="repo-desc">${escapeHtml(r.description || "")}</div>
            <div class="repo-meta">
              ${lang ? `<span><span class="dot"></span> ${escapeHtml(lang)}</span>` : ""}
              ${r.license?.spdx_id ? `<span>${escapeHtml(r.license.spdx_id)}</span>` : ""}
            </div>
          </a>
        `;
      })
      .join("");

    setStatus(status, `Live data from github.com/${GITHUB_USERNAME}.`);
  } catch (err) {
    wrap.innerHTML = `
      <div class="muted small">
        Visit: <a href="https://github.com/${escapeHtml(GITHUB_USERNAME)}?tab=repositories" target="_blank" rel="noopener">
          github.com/${escapeHtml(GITHUB_USERNAME)}
        </a>
      </div>
    `;
    setStatus(status, rateLimitHint(err));
  }
}

initThemeToggle();
renderGitHubProfile();
renderGitHubRepos();

