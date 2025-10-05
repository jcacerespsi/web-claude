// Inicializa dataLayer y gtag desde el arranque para conservar eventos previos
window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };

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
        const slides = Array.from(slider.children);
        const nextButton = document.querySelector('.next-btn');
        const prevButton = document.querySelector('.prev-btn');
        const paginationContainer = document.getElementById('slider-pagination');
        const desktopQuery = window.matchMedia('(min-width: 992px)');
        const tabletQuery = window.matchMedia('(min-width: 768px)');
        const cleanupCallbacks = [];
        let currentIndex = 0;
        let intervalId;
        let slidesPerView = 1;
        let totalPages = 0;
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

        const calculateSlidesPerView = () => {
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

            if (!totalPages) {
                updatePagination();
                return;
            }

            const translatePercentage = (currentIndex * 100) / totalPages;
            // Usar transform con will-change para mejor performance
            slider.style.transform = `translateX(-${translatePercentage}%)`;
            updatePagination();
        };

        const ensurePaginationDots = () => {
            const nextTotalPages = Math.max(1, Math.ceil(slides.length / slidesPerView));
            const previousTotalPages = totalPages;
            totalPages = nextTotalPages;

            if (!paginationContainer) {
                return;
            }

            const shouldRebuild = previousTotalPages !== totalPages || paginationContainer.childElementCount !== totalPages;

            if (shouldRebuild) {
                paginationContainer.innerHTML = '';

                for (let i = 0; i < totalPages; i++) {
                    const dot = document.createElement('button');
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
            }

            updatePagination();
        };

        const applySliderLayout = () => {
            const newSlidesPerView = calculateSlidesPerView();
            const slidesPerViewChanged = newSlidesPerView !== slidesPerView;
            const previousTotalPages = totalPages;

            slidesPerView = newSlidesPerView;
            ensurePaginationDots();

            if (currentIndex > getMaxIndex()) {
                currentIndex = 0;
            }

            if (slidesPerViewChanged || previousTotalPages !== totalPages) {
                showSlide(currentIndex);
            } else {
                updatePagination();
            }
        };

        const scheduleLayoutUpdate = debounce(applySliderLayout, 150);

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
            if (intervalId || !isSliderVisible) return;
            intervalId = setInterval(nextSlide, 7000);
        };

        const stopAutoSlide = () => {
            if (!intervalId) return;
            clearInterval(intervalId);
            intervalId = null;
        };

        nextButton.addEventListener('click', () => {
            nextSlide();
            stopAutoSlide();
            startAutoSlide();
        });

        prevButton.addEventListener('click', () => {
            prevSlide();
            stopAutoSlide();
            startAutoSlide();
        });

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

        applySliderLayout();
        if (!intervalId && isSliderVisible) {
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

    // COOKIE CONSENT BANNER
    const GTAG_MEASUREMENT_ID = 'G-D5Z9J5PQCK';
    const CONSENT_STORAGE_KEY = 'cookieConsent';
    const CONSENT_COOKIE_KEY = 'cookie_consent';
    const CONSENT_COOKIE_MAX_AGE = 15552000; // 180 días en segundos
    let gtmLoaded = false;

    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesBtn = document.getElementById('accept-cookies-btn');
    const rejectCookiesBtn = document.getElementById('reject-cookies-btn');

    const isLocalStorageAvailable = (() => {
        try {
            const testKey = '__consent_test__';
            window.localStorage.setItem(testKey, '1');
            window.localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    })();

    const setCookieValue = (name, value, maxAgeSeconds) => {
        document.cookie = `${name}=${value}; max-age=${maxAgeSeconds}; path=/`;
    };

    const getCookieValue = (name) => {
        const nameEQ = `${name}=`;
        return document.cookie
            .split(';')
            .map(cookie => cookie.trim())
            .find(cookie => cookie.startsWith(nameEQ))?.substring(nameEQ.length) || null;
    };

    const getStoredConsent = () => {
        let storedValue = null;

        if (isLocalStorageAvailable) {
            try {
                storedValue = window.localStorage.getItem(CONSENT_STORAGE_KEY);
            } catch (error) {
                storedValue = null;
            }
        }

        if (!storedValue) {
            storedValue = getCookieValue(CONSENT_COOKIE_KEY);
        }

        return storedValue;
    };

    const persistConsent = (value) => {
        let stored = false;

        if (isLocalStorageAvailable) {
            try {
                window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
                stored = true;
            } catch (error) {
                stored = false;
            }
        }

        if (!stored) {
            try {
                setCookieValue(CONSENT_COOKIE_KEY, value, CONSENT_COOKIE_MAX_AGE);
                stored = true;
            } catch (error) {
                stored = false;
            }
        }

        return stored;
    };

    const loadGTM = () => {
        if (gtmLoaded) {
            return;
        }

        gtmLoaded = true;
        window.gtag('js', new Date());
        window.gtag('config', GTAG_MEASUREMENT_ID);

        const gtmScript = document.createElement('script');
        gtmScript.defer = true;
        gtmScript.src = `https://www.googletagmanager.com/gtag/js?id=${GTAG_MEASUREMENT_ID}`;
        document.head.appendChild(gtmScript);
    };

    window.loadGTM = loadGTM;

    const hideCookieBanner = () => {
        if (!cookieBanner) {
            return;
        }

        cookieBanner.classList.remove('active');
        cookieBanner.setAttribute('aria-hidden', 'true');
        document.removeEventListener('keydown', handleBannerKeydown);
    };

    const showCookieBanner = () => {
        if (!cookieBanner) {
            return;
        }

        cookieBanner.classList.add('active');
        cookieBanner.setAttribute('aria-hidden', 'false');
        document.addEventListener('keydown', handleBannerKeydown);

        window.setTimeout(() => {
            if (document.activeElement !== acceptCookiesBtn) {
                acceptCookiesBtn?.focus({ preventScroll: true });
            }
        }, 0);
    };

    const handleBannerKeydown = (event) => {
        if (event.key === 'Escape' || event.key === 'Esc') {
            event.preventDefault();
            if (rejectCookiesBtn) {
                rejectCookiesBtn.click();
            } else if (acceptCookiesBtn) {
                acceptCookiesBtn.click();
            }
        }
    };

    if (cookieBanner && acceptCookiesBtn) {
        const storedConsent = getStoredConsent();

        if (storedConsent === 'accepted') {
            loadGTM();
            hideCookieBanner();
        } else if (!storedConsent) {
            showCookieBanner();
        } else {
            hideCookieBanner();
        }

        acceptCookiesBtn.addEventListener('click', () => {
            persistConsent('accepted');
            loadGTM();
            hideCookieBanner();
        });

        if (rejectCookiesBtn) {
            rejectCookiesBtn.addEventListener('click', () => {
                persistConsent('rejected');
                hideCookieBanner();
            });
        }
    }

    // Inicializar lazy load de mapas
    initLazyMaps();
});
