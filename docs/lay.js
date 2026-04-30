// lay.js - Hongsirak Custom Script
const siteConfig = {
    meta: {
        framework: 'V4',
        type: 'page',
        mode: 'live',
        lang: 'ko',
        theme: false,
        footer: true,
        symbol: false,
        scroll_smooth: true
    },
    api: {
        server: 'provider',
        redirect: '../'
    },
    canvas: {
        id: 'home',
        target: '#home',
        effect: '', // 기본 슬라이드 효과
        overlay: 'dotted',
        image_type: 'cover',
        image_count: 1,
        image_slide: 1,
        image_path: './section/home/',
        image_format: 'webp'
    },
    buttons: [
        { name: 'Menu', icon: 'restaurant', url: '#normal' },
        { name: 'Catering', icon: 'outdoor_grill', url: '#buffet' },
        { name: 'Location', icon: 'location_on', url: '#location' }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    if (window.V4) {
        window.V4.init(siteConfig).then(async (app) => {
            // Function to merge and apply menu data
            const applyMenuData = async () => {
                try {
                    const response = await fetch('./lang.menu.json');
                    if (response.ok) {
                        const menuReq = await response.json();
                        const currentLang = document.documentElement.lang || 'ko';
                        const menuData = menuReq[currentLang] || menuReq['_default'] || {};
                        
                        // Merge into existing i18n data
                        Object.assign(app.Data.get(), menuData);
                        app.Data.apply();
                    }
                } catch (e) { console.warn('Shared menu data load failed', e); }
            };

            // Initial Apply
            await applyMenuData();

            // Re-apply when language changes (Core toggle support)
            document.querySelectorAll('.damso-lang-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    // Give a small delay for core to update lang attribute and load data
                    setTimeout(applyMenuData, 100);
                });
            });

            console.log('Hongsirak V4 App Initialized');
        });
    }
});
