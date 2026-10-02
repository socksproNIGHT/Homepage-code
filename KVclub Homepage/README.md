# Tech Club Homepage Prototype

A portable, responsive Tech Club landing page for P.M. SHRI Kendriya Vidyalaya Sainik Vihar. It uses HTML, scoped CSS and vanilla JavaScript, and opens directly from `index.html`.

## Run the Prototype

Open `index.html` directly in a modern browser. There is no build step, package installation, framework or development server requirement. The scripts use classic deferred loading for local-file compatibility.

## Project Layout

- `index.html` — semantic homepage markup.
- `src/tech-club-homepage.css` — responsive dark-navy theme and motion styles scoped to the `.tc-homepage` wrapper.
- `src/site-links.js` — the single `TC_SITE_LINKS` configuration object for every external destination. Change URLs here only.
- `src/homepage-content.js` — edit the `announcements` array here to replace or add event entries; the first upcoming entry fills the hero event display.
- `src/tech-club-homepage.js` — progressive enhancement: Canvas particles, randomized background fragments, reveal effects, mobile navigation and button feedback.
- `assets/logo/Tech_club_pfp.jpg` — the Tech Club profile picture used in the compact header and footer marks. It is a JPEG/JFIF image; only its mistaken `.jfif` extension was corrected.
- `assets/logo/` — approved school/KV logo can be added here later.
- `assets/images/` — approved project and activity images.
- `assets/icons/` — local icon assets if needed.
- `docs/HOMEPAGE_CONTENT.md` — content source of truth with confirmed, draft, placeholder and missing information separated.
- `docs/HOMEPAGE_SPEC.md` — page structure, UX priorities and implementation boundaries.

## Link and Content Status

External destinations are centralized in `src/site-links.js`. The supplied Login, Main Website and Alternate Site addresses are marked unverified. During the 2026-10-01 check, Materials returned a database error, the Main Website showed a not-found page, and the Alternate Site failed DNS resolution. Login displayed a form, but its service is not confirmed.

Before the WordPress handoff, confirm the external URLs and site theme/editor, and provide the school logo, workshop year/details if they should be published, and approved project descriptions or images. The page lists the president's contact as 88005 41545. No achievements are currently confirmed.

## WordPress Status

**WordPress integration has NOT been implemented.** This frontend contains no PHP, plugin, database, authentication, backend, tracking or external library. It is a portable design and content handoff for a later WordPress implementation.