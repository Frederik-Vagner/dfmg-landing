/**
 * Sustainability Slider
 * Shared slider for all sustainability pages.
 * Supports both horizontal and vertical scrolling.
 *
 * Usage: Add a data attribute to the container element:
 *   <div class="horizontal-container" id="horizontalContainer" data-slider="horizontal">
 *   <div class="vertical-container" id="verticalContainer" data-slider="vertical">
 *
 * Optional hash mappings via data attribute on <body>:
 *   <body data-slide-hashes='{"#miljoe":1,"#social":2,"#governance":3}'>
 */
class SustainabilitySlider {
    constructor() {
        // Auto-detect direction from container
        const hContainer = document.getElementById('horizontalContainer');
        const vContainer = document.getElementById('verticalContainer');

        this.direction = hContainer ? 'horizontal' : 'vertical';
        this.container = hContainer || vContainer;

        if (!this.container) return;

        this.dots = document.querySelectorAll('.slide-dot');
        this.currentSlide = 0;
        this.totalSlides = this.container.querySelectorAll('.slide').length;
        this.isAnimating = false;

        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupKeyboard();
        this.setupWheel();
        this.setupTouch();
        this.handleHash();
    }

    setupNavigation() {
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
    }

    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (this.isAnimating) return;

            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    this.prevSlide();
                    break;
            }
        });
    }

    setupWheel() {
        this.container.addEventListener('wheel', (e) => {
            if (this.isAnimating) return;
            e.preventDefault();

            const delta = this.direction === 'horizontal'
                ? (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY)
                : e.deltaY;

            if (delta > 50) this.nextSlide();
            else if (delta < -50) this.prevSlide();
        }, { passive: false });
    }

    setupTouch() {
        let startPos = 0;
        const axis = this.direction === 'horizontal' ? 'clientX' : 'clientY';

        this.container.addEventListener('touchstart', (e) => {
            startPos = e.touches[0][axis];
        });

        this.container.addEventListener('touchend', (e) => {
            if (this.isAnimating) return;

            const endPos = e.changedTouches[0][axis];
            const diff = startPos - endPos;

            if (Math.abs(diff) > 50) {
                diff > 0 ? this.nextSlide() : this.prevSlide();
            }
        });
    }

    goToSlide(index) {
        if (index === this.currentSlide || this.isAnimating) return;

        this.isAnimating = true;
        this.currentSlide = Math.max(0, Math.min(index, this.totalSlides - 1));

        const value = -this.currentSlide * 100;
        this.container.style.transform = this.direction === 'horizontal'
            ? `translateX(${value}vw)`
            : `translateY(${value}vh)`;

        this.updateDots();

        setTimeout(() => {
            this.isAnimating = false;
        }, 800);
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides - 1) {
            this.goToSlide(this.currentSlide + 1);
        }
    }

    prevSlide() {
        if (this.currentSlide > 0) {
            this.goToSlide(this.currentSlide - 1);
        }
    }

    updateDots() {
        const maxDots = this.totalSlides;
        this.dots.forEach((dot, index) => {
            const classes = ['active'];
            for (let i = 1; i <= maxDots; i++) classes.push(`slide-${i}-active`);
            dot.classList.remove(...classes);

            if (index === this.currentSlide) {
                dot.classList.add('active', `slide-${this.currentSlide + 1}-active`);
            }
        });
    }

    handleHash() {
        const hash = window.location.hash;
        if (!hash) return;

        // Check for data attribute on body
        const hashMap = document.body.dataset.slideHashes;
        if (hashMap) {
            try {
                const map = JSON.parse(hashMap);
                if (map[hash] !== undefined) {
                    this.goToSlide(map[hash]);
                    return;
                }
            } catch (e) { /* ignore parse errors */ }
        }

        // Default: #slide2 -> index 1, #slide3 -> index 2, etc.
        const match = hash.match(/^#slide(\d+)$/);
        if (match) {
            this.goToSlide(parseInt(match[1]) - 1);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SustainabilitySlider();
});
