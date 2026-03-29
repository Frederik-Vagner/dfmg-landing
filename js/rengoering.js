        let currentTab = 'kontor';

        function switchTab(tabName) {
            currentTab = tabName;

            // Update button styles
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');

            // Update table content
            updateTableContent();
        }

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
