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
        window.V4.init(siteConfig).then(async (app) => {
            // lang.menu.json 로드 후 코어 langData에 병합
            // 언어 전환은 ?lang= URL 파라미터 방식으로 페이지 재로드됨.
            // DOMContentLoaded마다 아래 로직이 자동 실행되므로 별도 이벤트 감지 불필요.
            try {
                const response = await fetch('../lang.menu.json');
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
