# Bundled fonts for Typst document generation

Fonts in this folder are supplied to the Typst compiler (via `--font-path`)
when generating PDF documents from `.typzip`/`.typ` templates. Typst is run
with `--ignore-system-fonts`, so **only** these fonts, fonts included inside a
template bundle, and the fonts embedded in the typst binary itself (Libertinus
Serif, New Computer Modern, DejaVu Sans Mono) are available to templates. This
makes font resolution identical across dev machines and production — a
template that renders correctly locally cannot hit missing fonts when
deployed.

Current contents: the **Liberation** family v2.1.5 (Sans / Serif / Mono),
which is metric-compatible with Arial / Times New Roman / Courier New. We
cannot redistribute those Microsoft fonts themselves, so templates wanting an
"Arial look" should use `font: "Liberation Sans"` (or a fallback stack like
`("Arial", "Liberation Sans")`).

Liberation fonts are licensed under the SIL Open Font License (see LICENSE /
AUTHORS in this folder, which must be kept alongside the font files). Source:
https://github.com/liberationfonts/liberation-fonts (release 2.1.5).

To add a font for all templates, drop the `.ttf`/`.otf` here (subfolders are
fine — the directory is scanned recursively) **and check its license permits
redistribution and embedding**. A font needed by just one template can instead
be included in that template's `.typzip` bundle.
