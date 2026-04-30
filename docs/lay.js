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
        image_slide: 5,
        image_path: './section/home/',
        image_format: 'jpg'
    },
    buttons: [
        { name: 'Menu', icon: 'restaurant', url: '#normal' },
        { name: 'Catering', icon: 'outdoor_grill', url: '#buffet' },
        { name: 'Location', icon: 'location_on', url: '#location' }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    if (window.V4) {
        window.V4.init(siteConfig).then(app => {
            console.log('Hongsirak V4 App Initialized');
        });
    }
});
