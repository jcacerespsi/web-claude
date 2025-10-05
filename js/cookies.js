(function () {
    const STORAGE_KEY = 'cookies-consent';

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

    const callLoadGTM = () => {
        if (typeof window.loadGTM === 'function') {
            window.loadGTM();
        }
    };

    const hideBanner = (banner) => {
        banner.classList.remove('is-visible');
        banner.setAttribute('aria-hidden', 'true');
        banner.style.display = 'none';
    };

    const showBanner = (banner, acceptButton) => {
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

        hideBanner(banner);

        const storedConsent = getStoredConsent();

        if (storedConsent === 'accepted') {
            callLoadGTM();
            return;
        }

        if (storedConsent !== 'rejected') {
            showBanner(banner, acceptButton);
        }

        acceptButton?.addEventListener('click', () => {
            setStoredConsent('accepted');
            hideBanner(banner);
            callLoadGTM();
        });

        rejectButton?.addEventListener('click', () => {
            setStoredConsent('rejected');
            hideBanner(banner);
        });
    });
})();
