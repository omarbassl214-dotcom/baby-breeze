// Cart State Management
let cart = JSON.parse(localStorage.getItem('babyBreezeCart')) || [];
let selectedSize = 'NB'; // Default size

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initSizeSelectors();
    initSizeGuide();
    updateCartUI();
    initProductAutoScroll();
});

// ── Checkout Functions ─────────────────────────────────────────
function openCheckout() {
    const modal = document.getElementById('checkout-modal');
    const content = document.getElementById('checkout-content');

    // If cart is empty, show a message instead
    if (!cart || cart.length === 0) {
        alert('Your cart is empty! Add some items first. 🛒');
        return;
    }

    // Clear fields and errors
    document.getElementById('checkout-name').value = '';
    document.getElementById('checkout-phone').value = '';
    document.getElementById('checkout-location').value = '';
    document.getElementById('checkout-error').classList.add('hidden');

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
    // Close cart drawer behind it
    const cartDrawer = document.getElementById('cart-drawer');
    if (cartDrawer) cartDrawer.classList.add('translate-x-full');
    const cartOverlay = document.getElementById('cart-overlay');
    if (cartOverlay) {
        cartOverlay.classList.replace('opacity-100', 'opacity-0');
        setTimeout(() => cartOverlay.classList.add('hidden'), 300);
    }
}

function closeCheckout() {
    const modal = document.getElementById('checkout-modal');
    const content = document.getElementById('checkout-content');
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 300);
}

function submitOrder() {
    const name = document.getElementById('checkout-name').value.trim();
    const phone = document.getElementById('checkout-phone').value.trim();
    const location = document.getElementById('checkout-location').value.trim();
    const errorEl = document.getElementById('checkout-error');

    if (!name || !phone || !location) {
        errorEl.classList.remove('hidden');
        return;
    }

    // Save order to localStorage so you can review it later
    const order = {
        id: 'BB-' + Date.now(),
        name,
        phone,
        location,
        items: [...cart],
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2),
        date: new Date().toLocaleString()
    };
    const orders = JSON.parse(localStorage.getItem('babyBreezeOrders') || '[]');
    orders.push(order);
    localStorage.setItem('babyBreezeOrders', JSON.stringify(orders));

    // Clear the cart
    cart = [];
    saveCart();
    updateCartUI();

    // Close checkout, show success
    closeCheckout();
    setTimeout(() => openSuccess(name), 350);
}

function openSuccess(name) {
    const modal = document.getElementById('success-modal');
    const content = document.getElementById('success-content');
    document.getElementById('success-message').textContent =
        `Thank you, ${name}! 🎀 Your order has been received and we'll call you shortly.`;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function closeSuccess() {
    const modal = document.getElementById('success-modal');
    const content = document.getElementById('success-content');
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        navigateTo('view-home');
    }, 300);
}
// ──────────────────────────────────────────────────────────────


function saveCart() {
    localStorage.setItem('babyBreezeCart', JSON.stringify(cart));
}

function updateCartUI() {
    const cartContainer = document.querySelector('#cart-drawer .flex-1');
    const badgeElements = document.querySelectorAll('.bg-error'); // Basic way to find the cart badge
    
    // Update Badge
    badgeElements.forEach(badge => {
        if(cart.length > 0) {
            badge.style.display = 'block';
            // Optionally add number inside if not just a dot
        } else {
            badge.style.display = 'none';
        }
    });

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <span class="material-symbols-outlined text-5xl mb-4">shopping_bag</span>
            <p>Your cart is empty.</p>
        `;
        return;
    }

    let cartHTML = '<div class="w-full flex flex-col gap-4 overflow-y-auto pr-2">';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        cartHTML += `
            <div class="flex gap-4 p-4 border border-surface-variant rounded-xl items-center relative">
                <img src="${item.image}" alt="${item.name}" class="w-20 h-24 object-cover rounded-md bg-surface-container-low">
                <div class="flex-1">
                    <h4 class="font-label-md text-on-surface line-clamp-1">${item.name}</h4>
                    <p class="font-label-sm text-on-surface-variant mt-1">Size: ${item.size}</p>
                    <p class="font-label-md text-primary mt-2">$${item.price.toFixed(2)}</p>
                </div>
                <div class="flex flex-col items-center gap-2">
                    <button onclick="removeFromCart(${index})" class="text-on-surface-variant hover:text-error p-1">
                        <span class="material-symbols-outlined text-lg">delete</span>
                    </button>
                    <div class="flex items-center gap-2 bg-surface-container-low rounded-full px-2 py-1">
                        <button onclick="updateQuantity(${index}, -1)" class="font-bold text-on-surface-variant">-</button>
                        <span class="font-label-sm w-4 text-center">${item.quantity}</span>
                        <button onclick="updateQuantity(${index}, 1)" class="font-bold text-on-surface-variant">+</button>
                    </div>
                </div>
            </div>
        `;
    });
    cartHTML += '</div>';
    
    // Add Total section inside the flex-1 container before the checkout button
    cartHTML += `
        <div class="mt-auto w-full pt-4 font-headline-md text-primary flex justify-between">
            <span>Total:</span>
            <span>$${total.toFixed(2)}</span>
        </div>
    `;

    cartContainer.innerHTML = cartHTML;
}

function addToCart(name, price, image) {
    // Check if item with same size already exists
    const existingIndex = cart.findIndex(item => item.name === name && item.size === selectedSize);
    
    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            name,
            price,
            image,
            size: selectedSize,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartUI();
    toggleCart(); // Open drawer to show the user
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function updateQuantity(index, change) {
    if (cart[index].quantity + change > 0) {
        cart[index].quantity += change;
    } else {
        cart.splice(index, 1); // remove if drops to 0
    }
    saveCart();
    updateCartUI();
}

// Sizing Selection Logic
function initSizeSelectors() {
    const sizeButtons = document.querySelectorAll('.flex.flex-wrap.gap-sm button');
    if (!sizeButtons.length) return;

    sizeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active classes from all
            sizeButtons.forEach(b => {
                b.className = "px-6 py-3 rounded-full border border-outline-variant text-on-surface-variant font-label-md hover:border-secondary hover:text-secondary transition-all hover:scale-105";
            });
            
            // Add active classes to clicked
            const activeClasses = "px-6 py-3 rounded-full border border-secondary text-on-secondary-container font-label-md bg-secondary-container/30 transition-all hover:scale-105".split(" ");
            btn.className = "";
            btn.classList.add(...activeClasses);
            
            selectedSize = btn.innerText.trim();
        });
    });
}

// Size Guide Logic
function initSizeGuide() {
    // Create Modal HTML
    const modalHTML = `
        <div id="size-guide-modal" class="fixed inset-0 z-[100] hidden items-center justify-center px-4">
            <div class="absolute inset-0 bg-on-background/40 backdrop-blur-sm" onclick="toggleSizeGuide()"></div>
            <div class="bg-surface relative z-10 rounded-2xl w-full max-w-lg shadow-2xl p-6 transform scale-95 opacity-0 transition-all duration-300" id="size-guide-content">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="font-headline-md text-primary">Size Guide</h2>
                    <button onclick="toggleSizeGuide()" class="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="overflow-hidden rounded-xl border border-surface-variant">
                    <table class="w-full text-left font-body-md text-on-surface-variant">
                        <thead class="bg-surface-container-low text-primary">
                            <tr>
                                <th class="p-4 font-label-md">Size</th>
                                <th class="p-4 font-label-md">Height (in)</th>
                                <th class="p-4 font-label-md">Weight (lb)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-t border-surface-variant">
                                <td class="p-4">NB (Newborn)</td>
                                <td class="p-4">Up to 21.5</td>
                                <td class="p-4">5 - 8</td>
                            </tr>
                            <tr class="border-t border-surface-variant">
                                <td class="p-4">0-3 Months</td>
                                <td class="p-4">21.5 - 24</td>
                                <td class="p-4">8 - 12.5</td>
                            </tr>
                            <tr class="border-t border-surface-variant">
                                <td class="p-4">3-6 Months</td>
                                <td class="p-4">24 - 26.5</td>
                                <td class="p-4">12.5 - 16.5</td>
                            </tr>
                            <tr class="border-t border-surface-variant">
                                <td class="p-4">6-9 Months</td>
                                <td class="p-4">26.5 - 28.5</td>
                                <td class="p-4">16.5 - 20.5</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Wire up "Size Guide" links
    const sizeGuideLinks = document.querySelectorAll('a');
    sizeGuideLinks.forEach(link => {
        if (link.innerText.includes('Size Guide')) {
            link.href = "javascript:void(0)";
            link.addEventListener('click', toggleSizeGuide);
        }
    });
}

function toggleSizeGuide() {
    const modal = document.getElementById('size-guide-modal');
    const content = document.getElementById('size-guide-content');
    
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(() => {
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }, 10);
    } else {
        content.classList.remove('scale-100', 'opacity-100');
        content.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }, 300);
    }
}

const productDescriptions = {
    "Ribbed Asymmetrical Crop Tops": "Elevate your little one's wardrobe with these chic ribbed crop tops. Featuring an asymmetrical design and soft, stretchy fabric, they offer a perfect blend of style and all-day comfort.",
    "Collared Blouse & Shorts Set": "A charming and classic two-piece set featuring a crisp white collared blouse with delicate detailing, paired perfectly with lightweight, breathable shorts for warm sunny days.",
    "Bear Cardigan & Starry Pants": "Keep them cozy and cute in this adorable knit cardigan with playful bear embroidery, matched with starry patterned pants for magical bedtime stories or chilly outings.",
    "Bunny Ear Swaddle Wraps": "Wrap your baby in pure warmth and comfort with these ultra-soft swaddles, complete with adorable bunny ears on the hood for the sweetest snuggles.",
    "Strawberry Cardigan & Skirt": "A sweet and playful outfit perfect for springtime! This charming set features a cozy strawberry-embroidered cardigan and a beautifully pleated red skirt.",
    "Pink Embroidered Blouse Set": "Delicate floral embroidery adorns this lovely pink blouse, paired with matching ruffled bottoms for an effortlessly elegant and comfortable look.",
    "Red Ribbed Tank & Cherry Pants": "A vibrant and fun combination! The ribbed red tank top perfectly complements the adorable cherry-print pants, making it ideal for playdates and picnics.",
    "White Floral Lace Layette Set": "An exquisite white layette set featuring intricate floral lace details and a matching bonnet. Perfect for special occasions, photoshoots, or a beautiful coming-home outfit.",
    "Peach Polka Dot Onesie": "Simple, sweet, and incredibly soft. This peach-colored onesie features a subtle polka dot texture and ruffled accents for a touch of everyday charm.",
    "White Geometric Onesie": "A modern take on baby basics! This clean white onesie features subtle geometric texturing and a comfortable, relaxed fit for everyday play.",
    "Blue Floral Ruffle Top Set": "Bring a touch of the garden to their wardrobe with this beautiful blue floral top, featuring delicate ruffles and matched with soft, comfortable bottoms.",
    "Burgundy Bow-Shoulder Swimsuit": "Make a splash in style! This gorgeous burgundy swimsuit features elegant bow details on the shoulders and a comfortable, secure fit for water fun.",
    "Giraffe Ruffle Tee & Shorts Set": "A wonderfully cheerful set featuring a cute giraffe print on a ruffled tee, paired with vibrant patterned shorts for a day full of fun and smiles.",
    "Turtle Graphic Tee Set": "Perfect for little explorers! This comfortable set features an adorable sea turtle graphic tee and matching breezy shorts for warm-weather adventures.",
    "Bear Outline Tee & Shorts Set": "A minimalist and stylish choice! The simple bear outline on the soft cotton tee pairs perfectly with the lightweight, comfortable shorts.",
    "Woodland Mushroom Lounge Set": "Bring the magic of the forest home! This cozy lounge set features charming mushroom and woodland prints, perfect for relaxing or playful days.",
    "Floral Pinafore Dress": "A timeless classic for any little girl. This beautiful floral pinafore dress is lightweight, twirl-worthy, and perfect for sunny afternoons and family gatherings.",
    "White Embossed Lace Dress": "Elegance meets comfort in this stunning white dress. With beautiful embossed lace details, it's perfect for birthdays, holidays, and special moments.",
    "Paper Boat Striped Onesie": "Nautical charm at its best! This classic striped onesie features a sweet paper boat graphic, combining cozy comfort with seaside-inspired style."
};

// Stores the currently viewed product so Add to Bag always uses the right data
let currentProduct = { img: '', name: '', price: 0 };

// Open Product Detail with the clicked product's data
function openProduct(imgSrc, name, price) {
    // Store current product globally
    currentProduct = { img: imgSrc, name: name, price: parseFloat(price) };

    // Update the detail view with correct image, name, price
    const img = document.getElementById('product-detail-img');
    const nameEl = document.getElementById('product-detail-name');
    const priceEl = document.getElementById('product-detail-price');
    const descEl = document.getElementById('product-detail-desc');

    if (img) img.src = imgSrc;
    if (nameEl) nameEl.textContent = name;
    if (priceEl) priceEl.textContent = '$' + price;
    
    // Set dynamic description based on product name, or fallback to generic if not found
    if (descEl) {
        descEl.textContent = productDescriptions[name] || "Soft, breathable, and designed for ultimate comfort. Perfect for your little one's daily adventures. Features premium stitching and skin-friendly fabric.";
    }

    navigateTo('view-product');
}

// Called by Add to Bag button — always uses the currently viewed product
function addCurrentProduct() {
    addToCart(currentProduct.name, currentProduct.price, currentProduct.img);
}

// Routing Logic
let viewHistory = ['view-home'];

function navigateTo(viewId, isBack = false) {
    if (!isBack && viewId !== viewHistory[viewHistory.length - 1]) {
        if (viewId === 'view-home') {
            viewHistory = ['view-home'];
        } else {
            viewHistory.push(viewId);
        }
    }
    
    // Hide all views
    document.querySelectorAll('main').forEach(main => {
        main.style.display = 'none';
    });
    
    // Show requested view
    const activeView = document.getElementById(viewId);
    if(activeView) {
        activeView.style.display = 'block';
        window.scrollTo(0, 0); // Scroll to top on navigation
    }
    
    // Update Back Button Visibility
    const backBtn = document.getElementById('ui-back-btn');
    if (backBtn) {
        if (viewHistory.length > 1) {
            backBtn.classList.remove('hidden');
        } else {
            backBtn.classList.add('hidden');
        }
    }
    
    // Close drawer if open
    const drawer = document.getElementById('nav-drawer');
    const overlay = document.getElementById('drawer-overlay');
    if (drawer && !drawer.classList.contains('-translate-x-full')) {
        toggleDrawer();
    }
}

function goBack() {
    if (viewHistory.length > 1) {
        viewHistory.pop(); // remove current view
        const previousView = viewHistory[viewHistory.length - 1];
        navigateTo(previousView, true);
    }
}


// ── Search Functionality ───────────────────────────────────────
const keywordsMap = {
    "girls": ["dress", "skirt", "pinafore", "floral", "pink", "blouse", "ruffle", "cherry", "bow"],
    "girl": ["dress", "skirt", "pinafore", "floral", "pink", "blouse", "ruffle", "cherry", "bow"],
    "boys": ["boy", "turtle", "giraffe", "paper boat", "bear outline", "striped", "blue"],
    "boy": ["boy", "turtle", "giraffe", "paper boat", "bear outline", "striped", "blue"],
    "sets": ["set", "layette"],
    "set": ["set", "layette"],
    "winter": ["cardigan", "sweater", "warm", "swaddle", "pants"],
    "summer": ["tank", "crop", "swimsuit", "shorts", "tee", "swim"],
    "baby": ["onesie", "swaddle", "layette", "newborn"],
    "newborn": ["onesie", "swaddle", "layette", "newborn"]
};

function performSearch(query) {
    query = query.toLowerCase().trim();
    
    // Switch to shop view if we start typing
    if (query.length > 0 && document.getElementById('view-shop').style.display === 'none') {
        navigateTo('view-shop');
    }
    
    // Hide back button logic adjustment if we auto-navigated to shop via search
    if (query.length > 0) {
        document.getElementById('ui-back-btn').classList.add('hidden');
    }
    
    const container = document.getElementById('shop-grid-container');
    if (!container) return;
    const products = container.querySelectorAll('a');
    
    let searchTerms = [query];
    // Add relatable keywords
    for (const [key, words] of Object.entries(keywordsMap)) {
        if (query.length > 2 && (key.includes(query) || query.includes(key))) {
            searchTerms = searchTerms.concat(words);
        }
    }
    
    let hasResults = false;
    products.forEach(prod => {
        const titleEl = prod.querySelector('h4');
        if (!titleEl) return;
        const title = titleEl.textContent.toLowerCase();
        
        let match = false;
        if (query === '') {
            match = true;
        } else {
            for (const term of searchTerms) {
                if (title.includes(term)) {
                    match = true;
                    break;
                }
            }
        }
        
        if (match) {
            prod.style.display = 'flex';
            hasResults = true;
        } else {
            prod.style.display = 'none';
        }
    });
    
    // Scroll to top of shop
    if (query.length === 1) {
        window.scrollTo({top: 0, behavior: 'smooth'});
    }
}


function toggleSearchModal() {
    const modal = document.getElementById('search-modal');
    const content = document.getElementById('search-modal-content');
    const input = document.getElementById('modal-search-input');
    
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        modal.classList.remove('opacity-0');
        // Small delay for display block to apply before transition
        setTimeout(() => {
            content.classList.remove('-translate-y-full');
            input.focus();
        }, 10);
    } else {
        content.classList.add('-translate-y-full');
        modal.classList.add('opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }
}

function performModalSearch(query) {
    // Navigate to shop immediately
    if (document.getElementById('view-shop').style.display === 'none') {
        navigateTo('view-shop');
    }
    
    // Close the modal after a short delay so they can see it working
    setTimeout(() => {
        toggleSearchModal();
    }, 400);
    
    // Run the main search logic
    performSearch(query);
}


// --- Review System Logic ---
let currentRating = 5;

function setRating(stars) {
    currentRating = stars;
    const starElements = document.querySelectorAll('#star-rating-selector .star');
    starElements.forEach((star, index) => {
        if (index < stars) {
            star.style.color = '#C08552';
        } else {
            star.style.color = '';
        }
    });
}
// Initialize default rating visually
setTimeout(() => setRating(5), 500);

async function submitReview() {
    const name = document.getElementById('reviewer-name').value;
    const text = document.getElementById('reviewer-text').value;
    
    if (!name || !text) {
        alert("Please fill in your name and review!");
        return;
    }
    
    if (!window.db) {
        alert("Database is still connecting, please try again in a second.");
        return;
    }
    
    const submitBtn = document.querySelector('#review-modal button.bg-primary');
    submitBtn.innerText = "Submitting...";
    submitBtn.disabled = true;
    
    try {
        const newReview = { 
            name: name, 
            text: text, 
            rating: currentRating, 
            createdAt: window.serverTimestamp() 
        };
        
        // Save to Firebase
        await window.addDoc(window.collection(window.db, "reviews"), newReview);
        
        // Render it immediately for this user so it feels fast
        newReview.date = "Just now";
        renderNewReview(newReview);
        
        // Clean up modal
        document.getElementById('reviewer-name').value = '';
        document.getElementById('reviewer-text').value = '';
        setRating(5);
        document.getElementById('review-modal').classList.add('hidden');
        
        alert("Thank you! Your review is now live for everyone to see.");
    } catch (e) {
        console.error("Error adding review: ", e);
        alert("There was an error saving your review. Please try again.");
    } finally {
        submitBtn.innerText = "Submit Review";
        submitBtn.disabled = false;
    }
}

function renderNewReview(review) {
    const track = document.getElementById('reviews-container');
    if (!track) return;
    
    let starsHtml = '';
    for(let i=0; i<5; i++) {
        starsHtml += i < review.rating ? '★' : '☆';
    }
    
    const reviewCard = document.createElement('div');
    reviewCard.className = 'w-[280px] md:w-[320px] flex-shrink-0 bg-surface rounded-2xl p-6 shadow-sm snap-center border border-[#F2E0DA]';
    reviewCard.innerHTML = `
        <div class="flex text-[#C08552] mb-3 text-sm">${starsHtml}</div>
        <p class="font-body-md text-on-surface-variant mb-4 italic">"${review.text}"</p>
        <p class="font-label-sm text-primary">— ${review.name} <span class="text-xs text-outline ml-2">${review.date}</span></p>
    `;
    
    // Insert at the beginning of the reviews
    track.insertBefore(reviewCard, track.firstChild);
}

// Load Firebase reviews
window.addEventListener('firebaseReady', async () => {
    try {
        const q = window.query(window.collection(window.db, "reviews"), window.orderBy("createdAt", "asc"));
        const querySnapshot = await window.getDocs(q);
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            let dateStr = "Recently";
            if (data.createdAt) {
                const date = data.createdAt.toDate();
                dateStr = date.toLocaleDateString();
            }
            renderNewReview({
                name: data.name,
                text: data.text,
                rating: data.rating,
                date: dateStr
            });
        });
    } catch (e) {
        console.log("Error loading reviews from Firebase:", e);
    }
});
