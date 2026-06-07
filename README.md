# rtsketo Portfolio

Static public-safe portfolio site for `rtsketo.eu`.

This repository intentionally tracks only the deployable public website and safe
deployment notes. Private evidence archives, CV PDFs, generated audits, internal
repo scans and disclosure-review material are kept locally under `private/` and
are ignored by git.

## Run Locally

```sh
python3 -m http.server 8787 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:8787
```

Target domain:

```text
https://rtsketo.eu
```

## Deploy Shape

- `public/` is the web root.
- `Caddyfile` is the local server shape for `rtsketo.eu`.
- `private/` is local-only evidence material and must not be committed.

## Disclosure Rules

- Public-facing app/product names may be used when they are already suitable for portfolio wording.
- Do not add Axiom/internal repo links, internal URLs, private customer details, source paths, ticket IDs, branch names, commit hashes, endpoint details, screenshots, credentials, or private implementation details.
- Public professional work should stay at capability/mechanism level.
- Contact details should only be added after explicit public-use confirmation.
- Personal GitHub links are allowed only for public repositories.
