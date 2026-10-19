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
    const allColumns = document.querySelectorAll('.service-column');
    const isExpanded = column.classList.contains('expanded');
    const serviceType = column.getAttribute('data-service');

    // Reset all columns
    closeExpandedContent();

    if (!isExpanded) {
        // Expand clicked column and collapse others
        column.classList.add('expanded');
        allColumns.forEach(col => {
            if (col !== column) {
                col.classList.add('collapsed');
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
    expandedContent.className = 'expanded-content';
    expandedContent.innerHTML = `

        <div class="expanded-layout">
            <div class="expanded-content-left">
                <button class="btn--icon expanded-close-btn" data-action="close-expanded">
                    <iconify-icon icon="fluent:arrow-reply-20-filled" inline></iconify-icon>
                </button>
                <h3 class="expanded-title">${service.title}</h3>
                <p class="expanded-description">${service.description}</p>

                <div class="specialomrader-section">
                    <h4 class="specialomrader-title">Specialområder</h4>
                    <div class="grid grid--2">
                        ${service.categories.map(category => `
                            <div class="specialomrade">
                                <h5 class="specialomrade-title">${category.name}</h5>
                                <ul class="specialomrade-list">
                                    ${category.items.map(item => `
                                        <li class="specialomrade-item">${item}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="expanded-content-right">
                <div class="expanded-image">
                    <img src="/images/service/${getImageName(serviceType)}.webp" alt="${service.title}" class="expanded-image__photo" loading="lazy" decoding="async">
                </div>
                <div class="benefits-section">
                    <h4 class="benefits-title">Hvorfor DFMG</h4>
                    <div class="grid grid--2 grid--tight benefits-grid">
                        ${service.features.map(feature => `
                            <div class="card--benefits">
                                <iconify-icon icon="fluent:checkmark-20-filled" inline class="benefits-icon"></iconify-icon>
                                <span class="benefits-text">${feature}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="expanded-actions">
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

    const allColumns = document.querySelectorAll('.service-column');
    allColumns.forEach(col => {
        // Hide expanded content immediately before removing
        const expandedContent = col.querySelector('.expanded-content');
        if (expandedContent) {
            expandedContent.style.opacity = '0';
            expandedContent.style.visibility = 'hidden';
            // Remove after a brief moment to allow for smooth visual transition
            setTimeout(() => {
                if (expandedContent.parentNode) {
                    expandedContent.remove();
                }
            }, 50);
        }
        col.classList.remove('expanded', 'collapsed');
    });
}
// Add click handlers to service columns
document.querySelectorAll('.service-column').forEach(column => {
    column.addEventListener('click', () => toggleService(column));
});

// Close expanded content via data-action
document.addEventListener('click', (e) => {
    if (!e.target || typeof e.target.closest !== 'function') return;
    if (e.target.closest('[data-action="close-expanded"]')) {
        closeExpandedContent(e);
        return;
    }
});

// Close expanded service when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.service-column')) {
        document.querySelectorAll('.service-column').forEach(col => {
            col.classList.remove('expanded', 'collapsed');
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
