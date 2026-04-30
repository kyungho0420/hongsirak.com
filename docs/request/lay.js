/**
 * Hongsirak Request Logic
 */
const siteConfig = {
    meta: {
        framework: 'V4',
        type: 'form',
        mode: 'demo',
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
        window.V4.init(siteConfig).then((app) => {
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
    const qtyInputs = form.querySelectorAll('.qty-input');

    if (!form || !totalDisplay) return;

    const calculate = () => {
        let total = 0;

        qtyInputs.forEach(input => {
            // Enforce 3-digit limit
            if (input.value.length > 3) {
                input.value = input.value.slice(0, 3);
            }
            if (parseInt(input.value) > 999) {
                input.value = "999";
            }

            const qty = parseInt(input.value) || 0;
            const price = parseInt(input.dataset.price) || 0;
            total += qty * price;
        });

        // Format number with commas
        const formattedPrice = total.toLocaleString();
        
        // Handle currency display based on language
        const currentLang = window.V4?.lang || 'ko';
        if (currentLang === 'ko') {
            totalDisplay.innerText = `${formattedPrice}원`;
        } else {
            totalDisplay.innerText = `₩${formattedPrice}`;
        }

        if (total > 0) {
            totalDisplay.classList.add('active');
        } else {
            totalDisplay.classList.remove('active');
        }

        // Dynamic Payment Note
        const priceNote = document.querySelector('.price-note');
        if (priceNote) {
            if (total === 0) {
                priceNote.innerText = window.V4?.i18n?.get('price_note') || '';
            } else if (total < 100000) {
                priceNote.innerText = '10만원 미만은 선불 결제입니다.';
            } else {
                const deposit = Math.floor(total * 0.3);
                priceNote.innerHTML = `계약금 <b>${deposit.toLocaleString()}원</b> 선불 결제입니다.`;
            }
        }
    };

    form.addEventListener('change', calculate);
    form.addEventListener('input', calculate);
    calculate();
}
