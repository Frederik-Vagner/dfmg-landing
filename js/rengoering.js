        let currentTab = 'kontor';

        function switchTab(tabName) {
            currentTab = tabName;

            // Update button styles
            document.querySelectorAll('[data-tab]').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

            // Update table content
            updateTableContent();
        }

        // Bind tab buttons via data attributes
        document.querySelectorAll('[data-tab]').forEach(btn => {
            btn.addEventListener('click', () => switchTab(btn.dataset.tab));
        });

        function updateTableContent() {
            const tableData = {
                kontor: [
                    ['Tøm affaldsbeholdere og udskift poser', '3', '✓', '-', '✓', '-', '✓', '-', '-'],
                    ['Sæt stole på plads', '3', '✓', '-', '✓', '-', '✓', '-', '-'],
                    ['Ryd alle borde for glas, kopper, tallerkner og bestik', '3', '✓', '-', '✓', '-', '✓', '-', '-'],
                    ['Aftør borde', '1', '-', '-', '-', '-', '-', '-', '✓'],
                    ['Afstøv inventar og overflader under 1,80m', '1', '-', '-', '-', '-', '-', '-', '✓'],
                    ['Rengør indvendige glas og døre (omkring dørhåndtag)', '1', '-', '-', '-', '-', '-', '-', '✓'],
                    ['Aftør alle siddepladser', '1', '-', '-', '-', '-', '-', '-', '✓'],
                    ['Støvsug og vask gulvoverflader', '1', '-', '-', '-', '-', '-', '-', '✓'],
                    ['Kontrollér hjørner og fjern spindelvæv', '1', '-', '-', '-', '-', '-', '-', '✓'],
                    ['Støvsug og vedligehold tæpper og sofaer', '1 x måned', '-', '-', '-', '-', '-', '-', 'U1']
                ],
                moedelokaler: [
                    ['Tøm affaldsbeholdere og udskift poser', '3', '✓', '-', '✓', '-', '✓', '-', '-'],
                    ['Sæt stole på plads', '3', '✓', '-', '✓', '-', '✓', '-', '-'],
                    ['Ryd alle borde for glas, kopper, tallerkner og bestik', '3', '✓', '-', '✓', '-', '✓', '-', '-'],
                    ['Aftør borde', '1', '-', '-', '-', '-', '-', '-', '✓'],
                    ['Afstøv inventar og overflader under 1,80m', '1', '-', '-', '-', '-', '-', '-', '✓'],
                    ['Rengør indvendige glas og døre (omkring dørhåndtag)', '1', '-', '-', '-', '-', '-', '-', '✓'],
                    ['Aftør alle siddepladser', '1', '-', '-', '-', '-', '-', '-', '✓'],
                    ['Støvsug og vask gulvoverflader', '1', '-', '-', '-', '-', '-', '-', '✓'],
                    ['Kontrollér hjørner og fjern spindelvæv', '1', '-', '-', '-', '-', '-', '-', '✓'],
                    ['Støvsug og vedligehold tæpper og sofaer', '1 x måned', '-', '-', '-', '-', '-', '-', 'U1']
                ],
                koekken: [
                    ['Tøm affaldsbeholdere og udskift poser', '3', '✓', '-', '✓', '-', '✓', '-', '-'],
                    ['Aftør bordplader og skabslåger', '3', '✓', '-', '✓', '-', '✓', '-', '-'],
                    ['Rengør og desinficér vask (afkalkning ved behov)', '3', '✓', '-', '✓', '-', '✓', '-', '-'],
                    ['Aftør spiseborde/loungeborde', '3', '✓', '-', '✓', '-', '✓', '-', '-'],
                    ['Støvsug og vask gulvoverflader', '3', '✓', '-', '✓', '-', '✓', '-', '-'],
                    ['Håndtér opvaskemaskine (tøm, fyld, start ved behov)', '3', '✓', '-', '✓', '-', '✓', '-', '-'],
                    ['Aftør affaldsbeholdere', '1', '-', '-', '-', '-', '-', '-', '✓'],
                    ['Rengør opvaskemaskinens filter', '1', '-', '-', '-', '-', '-', '-', '✓'],
                    ['Aftør stole og lamper (<1,80m) og dørkarme', '1', '-', '-', '-', '-', '-', '-', '✓'],
                    ['Rengør og vedligehold kaffeudstyr', '1', '-', '-', '-', '-', '-', '-', '✓']
                ],
                toilet: [
                    ['Tøm affaldsbeholdere og udskift poser', '3', '✓', '-', '✓', '-', '✓', '-', '-'],
                    ['Støvsug og vask gulvoverflader', '3', '✓', '-', '✓', '-', '✓', '-', '-'],
                    ['Rengør og desinficér håndvask, armatur, toiletskål og toiletbørste', '3', '✓', '-', '✓', '-', '✓', '-', '-'],
                    ['Rengør spejle', '3', '✓', '-', '✓', '-', '✓', '-', '-'],
                    ['Aftør papir- og sæbebeholdere', '3', '✓', '-', '✓', '-', '✓', '-', '-'],
                    ['Genopfyld papir og sæbe (hvis nødvendigt)', '3', '✓', '-', '✓', '-', '✓', '-', '-'],
                    ['Rengør indvendige glas og døre (omkring dørhåndtag)', '3', '✓', '-', '✓', '-', '✓', '-', '-'],
                    ['Aftør døre, karme og lamper (<1,80m)', '1', '-', '-', '-', '-', '-', '-', '✓'],
                    ['Støv gulvpaneler', '1', '-', '-', '-', '-', '-', '-', '✓'],
                    ['Kontrollér loft og hjørner for spindelvæv', '1', '-', '-', '-', '-', '-', '-', '✓']
                ]
            };

            const sectionNames = {
                kontor: 'KONTOR',
                moedelokaler: 'MØDELOKALER',
                koekken: 'KØKKEN',
                toilet: 'TOILET'
            };

            const tbody = document.querySelector('.schedule-table');
            const data = tableData[currentTab];

            // Update header section name
            tbody.querySelector('.task-col').textContent = sectionNames[currentTab];

            // Clear existing rows except header
            while (tbody.children.length > 1) {
                tbody.removeChild(tbody.lastChild);
            }

            // Add new rows
            data.forEach(row => {
                const rowElement = document.createElement('div');
                rowElement.className = 'schedule-row';
                row.forEach(cell => {
                    const cellElement = document.createElement('div');
                    if (row.indexOf(cell) === 0) cellElement.className = 'task-col';
                    else if (row.indexOf(cell) === 1) cellElement.className = 'freq-col';
                    else cellElement.className = 'day-col';
                    cellElement.textContent = cell;
                    rowElement.appendChild(cellElement);
                });
                tbody.appendChild(rowElement);
            });
        }

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            updateTableContent();
        });

/* ── Specialty photo carousel ──────────────────────────────────────────────
 * Each .service-image-container holds the photos for one specialty, stacked,
 * with dot indicators underneath. The dots in the markup are placeholders
 * until the photos exist, so this only takes over once there is at least one
 * <img class="photo"> to page through — it then rebuilds the dots to match
 * the number of photos actually present, so adding or removing a photo needs
 * no change here.
 *
 * Kept separate from carousel.js on purpose: that one is arrow-driven, moves
 * a .carousel-track, and finds its buttons via container.closest('section').
 * These sit INSIDE that carousel, so reusing it would have the inner and
 * outer carousels fighting over the same selectors.
 */
(function () {
    'use strict';

    function initPhotoCarousel(container) {
        var photos = container.querySelectorAll('img.photo');
        if (!photos.length) {
            // Still a placeholder frame. The dots in the markup describe photos
            // that do not exist yet, so hide them rather than offer navigation
            // through nothing.
            var empty = container.querySelector('.photo-dots');
            if (empty) empty.hidden = true;
            return;
        }

        var dots = container.querySelector('.photo-dots');
        if (!dots) {
            dots = document.createElement('div');
            dots.className = 'photo-dots';
            container.appendChild(dots);
        }
        dots.innerHTML = '';

        var index = 0;
        function show(i) {
            index = (i + photos.length) % photos.length;
            photos.forEach(function (p, n) { p.classList.toggle('active', n === index); });
            dots.querySelectorAll('.photo-dot').forEach(function (d, n) {
                d.classList.toggle('active', n === index);
            });
        }

        photos.forEach(function (_, n) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'photo-dot';
            dot.setAttribute('aria-label', 'Vis billede ' + (n + 1) + ' af ' + photos.length);
            dot.addEventListener('click', function () { show(n); });
            dots.appendChild(dot);
        });

        // One photo needs no navigation.
        dots.hidden = photos.length < 2;

        // Swipe, so the photos are reachable on a phone without aiming at an 8px dot.
        var startX = null;
        container.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
        container.addEventListener('touchend', function (e) {
            if (startX === null) return;
            var dx = startX - e.changedTouches[0].clientX;
            if (Math.abs(dx) > 40) show(index + (dx > 0 ? 1 : -1));
            startX = null;
        });

        show(0);
    }

    function init() {
        document.querySelectorAll('.service-image-container').forEach(initPhotoCarousel);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
