# MDR1 inventory for AI document fill

A question-by-question look at MDR1 (template 359, version `3lihhi`), recording what each question needs before AI document fill can answer it, and the answer the fictional test documents will give. This is the source of truth for the fixture documents and `expected.json`.

- `sources/` holds the documents as HTML. `node ai-extraction-tests/medicine-registration/generate.mjs` renders them to `documents/` with a local Chrome (set `CHROME` if it isn't in the default macOS location) and `sharp`, which adds the scan and photo effects. The output is committed, so running the extraction doesn't need Chrome.
- `elements.json` is the question list the web-app sent for an application that had already been filled once (so `countrySelect` was "Other"), captured from the request, with the current answers removed. A new application's list is the same without the five questions `countrySelect` reveals: `countriesOfRegistration`, `productDescription`, `exipients`, `containerType` and `advanceSample`. Either way, the regulatory authority's questions and `otherCountrySelect` are missing.
- `expected.json` has the expected answer for each question code. A string, number or list of strings must match the answer (lists in any order). `anyOf` accepts any of its values. `includes` is for long text: each item must appear, and an item that's a list accepts any of its alternatives. `null` means the question should be left blank. The list builders' answers are rows keyed by their fields' codes.

Everything below is fictional. The countries are real because the form's country lists come from a lookup table, but every company, authority, product, number, address, phone and email is invented, and email domains use `.example`. Every document carries a "SPECIMEN – fictional test document" mark.

## The scenario

An importer in Tonga, **Moana Pharma Distributors Ltd**, registers **Kestamol 500** (paracetamol 500 mg film-coated tablets), made by **Kestrel Pharmaceuticals Pvt. Ltd.** in India. The product is registered in India and Sri Lanka, neither of which is on MDR1's list of approved (stringent) regulators.

The scenario takes the "Other" branch of "Select where the product is already registered", which reveals the most questions. The Fiji, Australia and New Zealand branches use product searches against external registers; on those branches, picking a product fills and locks most of the product questions, so AI fill has little left to do there.

## The documents

At most five files can be uploaded at once (the element's limit), so there are exactly five.

| # | Document | Format | Carries |
| --- | --- | --- | --- |
| 1 | WHO-style Certificate of Pharmaceutical Product, from the fictional National Medicines Licensing Office (India) | Typed PDF, 2 pages | Product, active ingredient and strength, dosage form, marketing authorisation number, authorised and marketed in India, manufacturer and site, GMP status, the authority's name, address, phone and email |
| 2 | Summary of product characteristics | Typed PDF, 3 pages | Description, excipients, indications, dosage, route, ATC code, pharmacopoeia, container, pack sizes, shelf life, storage, other registrations (Sri Lanka) |
| 3 | GMP certificate | Skewed, slightly noisy scan (JPEG) | Manufacturer, site address, site activities, the certificate's own number (a distractor for the registration ID) |
| 4 | Carton | Photo at an angle (JPEG) | Brand name, strength, "10 × 10 tablets", storage, manufacturer |
| 5 | Letter of authorisation from Kestrel to Moana Pharma | Scanned, signed letter (PDF) | That the applicant isn't the manufacturer, manufacturer's phone and email |

## The facts

| Fact | Value | Source |
| --- | --- | --- |
| Manufacturer | Kestrel Pharmaceuticals Pvt. Ltd. | 1, 3, 4, 5 |
| Site address | Plot 14, Phase II Industrial Estate, Vadodara 390010, Gujarat, India | 1, 3 |
| Site activities | Manufacture, primary and secondary packaging, and quality control testing of tablets and capsules | 3 |
| Manufacturer phone / email | +91 265 000 1414 / regulatory@kestrel-pharma.example | 5 |
| Brand name | Kestamol 500 | 1, 2, 4 |
| Active ingredient | Paracetamol 500 mg per tablet | 1, 2, 4 |
| Dosage form | Film-coated tablet (the form's option is "Tablet") | 1, 2 |
| Marketing authorisation (India) | NMLO/MA/2019/04417, granted 12 March 2019 | 1 |
| Also registered in | Sri Lanka (SL/REG/2022/0815) | 2 |
| GMP certificate number | GMP/KP/2024/118 (not a registration ID) | 3 |
| Pharmacopoeia | BP | 2 |
| Description | White to off-white, capsule-shaped film-coated tablets, 17.5 mm × 7.3 mm, scored on one side and debossed "K500" on the other | 2 |
| Excipients | Maize starch, pregelatinised starch, povidone K30, stearic acid, magnesium stearate, hypromellose, titanium dioxide (E171), macrogol 400 | 2 |
| Container | Clear PVC/aluminium foil blister strips of 10 tablets, in a printed carton with a package leaflet | 2 |
| Pack sizes | 10 tablets (1 × 10) and 100 tablets (10 × 10) | 2, 4 |
| Shelf life | 3 years | 2 |
| Storage | Do not store above 30 °C. Store in the original package in order to protect from light and moisture. (The carton: "Store below 30 °C. Protect from light and moisture.") | 2, 4 |
| Route | Oral | 2 |
| Indications | Mild to moderate pain (including headache, toothache, period pain and muscular aches) and fever | 2 |
| Dosage | Adults and children 12 years and over: 1–2 tablets every 4–6 hours, at most 8 tablets in 24 hours. Children 6–11 years: ½–1 tablet every 4–6 hours, at most 4 tablets in 24 hours. Not for children under 6. | 2 |
| ATC code | N02BE01 | 2 |
| Regulatory authority | National Medicines Licensing Office, Block C, Sector 10, Gandhinagar 382010, Gujarat, India; +91 79 0000 4410; licensing@nmlo.example | 1 |

Deliberately absent: Tonga's legal class, and whether a sample will be supplied in advance. The fill should leave both blank.

## Question by question

Status is what the fill can do for a new, empty application, with the current build:

- **Today**: visible, editable and of a supported type, so it's sent.
- **Hidden**: a supported type, but hidden until an earlier answer reveals it.
- **List**, **Search**, **File**: an unsupported type.
- **No**: shouldn't be filled from documents at all.

The aiDocumentFill element (`aiFill`, on the first page of `orgInfo`) has no scope, so it covers the whole form.

### Company and manufacturer (`orgInfo`)

| Code | Question | Type | Status | Expected answer |
| --- | --- | --- | --- | --- |
| orgData | (loads the applicant's organisation) | getValues | No | — |
| manName | Name of the Manufacturer | shortText | Today | Kestrel Pharmaceuticals Pvt. Ltd. |
| isManufacturer | Are you the Manufacturer, license/patent holder? | radioChoice | Today | No — but only if the model knows who the applicant is (see findings) |
| manufacturerAuth | Letter of Authorisation | fileUpload | File, hidden until isManufacturer = No | Document 5 |
| manufacturers | Manufacturing Site Location (address, country, activity, phone, email, licence, GMP certificate, other) | listBuilder, max 1 | List | One site, from the facts above; GMP certificate = document 3 |

### Product particulars (`prodParticulars`)

| Code | Question | Type | Status | Expected answer |
| --- | --- | --- | --- | --- |
| mSupplyItemLookup | (legacy, always hidden) | search | No | — |
| mSupplyItem | Corresponding mSupply item | search | No | The supplier's own catalogue; nothing in the documents |
| countrySelect | Where the product is already registered (Fiji / Australia / New Zealand / Other / None) | radioChoice | Today | Other |
| countriesOfRegistration | Which countries (250 countries, multi-select) | dropdownChoice | Hidden until countrySelect = Other | India, Sri Lanka |
| prodSelect | Product in the Fiji / Australian / New Zealand register | search | No (hidden on this branch) | — |
| RegID | Corresponding Registration ID ("first country selected only") | shortText | Today | NMLO/MA/2019/04417 |
| brandName | Brand/Trade Name | shortText | Today | Kestamol 500 |
| Generics | Active substances (substance search, strength, unit) | listBuilder | List (with a search inside) | Paracetamol, 500, mg |
| countrySelectAggregate | (computed) | getValues | No | — |
| trademarkEvidence | Trademark registration evidence | fileUpload | File, hidden until countrySelect | None of the five |
| dosageForm | Dosage form (57 options) | dropdownChoice | Today | Tablet |
| dosageFormGeneral | Dosage form (read-only copy) | shortText | No (hidden on this branch) | — |
| pharmacopeia | Pharmacopeia standard | radioChoice | Today | BP (British Pharmacopeia) |
| productSpecDoc | Product Specification | fileUpload | File, hidden until countrySelect | None of the five |
| productDescription | Description of Product | longText | Hidden until countrySelect | The description |
| exipients | Exipients | longText | Hidden until countrySelect | The excipients |
| containerType | Container Type and Type of Seal | longText | Hidden until countrySelect | The container |
| packSizes | Packaging Sizes (legacy) | listBuilder | No (always hidden) | — |
| packSizesFiji | Packaging Sizes (quantity, unit) | listBuilder | List | 10 Tablet; 100 Tablet |
| storageConditions | Storage conditions | shortText | Today | Below 30 °C, protected from light and moisture |
| shelfLife | Shelf life | shortText | Today | 3 years (or 36 months) |

### Legal class, indication and dosage (`indicationDosage`)

| Code | Question | Type | Status | Expected answer |
| --- | --- | --- | --- | --- |
| legalClass | Medicinal Products Classification (Tonga's classes 1–6) | dropdownChoice | Today | Blank: Tonga's class isn't in any document |
| atcCode | ATC Code and Category | search | Search | N02BE01 (if search is supported) |
| routeAdministration | Route of administration (26 options) | dropdownChoice | Today | Oral |
| prodInfoLeafleet | Product information leaflet | fileUpload | File | Document 2 |
| PIL | Patient information leaflet | fileUpload | File, hidden unless legal class 2A | — |
| recDosage | Recommended dosage | longText | Today | The dosage |
| indications | Recommended clinical indications | longText | Today | The indications |

### Marketing authorisation (`otherCountry`)

| Code | Question | Type | Status | Expected answer |
| --- | --- | --- | --- | --- |
| productAuthInCountryMan | Authorised in the country of manufacture? | radioChoice | Today | Yes |
| otherCountrySelect | Authorisation from recognised regulators (options are the countries chosen earlier) | dropdownChoice | Not sent until countriesOfRegistration is answered (its options are empty until then) | India, Sri Lanka |
| noApprovedCountry | (computed) | getValues | No | — |
| regCertificate | Marketing authorisation from recognised regulators | fileUpload | File | Document 1 |
| whoCpp | WHO CPP | fileUpload | File | Document 1 |
| gmpCert | GMP certificate | fileUpload | File, hidden until countrySelect | Document 3 |
| bioequivalence | Bio-equivalence report | fileUpload | File, hidden until countrySelect | None |
| stabilityStudy | Stability study report | fileUpload | File, hidden until countrySelect | None |
| advanceSample | Sample supplied in advance? | radioChoice | Hidden until countrySelect | Blank: not in any document |
| regAuthName | Name of Regulatory Authority | shortText | Hidden until noApprovedCountry is computed (see findings) | National Medicines Licensing Office |
| regAuthAddress | Address of Regulatory Authority | longText | Hidden, as regAuthName | Block C, Sector 10, Gandhinagar 382010, Gujarat, India |
| regAuthPhone | Contact number | shortText | Hidden, as regAuthName | +91 79 0000 4410 |
| regAuthEmail | Email | shortText | Hidden, as regAuthName | licensing@nmlo.example |
| noAuthReasons | Reasons for non-registration | longText | No (hidden unless countrySelect = None) | — |

### The other sections

| Code | Question | Type | Status | Expected answer |
| --- | --- | --- | --- | --- |
| proofOfPaymentApplicant | Proof of payment (`appFee`) | fileUpload | File | — |
| Declaration-COPY | Declaration ("I agree") | checkbox | Today, but it shouldn't be (see findings) | Blank |

The `reviewer` section's questions are for reviewers: a search, file uploads, and a radio question only visible at the Final Decision stage. None of them is sent to an applicant's fill.

## The tally

| | Questions | With an answer in the documents |
| --- | --- | --- |
| Today | 15 | 12 (legalClass and the declaration should stay blank; isManufacturer needs the applicant's identity) |
| Hidden until an earlier answer or a computed value | 9 | 8 (advanceSample should stay blank) |
| Dependent options (otherCountrySelect) | 1 | 1 |
| List builders | 3 | 3 |
| Searches | 1 useful (atcCode) | 1 |
| File uploads | 11 | 5 |

So a single run today can answer 12 of the form's questions. Revealing hidden questions adds 9 (with otherCountrySelect). List builders add 3 questions, but those are the core of the product: the site, the active substance and the pack sizes.

## Findings

1. **Hidden questions.** Nine answerable questions are hidden in an empty application. Five wait on `countrySelect` (through the computed `countrySelectAggregate`), and the same run that answers `countrySelect` would have to reveal them. `otherCountrySelect` is two steps removed: its options are whatever `countriesOfRegistration` selected.
2. **Computed values are only saved when their page is shown.** The regulatory authority's four questions are visible when `noApprovedCountry` is true, but that `getValues` element only saves its value once its page has been displayed, so in a new application they stay hidden even though their condition would be met. Revealing hidden questions therefore means evaluating `getValues` elements too, not just the visibility conditions.
3. **Who the applicant is.** `isManufacturer` asks whether the applicant is the manufacturer. The documents say Kestrel authorises Moana Pharma, but the model isn't told the applicant is Moana Pharma. The applicant's organisation (`orgData`) could be passed as context.
4. **Dependent options.** `otherCountrySelect` isn't sent until `countriesOfRegistration` has an answer, because its options are the countries chosen there.
5. **Mapping to the form's words.** The documents say "film-coated tablet" and "oral use"; the options are "Tablet" and "Oral". Pack-size units come from a list that combines units of measure and dosage forms. This is what the option lists are for, but it's worth scoring.
6. **Distractor numbers.** The GMP certificate number and the Sri Lankan registration number mustn't end up in `RegID`, which asks for the first selected country's registration.
7. **Declarations.** The `Declaration` checkbox is sent, because a checkbox is a supported type. It should never be filled; this is a TO-DO in the spec. The expected answer is blank, and the model has no reason to answer it from the documents.
8. **Lookup data quality.** One unit in `units` is `mg/mL` followed by a run of tab characters. That's harmless to the fill, but it's what the model would see as an option.
