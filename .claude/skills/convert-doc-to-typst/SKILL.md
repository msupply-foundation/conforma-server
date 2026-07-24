---
name: convert-doc-to-typst
description: Convert an office document (a Word/.docx design mockup, an existing Carbone .odt template, or an Apple Pages file) into a Conforma Typst .typzip document-template bundle. Use when building a new Conforma PDF document template from a supplied Word design, or porting a Carbone template to Typst. Produces a validated main.typ + defaults.json + sample.json + assets bundle.
---

# Convert an office document into a Typst `.typzip` bundle

Turns a supplied document design into a Conforma Typst bundle that the
`generateDoc` action renders. Inputs, in expected order of frequency:

1. **Word `.docx`** — the common case. A *design mockup* of the finished
   document (what a certificate/permit should look like) with data locations
   marked using **Carbone-style markers** (`{d.name.first}`, see step 2).
2. **Carbone `.odt`** — an existing template being ported to Typst; same
   `{d.field}` markers plus Carbone loop patterns.
3. **Apple Pages `.pages`** — handle by exporting to Word first (see step 1c).

Data placeholders are written **Carbone-style** across all input formats:
`{d.path.to.field}`. This is deliberate — the `d.` prefix maps 1:1 onto the
Typst data object (`d`), so `{d.name.first}` becomes `#d.name.first`.

Read
[documentation/Typst-Document-Templates.md](../../../documentation/Typst-Document-Templates.md)
first — it is the source of truth for the bundle format, data handling, fonts,
and validation. This skill is the *conversion procedure*; that doc is the *spec*.

## What you're producing

A folder that validates into a `.typzip`:

```
<template-name>/
  main.typ        # entry point (prelude + layout)
  defaults.json   # a fallback for EVERY field main.typ reads (no-crash contract)
  sample.json     # realistic sample data for preview/validation
  _source/        # the ORIGINAL source doc, kept for future diff-based edits
  <assets>        # logos/seals/images, referenced by relative path
```

Work in a scratch folder, not in the repo. The end artifact is the `.typzip`
that `yarn validateTypst` emits.

## Procedure

### 1. Extract the source content, layout, and images

Office formats are zips. You need three things: the body text (+ any data
markers), the page setup (size + margins), and the embedded images.

**1a. Word `.docx`** (primary):

```bash
mkdir extract && cd extract
unzip -o "/path/to/design.docx"
xmllint --format word/document.xml > document_pretty.xml   # structure + layout
ls word/media/                                             # embedded images
# Plain text, one paragraph per line, with markers REASSEMBLED (see hazard below):
sed -e 's/<\/w:p>/\n/g' -e 's/<[^>]*>//g' word/document.xml > document_text.txt
```

- **Run-splitting hazard:** Word stores text as "runs", and a single marker can
  be fragmented across `<w:t>` elements — `{d.name.` in one run, `first}` in the
  next — triggered by spell-check, tracked changes, or formatting applied
  mid-marker. So a marker may NOT appear contiguously in `document.xml`, and a
  raw grep for `{d.` will miss it. Read markers from the tag-stripped
  `document_text.txt` (which concatenates run text), not the raw XML. If a
  marker still looks broken there, ask the author to retype it in one go with
  uniform formatting.
- Page setup is the `<w:sectPr>` block near the end of `document.xml`:
  `<w:pgSz w:w=".." w:h=".."/>` and `<w:pgMar w:top=".." .../>`. Values are in
  **twips** (1440 per inch, 567 per cm) — divide by 1440 for inches. A4 portrait
  is `w:w="11906" w:h="16838"`.
- Fonts appear as `<w:rFonts w:ascii="Arial"/>` on runs, or in
  `word/styles.xml`.

**1b. Carbone `.odt`** (porting an existing template):

```bash
unzip -o "/path/to/template.odt"
xmllint --format content.xml > content_pretty.xml
xmllint --format styles.xml | grep -A2 "page-layout-properties"   # page size/margins
ls Pictures/
```

**1c. Apple Pages `.pages`**: the modern format is not readable XML (compressed
protobuf), so **don't try to parse it directly**. Either ask the user to export
it from Pages (`File ▸ Export To ▸ Word…`) and treat it as `.docx`, or unzip it
and use the embedded `preview.pdf` (`QuickLook/` or `preview.pdf`) purely as a
visual target while you get the text content from the user.

**Copy every image** out into your bundle folder with a sensible name
(`logo.png`, `seal.png`). Typst templates reference assets by path — they can't
be embedded in the plain-text `.typ` the way office zips embed their images.

**Copy the original source document into `<template-name>/_source/`** (keeping
its real filename). It's never rendered — it rides along in the bundle so a
future edit can be done by diffing the author's new version against this
baseline (see "Updating an existing template" below).

> **Optional accelerator:** `pandoc` (3.x) has a Typst writer and can scaffold a
> rough `.typ` from a Word doc: `pandoc design.docx -t typst -o scaffold.typ`.
> It's not installed here by default (`brew install pandoc`), and the output
> always needs manual cleanup and the data-wiring below — but it can save typing
> for text-heavy documents. Skip it for layout-precise designs; hand-translation
> is more reliable there.

### 2. Inventory the data (where the dynamic content goes)

Produce a list of every dynamic value and the data path it comes from — these
become both the Typst dereferences AND the keys `defaults.json` must cover. Each
`{d.path.to.field}` marker is one data path: `{d.orgName}` → `#d.orgName`,
`{d.responses.billLadingNum.text}` → `#d.responses.billLadingNum.text`.

**Loops and conditionals** are the exception — authors are asked NOT to encode
these in Carbone syntax, because a Word design mockup is human-interpreted, not
machine-parsed. Handle whichever form you find:

- **Preferred (annotated mockup):** the author lays out ONE representative row
  or block and annotates it in plain language — "↻ repeats for each
  `d.products`", "only if `d.isRenewal`". Turn these into a `.map()` / `#if`
  (step 3), inferring the per-item field paths from the one example row.
- **Legacy Carbone loop:** a table with `{d.items[i].name}` on one row and
  `{d.items[i+1].name}` on the next is ONE loop over `d.items`, not two rows →
  one `.map()`.

The data shape must match how the `generateDoc` action supplies data — see the
data object in
[Generate Document](../../../documentation/List-of-Action-plugins.md#generate-document):
`{ ...applicationData, ...outputCumulative, ...data(mapped), additionalData }`.
Markers referencing application/response fields resolve against that; custom
values are conventionally nested under `d.additionalData`. If the intended data
source for a marker is ambiguous, ask rather than guess.

### 3. Write `main.typ`

Standard data prelude (copy verbatim), then page setup matching step 1, then
translate the body top-to-bottom.

```typst
#let d = if "datafile" in sys.inputs {
  json(sys.inputs.datafile)
} else {
  json(bytes(sys.inputs.data))
}

#set page(paper: "a4", margin: 2.54cm)   // match the source's page size/margins
#set text(font: "Liberation Sans", size: 12pt)
```

Translation cheat-sheet:

| Source construct       | Typst                                                        |
| ---------------------- | ------------------------------------------------------------ |
| A data placeholder     | `#d.field`                                                   |
| Centered heading       | `#align(center, text(size: 14pt, weight: "bold")[#d.title])` |
| Bold / italic run      | `*bold*` / `_italic_`, or `#text(weight: "bold")[...]`       |
| A repeating table row  | `#table(...)` with `..d.rows.map(r => (...)).flatten()`      |
| Conditional block      | `#if d.someFlag [ ... ]`                                     |
| Embedded image         | `#image("logo.png", width: 3cm)`                             |
| Absolutely-placed box  | `#place(top + left, dx: .., dy: .., block(width: ..)[ .. ])` |

Fonts: map the source's fonts to bundled families — Arial → **Liberation Sans**,
Times New Roman → **Liberation Serif**, Calibri → **Carlito**, Cambria →
**Caladea**. Word's default (Calibri/Aptos) → Carlito is the close match. Never
rely on a system font; the server ignores them. `yarn listFonts` shows the full
set (heading/display faces like Montserrat, Playfair Display, EB Garamond are
available too).

### 4. Write `defaults.json` (the critical file)

The no-crash contract, not decoration. It must contain **every path**
`main.typ` dereferences, so a render with no data still compiles. Rules:

- Mirror the exact nesting the template reads.
- Empty/neutral values: `""` for strings, `[]` for repeating arrays, `0` where a
  number is formatted.
- For array rows, `[]` is the correct default — the `.map()` just yields no
  rows. Do NOT put a sample row here (that goes in `sample.json`).

Step 6 proves mechanically whether you covered everything.

### 5. Write `sample.json`

Realistic data for a good-looking preview: a couple of array rows, plausible
strings/numbers. This is what a reviewer eyeballs. If the template has
conditionals, include data exercising both branches.

### 6. Validate — this is how you know it's right

```bash
yarn validateTypst /path/to/<template-name>/     # the folder
```

Compiles with **defaults alone** (proving no missing-field crash), then with
sample data, checks for unknown fonts, and on success writes the ready-to-upload
`<template-name>.typzip` next to the folder. PDFs land in
`__typst_cache/_validation/<name>/`.

If "defaults alone" fails with `dictionary does not contain key "X"`, your
`defaults.json` is missing path `X` — add it and re-run. Iterate until green.

### 7. Visual review

Open `sample.pdf` (and `defaults.pdf` — it should be a clean blank skeleton, no
errors) and compare against the original. Positioned frames, exact tab stops,
and letter-spacing rarely map 1:1 from office formats — expect to hand-tune
spacing (`#v()`), alignment, and `#place()` for absolutely-positioned elements.
Render a PNG for your own inspection with
`typst compile --ignore-system-fonts --font-path fonts --input datafile=/sample.json <bundle>/main.typ preview.png`.

## Gotchas (learned the hard way)

- **Missing data crashes Typst** (unlike Carbone's silent blanks) — that's the
  entire reason `defaults.json` exists and must be exhaustive.
- **Type strictness in computation**: `#d.n` displays a number fine, but
  `"Total: " + d.n` errors — wrap with `str()`. `#if d.flag` needs a real
  boolean. Nulls render blank in display position but break field access.
- **Loops**: `[i]` / `[i+1]` sibling rows in a Carbone source are a single
  `.map()`, not two literal rows.
- **Images**: copy them into the bundle; reference by relative path.
- **No `@preview` package imports** — they fetch from the network, which
  production servers can't do. Bundle shared `.typ` helpers instead.
- **Don't zip the enclosing folder** — bundle files must be at the zip root. Let
  `yarn validateTypst <folder>/` do the zipping; it gets this right.
- **Single-weight font spinoffs** (e.g. "Archivo Black") collide with their
  parent family — select weights via `weight:` on the base family instead.
- **Word twips**: page/margin numbers in `.docx` are 1440-per-inch; don't paste
  them into Typst as-is (which reads pt/cm/mm/in).

## Updating an existing template

When the author supplies a revised version of a document already converted,
**patch the existing bundle — don't re-convert from scratch** (a rebuild
regresses hand-tuned layout, safe-access wrappers, link reconstruction, etc.).
The bundle carries its own baseline in `_source/`, so:

1. Extract the tag-stripped text of BOTH the embedded `_source/` original and
   the new version (the `sed` one-liner in step 1a), and `diff` them.
2. The diff shows exactly which text/markers/fields changed — make the matching
   surgical edits to `main.typ` (and `defaults.json`/`sample.json` if a field
   was added/removed).
3. Replace the doc in `_source/` with the new version.
4. Re-run `yarn validateTypst` and eyeball the render.

Caveat: a text diff catches content, markers, and structure — but NOT pure
restyling (font/colour/bold changes). For those, compare the *rendered* PDFs
(LibreOffice-render the new source, or just check the new Typst output against
it). Re-convert from scratch only for a structural redesign, where patching is
more error-prone than rebuilding.

## Reference: the first converted template

The medicine import permit (a Carbone `.odt` with a header frame, centered
blocks, a repeating product table, and an embedded seal) was the first port and
exercises every pattern above. If a working example helps, reconstruct it from
the Typst work branch history.
