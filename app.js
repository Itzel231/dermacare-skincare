function checkHTTPS() {
    const statusEl = document.getElementById('https-status');
    const bannerEl = document.getElementById('security-banner');
    
    if (window.location.protocol === 'https:') {
        statusEl.textContent = '🔒 HTTPS Activo';
    } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') {
        statusEl.textContent = '🛠️ Modo Local';
    } else {
        statusEl.textContent = '⚠️ No Seguro (HTTP)';
        bannerEl.style.display = 'block';
        window.location.href = window.location.href.replace('http:', 'https:');
    }
}

const FALLBACK_IMAGE = "https://unsplash.com";

const defaultProducts = [
    {
        id: 1,
        name: "Limpiador Facial Suave",
        category: "Limpieza",
        price: 280,
        skinType: "Todo tipo de piel",
        image: "https://unsplash.com",
        alt: "Botella blanca con dispensador de gel limpiador facial suave junto a una toalla limpia",
        description: "Elimina impurezas, exceso de sebo, sudor y restos de contaminación sin dañar la barrera natural de la piel.",
        usage: "Primer paso de la rutina. Masajear sobre rostro húmedo por 30 segundos y enjuagar."
    },
    {
        id: 2,
        name: "Sérum de Ácido Hialurónico",
        category: "Hidratación",
        price: 390,
        skinType: "Piel Seca / Mixta",
        image: "https://unsplash.com",
        alt: "Frasco gotero de vidrio con sérum hidratante transparente de ácido hialurónico",
        description: "Retiene hasta 1000 veces su peso en agua, rellenando líneas finas por deshidratación y aportando jugosidad.",
        usage: "Aplicar de 2 a 3 gotas sobre la piel ligeramente húmeda antes de la crema."
    },
    {
        id: 3,
        name: "Sérum de Vitamina C 15%",
        category: "Tratamiento",
        price: 450,
        skinType: "Piel Opaca / Manchas",
        image: "https://unsplash.com",
        alt: "Frasco ámbar con gotero de sérum antioxidante de vitamina C iluminador",
        description: "Potente antioxidante que ilumina el rostro, unifica el tono, atenúa manchas y protege contra radicales libres.",
        usage: "Usar por las mañanas sobre piel limpia y seca, siempre seguido de protector solar."
    },
    {
        id: 4,
        name: "Protector Solar FPS 50+",
        category: "Protección",
        price: 420,
        skinType: "Todo tipo de piel",
        image: "https://unsplash.com",
        alt: "Tubo de crema protectora solar facial FPS 50 bajo luz natural",
        description: "Previene quemaduras solares, envejecimiento prematuro, manchas y reduce el riesgo de cáncer de piel.",
        usage: "Último paso de la rutina de mañana. Aplicar dos dedos de producto y reaplicar cada 2-3 horas."
    }
];

let productsDB = JSON.parse(localStorage.getItem('skincare_catalog_v3')) || defaultProducts;

function saveDB() {
    localStorage.setItem('skincare_catalog_v3', JSON.stringify(productsDB));
    renderProducts();
    renderAdminList();
}

let currentUser = JSON.parse(sessionStorage.getItem('dermacare_active_user')) || null;
let userLogs = JSON.parse(localStorage.getItem('dermacare_user_logs')) || [];

function updateUserUI() {
    const area = document.getElementById('user-session-area');
    if (currentUser) {
        area.innerHTML = `
            <span>👋 Hola, <strong>${currentUser.name}</strong> (Piel ${currentUser.skinType})</span>
            <button type="button" class="btn-user-logout" onclick="logoutUser()">Salir</button>
        `;
    } else {
        area.innerHTML = `
            <button type="button" class="btn-user-login" onclick="openUserModal()">👤 Iniciar Sesión</button>
        `;
    }
}

function openUserModal() {
    document.getElementById('user-modal').classList.add('open');
    document.getElementById('user-name').focus();
}

function loginUser(event) {
    event.preventDefault();
    const name = document.getElementById('user-name').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const skinType = document.getElementById('user-skin').value;
    const timestamp = new Date().toLocaleString('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });

    currentUser = { name, email, skinType, loginTime: timestamp };
    sessionStorage.setItem('dermacare_active_user', JSON.stringify(currentUser));

    userLogs.unshift(currentUser);
    localStorage.setItem('dermacare_user_logs', JSON.stringify(userLogs));

    updateUserUI();
    closeModals();
    event.target.reset();
}

function logoutUser() {
    currentUser = null;
    sessionStorage.removeItem('dermacare_active_user');
    updateUserUI();
}

function renderUserLogs() {
    const list = document.getElementById('admin-users-list');
    const countEl = document.getElementById('users-count');
    countEl.textContent = userLogs.length;

    if (userLogs.length === 0) {
        list.innerHTML = '<p>Aún no hay usuarios registrados que hayan iniciado sesión.</p>';
        return;
    }

    list.innerHTML = '';
    userLogs.forEach(u => {
        const div = document.createElement('div');
        div.className = 'user-log-item';
        div.innerHTML = `
            <div><strong>👤 ${u.name}</strong> — <span>${u.email}</span></div>
            <div style="font-size: 0.85rem; opacity: 0.85;">
                Tipo de piel: <strong>${u.skinType}</strong> | Ingresó: ${u.loginTime}
            </div>
        `;
        list.appendChild(div);
    });
}

function clearUserLogs() {
    if (confirm("¿Deseas borrar el historial de usuarios logueados?")) {
        userLogs = [];
        localStorage.setItem('dermacare_user_logs', JSON.stringify(userLogs));
        renderUserLogs();
    }
}

let currentFilter = 'Todos';

function renderProducts() {
    const container = document.getElementById('product-list');
    container.innerHTML = '';

    const filtered = currentFilter === 'Todos' 
        ? productsDB 
        : productsDB.filter(p => p.category === currentFilter);

    if (filtered.length === 0) {
        container.innerHTML = '<p>No hay productos disponibles en esta categoría.</p>';
        return;
    }

    filtered.forEach(prod => {
        const card = document.createElement('article');
        card.className = 'product-card';
        const imgSrc = prod.image || FALLBACK_IMAGE;
        const imgAlt = prod.alt || `Imagen ilustrativa de ${prod.name}`;
        const priceFormatted = prod.price ? `$${prod.price} MXN` : 'Consultar';
        const skinLabel = prod.skinType || 'Todo tipo de piel';

        card.innerHTML = `
            <div class="product-img-wrapper">
                <img 
                    src="${imgSrc}" 
                    alt="${imgAlt}" 
                    class="product-img" 
                    loading="lazy"
                    onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';"
                >
                <span class="price-tag">${priceFormatted}</span>
            </div>
            <div class="card-body">
                <div>
                    <div class="card-meta">
                        <span class="badge">${prod.category}</span>
                        <span class="skin-tag">${skinLabel}</span>
                    </div>
                    <h2>${prod.name}</h2>
                    <p><strong>¿Para qué sirve?:</strong> ${prod.description}</p>
                    <div class="usage-box">
                        <strong>Modo de uso:</strong> ${prod.usage}
                    </div>
                </div>
                <button type="button" class="btn-speak" onclick="speakText('${prod.name}. Precio ${priceFormatted}. Categoría ${prod.category}. Ideal para ${skinLabel}. Para qué sirve: ${prod.description}. Modo de uso: ${prod.usage}')" aria-label="Escuchar ficha del producto ${prod.name}">
                    🔊 Escuchar ficha del producto
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

function filterProducts(category, btnElement) {
    currentFilter = category;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');
    renderProducts();
}

let currentFontSize = 16;

function changeFontSize(delta) {
    currentFontSize = Math.min(Math.max(currentFontSize + delta, 14), 24);
    document.documentElement.style.setProperty('--font-size-base', currentFontSize + 'px');
}

function toggleContrast() {
    document.body.classList.toggle('high-contrast');
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-MX';
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Tu navegador no soporta lectura en voz alta.");
    }
}

function stopSpeech() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function openLoginModal() {
    document.getElementById('login-error').textContent = '';
    document.getElementById('admin-pass').value = '';
    document.getElementById('login-modal').classList.add('open');
    document.getElementById('admin-pass').focus();
}

