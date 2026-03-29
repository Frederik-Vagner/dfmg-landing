        // Price calculation data
        const RATES = {
            baseRatePerSqm: { let: 0.6, grundig: 0.9 },
            toiletRate: { let: 100, grundig: 150 },
            kitchenRate: { let: 75, grundig: 112.5 },
            meetingRoomRate: { let: 50, grundig: 75 },
            photoRate: { none: 0, after: 50, 'before-after': 100 },
            discountRates: { 2: 0.10, 3: 0.15, 5: 0.20 },
            // ADD THESE TASK RATES
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

            let weeklyCost = 0;
            let baseAreaCost = 0, toiletCost = 0, kitchenCost = 0, meetingRoomCost = 0;

            // Calculate for each selected day WITH TASK COSTS
            state.cleaningDays.forEach(day => {
                const cleaningType = state.cleaningTypes[day];
                if (cleaningType) {
                    const areaCost = area * RATES.baseRatePerSqm[cleaningType];
                    const toiletDayCost = state.toilets * RATES.toiletRate[cleaningType];
                    const kitchenDayCost = state.kitchens * RATES.kitchenRate[cleaningType];
                    const meetingRoomDayCost = state.meetingRooms * RATES.meetingRoomRate[cleaningType];

                    // ADD TASK COSTS BACK
                    let taskCosts = 0;
                    document.querySelectorAll('.task-checkbox:checked').forEach(checkbox => {
                        const task = checkbox.dataset.task;
                        const section = checkbox.dataset.section;

                        if (task && section && RATES.taskRates[section]?.[task]?.[cleaningType]) {
                            const multiplier = section === 'office' ? 1 :
                                            section === 'kitchen' ? state.kitchens :
                                            section === 'toilet' ? state.toilets : 1;
                            taskCosts += RATES.taskRates[section][task][cleaningType] * multiplier;
                        }
                    });

                    weeklyCost += areaCost + toiletDayCost + kitchenDayCost + meetingRoomDayCost + taskCosts;

                    // Accumulate monthly costs
                    baseAreaCost += areaCost * 4.33;
                    toiletCost += toiletDayCost * 4.33;
                    kitchenCost += kitchenDayCost * 4.33;
                    meetingRoomCost += meetingRoomDayCost * 4.33;
                }
            });

            // Photo costs
            const photoMultiplier = RATES.photoRate[state.photos];
            let photoCost = 0;
            if (photoMultiplier > 0) {
                photoCost = state.cleaningDays.length * photoMultiplier * 4.33;
                weeklyCost += state.cleaningDays.length * photoMultiplier;
            }

            let monthlyCost = weeklyCost * 4.33;

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

            monthlyCost = monthlyCost * (1 - discount);

            return {
                base: Math.round(baseAreaCost),
                meetings: Math.round(meetingRoomCost),
                toilets: Math.round(toiletCost),
                kitchens: Math.round(kitchenCost),
                photos: Math.round(photoCost),
                discount: Math.round(discount * 100),
                total: Math.round(monthlyCost)
            };
        }

        function getTaskSummary() {
            const checkedTasks = document.querySelectorAll('.task-checkbox:checked');
            const totalTasks = checkedTasks.length;

            // Based on current default (14 tasks) being "Standard"
            if (totalTasks >= 26) {
                return { text: "Komplet pakke - alle opgaver", cost: 0 };
            } else if (totalTasks >= 17) {  // 14 + 3
                return { text: "Tilpasset pakke", cost: 0 };
            } else if (totalTasks >= 12) {  // 14 ± 2 for some flexibility
                return { text: "Standard pakke", cost: 0 };
            } else {  // 11 or fewer (14 - 3)
                return { text: "Minimal pakke", cost: 0 };
            }
        }

        // Update UI efficiently
        function updatePriceDisplay() {
            const prices = calculatePrice();
            const breakdown = document.getElementById('price-breakdown');
            const lines = breakdown.querySelectorAll('.price-line');

            lines[0].lastElementChild.textContent = `${prices.base.toLocaleString('da-DK')} kr`;
            lines[1].lastElementChild.textContent = `${prices.meetings.toLocaleString('da-DK')} kr`;
            lines[2].lastElementChild.textContent = `${prices.toilets.toLocaleString('da-DK')} kr`;
            lines[3].lastElementChild.textContent = `${prices.kitchens.toLocaleString('da-DK')} kr`;
            lines[4].lastElementChild.textContent = `${prices.photos.toLocaleString('da-DK')} kr`;
            lines[6].lastElementChild.textContent = `-${prices.discount}%`; // CHANGE FROM 6 TO 6

            document.getElementById('monthly-price').textContent = `${prices.total.toLocaleString('da-DK')} kr`;

            // Update descriptions
            const area = state.sizeMethod === 'area' ? state.area : state.employees * 25;
            lines[0].firstElementChild.textContent = `Basispris (${area} m²)`;
            lines[1].firstElementChild.textContent = `Mødelokaler (${state.meetingRooms} stk)`;
            lines[2].firstElementChild.textContent = `Toiletter (${state.toilets} stk)`;
            lines[3].firstElementChild.textContent = `Køkkener (${state.kitchens} stk)`;

            // Update task summary
            const taskSummary = getTaskSummary();
            document.getElementById('task-summary-text').textContent = taskSummary.text;
            document.getElementById('task-summary-price').textContent = taskSummary.cost > 0 ?
                `+${taskSummary.cost.toLocaleString('da-DK')} kr` : 'inkluderet';
        }

        // Event handlers
        function selectSizeMethod(method) {
            state.sizeMethod = method;
            document.querySelectorAll('[onclick*="selectSizeMethod"]').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            if (method === 'area') {
                document.getElementById('area-input').style.display = 'block';
                document.getElementById('employees-input').style.display = 'none';
            } else {
                document.getElementById('area-input').style.display = 'none';
                document.getElementById('employees-input').style.display = 'block';
            }
            updatePriceDisplay();
        }

        function selectPhotoOption(option) {
            state.photos = option;
            document.querySelectorAll('[onclick*="selectPhotoOption"]').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            updatePriceDisplay();
        }

        function toggleDayType(day, type) {
            document.querySelectorAll(`[data-day="${day}"]`).forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            if (!state.cleaningDays.includes(day)) {
                state.cleaningDays.push(day);
            }
            updatePriceDisplay();
        }

        function toggleAllServiceTypes(type) {
            state.serviceMode = type; // UPDATE STATE

            // Update button states
            document.querySelectorAll('[onclick*="toggleAllServiceTypes"]').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            const serviceSections = document.querySelectorAll('.service-tasks');

            if (type === 'grundig') {
                serviceSections.forEach(section => section.classList.add('grundig-mode'));
                // Check all tasks in grundig mode
                document.querySelectorAll('.task-checkbox').forEach(checkbox => {
                    checkbox.checked = true;
                });
            } else {
                serviceSections.forEach(section => section.classList.remove('grundig-mode'));
                // Only check basic tasks
                document.querySelectorAll('.task-item:not(.grundig-only) .task-checkbox').forEach(checkbox => {
                    checkbox.checked = true;
                });
                document.querySelectorAll('.grundig-only .task-checkbox').forEach(checkbox => {
                    checkbox.checked = false;
                });
            }
        }

        // Efficient input handling
        document.addEventListener('DOMContentLoaded', function() {
            // Debounced input updates
            let timeout;
            function debouncedUpdate(callback) {
                clearTimeout(timeout);
                timeout = setTimeout(callback, 150);
            }

            // Input listeners
            document.getElementById('office-area').addEventListener('input', e => {
                state.area = parseInt(e.target.value) || 0;
                debouncedUpdate(updatePriceDisplay);
            });

            document.getElementById('employee-count').addEventListener('input', e => {
                state.employees = parseInt(e.target.value) || 0;
                debouncedUpdate(updatePriceDisplay);
            });

            document.getElementById('meeting-room-count').addEventListener('input', e => {
                state.meetingRooms = parseInt(e.target.value) || 0;
                debouncedUpdate(updatePriceDisplay);
            });

            document.getElementById('toilet-count').addEventListener('input', e => {
                state.toilets = parseInt(e.target.value) || 0;
                debouncedUpdate(updatePriceDisplay);
            });

            document.getElementById('kitchen-count').addEventListener('input', e => {
                state.kitchens = parseInt(e.target.value) || 0;
                debouncedUpdate(updatePriceDisplay);
            });

            // Day buttons
            document.querySelectorAll('[data-day]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const day = btn.dataset.day;
                    const type = btn.dataset.type;

                    if (btn.classList.contains('active')) {
                        // Deselect
                        btn.classList.remove('active');
                        delete state.cleaningTypes[day];  // Use delete instead
                        state.cleaningDays = state.cleaningDays.filter(d => d !== day);
                    } else {
                        // Select: remove active from other buttons for this day
                        document.querySelectorAll(`[data-day="${day}"]`).forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');

                        state.cleaningTypes[day] = type;
                        if (!state.cleaningDays.includes(day)) {
                            state.cleaningDays.push(day);
                        }
                    }

                    debouncedUpdate(updatePriceDisplay);
                });
            });

            // Initial calculation
            updatePriceDisplay();

            document.addEventListener('change', function(e) {
                if (e.target.classList.contains('task-checkbox')) {
                    debouncedUpdate(updatePriceDisplay);
                }
            });
        });