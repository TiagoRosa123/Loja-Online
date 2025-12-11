/* =========================================================
   API SERVICE - Serviço para comunicação com a API
   ========================================================= */

// Configuração base da API
const API_BASE_URL = 'http://localhost:5068/api';

/**
 * Classe ApiService - Centraliza todas as chamadas à API
 */
class ApiService {
    
    /**
     * Método auxiliar para fazer requisições HTTP
     * @param {string} endpoint - O endpoint da API (ex: '/Products/GetProducts')
     * @param {object} options - Opções do fetch (method, headers, body, etc.)
     * @returns {Promise} - Retorna a resposta da API
     */
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        
        // Configuração padrão dos headers
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        // Merge das opções com as configurações padrão
        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            
            // Verifica se a resposta foi bem-sucedida
            if (!response.ok) {
                throw new Error(`Erro HTTP! Status: ${response.status}`);
            }

            // Tenta fazer parse do JSON
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Erro na requisição à API:', error);
            throw error;
        }
    }

    // ==================== PRODUTOS ====================

    /**
     * Obtém todos os produtos
     * @returns {Promise<Array>} - Lista de produtos
     */
    static async getAllProducts() {
        return await this.request('/Products/GetProducts', {
            method: 'GET'
        });
    }

    /**
     * Obtém um produto por ID
     * @param {number} id - ID do produto
     * @returns {Promise<Object>} - Dados do produto
     */
    static async getProductById(id) {
        return await this.request(`/Products/${id}`, {
            method: 'GET'
        });
    }

    /**
     * Cria um novo produto
     * @param {Object} product - Dados do produto
     * @param {string} product.name - Nome do produto
     * @param {string} product.sku - SKU do produto
     * @param {string} product.description - Descrição do produto
     * @param {number} product.price - Preço do produto
     * @returns {Promise<Object>} - Produto criado
     */
    static async createProduct(product) {
        // Adiciona a data de criação
        const productData = {
            ...product,
            createdAt: new Date().toISOString()
        };

        return await this.request('/Products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    /**
     * Atualiza um produto existente
     * @param {Object} product - Dados do produto (deve incluir o ID)
     * @returns {Promise<Object>} - Produto atualizado
     */
    static async updateProduct(product) {
        return await this.request('/Products/EditProduct', {
            method: 'PUT',
            body: JSON.stringify(product)
        });
    }

    /**
     * Elimina um produto
     * @param {number} productId - ID do produto a eliminar
     * @returns {Promise<boolean>} - true se eliminado com sucesso
     */
    static async deleteProduct(productId) {
        return await this.request(`/Products/DeleteProduct?productId=${productId}`, {
            method: 'DELETE'
        });
    }
}

// Exporta o serviço para uso em outros ficheiros
// (Se estiver a usar módulos ES6, descomente a linha abaixo)
// export default ApiService;
