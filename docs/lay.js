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
        window.V4.init(siteConfig).then(async () => {
            const Data = window.V4.App?.Data;
            const Util = window.V4.App?.Util;
            if (!Data) return console.warn('[Hongsirak] V4.App.Data not available');

            try {
                const response = await fetch('./lang.menu.json');
                if (response.ok) {
                    const menuReq = await response.json();
                    // 1. Util.getText를 가로채서 menu.json 데이터를 우선적으로 반환하도록 함 (최종병기)
                    const originalGetText = Util.getText;
                    Util.getText = function(key, params) {
                        const currentLang = document.documentElement.lang || 'ko';
                        const menuData = menuReq[currentLang] || menuReq['_default'] || {};
                        if (menuData && menuData[key]) {
                            return Util.processText(menuData[key], params);
                        }
                        return originalGetText.call(Util, key, params);
                    };

                    // 2. 초기 적용
                    Data.apply();
                }
            } catch (e) { console.warn('[Hongsirak] Shared menu data load failed', e); }

            console.log('Hongsirak V4 App Initialized');
        });
    }
});
