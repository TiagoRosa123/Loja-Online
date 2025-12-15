/* =========================================================
   PRODUTOS.JS - Gestão de Produtos com API
   ========================================================= */

// Variável global para armazenar o ID do produto em edição
let editingProductId = null;

/**
 * Carrega todos os produtos ao carregar a página
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar Autenticação
    if (!AuthService.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Verificação de Role (Admin)
    if (!AuthService.isAdmin()) {
        const adminForm = document.getElementById('adminProductForm');
        if (adminForm) adminForm.style.display = 'none';
    }

    await loadProducts();
    setupEventListeners();
});

/**
 * Configura os event listeners dos formulários e botões
 */
function setupEventListeners() {
    // Formulário de criar/editar produto
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }

    // Botão de cancelar edição
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelEdit);
    }
}

/**
 * Carrega e exibe todos os produtos
 */
async function loadProducts() {
    try {
        showLoading(true);
        const products = await ApiService.getAllProducts();
        displayProducts(products);
    } catch (error) {
        showError('Erro ao carregar produtos: ' + error.message);
    } finally {
        showLoading(false);
    }
}

/**
 * Exibe os produtos na tabela
 * @param {Array} products - Lista de produtos
 */
function displayProducts(products) {
    const tbody = document.getElementById('productsTableBody');
    const isAdmin = AuthService.isAdmin();

    // Esconder/Mostrar cabeçalho de Ações
    // Nota: É melhor fazer isso no HTML mas aqui funciona para o exemplo
    const actionHeader = document.querySelector('thead tr th:last-child');
    if (actionHeader) {
        actionHeader.style.display = isAdmin ? '' : 'none';
    }

    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum produto encontrado</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>${escapeHtml(product.name)}</td>
            <td>${escapeHtml(product.sku)}</td>
            <td>${escapeHtml(product.description || '-')}</td>
            <td>€${product.price.toFixed(2)}</td>
            ${isAdmin ? `
            <td>
                <button class="btn btn-sm btn-primary" onclick="editProduct(${product.id})">
                    Editar
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">
                    Eliminar
                </button>
            </td>
            ` : ''}
        </tr>
    `).join('');
}

/**
 * Trata o submit do formulário (criar ou editar)
 * @param {Event} event - Evento de submit
 */
async function handleProductSubmit(event) {
    event.preventDefault();

    const formData = {
        name: document.getElementById('productName').value,
        sku: document.getElementById('productSku').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        gender: document.getElementById('productGender').value,
        imageUrl: document.getElementById('productImage').value
    };

    try {
        showLoading(true);

        if (editingProductId) {
            // Atualizar produto existente
            formData.id = editingProductId;
            await ApiService.updateProduct(formData);
            showSuccess('Produto atualizado com sucesso!');
        } else {
            // Criar novo produto
            await ApiService.createProduct(formData);
            showSuccess('Produto criado com sucesso!');
        }

        // Recarrega a lista e limpa o formulário
        await loadProducts();
        resetForm();

    } catch (error) {
        showError('Erro ao guardar produto: ' + error.message);
    } finally {
        showLoading(false);
    }
}

/**
 * Prepara o formulário para editar um produto
 * @param {number} productId - ID do produto a editar
 */
async function editProduct(productId) {
    try {
        showLoading(true);
        const product = await ApiService.getProductById(productId);

        // Preenche o formulário
        document.getElementById('productName').value = product.name;
        document.getElementById('productSku').value = product.sku;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category || 'T-Shirt';
        document.getElementById('productGender').value = product.gender || 'Homem';
        document.getElementById('productImage').value = product.imageUrl || '';

        // Atualiza o estado
        editingProductId = productId;

        // Atualiza a UI
        document.getElementById('formTitle').textContent = 'Editar Produto';
        document.getElementById('submitBtn').textContent = 'Atualizar';
        document.getElementById('cancelEditBtn').style.display = 'inline-block';

        // Scroll para o formulário
        document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        showError('Erro ao carregar produto: ' + error.message);
    } finally {
        showLoading(false);
    }
}

/**
 * Elimina um produto
 * @param {number} productId - ID do produto a eliminar
 */
async function deleteProduct(productId) {
    if (!confirm('Tem a certeza que deseja eliminar este produto?')) {
        return;
    }

    try {
        showLoading(true);
        await ApiService.deleteProduct(productId);
        showSuccess('Produto eliminado com sucesso!');
        await loadProducts();
    } catch (error) {
        showError('Erro ao eliminar produto: ' + error.message);
    } finally {
        showLoading(false);
    }
}

/**
 * Cancela a edição e volta ao modo de criação
 */
function cancelEdit() {
    resetForm();
}

/**
 * Reseta o formulário para o estado inicial
 */
function resetForm() {
    document.getElementById('productForm').reset();
    editingProductId = null;
    document.getElementById('formTitle').textContent = 'Adicionar Produto';
    document.getElementById('submitBtn').textContent = 'Criar Produto';
    document.getElementById('cancelEditBtn').style.display = 'none';
}

// ==================== FUNÇÕES AUXILIARES ====================

/**
 * Mostra/esconde o indicador de loading
 * @param {boolean} show - true para mostrar, false para esconder
 */
function showLoading(show) {
    const loader = document.getElementById('loadingIndicator');
    if (loader) {
        loader.style.display = show ? 'block' : 'none';
    }
}

/**
 * Mostra mensagem de sucesso
 * @param {string} message - Mensagem a exibir
 */
function showSuccess(message) {
    const container = document.getElementById('alertContainer');
    if (!container) return alert(message);

    container.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="fas fa-check-circle me-2"></i> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    // Scroll para o topo para ver a mensagem
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Remover automaticamente após 4 segundos
    setTimeout(() => {
        const alert = container.querySelector('.alert');
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 4000);
}

/**
 * Mostra mensagem de erro
 * @param {string} message - Mensagem a exibir
 */
function showError(message) {
    const container = document.getElementById('alertContainer');
    if (!container) return alert(message);

    container.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="fas fa-exclamation-circle me-2"></i> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    // Scroll para o topo para ver a mensagem
    window.scrollTo({ top: 0, behavior: 'smooth' });
    console.error(message);

    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        const alert = container.querySelector('.alert');
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
}

/**
 * Escapa HTML para prevenir XSS
 * @param {string} text - Texto a escapar
 * @returns {string} - Texto escapado
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
