        // Price calculation data
        const WEEKS_PER_MONTH = 4.33;

        const RATES = {
            baseRatePerSqm: { let: 0.6, grundig: 0.9 },
            toiletRate: { let: 100, grundig: 150 },
            kitchenRate: { let: 75, grundig: 112.5 },
            meetingRoomRate: { let: 50, grundig: 75 },
            photoRate: { none: 0, after: 50, 'before-after': 100 },
            discountRates: { 2: 0.10, 3: 0.15, 5: 0.20 },
            taskRates: {
                office: {
                    'waste': { let: 5, grundig: 5 },
                    'light-meeting': { let: 8, grundig: 0 },
                    'deep-meeting': { let: 0, grundig: 15 },
                    'vacuum-floor': { let: 0, grundig: 12 },
                    'wipe-tables': { let: 0, grundig: 8 },
                    'dust-surfaces': { let: 0, grundig: 10 },
                    'dust-shelves': { let: 0, grundig: 6 },
                    'clean-glass': { let: 0, grundig: 4 },
                    'clean-walls': { let: 0, grundig: 3 },
                    'vacuum-furniture': { let: 0, grundig: 5 }
                },
                kitchen: {
                    'waste': { let: 3, grundig: 3 },
                    'vacuum-floor': { let: 8, grundig: 8 },
                    'clean-sink': { let: 5, grundig: 5 },
                    'wipe-surfaces': { let: 6, grundig: 6 },
                    'wipe-tables': { let: 4, grundig: 4 },
                    'dishwasher': { let: 3, grundig: 3 },
                    'clean-filter': { let: 0, grundig: 2 },
                    'wipe-chairs': { let: 0, grundig: 4 },
                    'check-supplies': { let: 0, grundig: 2 },
                    'clean-fridge': { let: 0, grundig: 3 }
                },
                toilet: {
                    'waste': { let: 2, grundig: 2 },
                    'vacuum-floor': { let: 4, grundig: 4 },
                    'clean-sanitary': { let: 8, grundig: 8 },
                    'clean-mirror': { let: 2, grundig: 2 },
                    'wipe-dispensers': { let: 2, grundig: 2 },
                    'refill-supplies': { let: 1, grundig: 1 },
                    'wipe-doors': { let: 0, grundig: 3 },
                    'dust-panels': { let: 0, grundig: 2 },
                    'check-ceiling': { let: 0, grundig: 2 },
                    'clean-glass': { let: 0, grundig: 2 }
                }
            }
        };

        const PHOTO_LABELS = { none: 'Ingen billeder', after: 'Billeder (efter)', 'before-after': 'Billeder (før & efter)' };

        // State management
        let state = {
            sizeMethod: 'area',
            area: 500,
            employees: 15,
            meetingRooms: 4,
            toilets: 3,
            kitchens: 2,
            photos: 'after',
            cleaningDays: ['tuesday', 'thursday', 'sunday'],
            cleaningTypes: {
                'tuesday': 'let',
                'thursday': 'let',
                'sunday': 'grundig'
            },
            serviceMode: 'let'
        };

        function calculatePrice() {
            const area = state.sizeMethod === 'area' ? state.area : state.employees * 25;

            // Query checked tasks once before the loop
            const checkedTasks = document.querySelectorAll('.task-checkbox:checked');

            let baseAreaCost = 0, toiletCost = 0, kitchenCost = 0, meetingRoomCost = 0, taskCostTotal = 0;

            state.cleaningDays.forEach(day => {
                const cleaningType = state.cleaningTypes[day];
                if (cleaningType) {
                    baseAreaCost += area * RATES.baseRatePerSqm[cleaningType] * WEEKS_PER_MONTH;
                    toiletCost += state.toilets * RATES.toiletRate[cleaningType] * WEEKS_PER_MONTH;
                    kitchenCost += state.kitchens * RATES.kitchenRate[cleaningType] * WEEKS_PER_MONTH;
                    meetingRoomCost += state.meetingRooms * RATES.meetingRoomRate[cleaningType] * WEEKS_PER_MONTH;

                    checkedTasks.forEach(checkbox => {
                        const task = checkbox.dataset.task;
                        const section = checkbox.dataset.section;
                        if (task && section && RATES.taskRates[section]?.[task]?.[cleaningType]) {
                            const multiplier = section === 'office' ? 1 :
                                            section === 'kitchen' ? state.kitchens :
                                            section === 'toilet' ? state.toilets : 1;
                            taskCostTotal += RATES.taskRates[section][task][cleaningType] * multiplier * WEEKS_PER_MONTH;
                        }
                    });
                }
            });

            // Photo costs
            const photoRate = RATES.photoRate[state.photos];
            const photoCost = photoRate > 0 ? state.cleaningDays.length * photoRate * WEEKS_PER_MONTH : 0;

            const subtotal = baseAreaCost + toiletCost + kitchenCost + meetingRoomCost + photoCost + taskCostTotal;

            // Frequency discount
            let discount = 0;
            const frequency = state.cleaningDays.length;
            const sortedDiscounts = Object.entries(RATES.discountRates).sort((a, b) => b[0] - a[0]);
            for (const [minFreq, rate] of sortedDiscounts) {
                if (frequency >= parseInt(minFreq)) {
                    discount = rate;
                    break;
                }
            }

            const lines = {
                base: Math.round(baseAreaCost),
                meetings: Math.round(meetingRoomCost),
                toilets: Math.round(toiletCost),
                kitchens: Math.round(kitchenCost),
                photos: Math.round(photoCost),
                tasks: Math.round(taskCostTotal)
            };
            // Without a discount the total is the sum of the rounded lines; with
            // one, the discount is shown in kroner as whatever closes the gap, so
            // the column always adds up exactly.
            const lineSum = Object.values(lines).reduce((a, b) => a + b, 0);
            const total = discount > 0 ? Math.round(subtotal * (1 - discount)) : lineSum;

            return Object.assign(lines, {
                discount: Math.round(discount * 100),
                discountAmount: lineSum - total,
                frequency: frequency,
                total: total
            });
        }

        function getTaskSummary() {
            const totalTasks = document.querySelectorAll('.task-checkbox:checked').length;
            if (totalTasks >= 26) return 'Komplet pakke - alle opgaver';
            if (totalTasks >= 17) return 'Tilpasset pakke';
            if (totalTasks >= 12) return 'Standard pakke';
            return 'Minimal pakke';
        }

        // Update UI
        function updatePriceDisplay() {
            const prices = calculatePrice();
            const area = state.sizeMethod === 'area' ? state.area : state.employees * 25;

            // Update price values via data-price attributes
            document.querySelector('[data-price="base"] [data-value]').textContent = `${prices.base.toLocaleString('da-DK')} kr`;
            document.querySelector('[data-price="meetings"] [data-value]').textContent = `${prices.meetings.toLocaleString('da-DK')} kr`;
            document.querySelector('[data-price="toilets"] [data-value]').textContent = `${prices.toilets.toLocaleString('da-DK')} kr`;
            document.querySelector('[data-price="kitchens"] [data-value]').textContent = `${prices.kitchens.toLocaleString('da-DK')} kr`;
            document.querySelector('[data-price="photos"] [data-value]').textContent = `${prices.photos.toLocaleString('da-DK')} kr`;
            document.querySelector('[data-price="tasks"] [data-value]').textContent = `${prices.tasks.toLocaleString('da-DK')} kr`;
            document.querySelector('[data-price="discount"] [data-value]').textContent = `-${prices.discountAmount.toLocaleString('da-DK')} kr`;
            document.getElementById('monthly-price').textContent = `${prices.total.toLocaleString('da-DK')} kr`;

            // Update dynamic labels
            document.querySelector('[data-price="base"] [data-label]').textContent = `Basispris (${area} m²)`;
            document.querySelector('[data-price="meetings"] [data-label]').textContent = `Mødelokaler (${state.meetingRooms} stk)`;
            document.querySelector('[data-price="toilets"] [data-label]').textContent = `Toiletter (${state.toilets} stk)`;
            document.querySelector('[data-price="kitchens"] [data-label]').textContent = `Køkkener (${state.kitchens} stk)`;
            document.querySelector('[data-price="photos"] [data-label]').textContent = PHOTO_LABELS[state.photos];
            document.querySelector('[data-price="tasks"] [data-label]').textContent = `Opgaver (${document.querySelectorAll('.task-checkbox:checked').length} valgt)`;
            const discountLine = document.querySelector('[data-price="discount"]');
            if (prices.discount > 0) {
                discountLine.style.display = '';
                discountLine.querySelector('[data-label]').textContent = `Rabat ${prices.discount}% (${prices.frequency}x/uge)`;
            } else {
                discountLine.style.display = 'none';
            }

            // Update task summary
            document.getElementById('task-summary-text').textContent = getTaskSummary();
        }

        // Efficient input handling
        document.addEventListener('DOMContentLoaded', function() {
            let timeout;
            function debouncedUpdate() {
                clearTimeout(timeout);
                timeout = setTimeout(updatePriceDisplay, 150);
            }

            // Number fields: a value that isn't a whole number at or above the
            // field's minimum keeps the last good value and says why, instead of
            // pricing "-50 m²" or "abc".
            const NUMBER_FIELDS = {
                'office-area': { key: 'area', message: 'Indtast et areal på mindst 1 m².' },
                'employee-count': { key: 'employees', message: 'Indtast mindst 1 medarbejder.' },
                'meeting-room-count': { key: 'meetingRooms', message: 'Antal mødelokaler skal være 0 eller flere.' },
                'toilet-count': { key: 'toilets', message: 'Antal toiletter skal være 0 eller flere.' },
                'kitchen-count': { key: 'kitchens', message: 'Antal køkkener skal være 0 eller flere.' }
            };
            const inputError = document.getElementById('calc-input-error');

            function showInputErrors() {
                const invalid = Object.keys(NUMBER_FIELDS)
                    .map(id => document.getElementById(id))
                    .filter(input => input.getAttribute('aria-invalid') === 'true');
                inputError.textContent = invalid.map(input => NUMBER_FIELDS[input.id].message).join(' ');
                inputError.hidden = invalid.length === 0;
            }

            Object.entries(NUMBER_FIELDS).forEach(([id, field]) => {
                const input = document.getElementById(id);
                input.addEventListener('input', () => {
                    const value = Number(input.value);
                    const valid = input.value.trim() !== '' && Number.isInteger(value) && value >= Number(input.min);
                    input.setAttribute('aria-invalid', valid ? 'false' : 'true');
                    showInputErrors();
                    if (!valid) return;
                    state[field.key] = value;
                    debouncedUpdate();
                });
            });

            // Day buttons
            document.querySelectorAll('[data-day]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const day = btn.dataset.day;
                    const type = btn.dataset.type;

                    if (btn.classList.contains('active')) {
                        btn.classList.remove('active');
                        delete state.cleaningTypes[day];
                        state.cleaningDays = state.cleaningDays.filter(d => d !== day);
                    } else {
                        document.querySelectorAll(`[data-day="${day}"]`).forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        state.cleaningTypes[day] = type;
                        if (!state.cleaningDays.includes(day)) {
                            state.cleaningDays.push(day);
                        }
                    }

                    debouncedUpdate();
                });
            });

            // Size method buttons
            document.querySelectorAll('[data-size-method]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const method = btn.dataset.sizeMethod;
                    state.sizeMethod = method;
                    document.querySelectorAll('[data-size-method]').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    document.getElementById('area-input').style.display = method === 'area' ? 'block' : 'none';
                    document.getElementById('employees-input').style.display = method === 'employees' ? 'block' : 'none';
                    debouncedUpdate();
                });
            });

            // Photo option buttons
            document.querySelectorAll('[data-photo]').forEach(btn => {
                btn.addEventListener('click', () => {
                    state.photos = btn.dataset.photo;
                    document.querySelectorAll('[data-photo]').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    debouncedUpdate();
                });
            });

            // Service mode toggle (let/grundig)
            document.querySelectorAll('[data-service-mode]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const type = btn.dataset.serviceMode;
                    state.serviceMode = type;
                    document.querySelectorAll('[data-service-mode]').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    const serviceSections = document.querySelectorAll('.task-grid');
                    if (type === 'grundig') {
                        serviceSections.forEach(section => section.classList.add('task-grid--deep'));
                        document.querySelectorAll('.task-checkbox').forEach(cb => { cb.checked = true; });
                    } else {
                        serviceSections.forEach(section => section.classList.remove('task-grid--deep'));
                        document.querySelectorAll('.task-item:not(.task-item--deep) .task-checkbox').forEach(cb => { cb.checked = true; });
                        document.querySelectorAll('.task-item--deep .task-checkbox').forEach(cb => { cb.checked = false; });
                    }
                    debouncedUpdate();
                });
            });

            // Task checkbox changes
            document.addEventListener('change', function(e) {
                if (e.target.classList.contains('task-checkbox')) {
                    debouncedUpdate();
                }
            });

            // Initial calculation
            updatePriceDisplay();
        });
