// Inicializa dataLayer y gtag desde el arranque para conservar eventos previos
window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };

const GA_MEASUREMENT_ID = 'G-D5Z9J5PQCK';
window.__GA_MEASUREMENT_ID = GA_MEASUREMENT_ID;

function legacyInjectAnalytics(containerId) {
    if (window.__gtmLoaded) {
        return;
    }

    window.__gtmLoaded = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${containerId}`;
    document.head.appendChild(script);
}

window.loadGTM = function loadGTM() {
    const containerId = window.__GTM_ID || GA_MEASUREMENT_ID;

    if (typeof window.injectGtm === 'function') {
        window.injectGtm(containerId);
    } else {
        legacyInjectAnalytics(containerId);
    }

    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID);
};

function setUniformTestimonialHeights(){
    const container = document.querySelector('.testimonials-section');
    if (!container) return;
    container.style.removeProperty('--t-card-h');
    const cards = container.querySelectorAll('.testimonial-card');
    let max = 0;
    cards.forEach(card => {
        max = Math.max(max, card.offsetHeight);
    });
    if (max) {
        container.style.setProperty('--t-card-h', `${max}px`);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Header scroll effect - PASSIVE LISTENER
    const header = document.getElementById('mainHeader');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });

    // Mobile menu toggle
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileNav = document.getElementById('mobile-nav');
    hamburgerBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('active');
    });
    mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => mobileNav.classList.remove('active'));
    });
    
    // FAQ accordion
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const faqItem = button.parentElement;
            faqItem.classList.toggle('active');
        });
    });

    // TESTIMONIAL CAROUSEL - OPTIMIZADO
    const slider = document.querySelector('.testimonial-slider');
    if (slider) {
        const totalItems = slider.children.length;

        const nextButton = document.querySelector('.next-btn');
        const prevButton = document.querySelector('.prev-btn');
        const paginationContainer = document.getElementById('slider-pagination');
        const desktopQuery = window.matchMedia('(min-width: 1024px)');
        const tabletQuery = window.matchMedia('(min-width: 768px)');
        const cleanupCallbacks = [];
        let currentIndex = 0;
        let intervalId;
        let itemsPerView = 1;
        let totalPages = Math.max(1, Math.ceil(totalItems / itemsPerView));
        let layoutUpdateTimeoutId = null;
        let sliderObserver;
        let isSliderVisible = !('IntersectionObserver' in window);

        const debounce = (fn, delay = 150) => {
            return (...args) => {
                if (layoutUpdateTimeoutId) {
                    clearTimeout(layoutUpdateTimeoutId);
                }
                layoutUpdateTimeoutId = setTimeout(() => {
                    layoutUpdateTimeoutId = null;
                    fn(...args);
                }, delay);
            };
        };

        const throttle = (fn, limit = 200) => {
            let waiting = false;
            let pendingArgs = null;

            return (...args) => {
                if (waiting) {
                    pendingArgs = args;
                    return;
                }

                fn(...args);
                waiting = true;

                setTimeout(() => {
                    waiting = false;
                    if (pendingArgs) {
                        fn(...pendingArgs);
                        pendingArgs = null;
                    }
                }, limit);
            };
        };

        const calculateItemsPerView = () => {
            if (desktopQuery.matches) {
                return 3;
            }
            if (tabletQuery.matches) {
                return 2;
            }
            return 1;
        };

        const updatePagination = () => {
            if (!paginationContainer) return;
            const dots = paginationContainer.querySelectorAll('.pagination-dot');
            if (!dots.length) return;

            const safeIndex = Math.min(Math.max(currentIndex, 0), dots.length - 1);
            dots.forEach((dot, index) => {
                const isActive = index === safeIndex;
                dot.classList[isActive ? 'add' : 'remove']('active');
                if (isActive) {
                    dot.setAttribute('aria-current', 'page');
                } else {
                    dot.removeAttribute('aria-current');
                }
            });
        };

        const getMaxIndex = () => Math.max(0, totalPages - 1);

        const showSlide = (index) => {
            const maxIndex = getMaxIndex();
            currentIndex = Math.min(Math.max(index, 0), maxIndex);
            slider.style.transform = `translateX(-${currentIndex * 100}%)`;
            updatePagination();
            setUniformTestimonialHeights();
        };

        const ensurePaginationDots = () => {
            if (!paginationContainer) {
                return;
            }

            const shouldRebuild = paginationContainer.childElementCount !== totalPages;

            if (shouldRebuild) {
                paginationContainer.innerHTML = '';

                for (let i = 0; i < totalPages; i++) {
                    const dot = document.createElement('button');
                    dot.type = 'button';
                    dot.classList.add('pagination-dot');
                    dot.setAttribute('aria-label', `Ir a página ${i + 1}`);

                    dot.addEventListener('click', () => {
                        currentIndex = i;
                        showSlide(currentIndex);
                        stopAutoSlide();
                        startAutoSlide();
                    });

                    paginationContainer.appendChild(dot);
                }

                setUniformTestimonialHeights();
            }

            updatePagination();
        };

        const applySliderLayout = (requestedItemsPerView = calculateItemsPerView()) => {
            itemsPerView = requestedItemsPerView;
            totalPages = Math.max(1, Math.ceil(totalItems / itemsPerView));
            ensurePaginationDots();
            currentIndex = Math.min(currentIndex, getMaxIndex());
            showSlide(currentIndex);
        };

        const scheduleLayoutUpdate = debounce(() => {
            applySliderLayout();
        }, 150);

        const registerMediaListener = (mediaQuery, handler) => {
            if (!mediaQuery) return () => {};

            if (typeof mediaQuery.addEventListener === 'function') {
                mediaQuery.addEventListener('change', handler);
                return () => mediaQuery.removeEventListener('change', handler);
            }

            mediaQuery.addListener(handler);
            return () => mediaQuery.removeListener(handler);
        };

        const handleBreakpointChange = () => {
            scheduleLayoutUpdate();
        };

        cleanupCallbacks.push(registerMediaListener(desktopQuery, handleBreakpointChange));
        cleanupCallbacks.push(registerMediaListener(tabletQuery, handleBreakpointChange));

        const throttledResizeHandler = throttle(() => {
            const computedItemsPerView = calculateItemsPerView();
            if (computedItemsPerView !== itemsPerView) {
                applySliderLayout(computedItemsPerView);
                setUniformTestimonialHeights();
            }
        }, 200);

        window.addEventListener('resize', throttledResizeHandler);
        cleanupCallbacks.push(() => window.removeEventListener('resize', throttledResizeHandler));

        const nextSlide = () => {
            const maxIndex = getMaxIndex();
            currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
            showSlide(currentIndex);
        };

        const prevSlide = () => {
            const maxIndex = getMaxIndex();
            currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
            showSlide(currentIndex);
        };

        const startAutoSlide = () => {
            if (intervalId || !isSliderVisible || totalPages <= 1) return;
            intervalId = setInterval(nextSlide, 7000);
        };

        const stopAutoSlide = () => {
            if (!intervalId) return;
            clearInterval(intervalId);
            intervalId = null;
        };

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                nextSlide();
                stopAutoSlide();
                startAutoSlide();
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                prevSlide();
                stopAutoSlide();
                startAutoSlide();
            });
        }

        if ('IntersectionObserver' in window) {
            sliderObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.target !== slider) return;
                    isSliderVisible = entry.isIntersecting;

                    if (isSliderVisible) {
                        startAutoSlide();
                    } else {
                        stopAutoSlide();
                    }
                });
            }, { threshold: 0.2 });

            sliderObserver.observe(slider);
            cleanupCallbacks.push(() => sliderObserver && sliderObserver.disconnect());
        } else {
            startAutoSlide();
        }

        applySliderLayout(calculateItemsPerView());
        if (!intervalId && isSliderVisible && totalPages > 1) {
            startAutoSlide();
        }

        const cleanup = () => {
            stopAutoSlide();
            if (layoutUpdateTimeoutId) {
                clearTimeout(layoutUpdateTimeoutId);
                layoutUpdateTimeoutId = null;
            }
            cleanupCallbacks.forEach(fn => {
                if (typeof fn === 'function') {
                    fn();
                }
            });
            cleanupCallbacks.length = 0;
            window.removeEventListener('pagehide', cleanup);
            window.removeEventListener('beforeunload', cleanup);
        };

        window.addEventListener('pagehide', cleanup, { once: true });
        window.addEventListener('beforeunload', cleanup, { once: true });
    }

    setUniformTestimonialHeights();
    window.addEventListener('load', setUniformTestimonialHeights);

    // GOOGLE MAPS LAZY LOAD AUTOMÁTICO CON INTERSECTION OBSERVER
    const initLazyMaps = () => {
        const mapContainers = document.querySelectorAll('.map-lazy-container');
        
        if ('IntersectionObserver' in window) {
            const mapObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const container = entry.target;
                        const mapSrc = container.dataset.mapSrc;
                        
                        const iframe = document.createElement('iframe');
                        iframe.src = mapSrc;
                        iframe.width = '600';
                        iframe.height = '450';
                        iframe.style.border = '0';
                        iframe.allowFullscreen = true;
                        iframe.loading = 'lazy';
                        iframe.referrerPolicy = 'no-referrer-when-downgrade';
                        iframe.title = 'Ubicación de la consulta de Javi Cáceres en Roses';
                        
                        container.innerHTML = '';
                        container.appendChild(iframe);
                        mapObserver.unobserve(container);
                    }
                });
            }, { rootMargin: '200px' });
            
            mapContainers.forEach(container => mapObserver.observe(container));
        } else {
            // Fallback para navegadores antiguos
            mapContainers.forEach(container => {
                const iframe = document.createElement('iframe');
                iframe.src = container.dataset.mapSrc;
                container.appendChild(iframe);
            });
        }
    };

    // Inicializar lazy load de mapas
    initLazyMaps();
});
