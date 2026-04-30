/**
 * Hongsirak Request Logic
 */
const siteConfig = {
    meta: {
        framework: 'V4',
        type: 'form',
        mode: 'live',
        lang: 'ko',
        theme: true,
        footer: true,
        symbol: true
    },
    api: {
        server: 'provider',
        redirect: '../'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (window.V4) {
        window.V4.init(siteConfig).then(async () => {
            const Data = window.V4.App?.Data;
            const Util = window.V4.App?.Util;
            if (!Data) return console.warn('[Hongsirak] V4.App.Data not available');

            try {
                const response = await fetch('../lang.menu.json');
                if (response.ok) {
                    const menuReq = await response.json();
                    const applyMenuData = () => {
                        const currentLang = document.documentElement.lang || 'ko';
                        const menuData = menuReq[currentLang] || menuReq['_default'] || {};
                        
                        Object.assign(Data.get(), menuData);
                        Data.apply();
                        
                        document.querySelectorAll('[data-i18n].render-as-html').forEach(el => {
                            const text = Util.getText(el.dataset.i18n);
                            if (text && text !== el.dataset.i18n) el.innerHTML = text;
                        });
                        
                        // 주문서 가격 업데이트 트리거
                        const form = document.getElementById('order-form');
                        if (form) form.dispatchEvent(new Event('change'));
                    };

                    applyMenuData();

                    // V4 코어의 비동기 다국어 변경(fetch) 후 커스텀 데이터 재적용
                    document.addEventListener('click', (e) => {
                        if (e.target.closest('.damso-lang-btn, [data-lang-set], [data-i18n-set]')) {
                            setTimeout(applyMenuData, 100);
                        }
                    });
                }
            } catch (e) { console.warn('[Hongsirak] Shared menu data load failed', e); }

            initDynamicUI();
            initPriceCalculator();
        });
    }
});

function initDynamicUI() {
    const pickupSelect = document.getElementById('pickup_method');
    const addressGroup = document.getElementById('group-address');
    const addressInput = addressGroup ? addressGroup.querySelector('input') : null;

    const toggleAddress = () => {
        if (!pickupSelect || !addressGroup) return;

        const isDelivery = pickupSelect.value === 'delivery';
        if (isDelivery) {
            addressGroup.classList.remove('hidden');
            if (addressInput) addressInput.setAttribute('required', 'required');
        } else {
            addressGroup.classList.add('hidden');
            if (addressInput) {
                addressInput.removeAttribute('required');
                addressInput.value = '';
            }
        }
    };

    if (pickupSelect) {
        pickupSelect.addEventListener('change', toggleAddress);
        toggleAddress();
    }
}

function initPriceCalculator() {
    const form = document.getElementById('order-form');
    const totalDisplay = document.getElementById('total-price');

    if (!form || !totalDisplay) return;

    const calculate = () => {
        const qtyInputs = form.querySelectorAll('.qty-input');
        let total = 0;

        qtyInputs.forEach(input => {
            if (input.value.length > 3) input.value = input.value.slice(0, 3);
            if (parseInt(input.value) > 999) input.value = '999';

            const qty = parseInt(input.value) || 0;
            const price = parseInt(input.dataset.price) || 0;
            total += qty * price;
        });

        const formattedPrice = total.toLocaleString();
        const unit = window.V4?.App?.Util?.getText('currency_unit') || '원';

        totalDisplay.innerText = (unit === '₩') ? `₩${formattedPrice}` : `${formattedPrice}${unit}`;
        totalDisplay.classList.toggle('active', total > 0);

        const priceNote = document.querySelector('.price-note');
        if (priceNote) {
            const getText = (key) => window.V4?.App?.Util?.getText(key) || '';
            if (total === 0) {
                priceNote.innerText = getText('price_note');
            } else if (total < 100000) {
                priceNote.innerText = getText('payment_note_under');
            } else {
                const deposit = Math.floor(total * 0.3);
                const note = getText('payment_note_over').replace('{amount}', deposit.toLocaleString());
                priceNote.innerHTML = note;
            }
        }
    };

    form.addEventListener('change', calculate);
    form.addEventListener('input', calculate);
    calculate();
}
