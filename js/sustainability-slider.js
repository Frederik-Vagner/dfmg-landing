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
        this.slides = this.container.querySelectorAll('.slide');
        this.totalSlides = this.slides.length;
        this.isAnimating = false;

        // Below 768px a slide's content is taller than the screen, so stepping
        // by whole viewport heights would skip past the bottom of each one.
        // There the CSS lays the slides out as ordinary stacked sections and
        // the page scrolls normally, so the slider must not take over wheel,
        // touch or the transform.
        this.mq = window.matchMedia('(max-width: 768px)');

        this.init();

        // Keep the two modes in sync when the viewport crosses the breakpoint
        // (rotation, or a desktop window dragged narrow).
        const onChange = () => {
            if (this.isMobile()) this.container.style.transform = '';
            else this.applyTransform();
        };
        if (this.mq.addEventListener) this.mq.addEventListener('change', onChange);
        else if (this.mq.addListener) this.mq.addListener(onChange);
    }

    isMobile() {
        return this.mq.matches;
    }

    // A slide whose content is taller than the screen scrolls inside itself
    // (overflow-y: auto in slides.css). Wheel, touch and arrow keys scroll it
    // first and only move to the next slide once it is at that edge;
    // otherwise everything below the fold would be unreachable.
    canScroll(direction) {
        const slide = this.slides[this.currentSlide];
        if (!slide) return false;
        return direction > 0
            ? slide.scrollTop + slide.clientHeight < slide.scrollHeight - 1
            : slide.scrollTop > 0;
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
            // The dots are <div>s: make them keyboard buttons (Enter and Space
            // are handled for every role="button" in components.js).
            if (dot.tagName !== 'BUTTON') {
                dot.setAttribute('role', 'button');
                dot.setAttribute('tabindex', '0');
            }
            if (!dot.hasAttribute('aria-label')) dot.setAttribute('aria-label', `Slide ${index + 1}`);
            dot.addEventListener('click', () => this.goToSlide(index));
        });
    }

    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (this.isMobile() || this.isAnimating) return;

            const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
            if (!step) return;
            e.preventDefault();

            const vertical = e.key === 'ArrowDown' || e.key === 'ArrowUp';
            if (vertical && this.canScroll(step)) {
                this.slides[this.currentSlide].scrollBy({
                    top: step * this.slides[this.currentSlide].clientHeight * 0.4,
                    behavior: 'smooth'
                });
            } else if (step > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        });
    }

    setupWheel() {
        this.container.addEventListener('wheel', (e) => {
            if (this.isMobile()) return;

            // Vertical wheel movement scrolls an overflowing slide natively.
            const verticalWheel = Math.abs(e.deltaY) >= Math.abs(e.deltaX);
            if (verticalWheel && e.deltaY !== 0 && this.canScroll(Math.sign(e.deltaY))) return;

            e.preventDefault();
            if (this.isAnimating) return;

            const delta = this.direction === 'horizontal'
                ? (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY)
                : e.deltaY;

            if (delta > 50) this.nextSlide();
            else if (delta < -50) this.prevSlide();
        }, { passive: false });
    }

    setupTouch() {
        let startPos = 0;
        let couldScroll = { 1: false, '-1': false };
        const axis = this.direction === 'horizontal' ? 'clientX' : 'clientY';

        this.container.addEventListener('touchstart', (e) => {
            startPos = e.touches[0][axis];
            // Judged at the start: by touchend the swipe has already scrolled
            // the slide, possibly right up to its edge.
            couldScroll = { 1: this.canScroll(1), '-1': this.canScroll(-1) };
        });

        this.container.addEventListener('touchend', (e) => {
            if (this.isMobile() || this.isAnimating) return;

            const endPos = e.changedTouches[0][axis];
            const diff = startPos - endPos;

            if (Math.abs(diff) > 50) {
                // A vertical swipe that scrolled the slide is not a slide change.
                if (this.direction === 'vertical' && couldScroll[Math.sign(diff)]) return;
                diff > 0 ? this.nextSlide() : this.prevSlide();
            }
        });
    }

    applyTransform() {
        const value = -this.currentSlide * 100;
        this.container.style.transform = this.direction === 'horizontal'
            ? `translateX(${value}vw)`
            : `translateY(${value}vh)`;
    }

    goToSlide(index) {
        if (this.isAnimating) return;

        const target = Math.max(0, Math.min(index, this.totalSlides - 1));

        // Stacked layout: the slides are ordinary sections, so move the page
        // to the one asked for instead of sliding the whole container.
        if (this.isMobile()) {
            this.currentSlide = target;
            const slide = this.slides[target];
            if (slide) slide.scrollIntoView({ behavior: 'smooth', block: 'start' });
            this.updateDots();
            return;
        }

        if (target === this.currentSlide) return;

        // Arrive at the edge you came from: the top going forward, the bottom
        // going back, so a tall slide continues where the previous one ended.
        const incoming = this.slides[target];
        if (incoming) incoming.scrollTop = target > this.currentSlide ? 0 : incoming.scrollHeight;

        this.isAnimating = true;
        this.currentSlide = target;
        this.applyTransform();
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
