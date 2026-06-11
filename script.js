document.addEventListener('DOMContentLoaded', () => {

    // 0. Read selected shop data sent from home.html
    function getSelectedShopData() {
        const params = new URLSearchParams(window.location.search);

        const shopName = params.get('shop');

        if (!shopName) {
            return null;
        }

        return {
            name: shopName,
            type: params.get('type') || 'Pizza',
            location: params.get('location') || 'Nugegoda',
            country: params.get('country') || 'Sri Lanka',
            rating: params.get('rating') || '4.8',
            meta: params.get('meta') || 'Fresh food • Fast delivery',
            image: params.get('image') || 'Assets/logo.png'
        };
    }

    function updateText(selector, value) {
        const element = document.querySelector(selector);
        if (element && value) {
            element.textContent = value;
        }
    }

    function hydrateSelectedShopPage(shop) {
        if (!shop) {
            return;
        }

        document.title = `${shop.name} | Sappy Eats`;

        updateText('.shop-about-content h2', shop.name);
        updateText('.store-name', shop.name);
        updateText('.store-addr', `${shop.location}, ${shop.country}`);

        const shopDescription = document.querySelector('.shop-description');
        if (shopDescription) {
            shopDescription.textContent =
                `${shop.name} is a ${shop.type} food shop in ${shop.location}. Explore popular dishes, add items to your cart, and continue to checkout.`;
        }

        const locationCard = document.querySelector('.shop-details .detail-card:first-child .detail-content');
        if (locationCard) {
            const paragraphs = locationCard.querySelectorAll('p');
            if (paragraphs[0]) paragraphs[0].textContent = shop.name;
            if (paragraphs[1]) paragraphs[1].textContent = `${shop.location}, ${shop.country}`;
        }

        const storeThumb = document.querySelector('.store-thumb');
        if (storeThumb && shop.image) {
            storeThumb.src = shop.image;
            storeThumb.alt = shop.name;
        }

        const logoImage = document.querySelector('.pizza-logo img');
        if (logoImage) {
            logoImage.alt = `${shop.name} Logo`;
        }

        const sectionLabel = document.querySelector('.shop-about-content .section-label');
        if (sectionLabel && shop.rating) {
            sectionLabel.textContent = `${shop.rating} ★ ${shop.type}`;
        }
    }

    const selectedShopData = getSelectedShopData();
    hydrateSelectedShopPage(selectedShopData);

    // 1. Heart Icons interaction
    const hearts = document.querySelectorAll('.heart-indicator');
    hearts.forEach(heart => {
        heart.addEventListener('click', () => {
            heart.classList.toggle('liked');
            if(heart.classList.contains('liked')) {
                heart.classList.remove('far');
                heart.classList.add('fas');
            } else {
                heart.classList.remove('fas');
                heart.classList.add('far');
            }
        });
    });

    // 2. Add to Cart Logic & Sidebar Cart
    const addButtons = document.querySelectorAll('.add-to-cart');
    const cart = {}; // Object to track cart items

    // Helper: update the upsell button label based on whether any upsell items are in cart
    function updateUpsellButtonLabel() {
        const upsellSkipBtn = document.getElementById('upsellSkipBtn');
        if (!upsellSkipBtn) return;
        upsellSkipBtn.textContent = 'Continue to checkout';
    }

    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const headerCartBtn = document.querySelector('.cart-btn');

    // Open & Close Functions
    function toggleCart(show) {
        if(show) {
            cartSidebar.classList.add('active');
            cartOverlay.classList.add('active');
        } else {
            cartSidebar.classList.remove('active');
            cartOverlay.classList.remove('active');
        }
    }

    closeCartBtn.addEventListener('click', () => toggleCart(false));
    cartOverlay.addEventListener('click', () => toggleCart(false));
    if (headerCartBtn) {
        headerCartBtn.addEventListener('click', () => {
            toggleCart(true);
        });
    }

    // Render Cart Function
    function updateSidebarCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let html = '';

        for (const [id, item] of Object.entries(cart)) {
            const itemTotal = item.price * item.qty;
            total += itemTotal;
            html += `
                <div class="new-item-row">
                    <img src="${item.img}" alt="${item.title}" class="new-item-img">
                    <div class="new-item-details">
                        <div class="new-item-title">${item.qty} x ${item.title}</div>
                        <div class="new-item-price">LKR ${itemTotal.toFixed(2)}</div>
                    </div>
                    <div class="new-item-controls">
                        <button class="trash-btn" data-title="${item.title}"><i class="fas fa-trash-alt"></i></button>
                        <span>${item.qty}</span>
                        <button class="plus-btn" data-title="${item.title}"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
            `;
        }

        if (Object.keys(cart).length === 0) {
            html = '<p style="color: var(--text-secondary); text-align: center; margin-top: 20px;">Your cart is empty.</p>';
        }

        cartItemsContainer.innerHTML = html;
        cartTotalPrice.textContent = `LKR ${total.toFixed(2)}`;

        // Attach event listeners for inline + and trash inside cart
        cartItemsContainer.querySelectorAll('.plus-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const title = e.currentTarget.getAttribute('data-title');
                if (cart[title]) {
                    cart[title].qty += 1;
                    updateSidebarCart();
                }
            });
        });
        cartItemsContainer.querySelectorAll('.trash-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const title = e.currentTarget.getAttribute('data-title');
                if (cart[title]) {
                    cart[title].qty -= 1;
                    if(cart[title].qty <= 0) {
                         delete cart[title];
                    }
                    updateSidebarCart();
                }
            });
        });

        // Update Checkout final subtotals as well
        const checkoutTotalElem = document.getElementById('chkFinalTotal');
        const checkoutSubElem = document.getElementById('chkFinalSubtotal');
        const chkItemsCount = document.getElementById('chkItemsCount');
        if(checkoutTotalElem && checkoutSubElem) {
             checkoutSubElem.textContent = `LKR ${total.toFixed(2)}`;
             const finalVal = total + 99.00 + 25.00 - 41.09;
             checkoutTotalElem.textContent = `LKR ${finalVal.toFixed(2)}`;
        }
        if(chkItemsCount) {
             const itemsCount = Object.values(cart).reduce((acc, item) => acc + item.qty, 0);
             chkItemsCount.textContent = itemsCount;
        }
        // Update cart badge counts in both the header and bottom menu
        const itemsCount = Object.values(cart).reduce((acc, item) => acc + item.qty, 0);
        document.querySelectorAll('.cart-count, .bottom-cart-count').forEach(countNode => {
            countNode.textContent = itemsCount;
        });

        if (headerCartBtn) {
            headerCartBtn.classList.toggle('has-items', itemsCount > 0);
        }
        const chkCartItems = document.getElementById('chkCartItems');
        if(chkCartItems) {
            if (Object.keys(cart).length === 0) {
                chkCartItems.innerHTML = '<p style="color: var(--text-secondary); text-align:center; padding:12px;">Your cart is empty.</p>';
                chkCartItems.style.display = 'none';
            } else {
                let itemsHtml = '';
                for (const [id, item] of Object.entries(cart)) {
                    const lineTotal = (item.price * item.qty).toFixed(2);
                    itemsHtml += `<div class="chk-cart-item"><div class="chk-item-left"><div class="chk-item-title">${item.title}</div><div class="chk-item-qty">x${item.qty}</div></div><div class="chk-item-line">LKR ${lineTotal}</div></div>`;
                }
                chkCartItems.innerHTML = itemsHtml;
            }
        }
        // Keep upsell button label in sync after cart changes
        updateUpsellButtonLabel();
    }

    // Toggle cart items in checkout
    const chkCartSummaryElem = document.getElementById('chkCartSummary');
    const chkCartItemsElem = document.getElementById('chkCartItems');
    if (chkCartSummaryElem && chkCartItemsElem) {
        chkCartSummaryElem.addEventListener('click', () => {
            if (chkCartItemsElem.style.display === 'none' || chkCartItemsElem.style.display === '') {
                chkCartItemsElem.style.display = 'block';
            } else {
                chkCartItemsElem.style.display = 'none';
            }
        });
    }

    // Modal Logic
    const goToCheckoutBtn = document.getElementById('goToCheckoutBtn');
    const upsellOverlay = document.getElementById('upsellOverlay');
    const closeUpsellBtn = document.getElementById('closeUpsellBtn');
    const upsellSkipBtn = document.getElementById('upsellSkipBtn');
    
    const checkoutOverlay = document.getElementById('checkoutOverlay');
    const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');

    if(goToCheckoutBtn) {
        goToCheckoutBtn.addEventListener('click', () => {
            checkAuthOrProceed(() => {
                toggleCart(false);
                upsellOverlay.classList.add('active');
                updateUpsellButtonLabel();
            });
        });
    }

    // Bottom menu buttons (mobile)
    const bottomCartBtn = document.getElementById('bottomCartBtn');
    const bottomOrderBtn = document.getElementById('bottomOrderBtn');
    if (bottomCartBtn) {
        bottomCartBtn.addEventListener('click', () => {
            toggleCart(true);
        });
    }
    if (bottomOrderBtn) {
        bottomOrderBtn.addEventListener('click', () => {
            // mirror the header Order Now behavior
            toggleCart(false);
            if (upsellOverlay) upsellOverlay.classList.add('active');
        });
    }

    if(closeUpsellBtn) {
        closeUpsellBtn.addEventListener('click', () => {
            upsellOverlay.classList.remove('active');
        });
    }

    if(upsellSkipBtn) {
        upsellSkipBtn.addEventListener('click', () => {
            upsellOverlay.classList.remove('active');
            checkoutOverlay.classList.add('active');
            updateSidebarCart(); // to refresh checkout totals
        });
    }

    if(closeCheckoutBtn) {
        closeCheckoutBtn.addEventListener('click', () => {
            checkoutOverlay.classList.remove('active');
        });
    }

    // Order Placed / Tracking overlay logic
    const orderPlacedOverlay = document.getElementById('orderPlacedOverlay');
    const closeTrackingBtn = document.getElementById('closeTrackingBtn');
    const contactRiderBtn = document.getElementById('contactRiderBtn');
    const driverEta = document.getElementById('driverEta');
    const orderPlacedItems = document.getElementById('orderPlacedItems');
    const orderPlacedTotal = document.getElementById('orderPlacedTotal');


    function readYummyStorage(key, fallback) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return value === null ? fallback : value;
        } catch (error) {
            return fallback;
        }
    }

    function writeYummyStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn('Unable to save profile data', error);
        }
    }

    function saveOrderToProfile(subtotal) {
        const cartItems = Object.values(cart).map(item => ({
            title: item.title,
            qty: item.qty,
            price: item.price,
            img: item.img
        }));

        if (!cartItems.length) return;

        const deliveryFee = 99;
        const serviceFee = 25;
        const credit = 41.09;
        const finalTotal = Math.max(0, subtotal + deliveryFee + serviceFee - credit);
        const earnedPoints = Math.max(10, Math.floor(finalTotal / 100) * 10);
        const selectedShop = selectedShopData || {};
        const storedUser = readYummyStorage('yummyCurrentUser', {});

        const order = {
            id: 'YM-' + Date.now().toString().slice(-6),
            date: new Date().toISOString(),
            restaurant: selectedShop.name || 'Red Oven Pizza',
            location: selectedShop.location || 'Nugegoda',
            status: 'Preparing',
            subtotal,
            deliveryFee,
            serviceFee,
            credit,
            total: finalTotal,
            pointsEarned: earnedPoints,
            items: cartItems
        };

        const orders = readYummyStorage('yummyOrderHistory', []);
        writeYummyStorage('yummyOrderHistory', [order, ...orders].slice(0, 20));

        const loyalty = readYummyStorage('yummyLoyaltyProfile', {
            points: 2480,
            lifetimeOrders: 18,
            lifetimeSavings: 740,
            tier: 'Gold'
        });

        loyalty.points = Number(loyalty.points || 0) + earnedPoints;
        loyalty.lifetimeOrders = Number(loyalty.lifetimeOrders || 0) + 1;
        loyalty.lifetimeSavings = Number(loyalty.lifetimeSavings || 0) + credit;
        if (loyalty.points >= 3000) loyalty.tier = 'Platinum';
        else if (loyalty.points >= 1500) loyalty.tier = 'Gold';
        else if (loyalty.points >= 600) loyalty.tier = 'Silver';
        else loyalty.tier = 'Bronze';

        writeYummyStorage('yummyLoyaltyProfile', loyalty);

        if (currentAuthUser || storedUser.email) {
            writeYummyStorage('yummyCurrentUser', currentAuthUser || storedUser);
        }
    }

    function openOrderPlaced() {
        // populate summary
        let total = 0;
        orderPlacedItems.innerHTML = '';
        for (const [id, item] of Object.entries(cart)) {
            const line = (item.price * item.qty).toFixed(2);
            total += parseFloat(line);
            const row = document.createElement('div');
            row.className = 'summary-item';
            row.innerHTML = `<div class="summary-item-left"><div class="summary-item-title">${item.title}</div><div class="summary-item-meta">x${item.qty}</div></div><div class="summary-item-line">LKR ${line}</div>`;
            orderPlacedItems.appendChild(row);
        }
        orderPlacedTotal.textContent = `LKR ${total.toFixed(2)}`;
        saveOrderToProfile(total);

        checkoutOverlay.classList.remove('active');
        orderPlacedOverlay.style.display = 'flex';
        startDriverSimulation();
    }

    function closeOrderPlaced() {
        orderPlacedOverlay.style.display = 'none';
        stopDriverSimulation();
    }

    if (closeTrackingBtn) closeTrackingBtn.addEventListener('click', closeOrderPlaced);
    if (contactRiderBtn) contactRiderBtn.addEventListener('click', () => { alert('Contact rider feature not implemented in demo'); });

    // Bind place order buttons
    const placeOrderLarge = document.querySelector('.chk-place-order-large');
    const placeOrderSmall = document.querySelector('.chk-place-order-small');
    if (placeOrderLarge) placeOrderLarge.addEventListener('click', () => { openOrderPlaced(); });
    if (placeOrderSmall) placeOrderSmall.addEventListener('click', () => { openOrderPlaced(); });

    // Leaflet-based driver simulation
    let map = null;
    let riderMarker = null;
    let destinationMarker = null;
    let routeLine = null;
    let driverTimer = null;

    function buildMapPoint(lat, lng) {
        return L.latLng(lat, lng);
    }

    function ensureOrderMap() {
        const canvas = document.getElementById('orderMapCanvas');
        if (!canvas || !window.L) return null;

        if (!map) {
            const storeCoord = buildMapPoint(6.9007, 79.8612);
            const userCoord = buildMapPoint(6.9148, 79.8616);

            map = L.map(canvas, {
                zoomControl: false,
                attributionControl: false,
                scrollWheelZoom: false,
                dragging: false,
                doubleClickZoom: false,
                boxZoom: false,
                keyboard: false,
                tap: false
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            const riderIcon = L.divIcon({
                className: 'leaflet-rider-icon',
                html: '<i class="fas fa-motorcycle"></i>',
                iconSize: [34, 34],
                iconAnchor: [17, 17]
            });

            const destinationIcon = L.divIcon({
                className: 'leaflet-destination-icon',
                html: '<i class="fas fa-map-marker-alt"></i>',
                iconSize: [28, 28],
                iconAnchor: [14, 28]
            });

            riderMarker = L.marker(storeCoord, { icon: riderIcon }).addTo(map);
            destinationMarker = L.marker(userCoord, { icon: destinationIcon }).addTo(map);
            routeLine = L.polyline([storeCoord, userCoord], {
                color: '#C91A25',
                weight: 5,
                opacity: 0.75
            }).addTo(map);

            map.fitBounds(routeLine.getBounds(), { padding: [30, 30] });
        }

        return map;
    }

    function startDriverSimulation() {
        const mapInstance = ensureOrderMap();
        if (!mapInstance || !riderMarker || !routeLine) return;

        const path = routeLine.getLatLngs();
        const start = path[0];
        const end = path[path.length - 1];
        const steps = 42;
        const interpolatedPath = [];

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            interpolatedPath.push({
                lat: start.lat + (end.lat - start.lat) * t,
                lng: start.lng + (end.lng - start.lng) * t,
                eta: Math.max(0, Math.round((1 - t) * 18))
            });
        }

        let index = 0;
        riderMarker.setLatLng(interpolatedPath[0]);
        if (driverEta) driverEta.textContent = `ETA: ${interpolatedPath[0].eta} mins`;

        if (driverTimer) clearInterval(driverTimer);
        driverTimer = setInterval(() => {
            index += 1;
            if (index >= interpolatedPath.length) {
                clearInterval(driverTimer);
                driverTimer = null;
                if (driverEta) driverEta.textContent = 'Arrived';
                return;
            }

            const point = interpolatedPath[index];
            riderMarker.setLatLng([point.lat, point.lng]);
            mapInstance.panTo([point.lat, point.lng], { animate: true, duration: 0.3 });
            if (driverEta) driverEta.textContent = point.eta > 0 ? `ETA: ${point.eta} mins` : 'Arriving';
        }, 1200);

        setTimeout(() => {
            mapInstance.invalidateSize();
        }, 30);
    }

    function stopDriverSimulation() {
        if (driverTimer) clearInterval(driverTimer);
        driverTimer = null;
    }

    // Upsell Add Items
    document.querySelectorAll('.upsell-add-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.upsell-card');
            const title = card.querySelector('h4').textContent;
            const priceText = card.querySelector('p').textContent;
            const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
            const img = card.querySelector('img') ? card.querySelector('img').src : 'Assets/logo.png';
            
            if(cart[title]) {
                 cart[title].qty += 1;
            } else {
                 cart[title] = { title, price, img, qty: 1 };
            }
            updateSidebarCart();
            // Just provide visual feedback
            const icon = this.querySelector('i');
            icon.classList.remove('fa-plus');
            icon.classList.add('fa-check');
            btn.classList.add('is-selected');
            setTimeout(() => {
                icon.classList.remove('fa-check');
                icon.classList.add('fa-plus');
                btn.classList.remove('is-selected');
            }, 900);
        });
    });

    // Bind original Add buttons
    addButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const parent = this.parentNode;
            // Support both dynamic .menu-card and static .fm-card structures
            const card = this.closest('.menu-card') || this.closest('.fm-card');
            if (!card) return;

            // Extract item data depending on structure
            let title = '';
            let price = 0;
            let img = '';

            if (card.querySelector('.food-title')) {
                title = card.querySelector('.food-title').textContent;
                const priceText = card.querySelector('.price').textContent;
                price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
                const imgEl = card.querySelector('.food-img');
                img = imgEl ? imgEl.src : 'Assets/logo.png';
            } else if (card.querySelector('.fm-title')) {
                title = card.querySelector('.fm-title').textContent;
                const priceText = card.querySelector('.fm-price').textContent;
                price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
                const imgEl = card.querySelector('.fm-img-wrapper img');
                img = imgEl ? imgEl.src : 'Assets/logo.png';
            }

            if (!title) return;
            openProductOptionsModal({title, price, img, category: (card.dataset.category || 'Pizza')}, this, parent);
        });
    });

    function bindQtyEvents(container, originalCartBtn, itemTitle) {
        const minusBtn = container.querySelector('.minus');
        const plusBtn = container.querySelector('.plus');
        const valSpan = container.querySelector('.qty-value');

        plusBtn.addEventListener('click', () => {
            let val = parseInt(valSpan.textContent);
            valSpan.textContent = val + 1;
            
            if (cart[itemTitle]) {
                cart[itemTitle].qty = val + 1;
                updateSidebarCart();
            }
        });

        minusBtn.addEventListener('click', () => {
            let val = parseInt(valSpan.textContent);
            if (val > 1) {
                valSpan.textContent = val - 1;
                
                if (cart[itemTitle]) {
                    cart[itemTitle].qty = val - 1;
                    updateSidebarCart();
                }
            } else if (val === 1 && originalCartBtn) {
                // Remove from cart
                delete cart[itemTitle];
                updateSidebarCart();
                
                // Restore original icon
                container.parentNode.replaceChild(originalCartBtn, container);
            }
        });
    }

    
    // 4. Food Category Auto-sliding Carousel
    const track = document.querySelector(".food-category-track");
    const carousel = document.querySelector(".food-category-carousel");

    if (track && carousel) {
        const originalCards = Array.from(track.children);

        originalCards.forEach((card) => {
            const clone = card.cloneNode(true);
            track.appendChild(clone);
        });

        if (window.lucide) {
            lucide.createIcons();
        }

        let slideCurrentIndex = 0;

        function getCardWidth() {
            const card = track.querySelector(".food-category-card");
            const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
            return card.offsetWidth + gap;
        }

        function slideNext() {
            const cardWidth = getCardWidth();
            slideCurrentIndex++;

            track.style.transition = "transform 0.55s ease";
            track.style.transform = `translateX(-${slideCurrentIndex * cardWidth}px)`;

            if (slideCurrentIndex >= originalCards.length) {
                setTimeout(() => {
                    track.style.transition = "none";
                    slideCurrentIndex = 0;
                    track.style.transform = `translateX(0px)`;
                }, 560);
            }
        }

        function slidePrev() {
            const cardWidth = getCardWidth();
            if (slideCurrentIndex <= 0) {
                track.style.transition = "none";
                slideCurrentIndex = originalCards.length;
                track.style.transform = `translateX(-${slideCurrentIndex * cardWidth}px)`;
                // force reflow to apply the transition jumping
                void track.offsetWidth;
            }
            slideCurrentIndex--;
            track.style.transition = "transform 0.55s ease";
            track.style.transform = `translateX(-${slideCurrentIndex * cardWidth}px)`;
        }

        const prevBtnCat = document.querySelector(".prev-btn-cat");
        const nextBtnCat = document.querySelector(".next-btn-cat");

        if (nextBtnCat) {
            nextBtnCat.addEventListener("click", () => {
                slideNext();
            });
        }
        
        if (prevBtnCat) {
            prevBtnCat.addEventListener("click", () => {
                slidePrev();
            });
        }

        window.addEventListener("resize", () => {
            const cardWidth = getCardWidth();
            track.style.transition = "none";
            track.style.transform = `translateX(-${slideCurrentIndex * cardWidth}px)`;
        });
    }

    // 5. Dynamic Top Picks based on Category Selection
    const menuData = {
        "Pizza": {
            filters: ["All", "Vegetarian", "Pepperoni", "Margherita", "BBQ Chicken"],
            items: [
                { category: "Vegetarian", name: "Veggie Supreme", desc: "Olive, Mushroom, Bell Pepper", price: 45.0, rating: 4.8, img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=256&h=256&fit=crop" },
                { category: "Pepperoni", name: "Pepperoni Feast", desc: "Pepperoni, Cheese, Sauce", price: 55.0, rating: 5.0, img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=256&h=256&fit=crop" },
                { category: "Margherita", name: "Classic Margherita", desc: "Basil, Mozzarella, Tomato", price: 40.0, rating: 4.5, img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=256&h=256&fit=crop" },
                { category: "BBQ Chicken", name: "BBQ Roast Pizza", desc: "Chicken, BBQ Sauce, Onion", price: 65.0, rating: 4.9, img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=256&h=256&fit=crop" }
            ]
        },
        "Pasta": {
            filters: ["All", "Spaghetti", "Penne", "Macaroni"],
            items: [
                { category: "Spaghetti", name: "Egg Chicken Spaghetti", desc: "Spaghetti, Egg, Syrup, Sauces", price: 57.0, rating: 5.0, img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=256&h=256&fit=crop" },
                { category: "Penne", name: "Penne Arrabiata", desc: "Tomato, Garlic, Chili, Parsley", price: 45.0, rating: 4.7, img: "https://images.unsplash.com/photo-1621510456681-2330135e5871?w=256&h=256&fit=crop" },
                { category: "Spaghetti", name: "Seafood Spaghetti", desc: "Shrimp, Squid, Garlic, Lemon", price: 68.0, rating: 4.9, img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=256&h=256&fit=crop" }
            ]
        },
        // Fallback for others to avoid breaking
        "Default": {
            filters: ["All", "Popular", "New", "Chef's Special"],
            items: [
                { category: "Popular", name: "Egg Chicken Spaghetti", desc: "Spaghetti, Egg, Syrup, Sauces", price: 57.0, rating: 5.0, img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=256&h=256&fit=crop" },
                { category: "Chef's Special", name: "Salmon Salad", desc: "Salmon, Egg, Tomato, Greens", price: 68.0, rating: 5.0, img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=256&h=256&fit=crop" },
                { category: "New", name: "Shrimp Noodles", desc: "Shrimp, Lemon, Noodles, Brocolli", price: 40.0, rating: 5.0, img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=256&h=256&fit=crop" },
                { category: "Popular", name: "Chicken Carrot Tikka", desc: "Chicken, Carrots, Spices, Greads", price: 85.0, rating: 5.0, img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=256&h=256&fit=crop" },
                { category: "New", name: "Lemon Chicken Grill", desc: "Spices, Lemon, Chicken, Sweet, Onion", price: 95.0, rating: 5.0, img: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=256&h=256&fit=crop" },
                { category: "Chef's Special", name: "Salmon Roast", desc: "Spaghetti, Egg, Syrup, Bread", price: 67.0, rating: 5.0, img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=256&h=256&fit=crop" }
            ]
        }
    };

    const filtersContainer = document.getElementById("dynamic-filters");
    const menuGridContainer = document.getElementById("dynamic-menu-grid");
    
    // Make sure we have the container
    if (filtersContainer && menuGridContainer) {
        
        const initialCategory = selectedShopData ? selectedShopData.type : "Default";
        let currentCategoryData = menuData[initialCategory] || menuData["Default"];

        function renderGrid(items, filterBy = "All") {
            menuGridContainer.innerHTML = "";
            const filteredItems = filterBy === "All" ? items : items.filter(item => item.category === filterBy);

            filteredItems.forEach(item => {
                const card = document.createElement("div");
                card.className = "menu-card";
                card.innerHTML = `
                    <div class="card-header">
                        <img src="${item.img}" alt="${item.name}" class="food-img">
                        <div class="rating">
                            ${item.rating.toFixed(1)} <i class="fas fa-star star-icon"></i>
                        </div>
                    </div>
                    <div class="card-body">
                        <i class="far fa-heart heart-indicator"></i>
                        <h3 class="food-title">${item.name}</h3>
                        <p class="food-desc">${item.desc}</p>
                        <div class="card-footer">
                            <button class="action-btn-group add-to-cart">
                                <i class="fas fa-shopping-cart"></i>
                            </button>
                            <span class="price">$${item.price.toFixed(2)}</span>
                        </div>
                    </div>
                `;
                menuGridContainer.appendChild(card);
                
                // Attach events exactly like the hardcoded ones
                const heart = card.querySelector('.heart-indicator');
                heart.addEventListener('click', () => {
                    heart.classList.toggle('liked');
                    if(heart.classList.contains('liked')) {
                        heart.classList.remove('far'); heart.classList.add('fas');
                    } else {
                        heart.classList.remove('fas'); heart.classList.add('far');
                    }
                });

                const cartBtn = card.querySelector('.add-to-cart');
                cartBtn.addEventListener('click', function() {
                    const parent = this.parentNode;
                    const title = item.name;

                    openProductOptionsModal({title: item.name, price: item.price, img: item.img, category: item.category || 'Pizza', desc: item.desc, rating: item.rating}, this, parent);
                });
            });
        }

        function renderFilters(filters, activeFilter = "All") {
            filtersContainer.innerHTML = "";
            filters.forEach(filter => {
                const btn = document.createElement("button");
                btn.className = `cat-btn ${filter === activeFilter ? "active" : ""}`;
                btn.textContent = filter;
                btn.addEventListener("click", () => {
                    document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                    renderGrid(currentCategoryData.items, filter);
                });
                filtersContainer.appendChild(btn);
            });
        }

        // Initialize with selected shop type from home.html
        renderFilters(currentCategoryData.filters);
        renderGrid(currentCategoryData.items);

        if (selectedShopData) {
            const matchingCategoryCard = Array.from(document.querySelectorAll('.food-category-card')).find((card) => {
                return card.getAttribute('data-category') === selectedShopData.type;
            });

            if (matchingCategoryCard) {
                matchingCategoryCard.style.borderColor = "var(--accent-color)";
            }
        }

        // Bind Carousel Cards click to swap Category Data
        document.querySelectorAll(".food-category-card").forEach(card => {
            card.addEventListener("click", () => {
                const category = card.getAttribute("data-category") || "Default";
                currentCategoryData = menuData[category] || menuData["Default"];
                
                // Remove highlight from all, highlight the selected one
                document.querySelectorAll(".food-category-card").forEach(c => {
                    c.style.borderColor = "transparent";
                });
                card.style.borderColor = "var(--accent-color)";

                // Re-render
                renderFilters(currentCategoryData.filters);
                renderGrid(currentCategoryData.items);
                
                // Scroll to top picks nicely
                document.querySelector(".top-picks-section").scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    // 6. Static Explore Menu categorization filter (left sidebar)
    const sidebarCategoryItems = document.querySelectorAll('.menu-sidebar ul li');
    const fmCards = document.querySelectorAll('.fm-card');
    if (sidebarCategoryItems && fmCards) {
        sidebarCategoryItems.forEach(li => {
            li.addEventListener('click', () => {
                // mark active
                sidebarCategoryItems.forEach(x => x.classList.remove('active'));
                li.classList.add('active');

                const selected = li.textContent.trim();
                // show all
                if (/all/i.test(selected)) {
                    fmCards.forEach(card => card.style.display = '');
                    return;
                }

                // filter by data-category (case-insensitive)
                fmCards.forEach(card => {
                    const cat = (card.dataset.category || '').trim();
                    if (cat && cat.toLowerCase() === selected.toLowerCase()) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });

        if (selectedShopData) {
            const autoCategory = Array.from(sidebarCategoryItems).find((item) => {
                return item.textContent.trim().toLowerCase() === selectedShopData.type.toLowerCase();
            });

            if (autoCategory) {
                autoCategory.click();
            }
        }
    }

    let currentAuthUser = readYummyStorage('yummyCurrentUser', null); 
    let currentModalProduct = null;
    let productLoaderTimer = null;

    function openProductOptionsModal(item, originalBtn, parentNode) {
        currentModalProduct = {
            item,
            originalBtn,
            parentNode,
            qty: 1,
            extraCheese: false,
            size: 'Large'
        };

        const overlay = document.getElementById('productOptionsOverlay');
        const modal = document.querySelector('.yhm-product-modal');
        if (overlay) overlay.classList.add('active');
        if (modal) {
            modal.classList.add('is-loading');
            if (productLoaderTimer) clearTimeout(productLoaderTimer);
            productLoaderTimer = setTimeout(() => {
                modal.classList.remove('is-loading');
                productLoaderTimer = null;
            }, 650);
        }

        const titleEl = document.getElementById('pmTitle');
        const imgEl = document.getElementById('pmImg');
        const categoryEl = document.getElementById('pmCategory');
        const ratingEl = document.getElementById('pmRating');
        const descEl = document.getElementById('pmDescription');

        if (titleEl) titleEl.textContent = item.title;
        if (imgEl) imgEl.src = item.img;
        if (categoryEl) categoryEl.textContent = item.category || 'Pizza';
        if (ratingEl) ratingEl.textContent = (item.rating || 4.8).toFixed ? (item.rating || 4.8).toFixed(1) : (item.rating || '4.8');
        if (descEl) descEl.textContent = item.desc || 'Fresh, hot, made to order.';
        try { document.getElementById('pmTopPrice').textContent = item.price.toFixed(2); } catch(e) {}

        const extraCheese = document.getElementById('pmExtraCheese');
        if (extraCheese) extraCheese.checked = false;

        const radios = document.querySelectorAll('input[name="pmsize"]');
        radios.forEach((radio, index) => {
            radio.checked = index === 0;
        });

        currentModalProduct.qty = 1;
        const qtyEl = document.getElementById('pmQtyVal');
        if (qtyEl) qtyEl.textContent = '1';

        updateModalTotals();
    }

    function updateModalTotals() {
        if (!currentModalProduct) return;
        const base = currentModalProduct.item.price;
        const extra = currentModalProduct.extraCheese ? 250 : 0;
        const qty = currentModalProduct.qty;
        const sub = (base + extra) * qty;

        const amEl = document.getElementById('pmAddToCartBtn');
        if (amEl) {
            amEl.innerHTML = 'Add ' + qty + ' &bull; LKR ' + sub.toFixed(2);
        }

        const totalEl = document.getElementById('pmFinalTotal');
        if (totalEl) totalEl.textContent = sub.toFixed(2);
    }

    // Modal bindings
    function closeProductOptionsModal() {
        const overlay = document.getElementById('productOptionsOverlay');
        const modal = document.querySelector('.yhm-product-modal');
        if (overlay) overlay.classList.remove('active');
        if (modal) modal.classList.remove('is-loading');
        if (productLoaderTimer) clearTimeout(productLoaderTimer);
        productLoaderTimer = null;
    }

    document.getElementById('closeProductBtn')?.addEventListener('click', closeProductOptionsModal);

    document.getElementById('pmExtraCheese')?.addEventListener('change', (e) => {
        if(currentModalProduct) {
            currentModalProduct.extraCheese = e.target.checked;
            updateModalTotals();
        }
    });

    document.querySelectorAll('input[name="pmsize"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (currentModalProduct) currentModalProduct.size = e.target.value;
        });
    });

    document.getElementById('pmQtyMinus')?.addEventListener('click', () => {
        if (currentModalProduct && currentModalProduct.qty > 1) {
            currentModalProduct.qty--;
            document.getElementById('pmQtyVal').textContent = currentModalProduct.qty;
            updateModalTotals();
        }
    });

    document.getElementById('pmQtyPlus')?.addEventListener('click', () => {
        if (currentModalProduct) {
            currentModalProduct.qty++;
            document.getElementById('pmQtyVal').textContent = currentModalProduct.qty;
            updateModalTotals();
        }
    });

    function doAddToCart() {
        const title = currentModalProduct.item.title;
        const finalPrice = currentModalProduct.item.price + (currentModalProduct.extraCheese ? 250 : 0);
        
        if (cart[title]) {
            cart[title].qty += currentModalProduct.qty;
        } else {
            cart[title] = { title, price: finalPrice, img: currentModalProduct.item.img, qty: currentModalProduct.qty };
        }
        
        // Transform the button on the main page dynamically if requested
        if (currentModalProduct.originalBtn && currentModalProduct.parentNode) {
            const qtyDiv = document.createElement('div');
            qtyDiv.className = 'action-btn-group qty-control';
            qtyDiv.innerHTML = `<button class="qty-btn minus">-</button><span class="qty-value">${cart[title].qty}</span><button class="qty-btn plus">+</button>`;
            bindQtyEvents(qtyDiv, currentModalProduct.originalBtn, title);
            try {
                currentModalProduct.parentNode.replaceChild(qtyDiv, currentModalProduct.originalBtn);
            } catch(e){}
        }

        updateSidebarCart();
        closeProductOptionsModal();
    }

    document.getElementById('pmAddToCartBtn')?.addEventListener('click', () => {
        doAddToCart();
    });
    
    // Auth Modal handling
    let authMode = 'login';

    function setAuthMode(mode) {
        authMode = mode;
        const isSignup = mode === 'signup';
        const title = document.getElementById('authTitle');
        const subtitle = document.getElementById('authSubtitle');
        const submit = document.getElementById('authSubmitBtn');
        const nameGroup = document.getElementById('authNameGroup');
        const loginTab = document.getElementById('authLoginTab');
        const signupTab = document.getElementById('authSignupTab');
        const toggleText = document.getElementById('authToggleText');
        const toggleLink = document.getElementById('authToggleLink');

        if (title) title.textContent = isSignup ? 'Create account' : 'Login to continue';
        if (subtitle) subtitle.textContent = isSignup ? 'Create your account for faster checkout.' : 'Continue to checkout securely.';
        if (submit) submit.textContent = isSignup ? 'Create Account' : 'Continue';
        if (nameGroup) nameGroup.classList.toggle('is-hidden', !isSignup);
        if (loginTab) loginTab.classList.toggle('active', !isSignup);
        if (signupTab) signupTab.classList.toggle('active', isSignup);
        if (toggleText) toggleText.textContent = isSignup ? 'Already have an account?' : 'New here?';
        if (toggleLink) toggleLink.textContent = isSignup ? 'Login' : 'Create account';
    }

    function showAuthModal(callback) {
        const authOverlay = document.getElementById('authOverlay');
        if (authOverlay) authOverlay.classList.add('active');
        setAuthMode('login');
        window.pendingAuthCallback = callback;
    }

    function closeAuthModal() {
        const authOverlay = document.getElementById('authOverlay');
        if (authOverlay) authOverlay.classList.remove('active');
    }

    function checkAuthOrProceed(callback) {
        if (currentAuthUser) {
            callback();
        } else {
            showAuthModal(callback);
        }
    }

    document.getElementById('authLoginTab')?.addEventListener('click', () => setAuthMode('login'));
    document.getElementById('authSignupTab')?.addEventListener('click', () => setAuthMode('signup'));
    document.getElementById('authToggleLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        setAuthMode(authMode === 'login' ? 'signup' : 'login');
    });

    document.getElementById('closeAuthBtn')?.addEventListener('click', closeAuthModal);
    document.getElementById('authOverlay')?.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'authOverlay') closeAuthModal();
    });

    document.getElementById('authForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]')?.value || '';
        const name = document.getElementById('authName')?.value || '';
        currentAuthUser = { email, name: name || email.split('@')[0], mode: authMode };
        localStorage.setItem('yummyCurrentUser', JSON.stringify(currentAuthUser));
        closeAuthModal();
        if (window.pendingAuthCallback) {
            window.pendingAuthCallback();
            window.pendingAuthCallback = null;
        }
    });
    
    document.getElementById('pmBuyNowBtn')?.addEventListener('click', () => {
        if (!currentModalProduct) return;

        // Step-by-step flow:
        // 1) close the product popup first
        // 2) show login/sign-up only if needed
        // 3) then show popular add-ons before checkout
        closeProductOptionsModal();

        setTimeout(() => {
            checkAuthOrProceed(() => {
                doAddToCart();

                setTimeout(() => {
                    const upsell = document.getElementById('upsellOverlay');
                    if (upsell) upsell.classList.add('active');
                    updateUpsellButtonLabel();
                }, 180);
            });
        }, 220);
    });
});

// Initialize Lucide Icons
lucide.createIcons();

document.addEventListener("DOMContentLoaded", () => {
  const revealItems = document.querySelectorAll(".reveal-item");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add("is-visible");
          }, index * 120);

          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  revealItems.forEach((item) => {
    revealObserver.observe(item);
  });

  const orderButton = document.querySelector(".hero-btn");

  if (orderButton) {
    orderButton.addEventListener("click", () => {
      console.log("Order button clicked");
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  const menuBtn = document.querySelector(".mobile-menu-btn");
  const mobileNav = document.querySelector(".mobile-nav");

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener("click", () => {
      mobileNav.classList.toggle("is-open");

      const isOpen = mobileNav.classList.contains("is-open");

      menuBtn.innerHTML = isOpen
        ? '<i data-lucide="x"></i>'
        : '<i data-lucide="menu"></i>';

      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const footerLinks = document.querySelectorAll(".footer-link-column a, .footer-socials a");

  footerLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");

      if (href === "#") {
        e.preventDefault();
      }
    });
  });
});

// Simple slider for the shop-about section
document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();

    const slides = document.querySelectorAll(".shop-about-section .slide");
    const dots = document.querySelectorAll(".shop-about-section .dot");

    if (!slides.length) return;

    let currentSlide = 0;
    const intervalTime = 3000;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle("active", i === index);
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === index);
        });

        currentSlide = index;
    }

    function nextSlide() {
        const nextIndex = (currentSlide + 1) % slides.length;
        showSlide(nextIndex);
    }

    let slideInterval = setInterval(nextSlide, intervalTime);

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            showSlide(index);

            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, intervalTime);
        });
    });
});

// Updated Testimonial Carousel + Add Review Function
document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    const track = document.querySelector(".testimonial-track");
    const prevBtn = document.querySelector(".testimonial-prev");
    const nextBtn = document.querySelector(".testimonial-next");
    const dotsWrap = document.querySelector(".testimonial-dots");

    const reviewForm = document.getElementById("reviewForm");
    const reviewName = document.getElementById("reviewName");
    const reviewRole = document.getElementById("reviewRole");
    const reviewRating = document.getElementById("reviewRating");
    const reviewMessage = document.getElementById("reviewMessage");
    const reviewCounter = document.getElementById("reviewCounter");
    const reviewFormMessage = document.getElementById("reviewFormMessage");
    const openReviewFormBtn = document.getElementById("openReviewFormBtn");
    const closeReviewFormBtn = document.getElementById("closeReviewFormBtn");

    if (closeReviewFormBtn && reviewForm && openReviewFormBtn) {
        closeReviewFormBtn.addEventListener("click", () => {
            reviewForm.classList.remove("is-open");
            reviewForm.classList.add("review-form-hidden");

            openReviewFormBtn.style.display = "inline-flex";

            if (typeof lucide !== "undefined") {
                lucide.createIcons();
            }
        });
    }

    if (openReviewFormBtn && reviewForm) {
        openReviewFormBtn.addEventListener("click", () => {
            reviewForm.classList.add("is-open");
            reviewForm.classList.remove("review-form-hidden");

            openReviewFormBtn.style.display = "none";

            if (typeof lucide !== "undefined") {
                lucide.createIcons();
            }
        });
    }

    const STORAGE_KEY = "redOvenCustomerReviews";

    if (!track) return;

    let currentIndex = 0;
    let cards = Array.from(track.querySelectorAll(".testimonial-card"));

    function getVisibleCards() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }

    function getGap() {
        return parseFloat(window.getComputedStyle(track).gap) || 22;
    }

    function getMaxIndex() {
        return Math.max(0, cards.length - getVisibleCards());
    }

    function getInitials(name) {
        return (
            name
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map(word => word.charAt(0).toUpperCase())
                .join("") || "C"
        );
    }

    function buildStars(rating) {
        const safeRating = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));
        return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
    }

    function createReviewCard(review) {
        const card = document.createElement("div");
        card.className = "testimonial-card user-added-review";

        card.innerHTML = `
            <div class="quote-mark">“</div>
            <div class="stars">${buildStars(review.rating)}</div>

            <p class="testimonial-text">${review.message}</p>

            <div class="client-info">
                <div class="client-avatar">${getInitials(review.name)}</div>
                <div>
                    <h4>${review.name}</h4>
                    <span>${review.role || "Regular Customer"}</span>
                </div>
            </div>
        `;

        return card;
    }

    function getSavedReviews() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (error) {
            return [];
        }
    }

    function saveReviews(reviews) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
        } catch (error) {
            console.warn("Reviews could not be saved.", error);
        }
    }

    function loadSavedReviews() {
        const savedReviews = getSavedReviews();

        savedReviews.forEach(review => {
            track.appendChild(createReviewCard(review));
        });

        cards = Array.from(track.querySelectorAll(".testimonial-card"));
    }

    function renderDots() {
        if (!dotsWrap) return;

        dotsWrap.innerHTML = "";

        const totalDots = getMaxIndex() + 1;

        for (let i = 0; i < totalDots; i++) {
            const dot = document.createElement("button");
            dot.className = "testimonial-dot";
            dot.type = "button";
            dot.setAttribute("aria-label", `Testimonial slide ${i + 1}`);

            dot.addEventListener("click", () => {
                currentIndex = i;
                updateCarousel();
            });

            dotsWrap.appendChild(dot);
        }
    }

    function updateDots() {
        if (!dotsWrap) return;

        const dots = dotsWrap.querySelectorAll(".testimonial-dot");

        dots.forEach((dot, index) => {
            dot.classList.toggle("active", index === currentIndex);
        });
    }

    function updateCarousel() {
        cards = Array.from(track.querySelectorAll(".testimonial-card"));

        const maxIndex = getMaxIndex();

        if (currentIndex > maxIndex) currentIndex = maxIndex;
        if (currentIndex < 0) currentIndex = 0;

        const cardWidth = cards[0] ? cards[0].offsetWidth : 0;
        const moveX = currentIndex * (cardWidth + getGap());

        track.style.transform = `translateX(-${moveX}px)`;

        updateDots();
    }

    function refreshCarousel() {
        cards = Array.from(track.querySelectorAll(".testimonial-card"));
        renderDots();
        updateCarousel();
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            const maxIndex = getMaxIndex();
            currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
            updateCarousel();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            const maxIndex = getMaxIndex();
            currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
            updateCarousel();
        });
    }

    window.addEventListener("resize", refreshCarousel);

    if (reviewMessage && reviewCounter) {
        reviewMessage.addEventListener("input", () => {
            reviewCounter.textContent = `${reviewMessage.value.length}/180`;
        });
    }

    if (reviewForm) {
        reviewForm.addEventListener("submit", event => {
            event.preventDefault();

            const newReview = {
                name: reviewName.value.trim(),
                role: reviewRole.value.trim() || "Regular Customer",
                rating: reviewRating.value,
                message: reviewMessage.value.trim()
            };

            if (!newReview.name || !newReview.message) {
                if (reviewFormMessage) {
                    reviewFormMessage.textContent = "Please add your name and review.";
                }
                return;
            }

            const savedReviews = getSavedReviews();
            savedReviews.push(newReview);
            saveReviews(savedReviews);

            track.appendChild(createReviewCard(newReview));

            cards = Array.from(track.querySelectorAll(".testimonial-card"));
            currentIndex = getMaxIndex();

            refreshCarousel();

            reviewForm.reset();

            if (reviewCounter) {
                reviewCounter.textContent = "0/180";
            }

            if (reviewFormMessage) {
                reviewFormMessage.textContent = "Thank you! Your review has been added.";

                setTimeout(() => {
                    reviewFormMessage.textContent = "";
                }, 3000);
            }

            if (typeof lucide !== "undefined") {
                lucide.createIcons();
            }
        });
    }

    loadSavedReviews();
    refreshCarousel();
});


/* ================= SINGLE-PAGE PROFILE CONTROLLER ================= */
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const profileTriggers = document.querySelectorAll('[data-show-profile], a[href="#profile"]');
  const normalPageLinks = document.querySelectorAll('.pizza-nav a[href^="#"]:not([href="#profile"]), .mobile-nav a[href^="#"]:not([href="#profile"]), .profile-page a[href^="#"]:not([href="#profile"]):not([data-open-tab])');

  function setHeaderActiveForProfile(isProfile) {
    document.querySelectorAll('.pizza-nav a, .mobile-nav a').forEach((link) => {
      const isProfileLink = link.getAttribute('href') === '#profile' || link.hasAttribute('data-show-profile');
      link.classList.toggle('active', isProfile && isProfileLink);
      if (!isProfile && isProfileLink) link.classList.remove('active');
    });
  }

  function closeMobileNav() {
    const mobileNav = document.querySelector('.mobile-nav');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileNav) mobileNav.classList.remove('is-open');
    if (menuBtn) menuBtn.innerHTML = '<i data-lucide="menu"></i>';
    if (window.lucide) lucide.createIcons();
  }

  window.showProfilePage = function showProfilePage(tabName) {
    body.classList.add('profile-view');
    setHeaderActiveForProfile(true);
    closeMobileNav();
    const profile = document.getElementById('profile');
    if (profile) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (tabName) {
      setTimeout(() => {
        const tab = document.querySelector(`.profile-tab-btn[data-profile-tab="${tabName}"]`);
        if (tab) tab.click();
      }, 80);
    }
    if (history.replaceState) history.replaceState(null, '', '#profile');
  };

  window.showRestaurantPage = function showRestaurantPage(targetId) {
    body.classList.remove('profile-view');
    setHeaderActiveForProfile(false);
    closeMobileNav();
    const target = targetId ? document.getElementById(targetId.replace('#', '')) : document.getElementById('home');
    setTimeout(() => {
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 30);
    if (targetId && history.replaceState) history.replaceState(null, '', '#' + targetId.replace('#', ''));
  };

  profileTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      window.showProfilePage();
    });
  });

  normalPageLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href') || '';
      if (!href.startsWith('#') || href === '#') return;
      event.preventDefault();
      window.showRestaurantPage(href.slice(1));
    });
  });

  document.querySelectorAll('[data-open-tab]').forEach((node) => {
    node.addEventListener('click', () => {
      if (!body.classList.contains('profile-view')) {
        window.showProfilePage(node.dataset.openTab);
      }
    });
  });

  if (window.location.hash === '#profile') {
    window.showProfilePage();
  }
});


document.addEventListener('DOMContentLoaded', () => {
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  const defaults = {
    user: {
      name: 'Chethaka Fernando',
      email: 'chethaka2003@gmail.com',
      phone: '+94 77 123 4567',
      birthday: '2003-05-12'
    },
    loyalty: {
      points: 2480,
      lifetimeOrders: 18,
      lifetimeSavings: 740,
      tier: 'Gold'
    },
    orders: [
      {
        id: 'YM-452901',
        date: new Date(Date.now() - 1000 * 60 * 26).toISOString(),
        restaurant: 'Red Oven Pizza',
        location: 'Nugegoda',
        status: 'Preparing',
        total: 3320,
        pointsEarned: 330,
        items: [
          { title: 'Pepperoni Feast', qty: 1, price: 1650 },
          { title: 'Classic Margherita', qty: 1, price: 1450 }
        ]
      },
      {
        id: 'YM-449208',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        restaurant: 'Urban Pizza House',
        location: 'Colombo',
        status: 'Delivered',
        total: 2450,
        pointsEarned: 240,
        items: [
          { title: 'BBQ Roast Pizza', qty: 1, price: 1900 },
          { title: 'Coke Zero', qty: 2, price: 250 }
        ]
      },
      {
        id: 'YM-441610',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
        restaurant: 'Red Oven Pizza',
        location: 'Nugegoda',
        status: 'Delivered',
        total: 1880,
        pointsEarned: 180,
        items: [
          { title: 'Burger Combo', qty: 1, price: 1180 },
          { title: 'Chocolate Lava Cake', qty: 1, price: 700 }
        ]
      }
    ]
  };

  function readJSON(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value === null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function formatLKR(value) {
    return 'LKR ' + Number(value || 0).toLocaleString('en-LK', { maximumFractionDigits: 0 });
  }

  function toast(message) {
    const node = $('#profileToast');
    if (!node) return;
    node.textContent = message;
    node.classList.add('show');
    clearTimeout(window.__profileToastTimer);
    window.__profileToastTimer = setTimeout(() => node.classList.remove('show'), 2200);
  }

  function getProfileUser() {
    const stored = readJSON('yummyCurrentUser', null);
    const saved = readJSON('yummyProfileSettings', null);
    return {
      ...defaults.user,
      ...(stored || {}),
      ...(saved || {})
    };
  }

  function getLoyalty() {
    return {
      ...defaults.loyalty,
      ...readJSON('yummyLoyaltyProfile', {})
    };
  }

  function getOrders() {
    const saved = readJSON('yummyOrderHistory', []);
    const merged = [...saved, ...defaults.orders];
    const seen = new Set();
    return merged.filter(order => {
      if (seen.has(order.id)) return false;
      seen.add(order.id);
      return true;
    }).slice(0, 12);
  }

  function getTierMeta(points) {
    if (points >= 3000) return { tier: 'Platinum', next: 5000, min: 3000, label: 'Platinum member' };
    if (points >= 1500) return { tier: 'Gold', next: 3000, min: 1500, label: 'Gold member' };
    if (points >= 600) return { tier: 'Silver', next: 1500, min: 600, label: 'Silver member' };
    return { tier: 'Bronze', next: 600, min: 0, label: 'Bronze member' };
  }

  function hydrateProfile() {
    const user = getProfileUser();
    const loyalty = getLoyalty();
    const orders = getOrders();
    const firstName = (user.name || user.email || 'Customer').split(' ')[0];
    const initial = (user.name || user.email || 'C').trim().charAt(0).toUpperCase();

    $('#profileFirstName') && ($('#profileFirstName').textContent = firstName);
    $('#profileAvatar') && ($('#profileAvatar').textContent = initial);

    $('#fullNameInput') && ($('#fullNameInput').value = user.name || '');
    $('#emailInput') && ($('#emailInput').value = user.email || '');
    $('#phoneInput') && ($('#phoneInput').value = user.phone || '');
    $('#birthdayInput') && ($('#birthdayInput').value = user.birthday || '');

    $('#loyaltyPoints') && ($('#loyaltyPoints').textContent = Number(loyalty.points || 0).toLocaleString('en-LK'));
    $('#lifetimeOrders') && ($('#lifetimeOrders').textContent = Number(loyalty.lifetimeOrders || orders.length).toLocaleString('en-LK'));
    $('#lifetimeSavings') && ($('#lifetimeSavings').textContent = formatLKR(loyalty.lifetimeSavings || 0));

    const thisMonthTotal = orders
      .filter(order => new Date(order.date).getMonth() === new Date().getMonth())
      .reduce((sum, order) => sum + Number(order.total || 0), 0);
    $('#monthlySpend') && ($('#monthlySpend').textContent = formatLKR(thisMonthTotal || 8450));

    const tierMeta = getTierMeta(Number(loyalty.points || 0));
    const nextRemaining = Math.max(0, tierMeta.next - Number(loyalty.points || 0));
    const progress = Math.min(100, Math.round(((Number(loyalty.points || 0) - tierMeta.min) / (tierMeta.next - tierMeta.min)) * 100));
    $('#tierPill') && ($('#tierPill').innerHTML = `<i class="fas fa-crown"></i> ${tierMeta.label}`);
    $('#nextTierText') && ($('#nextTierText').textContent = nextRemaining > 0 ? `${nextRemaining.toLocaleString('en-LK')} points to next tier` : 'Top tier unlocked');
    $('#tierProgressPercent') && ($('#tierProgressPercent').textContent = `${progress}%`);
    $('#tierProgressBar') && ($('#tierProgressBar').style.width = `${progress}%`);

    const latest = orders[0];
    if (latest) {
      $('#latestOrderRestaurant') && ($('#latestOrderRestaurant').textContent = latest.restaurant);
      $('#latestOrderMeta') && ($('#latestOrderMeta').textContent = latest.items.map(item => `${item.qty}x ${item.title}`).join(', '));
      const status = $('#latestOrderStatus');
      if (status) {
        status.textContent = latest.status || 'Preparing';
        status.className = 'status-pill ' + String(latest.status || 'preparing').toLowerCase();
      }
    }

    renderOrders(orders);
  }

  function renderOrders(orders) {
    const list = $('#ordersList');
    if (!list) return;
    list.innerHTML = orders.map(order => {
      const itemText = order.items.map(item => `${item.qty} x ${item.title}`).join(' • ');
      const date = new Date(order.date).toLocaleDateString('en-LK', { month: 'short', day: 'numeric', year: 'numeric' });
      const statusClass = String(order.status || 'Delivered').toLowerCase();
      return `
        <article class="order-history-card">
          <div>
            <h3>${order.restaurant}</h3>
            <p>${itemText}</p>
            <div class="order-meta">
              <span>${order.id}</span>
              <span>${date}</span>
              <span>${order.location || 'Nugegoda'}</span>
              <span class="status-text-${statusClass}">${order.status || 'Delivered'}</span>
              <span>+${Number(order.pointsEarned || 0).toLocaleString('en-LK')} pts</span>
            </div>
          </div>
          <div class="order-history-actions">
            <strong>${formatLKR(order.total)}</strong>
            <button type="button" data-reorder>Reorder</button>
          </div>
        </article>
      `;
    }).join('');
  }

  function openTab(tabName) {
    $$('.profile-tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.profileTab === tabName));
    $$('.profile-tab-panel').forEach(panel => panel.classList.toggle('active', panel.dataset.panel === tabName));
    const panel = $(`[data-panel="${tabName}"]`);
    if (panel) {
      const offset = 150;
      const top = panel.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  $$('.profile-tab-btn').forEach(btn => btn.addEventListener('click', () => openTab(btn.dataset.profileTab)));
  $$('[data-open-tab]').forEach(node => node.addEventListener('click', event => {
    event.preventDefault();
    openTab(node.dataset.openTab);
  }));

  $('#profileSettingsForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const data = {
      name: $('#fullNameInput')?.value.trim(),
      email: $('#emailInput')?.value.trim(),
      phone: $('#phoneInput')?.value.trim(),
      birthday: $('#birthdayInput')?.value
    };
    writeJSON('yummyProfileSettings', data);
    const currentUser = readJSON('yummyCurrentUser', {});
    writeJSON('yummyCurrentUser', { ...currentUser, name: data.name, email: data.email });
    hydrateProfile();
    toast('Profile changes saved');
  });

  $('#copyReferralBtn')?.addEventListener('click', async () => {
    const code = 'YUMMY-CHE-2026';
    try {
      await navigator.clipboard.writeText(code);
      toast('Referral code copied');
    } catch (error) {
      toast('Referral code: ' + code);
    }
  });

  $$('.reward-item').forEach(button => button.addEventListener('click', () => {
    const cost = Number(button.dataset.points || 0);
    const reward = button.dataset.reward || 'Reward';
    const loyalty = getLoyalty();
    if (Number(loyalty.points || 0) < cost) {
      toast('Not enough points for this reward');
      return;
    }
    loyalty.points = Number(loyalty.points || 0) - cost;
    writeJSON('yummyLoyaltyProfile', loyalty);
    hydrateProfile();
    toast(`${reward} redeemed`);
  }));

  $$('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
    const code = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(code);
    } catch (error) {}
    toast(`${code} copied`);
  }));

  document.addEventListener('click', event => {
    const target = event.target.closest('[data-reorder]');
    if (!target) return;
    toast('Opening menu for reorder');
    setTimeout(() => {
      window.showRestaurantPage ? window.showRestaurantPage('menu') : (window.location.hash = 'menu');
    }, 500);
  });

  $('#addAddressBtn')?.addEventListener('click', () => toast('Address form can be connected to backend later'));
  $('#supportBtn')?.addEventListener('click', () => toast('Support center opened'));
  $$('.address-card button, .payment-card button').forEach(btn => btn.addEventListener('click', () => toast('This action is ready for backend connection')));

  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('is-visible'), index * 90);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });
  $$('.reveal-profile').forEach(item => observer.observe(item));

  hydrateProfile();
  if (window.lucide) lucide.createIcons();
});