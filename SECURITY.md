# Security policy

## What this repository is

davidebeltrame.com is a static site. GitHub Pages serves prebuilt HTML, CSS,
JavaScript and images from `main`. There is no backend, no database, no
accounts, no sessions, and no form a visitor can submit. The site sets no
cookie and requests nothing from a third-party origin.

## Supported versions

One: whatever `main` currently builds to. A static site has no releases to
support in parallel, so there is no version matrix. Anything reproducible on
the live site is either present in `main` or already fixed there.

## Reporting a vulnerability

Use GitHub's private vulnerability reporting — the **Report a vulnerability**
button under this repository's Security tab. That opens a private advisory,
which is the right place for anything that should not be public before it is
fixed.

Anything already public, or harmless to discuss in the open, can be a normal
issue instead.

This is a personal site maintained by one person. Expect a reply in days rather
than hours. If a report is valid I will say so and fix it; if I think it is not,
I will say why rather than leave it unanswered.

## Scope

Worth reporting:

- A way around the Content-Security-Policy, which is delivered as a `<meta>`
  element because GitHub Pages does not let me set response headers.
- Anything that makes the site serve content it should not, including a file
  that was meant to stay out of the build.
- Metadata left in a published image or PDF — location, device, or anything
  identifying beyond authorship.
- The GitHub Actions workflow in `.github/workflows/`, or anything that could
  influence what gets deployed.

Known, and not a finding:

- The contact address is stored and rendered as HTML entities inside its
  `mailto:` href. That defeats a scraper reading raw HTML and not one that
  parses the document first. It is not meant to.
- Response headers set by GitHub Pages rather than by this repository.
- Output from an automated scanner with no demonstrated impact on this site.
