(function () {
    const STORAGE_KEY = 'cookies-consent';
    const GTM_ID = 'G-D5Z9J5PQCK';

    window.__GTM_ID = GTM_ID;

    const getStoredConsent = () => {
        try {
            return window.localStorage.getItem(STORAGE_KEY);
        } catch (error) {
            return null;
        }
    };

    const setStoredConsent = (value) => {
        try {
            window.localStorage.setItem(STORAGE_KEY, value);
        } catch (error) {
            // Ignore storage errors (private mode, etc.)
        }
    };

    function addPreconnect(href) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = href;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    }

    function injectGtm(containerId) {
        if (window.__gtmLoaded) {
            return;
        }

        window.__gtmLoaded = true;
        addPreconnect('https://www.googletagmanager.com');
        addPreconnect('https://www.google-analytics.com');

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });

        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${containerId}`;
        document.head.appendChild(script);

        window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };
        const measurementId = window.__GA_MEASUREMENT_ID || containerId;
        window.gtag('js', new Date());
        window.gtag('config', measurementId);
    }

    window.injectGtm = injectGtm;

    if (typeof window.loadGTM !== 'function') {
        window.loadGTM = () => injectGtm(GTM_ID);
    }

    const hideBannerElement = (banner) => {
        banner.classList.remove('is-visible');
        banner.setAttribute('aria-hidden', 'true');
        banner.style.display = 'none';
    };

    const showBannerElement = (banner, acceptButton) => {
        banner.style.display = 'flex';
        requestAnimationFrame(() => {
            banner.classList.add('is-visible');
            banner.setAttribute('aria-hidden', 'false');
            acceptButton?.focus({ preventScroll: true });
        });
    };

    document.addEventListener('DOMContentLoaded', () => {
        const banner = document.querySelector('.cookie-banner');
        if (!banner) {
            return;
        }

        const acceptButton = banner.querySelector('.js-cookie-accept');
        const rejectButton = banner.querySelector('.js-cookie-reject');

        const hideBanner = () => hideBannerElement(banner);
        const showBanner = () => showBannerElement(banner, acceptButton);

        hideBanner();

        const storedConsent = getStoredConsent();

        if (storedConsent === 'accepted') {
            return;
        }

        if (storedConsent !== 'rejected') {
            showBanner();
        }

        acceptButton?.addEventListener('click', () => {
            setStoredConsent('accepted');
            injectGtm(GTM_ID);
            hideBanner();
        });

        rejectButton?.addEventListener('click', () => {
            setStoredConsent('rejected');
            hideBanner();
        });
    });

    const consent = getStoredConsent();
    if (consent === 'accepted') {
        injectGtm(GTM_ID);
    }
})();
