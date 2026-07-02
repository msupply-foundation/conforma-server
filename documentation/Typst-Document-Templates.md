# Typst Document Templates

Conforma generates PDF documents (licenses, certificates, permits…) with the [Generate Document](List-of-Action-plugins.md#generate-document) action. The original templating engine, [Carbone](https://carbone.io/), depends on a LibreOffice installation and is no longer actively maintained, so we are **migrating to [Typst](https://typst.app/)** — a modern markup-based typesetting system whose compiler is a single fast native binary ([#1149](https://github.com/msupply-foundation/conforma-server/issues/1149)). Carbone still works, but is aimed for deprecation: **use Typst for all new document templates.**

Which engine renders a document is decided per template file, by extension: `.typzip` (or bare `.typ`) → Typst; anything else → Carbone. Everything else about the action — parameters, data assembly, where the output PDF lands, the resulting "file" record — is identical between the two.

Typst reference documentation: https://typst.app/docs

## The `.typzip` bundle format

A Typst document template is uploaded to Conforma as a single **`.typzip`** file: an ordinary zip archive (renamed) containing everything the template needs:

| File            | Required | Purpose                                                                                                                    |
| --------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `main.typ`      | yes      | The template entry point                                                                                                     |
| `defaults.json` | yes      | Fallback values for **every** data field the template reads — guarantees missing data can never crash a render (see below)  |
| `sample.json`   | no       | Realistic sample data, used by the validation script and for previewing                                                      |
| anything else   | no       | Images, fonts, partial `.typ` files — referenced from `main.typ` by path relative to the bundle root                        |

All files must sit at the **root** of the zip (no enclosing folder — zip the files, not the folder containing them; subfolders for assets are fine). A bare `.typ` file can also be uploaded and is treated as a bundle-of-one — only suitable for experiments, since it can carry no images and, more importantly, no `defaults.json`.

Unlike `.odt` files (which are themselves zips carrying their images), a `.typ` file is plain text — that's why assets travel alongside it in the bundle, and why the bundle is the unit of upload.

## Writing a template

The server injects the action's data as a JSON file; every template starts with this prelude to read it:

```typst
#let d = if "datafile" in sys.inputs {
  json(sys.inputs.datafile)
} else {
  json(bytes(sys.inputs.data))
}
```

After that, `d` is the full data object, and Typst's normal language features drive the layout:

```typst
#set page(paper: "a4", margin: 2.54cm)
#set text(font: "Liberation Sans", size: 12pt)

#align(center, image("logo.png", width: 3cm))   // an image from the bundle

#align(center, text(size: 14pt, weight: "bold")[#d.orgName])

#if d.additionalData.isRenewal [This permit is a *renewal*.]

#table(
  columns: (1fr, auto, auto),
  table.header([*Product*], [*Qty*], [*Expiry*]),
  ..d.additionalData.tableData.map(row => (
    [#row.prodDescription.value.text],
    [#row.numUnits.value.number],
    [#row.expDate.value.text],
  )).flatten()
)
```

The data object has the same shape as for Carbone templates (see [Generate Document](List-of-Action-plugins.md#generate-document)):

```
{ ...applicationData, ...outputCumulative, ...data(mapped), additionalData }
```

## `defaults.json` and missing data

Typst is stricter than Carbone: dereferencing a field that isn't in the data (`#d.reviewData.reviewer.firstName` when `reviewData` is absent) is a **compile error**, failing the whole action. `defaults.json` closes that gap — before rendering, the server deep-merges the action's data *over* the defaults, so every field the template reads is guaranteed to exist.

Merge semantics (implemented in `src/components/files/documentGenerateTypst.ts`):

- Objects merge recursively — defaults fill only the gaps, at any depth
- Arrays and scalar values present in the live data are used **wholesale** (default array entries are never blended into real rows)
- `null` in live data counts as missing — the default is used
- Every substitution is logged to the server console: `WARNING: Data fields missing for Typst template <id>, defaults used for: ...`

So `defaults.json` doubles as the template's **data contract**: a complete skeleton of every path the template touches, usually with empty-string/empty-array values. The validation script (below) enforces this by compiling the template with the defaults alone.

Note that defaults guarantee *presence*, not *type*. In display position Typst is forgiving — `null` renders as blank, numbers render as text, even objects render (as their code representation) — but in computation position types are strict: `"Total: " + d.n` fails if `n` is a number (use `str(d.n)`), and `#if d.flag` fails if `flag` isn't a boolean.

## Fonts

Font resolution is **deterministic**: the compiler runs with `--ignore-system-fonts`, so the only fonts available are

1. the server's bundled [`fonts/`](https://github.com/msupply-foundation/conforma-server/tree/develop/fonts) folder,
2. any font files included in the template bundle itself, and
3. the fonts embedded in the Typst binary.

A template that renders correctly in dev therefore cannot hit missing fonts in production. Run **`yarn listFonts`** for the authoritative list of family names templates can use — names come from the fonts' internal metadata, never from filenames. The available families (at time of writing):

| Family                                                    | Type                                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Liberation Sans** / **Liberation Serif** / **Liberation Mono** | Metric-compatible with Arial / Times New Roman / Courier New                     |
| **Carlito**                                               | Metric-compatible with Calibri                                                   |
| **Caladea**                                               | Metric-compatible with Cambria                                                   |
| **Noto Sans** / **Noto Serif**                            | General purpose, very wide Unicode/language coverage                             |
| **Roboto**                                                | General-purpose sans                                                             |
| **Montserrat**                                            | Geometric sans — headings                                                        |
| **Archivo**                                               | Grotesque sans — headings (Black weight available; Condensed in Regular/Bold)    |
| **Oswald**                                                | Condensed sans — headings (no italics)                                           |
| **Raleway**                                               | Elegant sans — headings                                                          |
| **Playfair Display**                                      | High-contrast serif — headings/certificates                                      |
| **DM Serif Display**                                      | Contemporary display serif — headings                                            |
| **EB Garamond**                                           | Classic old-style serif — formal documents/certificates                          |
| **Cormorant Garamond**                                    | Delicate display Garamond — large sizes only                                     |
| **Libertinus Serif**                                      | Embedded in the Typst binary (the default font, and fallback for unknown families) |
| **New Computer Modern** (+ **Math**)                      | Embedded in the Typst binary                                                     |
| **DejaVu Sans Mono**                                      | Embedded in the Typst binary                                                     |

Individual faces within a family are selected with `weight` (`"bold"`, `600`, …), `style` (`"italic"`), and `stretch` (`75%` = Condensed) — Typst picks the closest available face rather than erroring, and an entirely unknown family is a logged warning with fallback to Libertinus Serif, not a failed render.

There are no Microsoft fonts (they can't be redistributed) — use the metric-compatible substitutes above. To make a new font available to all templates, add it to the `fonts/` folder (see the README there for licensing requirements); a font needed by just one template can instead travel inside its `.typzip` bundle.

## Validating a bundle

```bash
yarn validateTypst <path> [<path> ...]
```

where each `<path>` is a `.typzip` file, an **unpacked bundle folder** (containing `main.typ`), a bare `.typ`, or a folder holding several of those. For each bundle it checks:

1. Structure — `main.typ` and `defaults.json` at the root, JSON files parse
2. Compiles with **defaults alone** — proving no data shape can crash it
3. Compiles with `sample.json` (if present) merged over the defaults
4. No unknown-font warnings — validation runs through the server's own render function with the same font restrictions as production

Output PDFs are written to `__typst_cache/_validation/<name>/` for visual review, and the script exits non-zero on failure (CI-friendly). Validating an unpacked folder additionally writes the ready-to-upload `<folder>.typzip` next to it on success — so the authoring loop is: edit files in a folder → `yarn validateTypst myTemplate/` → inspect PDFs → upload the emitted `.typzip`.

## Under the hood / deployment

- On first use, a bundle is extracted to `__typst_cache/<file uniqueId>/` and cached there permanently (uploaded files are immutable). The cache is safe to delete — bundles re-extract on demand.
- Each render writes the merged data to a temporary JSON file inside the bundle folder and invokes the CLI roughly as: `typst compile --root <bundle> --ignore-system-fonts --font-path fonts --font-path <bundle> --input datafile=/<tmp>.json main.typ <output>.pdf`. Renders are fast — typically tens of milliseconds, vs seconds for Carbone/LibreOffice.
- **Dev setup:** install the CLI (`brew install typst` on macOS) — it must be on the PATH, or pointed at via the `TYPST_BIN` env variable. Compile errors surface in the action's `error_log`, with the offending template line quoted.
- **Docker:** the image downloads a **pinned** Typst release (`TYPST_VERSION` in `docker/Dockerfile`). Typst syntax evolves between minor versions, so version bumps should be deliberate: bump the Dockerfile, update local CLIs to match, and re-run `yarn validateTypst` over all known bundles.

## Gotchas

- **Don't use `@preview` package imports** (e.g. from the Typst package registry) in templates — they trigger a network download at render time, which is not supported on production servers. Shared helper code can be included in the bundle as additional `.typ` files and `#import`-ed by relative path.
- The `options` parameter of the generateDoc action (Carbone localisation settings) is ignored for Typst templates — do date/currency formatting upstream in the action's data expressions, or in the template itself.
- Templates can only read files inside their own bundle (`--root` is the unpacked bundle folder) — they cannot reference other uploaded files or server paths.
