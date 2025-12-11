/* =========================================================
   CART SERVICE - Gestão do Carrinho
   ========================================================= */

const CartService = {
    // Key for localStorage
    STORAGE_KEY: 'box_caramela_cart',

    // Obter itens do carrinho
    getItems() {
        const items = localStorage.getItem(this.STORAGE_KEY);
        return items ? JSON.parse(items) : [];
    },

    // Adicionar item ao carrinho
    // Adicionar item ao carrinho
    addItem(product, btnElement) {
        const items = this.getItems();
        const existingItem = items.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl || 'https://placehold.co/300?text=Sem+Imagem', // Fallback
                quantity: 1
            });
        }

        this.saveItems(items);
        this.updateCartCount();

        // Feedback Visual no Botão (sem alert)
        if (btnElement) {
            const originalText = btnElement.innerHTML;
            const originalClass = btnElement.className;

            btnElement.innerHTML = 'Adicionado!';
            btnElement.className = 'btn btn-success btn-sm';
            btnElement.disabled = true;

            setTimeout(() => {
                btnElement.innerHTML = originalText;
                btnElement.className = originalClass;
                btnElement.disabled = false;
            }, 1000);
        }
    },

    // Remover item
    removeItem(productId) {
        let items = this.getItems();
        items = items.filter(item => item.id !== productId);
        this.saveItems(items);
        this.updateCartCount();
        // Disparar evento para atualizar UI se necessário
        window.dispatchEvent(new Event('cart-updated'));
    },

    // Salvar no storage
    saveItems(items) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    },

    // Limpar carrinho
    clear() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.updateCartCount();
    },

    // Atualizar contador no menu (se existir)
    updateCartCount() {
        const items = this.getItems();
        const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

        const badge = document.getElementById('cart-count');
        if (badge) {
            badge.textContent = totalCount;
            badge.style.display = totalCount > 0 ? 'inline-block' : 'none'; // Mostrar só se > 0
        }
    },

    // Calcular total
    getTotal() {
        return this.getItems().reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    // Finalizar Compra (Enviar para API)
    async checkout() {
        const items = this.getItems();
        if (items.length === 0) {
            alert('O carrinho está vazio.');
            return;
        }

        if (!AuthService.isAuthenticated()) {
            alert('Tem de fazer login para finalizar a compra.');
            window.location.href = 'login.html';
            return;
        }

        // Preparar dados para a API (DTO: ProductId, Quantity)
        const orderData = items.map(item => ({
            productId: item.id,
            quantity: item.quantity
        }));

        try {
            const response = await ApiService.request('/Orders', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AuthService.getToken()}`
                },
                body: JSON.stringify(orderData)
            });

            // Sucesso UX: Limpar e mostrar mensagem no modal
            this.clear();

            // Atualizar o conteúdo do modal diretamente
            const container = document.getElementById('cartItemsContainer');
            const footer = document.querySelector('#cartModal .modal-footer');

            if (container) {
                container.innerHTML = `
                    <div class="text-center py-5">
                        <div class="mb-3 text-success">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                            </svg>
                        </div>
                        <h3>Compra Finalizada!</h3>
                        <p class="text-muted">A encomenda #${response.orderId || ''} foi registada com sucesso.</p>
                        <button class="btn btn-primary mt-3" data-bs-dismiss="modal">
                            Continuar a Comprar
                        </button>
                    </div>
                `;
            }

            // Esconde o footer (onde está o botão de checkout) para não confundir
            if (footer) footer.style.display = 'none';

            // Resetar o footer quando o modal fechar (para a próxima vez)
            const modalEl = document.getElementById('cartModal');
            const resetFooter = () => {
                if (footer) footer.style.display = 'flex';
                modalEl.removeEventListener('hidden.bs.modal', resetFooter);
            };
            modalEl.addEventListener('hidden.bs.modal', resetFooter);


        } catch (error) {
            alert('Erro ao finalizar encomenda: ' + error.message);
        }
    }
};

// Inicializar contador ao carregar
document.addEventListener('DOMContentLoaded', () => {
    CartService.updateCartCount();
});
