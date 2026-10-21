## What and why
<!-- One or two sentences: what a reader of the site will see differently, and why. -->

## Pages
<!-- Links to the changed pages on the deploy preview. -->

## Facts used
<!-- Every number, price, client name or claim in the change, and where it comes from
     (_data/facts.json, _data/site.json, the task, an ERP export). "None" if no new facts. -->

## Open questions for Frederik
<!-- TODOs left in the copy, wording choices, anything you were not sure of. "None" if none. -->

## Checklist
- [ ] `npm run build` passes locally (clean build)
- [ ] EN and DA both changed (platform pages)
- [ ] New images: added with `npm run photo` (source recorded), alt text in the page's language
- [ ] Case: client named only with written consent (`clientConsent: true`, say where it comes from), or anonymised; `sources` for every number
- [ ] Only content paths changed, within the size limits (`npm run check:paths`)
- [ ] No forms submitted on the deploy preview
