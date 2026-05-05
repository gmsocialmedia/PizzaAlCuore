let cart = [];
let nextId = 1;
let currentPizza = null;

const cartModal = document.getElementById('cartModal');
const customModal = document.getElementById('customModal');
const cartBtn = document.getElementById('cartBtn');
const cartCountSpan = document.getElementById('cartCount');
const cartItemsDiv = document.getElementById('cartItemsList');
const cartTotalSpan = document.getElementById('cartTotal');
const toast = document.getElementById('toastMsg');
const confirmOrderBtn = document.getElementById('confirmOrderBtn');

cartBtn.onclick = () => {
    renderCart();
    cartModal.style.display = 'flex';
};
document.querySelector('.close-cart').onclick = () => cartModal.style.display = 'none';
window.onclick = (e) => {
    if (e.target === cartModal) cartModal.style.display = 'none';
    if (e.target === customModal) customModal.style.display = 'none';
};

function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function updateCartCount() {
    cartCountSpan.textContent = cart.length;
}

function renderCart() {
    if (!cartItemsDiv) return;
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p style="text-align:center">Seu carrinho está vazio.</p>';
        cartTotalSpan.innerText = '0';
        return;
    }
    let html = '';
    let total = 0;
    cart.forEach((item, idx) => {
        total += item.total;
        if (item.tipo === 'pizza') {
            html += `<div class="cart-item">
                <strong>🍕 ${item.pizza}</strong> - R$ ${item.basePrice.toFixed(2)}<br>`;
            if (item.bebidas.length) html += `🥤 Bebidas: ${item.bebidas.map(b=>`${b.name} (R$${b.price})`).join(', ')}<br>`;
            if (item.extras.length) html += `🧂 Extras: ${item.extras.map(e=>e.name).join(', ')}<br>`;
            if (item.borda) html += `🧀 ${item.borda.name}<br>`;
            html += `<small>Subtotal: R$ ${item.total.toFixed(2)}</small><br>
            <button class="remove-item" data-idx="${idx}">Remover</button></div>`;
        } else if (item.tipo === 'bebida') {
            html += `<div class="cart-item">
                <strong>🥤 ${item.nome}</strong> - R$ ${item.preco.toFixed(2)}<br>
                <button class="remove-item" data-idx="${idx}">Remover</button></div>`;
        }
    });
    cartItemsDiv.innerHTML = html;
    cartTotalSpan.innerText = total.toFixed(2);
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.idx);
            cart.splice(idx, 1);
            updateCartCount();
            renderCart();
            showToast('Item removido');
        });
    });
}

// Bebidas diretas
document.querySelectorAll('.add-bebida').forEach(btn => {
    btn.addEventListener('click', () => {
        const nome = btn.getAttribute('data-name');
        const preco = parseFloat(btn.getAttribute('data-price'));
        cart.push({ id: nextId++, tipo: 'bebida', nome: nome, preco: preco, total: preco });
        updateCartCount();
        showToast(`${nome} adicionada ao carrinho!`);
    });
});

// Adicionar pizza com modal
document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
        currentPizza = { name: btn.getAttribute('data-name'), basePrice: parseFloat(btn.getAttribute('data-price')) };
        customModal.style.display = 'flex';
    });
});
document.querySelector('#customModal .close').onclick = () => customModal.style.display = 'none';
document.getElementById('confirmAdd').onclick = () => {
    if (!currentPizza) return;
    const bebidas = Array.from(document.querySelectorAll('#customModal input[type="checkbox"]'))
        .filter(cb => cb.checked && ['Coca Cola Lata','Coca Cola 1L','Coca Cola 2L','Guaraná 1L','Guaraná 2L','Água 1L'].includes(cb.value))
        .map(cb => ({ name: cb.value, price: parseFloat(cb.dataset.price) }));
    const extras = Array.from(document.querySelectorAll('#customModal input[type="checkbox"]'))
        .filter(cb => ['Ketchup','Maionese','Mostarda'].includes(cb.value) && cb.checked)
        .map(cb => ({ name: cb.value, price: parseFloat(cb.dataset.price) }));
    let borda = null;
    const bordaSelected = document.querySelector('#customModal input[name="borda"]:checked');
    if (bordaSelected && bordaSelected.value) {
        borda = { name: `Borda ${bordaSelected.value}`, price: parseFloat(bordaSelected.dataset.price) };
    }
    const totalItem = currentPizza.basePrice + bebidas.reduce((a,b)=>a+b.price,0) + extras.reduce((a,b)=>a+b.price,0) + (borda ? borda.price : 0);
    cart.push({
        id: nextId++, tipo: 'pizza', pizza: currentPizza.name, basePrice: currentPizza.basePrice,
        bebidas: bebidas, extras: extras, borda: borda, total: totalItem
    });
    updateCartCount();
    showToast(`${currentPizza.name} adicionada!`);
    document.querySelectorAll('#customModal input').forEach(inp => {
        if (inp.type === 'checkbox') inp.checked = false;
        if (inp.type === 'radio' && inp.value === '') inp.checked = true;
    });
    customModal.style.display = 'none';
    currentPizza = null;
};

// Confirmar pedido
confirmOrderBtn.onclick = () => {
    if (cart.length === 0) { showToast('Carrinho vazio!'); return; }
    const cep = document.getElementById('cep').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    const numero = document.getElementById('numero').value.trim();
    if (!cep || !endereco || !numero) { showToast('Preencha CEP, endereço e número.'); return; }
    const complemento = document.getElementById('complemento').value.trim();
    const referencia = document.getElementById('referencia').value.trim();
    let msg = '🍕 *PEDIDO PIZZA AL CUORE* 🍕\n\n';
    let totalGeral = 0;
    let count = 1;
    cart.forEach(item => {
        if (item.tipo === 'pizza') {
            msg += `*${count}.* 🍕 ${item.pizza} - R$ ${item.basePrice.toFixed(2)}\n`;
            if (item.bebidas.length) msg += `   🥤 Bebidas: ${item.bebidas.map(b=>`${b.name} (R$${b.price})`).join(', ')}\n`;
            if (item.extras.length) msg += `   🧂 Extras: ${item.extras.map(e=>e.name).join(', ')}\n`;
            if (item.borda) msg += `   🧀 ${item.borda.name}\n`;
            msg += `   ➡️ Subtotal: R$ ${item.total.toFixed(2)}\n\n`;
            totalGeral += item.total;
        } else {
            msg += `*${count}.* 🥤 ${item.nome} - R$ ${item.preco.toFixed(2)}\n\n`;
            totalGeral += item.preco;
        }
        count++;
    });
    msg += `💰 *TOTAL: R$ ${totalGeral.toFixed(2)}*\n\n📬 *ENDEREÇO DE ENTREGA*\nCEP: ${cep}\n${endereco}, ${numero}\n`;
    if (complemento) msg += `Complemento: ${complemento}\n`;
    if (referencia) msg += `Referência: ${referencia}\n`;
    msg += `\n🔔 *Pedido gerado automaticamente. Aguardo confirmação!*`;
    window.open(`https://wa.me/5581991644702?text=${encodeURIComponent(msg)}`, '_blank');
    cart = [];
    updateCartCount();
    renderCart();
    cartModal.style.display = 'none';
    showToast('Pedido enviado! Redirecionando para o WhatsApp.');
};

// Menu mobile
const menuBtn = document.querySelector('.menu-mobile');
const navLinks = document.querySelector('.nav-links');
if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        if (navLinks.classList.contains('active')) {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '70px';
            navLinks.style.left = '0';
            navLinks.style.right = '0';
            navLinks.style.backgroundColor = 'var(--black)';
            navLinks.style.padding = '2rem';
            navLinks.style.gap = '1rem';
            navLinks.style.borderBottom = '1px solid var(--gold)';
        } else {
            navLinks.style.display = '';
        }
    });
}

// Filtros
const filtroBtns = document.querySelectorAll('.filtro-btn');
const pizzaItems = document.querySelectorAll('.pizza-item');
filtroBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filtroBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const categoria = btn.textContent.toLowerCase();
        pizzaItems.forEach(item => {
            if (categoria === 'todas') item.style.display = 'block';
            else if (categoria === 'tradicionais' && item.dataset.categoria === 'tradicional') item.style.display = 'block';
            else if (categoria === 'especiais' && item.dataset.categoria === 'especial') item.style.display = 'block';
            else item.style.display = 'none';
        });
    });
});

// Scroll suave e navbar
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            navLinks.style.display = '';
        }
    });
});
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
});

// Newsletter
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('newsName').value;
        const email = document.getElementById('newsEmail').value;
        if (name && email) {
            showToast(`Obrigado ${name}! Você receberá nossas novidades.`);
            newsletterForm.reset();
        } else {
            showToast('Preencha nome e e-mail corretamente.');
        }
    });
}