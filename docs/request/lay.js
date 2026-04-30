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
    };

    form.addEventListener('change', calculate);
    form.addEventListener('input', calculate);
    calculate();
}
