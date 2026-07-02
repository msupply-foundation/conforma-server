/**
 * TO_DO — Typst document template bundle validator (placeholder)
 *
 * Validates `.typzip` document template bundles before they're uploaded to a
 * Conforma instance. A `.typzip` is a zip archive containing:
 *   - main.typ        (required) the template entry point
 *   - defaults.json   (required) fallback values for every data field the
 *                     template reads — deep-merged under the live action data
 *                     at render time so missing fields never crash a compile
 *   - sample.json     (optional) realistic sample data for preview/testing
 *   - any images/assets/partial .typ files the template references
 *     (paths relative to the bundle root)
 *
 * Planned behaviour (run against one bundle path, or a folder of bundles):
 *   1. Structural checks: is a valid zip, contains main.typ and defaults.json,
 *      no entries that escape the bundle root (zip-slip)
 *   2. Compile with defaults.json ALONE — must succeed. This proves every
 *      field the template dereferences is covered by a default, i.e. the
 *      template can never fail on missing data.
 *   3. Compile with sample.json merged over defaults.json — must succeed;
 *      write the output PDF(s) somewhere inspectable for visual review.
 *   4. Compile with --ignore-system-fonts, using only the server's bundled
 *      font directory plus any fonts inside the bundle itself, and treat
 *      "unknown font family" warnings as failures. This makes validation
 *      match the deterministic font environment used at render time, so a
 *      bundle that validates on a dev Mac cannot hit missing fonts in
 *      Docker/Linux.
 *   5. Exit non-zero on any failure so this can run in CI.
 *
 * Planned usage (add alias to package.json scripts when implemented):
 *   yarn validate_doc_templates <path-to-bundle-or-folder>
 */

console.log(
  'TO_DO: validateTypstBundles is not implemented yet — see the comments in utils/validateTypstBundles.ts'
)
