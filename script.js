// === PARTICLE SYSTEM ===
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (10 + Math.random() * 10) + 's';
        container.appendChild(particle);
    }
}

// === CALCULATOR ===
const categoryData = {
    wellness: {
        name: 'Santé & Wellness',
        defaultPrice: 45,
        defaultMargin: 75,
        multiplier: 1.0
    },
    pets: {
        name: 'Animaux',
        defaultPrice: 35,
        defaultMargin: 60,
        multiplier: 0.9
    },
    tech: {
        name: 'Tech Accessoires',
        defaultPrice: 55,
        defaultMargin: 50,
        multiplier: 1.1
    },
    custom: {
        name: 'Produits Personnalisés',
        defaultPrice: 40,
        defaultMargin: 65,
        multiplier: 0.95
    }
};

// Form inputs
const priceInput = document.getElementById('price-input');
const marginInput = document.getElementById('margin-input');
const volumeSlider = document.getElementById('volume-slider');
const volumeValue = document.getElementById('volume-value');
const categorySelect = document.getElementById('category-select');
const marketingBudget = document.getElementById('marketing-budget');

// Result elements
const revenueMonthly = document.getElementById('revenue-monthly');
const netProfit = document.getElementById('net-profit');
const targetStatus = document.getElementById('target-status');
const ordersMonthly = document.getElementById('orders-monthly');
const targetProgress = document.getElementById('target-progress');
const currentDaily = document.getElementById('current-daily');
const caTotal = document.getElementById('ca-total');
const netTotal = document.getElementById('net-total');

// Range slider update
volumeSlider.addEventListener('input', function() {
    volumeValue.textContent = this.value + ' ventes/jour';
    calculateROI();
});

// All inputs trigger recalculation
[priceInput, marginInput, categorySelect, marketingBudget].forEach(input => {
    input.addEventListener('input', calculateROI);
});

function calculateROI() {
    const category = categorySelect.value;
    const data = categoryData[category];

    const price = parseFloat(priceInput.value) || data.defaultPrice;
    const marginPercent = parseFloat(marginInput.value) || data.defaultMargin;
    const volumePerDay = parseInt(volumeSlider.value);
    const marketing = parseFloat(marketingBudget.value) || 300;

    // Monthly calculations (30 days)
    const ordersMonthly = volumePerDay * 30;
    const revenueMonthly = ordersMonthly * price;
    const productCost = revenueMonthly * ((100 - marginPercent) / 100);
    const shopifyFees = (revenueMonthly * 0.02) + (ordersMonthly * 0.25); // 2% + 0.25€
    const appsCost = 100; // Fixed
    const domainCost = 1.25; // Monthly

    const totalCosts = productCost + shopifyFees + marketing + appsCost + domainCost;
    const netProfit = revenueMonthly - totalCosts;

    const dailyRevenue = revenueMonthly / 30;
    const dailyNet = netProfit / 30;

    // Update UI
    formatCurrency(revenueMonthly, revenueMonthly);
    formatCurrency(netProfit, netProfit);

    // Target status
    if (dailyRevenue >= 1000) {
        targetStatus.textContent = '✅ ATTEINT';
        targetStatus.style.color = 'var(--success)';
    } else {
        targetStatus.textContent = `⚠️ ${Math.round(dailyRevenue)}€/jour`;
        targetStatus.style.color = 'var(--warning)';
    }

    ordersMonthly.textContent = ordersMonthly.toLocaleString('fr-FR');

    // Progress bar
    const progress = Math.min((dailyRevenue / 1000) * 100, 100);
    targetProgress.style.width = progress + '%';
    currentDaily.textContent = Math.round(dailyRevenue) + '€';

    // Breakdown table
    caTotal.textContent = formatNumber(revenueMonthly) + '€';
    const productCostCell = document.querySelector('tr:nth-child(2) .value');
    productCostCell.textContent = '-' + formatNumber(productCost) + '€';
    productCostCell.className = 'value red';

    const shopifyCell = document.querySelector('tr:nth-child(3) .value');
    shopifyCell.textContent = '-' + formatNumber(shopifyFees) + '€';

    const marketingCell = document.querySelector('tr:nth-child(4) .value');
    marketingCell.textContent = '-' + marketing + '€';

    const appsCell = document.querySelector('tr:nth-child(5) .value');
    appsCell.textContent = '-' + appsCost + '€';

    netTotal.textContent = formatNumber(netProfit) + '€';

    return { dailyRevenue, dailyNet, ordersMonthly };
}

function formatCurrency(amount, element) {
    const formatted = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
    element.textContent = formatted;
}

function formatNumber(num) {
    return new Intl.NumberFormat('fr-FR').format(Math.round(num));
}

// === CATEGORY SELECTION ===
function selectCategory(element) {
    document.querySelectorAll('.cat-option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');

    const category = element.dataset.cat;
    const data = categoryData[category];
    categorySelect.value = category;
    priceInput.value = data.defaultPrice;
    marginInput.value = data.defaultMargin;

    calculateROI();
}

// === MODAL ===
function closeModal() {
    document.getElementById('start-modal').classList.remove('active');
}

function startProject() {
    document.getElementById('start-modal').classList.add('active');
}

function submitProject(e) {
    e.preventDefault();
    const shopName = document.getElementById('shop-name').value;
    const email = document.getElementById('user-email').value;
    const budget = document.getElementById('budget-select').value;

    alert(`✅ Projet enregistré !\n\nBoutique: ${shopName}\nEmail: ${email}\nBudget: ${budget}€\n\nJe vais maintenant créer votre boutique Shopify complète. Vous recevrez les codes par email.`);

    closeModal();
}

function downloadPlan() {
    alert('📄 Le plan complet va être généré et téléchargé.\n\nIl contiendra :\n- Le thème Shopify personnalisé\n- Les pages produits optimisées\n- La liste des fournisseurs\n- La stratégie marketing de lancement\n\nOuverture du fichier SHOPIFY_BOUTIQUE_PLAN.md...');
}

// === SCROLL ANIMATIONS ===
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply to sections
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    calculateROI();

    // Set initial category selection
    document.querySelector('.cat-option[data-cat="wellness"]').classList.add('selected');
});

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
