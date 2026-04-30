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
            // Function to merge and apply menu data
            const applyMenuData = async () => {
                try {
                    const response = await fetch('../lang.menu.json');
                    if (response.ok) {
                        const menuReq = await response.json();
                        const currentLang = document.documentElement.lang || 'ko';
                        const menuData = menuReq[currentLang] || menuReq['_default'] || {};
                        
                        // Merge into existing i18n data
                        Object.assign(app.Data.get(), menuData);
                        app.Data.apply();
                        
                        // Re-calculate prices to update currency unit
                        if (typeof calculatePrice === 'function') calculatePrice();
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

    window.calculatePrice = () => {
        const qtyInputs = form.querySelectorAll('.qty-input');
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
        const unit = window.V4?.i18n?.get('currency_unit') || '원';
        if (unit === '₩') {
            totalDisplay.innerText = `₩${formattedPrice}`;
        } else {
            totalDisplay.innerText = `${formattedPrice}${unit}`;
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
                priceNote.innerText = window.V4?.Util?.getText('price_note') || '';
            } else if (total < 100000) {
                priceNote.innerText = window.V4?.Util?.getText('payment_note_under') || '10만원 미만은 선불 결제입니다.';
            } else {
                const deposit = Math.floor(total * 0.3);
                let note = window.V4?.Util?.getText('payment_note_over') || '계약금 <b>{amount}원</b> 선불 결제입니다.';
                note = note.replace('{amount}', deposit.toLocaleString());
                priceNote.innerHTML = note;
            }
        }
    };

    form.addEventListener('change', window.calculatePrice);
    form.addEventListener('input', window.calculatePrice);
    window.calculatePrice();
}
