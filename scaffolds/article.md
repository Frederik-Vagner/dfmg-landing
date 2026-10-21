---
# Ny artikel. Lav den med: npm run new -- article <kategori> <navn>
# Felterne tjekkes af buildet (tools/schemas.js). Indhold og tone: docs/brief-facility.md.
title: "TODO: Titel til søgeresultater, højst 65 tegn | DFMG"
description: "TODO: Beskrivelse til søgeresultater på 70–160 tegn. Hvad lærer læseren, og hvorfor er det relevant for dem?"
articleTitle: "TODO: Overskriften på siden"
date: __DATE__
readTime: 5
author: dfmg
# Eget foto: npm run photo -- <pexels-link> article/<navn> --slot artikel-__SLUG__ --kind hero
# Uden foto bruges standardbilledet. Alt-teksten siger, hvad billedet viser.
# image: /images/article/<navn>.webp
# imageAlt: "Hvad billedet viser, på dansk"
excerpt: "TODO: En eller to sætninger til kortene og boksen øverst i artiklen: hvad læseren får ud af at læse den (80–220 tegn)."
---

{#- Skabelon. Disse kommentarer er noter til dig og vises ikke på siden.
    Skriv til "I/jer", konkret og roligt. Tal og fakta kun fra _data/facts.json
    som {{ facts.area }} osv. Ingen opfundne tal, kunder eller citater.
    Overskrifter: ## for afsnit, ### for underafsnit, med stort kun i første ord. -#}

TODO: Indledning på to–tre sætninger, der beskriver problemet, som læseren kender det.

## TODO: Første afsnit

TODO: Tekst.

## TODO: Andet afsnit

TODO: Tekst. En praktisk liste eller tjekliste gør artiklen nyttig:

- TODO: Punkt
- TODO: Punkt
- TODO: Punkt

{# En boks fremhæver én pointe. Grøn boks: callout "success". Slet den, hvis den ikke trænger. #}
{% callout %}
TODO: Pointen i én eller to sætninger.
{% endcallout %}

## TODO: Tredje afsnit

TODO: Tekst.

**TODO: Afslutning, der peger på kontakt.** Fx: Vil I høre, hvordan det kunne se ud hos jer? [Kontakt os](/pages/facility/kontakt.html) for en uforpligtende snak.
