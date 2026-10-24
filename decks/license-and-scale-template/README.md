# Live Workshop Landing Page Template

Static HTML template inspired by the visual structure of the License & Scale workshop page. It is isolated from the Infinittà Partners prospect-deck pages.

## Preview
Once deployed with the repository, open:
`/decks/license-and-scale-template/`

## Customize
Open `index.html` and edit the `SETTINGS` object near the bottom of the file:
- `brand`, `topTag`, `dateLabel`, `workshopDate`
- `headlineBefore`, `headlineAccent`, `subhead`
- `sectionTitle`, `bullets`, `ctaText`, `microcopy`
- `rating`, `avatarUrls`, `privacyUrl`, `footer`
- `registrationUrl`: when set to a real URL, both CTA buttons open it in a new tab. Leave blank to show the demo registration modal.

## Important before using for a prospect
- Replace all copy and the date/time with prospect-specific details.
- Replace demo portraits and social proof with approved, real assets; do not imply that placeholder ratings or testimonials are real.
- Connect the form to the prospect's CRM / registration provider, or set `registrationUrl` to their opt-in page.
- Update privacy, disclaimers, favicon, and metadata.
- The countdown uses `workshopDate` as an ISO 8601 date with timezone.

This is a standalone static page: no build step or framework required.
