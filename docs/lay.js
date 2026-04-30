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
        // page.js의 V4.init()은 { core, registerEffect } 구조를 반환함.
        // Data API는 app.core.Data 경로로 접근해야 함.
        window.V4.init(siteConfig).then(async (app) => {
            const data = app.core?.Data;
            const util = app.core?.Util;
            if (!data) return console.warn('[Hongsirak] V4 Data API not available');

            try {
                const response = await fetch('./lang.menu.json');
                if (response.ok) {
                    const menuReq = await response.json();
                    const currentLang = document.documentElement.lang || 'ko';
                    const menuData = menuReq[currentLang] || menuReq['_default'] || {};

                    // 코어 langData에 메뉴 데이터 병합 후 재렌더링
                    Object.assign(data.get(), menuData);
                    data.apply();

                    // render-as-html 요소 보호 처리
                    document.querySelectorAll('[data-i18n].render-as-html').forEach(el => {
                        const text = util.getText(el.dataset.i18n);
                        if (text && text !== el.dataset.i18n) el.innerHTML = text;
                    });
                }
            } catch (e) { console.warn('Shared menu data load failed', e); }

            console.log('Hongsirak V4 App Initialized');
        });
    }
});
