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
            // lang.menu.json 로드 후 코어 langData에 병합
            // 언어 전환은 ?lang= URL 파라미터 방식으로 페이지 재로드됨.
            // DOMContentLoaded마다 아래 로직이 자동 실행되므로 별도 이벤트 감지 불필요.
            try {
                const response = await fetch('./lang.menu.json');
                if (response.ok) {
                    const menuReq = await response.json();
                    const currentLang = document.documentElement.lang || 'ko';
                    const menuData = menuReq[currentLang] || menuReq['_default'] || {};

                    // 코어 langData에 메뉴 데이터 병합 후 재렌더링
                    Object.assign(app.Data.get(), menuData);
                    app.Data.apply();

                    // render-as-html 요소는 Data.apply() 재호출 시에도 반드시 innerHTML로 보호 처리
                    document.querySelectorAll('[data-i18n].render-as-html').forEach(el => {
                        const text = app.Util.getText(el.dataset.i18n);
                        if (text && text !== el.dataset.i18n) el.innerHTML = text;
                    });
                }
            } catch (e) { console.warn('Shared menu data load failed', e); }

            console.log('Hongsirak V4 App Initialized');
        });
    }
});
