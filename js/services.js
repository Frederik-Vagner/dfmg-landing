// Service pillar interaction
const serviceDetails = {
    cleaning: {
        title: "Erhvervsrengøring",
        badge: "Mest Populære",
        url: "/pages/facility/services/rengoering.html",
        description: "Erhvervsrengøring af kontorer, skoler, restauranter og eventlokaler med fokus på kvalitet og bæredygtighed.",
        detailedDescription: "Vores erfarne rengøringsteams leverer konsistent høj kvalitet gennem faste processer og miljøvenlige produkter.",
        categories: [
            {
                name: "Kontorrengøring",
                items: ["Daglig eller ugentlig service", "Gulvbehandling og støvsugning", "Sanitær og køkkenfaciliteter", "Papirkurve og affaldssortering"]
            },
            {
                name: "Restauranter & Caféer",
                items: ["Køkkenrengøring og fedtfjerning", "Ventilationsrensning via samarbejdspartner", "Fødevaresikkerhed", "Specialudstyr til foodservice"]
            },
            {
                name: "Skoler & Institutioner",
                items: ["Børnevenlige produkter", "Desinfektion og hygiejne", "Klasseværelser og fællesarealer", "Legepladser og udendørs områder"]
            }
        ],
        features: [
            "Miljøvenlige og allergivenlige produkter",
            "Faste og forsikrede medarbejdere",
            "Fleksible tidsplaner der passer jeres drift",
            "Digital rapportering og kvalitetskontrol"
        ]
    },
    property: {
        title: "Ejendomsservice",
        url: "/pages/facility/services/ejendomsservice.html",
        description: "Vedligeholdelse af trapper, opgange, elevatorer og udendørs områder.",
        categories: [
            {
                name: "Fællesarealer & Opgange",
                items: ["Daglig rengøring", "Gulvbehandling", "Belysning", "Mindre reparationer"]
            },
            {
                name: "Udendørs Områder",
                items: ["Græsslåning", "Ukrudtsbekæmpelse", "Snerydning", "Affaldshåndtering"]
            }
        ],
        features: [
            "Proaktiv vedligeholdelse",
            "Akut hjælp efter aftale",
            "Fagopgaver via samarbejdspartner",
            "Digital rapportering"
        ]
    },
    handyman: {
        title: "Handyman Services",
        url: "/pages/facility/services/handyman.html",
        description: "Reparationer, vedligeholdelse og møbelmontering med hurtig responstid.",
        categories: [
            {
                name: "VVS & El via samarbejdspartner",
                items: ["Vandhane reparationer", "Belysning", "Mindre lækager", "Udføres via samarbejdspartner"]
            },
            {
                name: "Maling & Spartling",
                items: ["Væg- og loftsmaling", "Spartling", "Træværk", "Professionelt finish"]
            }
        ],
        features: [
            "Bred ekspertise",
            "Akut service",
            "Fagopgaver via samarbejdspartner",
            "Garanti på arbejde"
        ]
    },
    supplies: {
        title: "Supplies & Produkter",
        url: "/pages/facility/services/produkter.html",
        description: "Hygiejneprodukter og office supplies med automatisk påfyldning.",
        categories: [
            {
                name: "Hygiejneprodukter",
                items: ["Sæbe og desinfektion", "Toiletpapir", "Affaldssække", "Dispensere"]
            },
            {
                name: "Office Supplies",
                items: ["Printerpapir", "Kaffe og te", "Rengøringsmidler", "Kontorprodukter"]
            }
        ],
        features: [
            "Automatisk påfyldning",
            "Konkurrencedygtige priser",
            "Miljøvenlige produkter",
            "Digital bestilling"
        ]
    },
    piccoline: {
        title: "Piccoline Ordning",
        url: "/pages/facility/services/picoline.html",
        description: "Mindre administrative opgaver og specialopgaver der gør hverdagen nemmere.",
        categories: [
            {
                name: "Administrative Opgaver",
                items: ["Dokumenthåndtering", "Datarengøring", "Mødetilberedelse", "Korrespondance"]
            },
            {
                name: "Praktiske Opgaver",
                items: ["Indkøb", "Levering", "Inventar", "Event-support"]
            }
        ],
        features: [
            "Fleksible løsninger",
            "Hurtig responstid",
            "Erfarne specialister",
            "Digital opgavestyring"
        ]
    },
    windows: {
        title: "Vinduespolering",
        url: "/pages/facility/services/vinduespudsning.html",
        description: "Professionel vinduesrens indvendig og udvendig.",
        categories: [
            {
                name: "Indvendig Vinduesrens",
                items: ["Vinduesflader", "Karme og riller", "Glaspartitioner", "Specialbehandling"]
            },
            {
                name: "Udvendig Polering",
                items: ["Højdearbejde via samarbejdspartner", "Facade og rammer", "Solafskærmning", "Tagvinduer"]
            }
        ],
        features: [
            "Miljøvenlige midler",
            "Erfarne vinduespolere",
            "Fuld forsikring"
        ]
    }
};

function toggleService(column) {
    const allColumns = document.querySelectorAll('.panels__item');
    const isExpanded = column.classList.contains('panels__item--open');
    const serviceType = column.getAttribute('data-service');

    // Reset all columns
    closeExpandedContent();

    if (!isExpanded) {
        // Expand clicked column and collapse others
        column.classList.add('panels__item--open');
        allColumns.forEach(col => {
            if (col !== column) {
                col.classList.add('panels__item--closed');
            }
        });

        // Add detailed content overlay
        showExpandedContent(column, serviceType);
    }
}

function getImageName(serviceType) {
    const imageMap = {
        'property': 'janitor',
        'piccoline': 'picoline',
        'cleaning': 'cleaning',
        'handyman': 'handyman',
        'supplies': 'delivery',
        'windows': 'windowcleaning'
    };
    return imageMap[serviceType] || serviceType;
}

function showExpandedContent(column, serviceType) {
    const service = serviceDetails[serviceType];
    if (!service) return;

    const expandedContent = document.createElement('div');
    expandedContent.className = 'panels__detail';
    expandedContent.innerHTML = `

        <div class="panels__detail-layout">
            <div class="panels__detail-main">
                <button class="icon-button panels__close" data-action="close-expanded">
                    <iconify-icon icon="fluent:arrow-reply-20-filled" inline></iconify-icon>
                </button>
                <h3 class="panels__detail-title">${service.title}</h3>
                <p class="panels__detail-text">${service.description}</p>

                <div class="panels__specialties">
                    <h4 class="panels__specialties-title">Specialområder</h4>
                    <div class="grid grid--fit">
                        ${service.categories.map(category => `
                            <div class="panels__specialty-group">
                                <h5 class="panels__specialty-title">${category.name}</h5>
                                <ul class="checklist checklist--success checklist--compact">
                                    ${category.items.map(item => `
                                        <li><iconify-icon icon="fluent:checkmark-20-filled" inline></iconify-icon> ${item}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="panels__detail-aside stack stack--loose">
                <div class="panels__detail-image">
                    <img src="/images/service/${getImageName(serviceType)}.webp" alt="${service.title}" class="panels__detail-photo" loading="lazy" decoding="async">
                </div>
                <div class="panels__benefits">
                    <h4 class="panels__benefits-title">Hvorfor DFMG</h4>
                    <ul class="checklist checklist--success grid grid--fit grid--tight">
                        ${service.features.map(feature => `
                            <li><iconify-icon icon="fluent:checkmark-20-filled" inline></iconify-icon> ${feature}</li>
                        `).join('')}
                    </ul>
                </div>

                <div class="panels__detail-actions">
                    <a href="${service.url}" class="btn btn--primary btn--md">
                        <iconify-icon icon="fluent:info-20-filled" inline></iconify-icon> Læs Mere
                    </a>
                    <a href="/pages/facility/kontakt.html" class="btn btn--secondary btn--md">
                        <iconify-icon icon="fluent:calculator-20-filled" inline></iconify-icon> Få Tilbud
                    </a>
                </div>
            </div>
        </div>
    `;

    column.appendChild(expandedContent);
}

function closeExpandedContent(event) {
    // Prevent event bubbling to parent elements
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }

    const allColumns = document.querySelectorAll('.panels__item');
    allColumns.forEach(col => {
        // Hide panels__item--open content immediately before removing
        const expandedContent = col.querySelector('.panels__detail');
        if (expandedContent) {
            expandedContent.classList.add('panels__detail--closing');
            // Remove after a brief moment to allow for smooth visual transition
            setTimeout(() => {
                if (expandedContent.parentNode) {
                    expandedContent.remove();
                }
            }, 50);
        }
        col.classList.remove('panels__item--open', 'panels__item--closed');
    });
}
// Add click handlers to service columns
document.querySelectorAll('.panels__item').forEach(column => {
    column.addEventListener('click', () => toggleService(column));
});

// Close panels__item--open content via data-action
document.addEventListener('click', (e) => {
    if (!e.target || typeof e.target.closest !== 'function') return;
    if (e.target.closest('[data-action="close-expanded"]')) {
        closeExpandedContent(e);
        return;
    }
});

// Close panels__item--open service when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.panels__item')) {
        document.querySelectorAll('.panels__item').forEach(col => {
            col.classList.remove('panels__item--open', 'panels__item--closed');
        });
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
