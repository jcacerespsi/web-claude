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
        let currentIndex = 0;
        let intervalId;
        let slidesPerView = 1;

        const createPaginationDots = () => {
            paginationContainer.innerHTML = '';
            const totalDots = 4;
            
            for (let i = 0; i < totalDots; i++) {
                const dot = document.createElement('button');
                dot.classList.add('pagination-dot');
                dot.setAttribute('aria-label', `Ir a página ${i + 1}`);
                if (i === 0) dot.classList.add('active');
                
                dot.addEventListener('click', () => {
                    currentIndex = i;
                    showSlide(currentIndex);
                    updatePagination();
                    stopAutoSlide();
                    startAutoSlide();
                });
                
                paginationContainer.appendChild(dot);
            }
        };

        const updatePagination = () => {
            const dots = paginationContainer.querySelectorAll('.pagination-dot');
            const currentPage = Math.floor(currentIndex);
            
            dots.forEach((dot, index) => {
                dot.classList[index === currentPage ? 'add' : 'remove']('active');
            });
        };

        const updateSlidesPerView = () => {
            if (window.innerWidth >= 992) {
                slidesPerView = 3;
            } else if (window.innerWidth >= 768) {
                slidesPerView = 2;
            } else {
                slidesPerView = 1;
            }
            createPaginationDots();
        };

        const showSlide = (index) => {
            const slideWidth = 100 / slidesPerView;
            // Usar transform con will-change para mejor performance
            slider.style.transform = `translateX(${-index * slideWidth}%)`;
            updatePagination();
        };

        const nextSlide = () => {
            const maxIndex = 3;
            currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
            showSlide(currentIndex);
        };
        
        const prevSlide = () => {
            const maxIndex = 3;
            currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
            showSlide(currentIndex);
        };

        const startAutoSlide = () => {
            intervalId = setInterval(nextSlide, 7000);
        };

        const stopAutoSlide = () => {
            clearInterval(intervalId);
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

        // RESIZE LISTENER PASIVO
        window.addEventListener('resize', () => {
            updateSlidesPerView();
            showSlide(currentIndex);
        }, { passive: true });
        
        updateSlidesPerView();
        startAutoSlide();
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
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesBtn = document.getElementById('accept-cookies-btn');

    if (cookieBanner && acceptCookiesBtn) {
        if (!getCookie('cookies_accepted')) {
            setTimeout(() => {
                cookieBanner.classList.add('active');
            }, 1500);
        }

        acceptCookiesBtn.addEventListener('click', () => {
            setCookie('cookies_accepted', 'true', 365);
            cookieBanner.style.transform = 'translateY(100%)';
        });
    }

    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
    }

    function getCookie(name) {
        const nameEQ = `${name}=`;
        const ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i].trim();
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
        }
        return null;
    }

    // Inicializar lazy load de mapas
    initLazyMaps();
});