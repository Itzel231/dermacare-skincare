/* =========================================================
   1. VERIFICACIÓN DE SEGURIDAD HTTPS
   ========================================================= */
function checkHTTPS() {
    const statusEl = document.getElementById('https-status');
    const bannerEl = document.getElementById('security-banner');
    
    if (window.location.protocol === 'https:') {
        statusEl.textContent = '🔒 Conexión Segura (HTTPS)';
    } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') {
        statusEl.textContent = '🛠️ Entorno VS Code Local (HTTPS listo para servidor)';
    } else {
        statusEl.textContent = '⚠️ Conexión No Segura (HTTP)';
        bannerEl.style.display = 'block';
        window.location.href = window.location.href.replace('http:', 'https:');
    }
}

/* =========================================================
   2. BASE DE DATOS LOCAL CON IMÁGENES (LOCALSTORAGE)
   ========================================================= */
const FALLBACK_IMAGE = "https://unsplash.com";

const defaultProducts = [
    {
        id: 1,
        name: "Limpiador Facial Suave",
        category: "Limpieza",
        image: "https://unsplash.com", // <-- LÍNEA 24: Cambia por "img/tu-foto.jpg" si deseas
        alt: "Botella blanca con dispensador de gel limpiador facial suave junto a una toalla limpia",
        description: "Elimina impurezas, exceso de sebo, sudor y restos de contaminación sin dañar la barrera natural de la piel.",
        usage: "Primer paso de la rutina. Masajear sobre rostro húmedo por 30 segundos y enjuagar."
    },
    {
        id: 2,
        name: "Sérum de Ácido Hialurónico",
        category: "Hidratación",
        image: "https://unsplash.com", // <-- LÍNEA 33: Cambia por "img/tu-foto.jpg" si deseas
        alt: "Frasco gotero de vidrio con sérum hidratante transparente de ácido hialurónico",
        description: "Retiene hasta 1000 veces su peso en agua, rellenando líneas finas por deshidratación y aportando jugosidad.",
        usage: "Aplicar de 2 a 3 gotas sobre la piel ligeramente húmeda antes de la crema."
    },
    {
        id: 3,
        name: "Sérum de Vitamina C",
        category: "Tratamiento",
        image: "https://unsplash.com", // <-- LÍNEA 42: Cambia por "img/tu-foto.jpg" si deseas
        alt: "Frasco ámbar con gotero de sérum antioxidante de vitamina C iluminador",
        description: "Potente antioxidante que ilumina el rostro, unifica el tono, atenúa manchas y protege contra radicales libres.",
        usage: "Usar por las mañanas sobre piel limpia y seca, siempre seguido de protector solar."
    },
    {
        id: 4,
        name: "Protector Solar FPS 50+",
        category: "Protección",
        image: "https://unsplash.com", // <-- LÍNEA 51: Cambia por "img/tu-foto.jpg" si deseas
        alt: "Tubo de crema protectora solar facial FPS 50 bajo luz natural",
        description: "Previene quemaduras solares, envejecimiento prematuro, manchas y reduce el riesgo de cáncer de piel.",
        usage: "Último paso de la rutina de mañana. Aplicar dos dedos de producto y reaplicar cada 2-3 horas."
    }
];

let productsDB = JSON.parse(localStorage.getItem('skincare_db_vscode')) || defaultProducts;

function saveDB() {
    localStorage.setItem('skincare_db_vscode', JSON.stringify(productsDB));
    renderProducts();
    renderAdminList();
}

/* =========================================================
   3. RENDERIZADO DE PRODUCTOS Y FILTROS
   ========================================================= */
let currentFilter = 'Todos';

function renderProducts() {
    const container = document.getElementById('product-list');
    container.innerHTML = '';

    const filtered = currentFilter === 'Todos' 
        ? productsDB 
        : productsDB.filter(p => p.category === currentFilter);

    if (filtered.length === 0) {
        container.innerHTML = '<p>No hay productos registrados en esta categoría.</p>';
        return;
    }

    filtered.forEach(prod => {
        const card = document.createElement('article');
        card.className = 'product-card';
        const imgSrc = prod.image || FALLBACK_IMAGE;
        const imgAlt = prod.alt || `Imagen ilustrativa de ${prod.name}`;

        card.innerHTML = `
            <div class="product-img-wrapper">
                <img 
                    src="${imgSrc}" 
                    alt="${imgAlt}" 
                    class="product-img" 
                    loading="lazy"
                    onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';"
                >
            </div>
            <div class="card-body">
                <div>
                    <span class="badge">${prod.category}</span>
                    <h2>${prod.name}</h2>
                    <p><strong>¿Para qué sirve?:</strong> ${prod.description}</p>
                    <div class="usage-box">
                        <strong>Cómo usarlo:</strong> ${prod.usage}
                    </div>
                </div>
                <button type="button" class="btn-speak" onclick="speakText('${prod.name}. Categoría ${prod.category}. Para qué sirve: ${prod.description}. Modo de uso: ${prod.usage}')" aria-label="Escuchar información de ${prod.name}">
                    🔊 Escuchar descripción
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

/* =========================================================
   4. ACCESIBILIDAD (VOZ, ALTO CONTRASTE Y TAMAÑO DE FUENTE)
   ========================================================= */
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

/* =========================================================
   5. SEGURIDAD DE ADMINISTRADOR Y SUBIDA DE IMÁGENES
   ========================================================= */
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

function closeModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('open'));
}

async function verifyAdmin(event) {
    event.preventDefault();
    const inputPass = document.getElementById('admin-pass').value;
    
    // Contraseña única: Skincare2026!
    const validHash = await sha256("Skincare2026!");
    const inputHash = await sha256(inputPass);

    if (inputHash === validHash) {
        closeModals();
        renderAdminList();
        document.getElementById('admin-modal').classList.add('open');
        document.getElementById('prod-name').focus();
    } else {
        document.getElementById('login-error').textContent = 'Contraseña incorrecta. Acceso denegado.';
    }
}

// Convierte archivo de imagen subido desde el dispositivo a Base64 optimizado
function readImageFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

async function addProduct(event) {
    event.preventDefault();
    const fileInput = document.getElementById('prod-file');
    const urlInput = document.getElementById('prod-img').value.trim();
    
    let finalImage = urlInput || FALLBACK_IMAGE;

    // Si el usuario seleccionó un archivo desde su PC o celular, tiene prioridad
    if (fileInput.files && fileInput.files[0]) {
        finalImage = await readImageFile(fileInput.files[0]);
    }

    const newProd = {
        id: Date.now(),
        name: document.getElementById('prod-name').value.trim(),
        category: document.getElementById('prod-cat').value,
        image: finalImage,
        alt: document.getElementById('prod-alt').value.trim(),
        description: document.getElementById('prod-desc').value.trim(),
        usage: document.getElementById('prod-use').value.trim()
    };

    productsDB.push(newProd);
    saveDB();
    event.target.reset();
    alert("Producto guardado correctamente en la base de datos.");
}

function deleteProduct(id) {
    if (confirm("¿Seguro que deseas eliminar este producto?")) {
        productsDB = productsDB.filter(p => p.id !== id);
        saveDB();
    }
}

function renderAdminList() {
