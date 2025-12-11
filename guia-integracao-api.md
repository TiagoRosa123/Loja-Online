# Guia de Interligação Frontend-API

Este guia explica como conectar o frontend HTML/JavaScript com a API ASP.NET Core do projeto Loja Online.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração do Backend (API)](#configuração-do-backend-api)
3. [Estrutura do Frontend](#estrutura-do-frontend)
4. [Como Usar o API Service](#como-usar-o-api-service)
5. [Exemplos Práticos](#exemplos-práticos)
6. [Boas Práticas](#boas-práticas)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

### Arquitetura

```
Frontend (HTML/JS)  ←→  API (ASP.NET Core)  ←→  Base de Dados (MySQL)
```

### URLs Importantes

- **API Base URL**: `http://localhost:5068/api`
- **Swagger UI**: `http://localhost:5068/swagger`

### Endpoints Disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/Products/GetProducts` | Listar todos os produtos |
| GET | `/api/Products/{id}` | Obter produto por ID |
| POST | `/api/Products` | Criar novo produto |
| PUT | `/api/Products/EditProduct` | Atualizar produto |
| DELETE | `/api/Products/DeleteProduct?productId={id}` | Eliminar produto |

---

## ⚙️ Configuração do Backend (API)

### Passo 1: Configurar CORS

O CORS (Cross-Origin Resource Sharing) é necessário para permitir que o frontend faça chamadas à API.

**Ficheiro**: `LojaOnline/LojaOnline/Program.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using LojaOnline.Data;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// --- Configuração CORS ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()  // Permite qualquer origem (para desenvolvimento)
              .AllowAnyMethod()  // Permite GET, POST, PUT, DELETE, etc.
              .AllowAnyHeader(); // Permite qualquer header
    });
});
// --- Fim Configuração CORS ---

builder.Services.AddControllers();
builder.Services.AddDbContext<ApiDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// --- Ativar CORS (IMPORTANTE: deve vir antes de UseAuthorization) ---
app.UseCors("AllowFrontend");
// --- Fim Ativar CORS ---

app.UseAuthorization();
app.MapControllers();
app.Run();
```

> [!IMPORTANT]
> A linha `app.UseCors("AllowFrontend")` **DEVE** vir antes de `app.UseAuthorization()`.

> [!WARNING]
> Em produção, substitua `AllowAnyOrigin()` por `WithOrigins("https://seudominio.com")` para maior segurança.

### Passo 2: Iniciar a API

```bash
cd LojaOnline/LojaOnline
dotnet run
```

A API estará disponível em `http://localhost:5068`

---

## 🎨 Estrutura do Frontend

### Organização de Ficheiros

```
Frontend/
├── pages/
│   ├── produtos.html          # Página de gestão de produtos
│   └── ...                    # Outras páginas
├── script/
│   ├── api-service.js         # Serviço centralizado para API
│   ├── produtos.js            # Lógica específica da página produtos
│   └── script.js              # Scripts gerais
└── css/
    └── style.css              # Estilos
```

### Carregar Scripts na Ordem Correta

**Importante**: Os scripts devem ser carregados nesta ordem:

```html
<!-- 1. Bootstrap (se estiver a usar) -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

<!-- 2. API Service (PRIMEIRO) -->
<script src="../script/api-service.js"></script>

<!-- 3. Scripts específicos da página -->
<script src="../script/produtos.js"></script>

<!-- 4. Scripts gerais -->
<script src="../script/script.js"></script>
```

---

## 🔧 Como Usar o API Service

### O que é o API Service?

O `api-service.js` é uma camada de abstração que centraliza todas as chamadas à API. Isto torna o código mais organizado e fácil de manter.

### Métodos Disponíveis

#### 1. Listar Todos os Produtos

```javascript
// Obter todos os produtos
const products = await ApiService.getAllProducts();
console.log(products);
```

**Resposta esperada**:
```json
[
  {
    "id": 1,
    "name": "Produto 1",
    "sku": "PROD-001",
    "description": "Descrição do produto",
    "price": 29.99,
    "createdAt": "2024-12-11T10:00:00"
  },
  ...
]
```

#### 2. Obter Produto por ID

```javascript
// Obter produto com ID 1
const product = await ApiService.getProductById(1);
console.log(product);
```

#### 3. Criar Novo Produto

```javascript
// Criar novo produto
const newProduct = {
    name: "Novo Produto",
    sku: "PROD-002",
    description: "Descrição do novo produto",
    price: 49.99
};

const createdProduct = await ApiService.createProduct(newProduct);
console.log('Produto criado:', createdProduct);
```

> [!NOTE]
> A data de criação (`createdAt`) é adicionada automaticamente pelo `ApiService`.

#### 4. Atualizar Produto

```javascript
// Atualizar produto existente
const updatedProduct = {
    id: 1,  // ID é obrigatório
    name: "Produto Atualizado",
    sku: "PROD-001",
    description: "Nova descrição",
    price: 39.99
};

await ApiService.updateProduct(updatedProduct);
```

#### 5. Eliminar Produto

```javascript
// Eliminar produto com ID 1
await ApiService.deleteProduct(1);
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Carregar e Exibir Produtos numa Tabela

```javascript
async function loadProducts() {
    try {
        // Mostrar loading
        document.getElementById('loading').style.display = 'block';
        
        // Buscar produtos da API
        const products = await ApiService.getAllProducts();
        
        // Obter referência à tabela
        const tbody = document.getElementById('productsTableBody');
        
        // Limpar tabela
        tbody.innerHTML = '';
        
        // Adicionar cada produto à tabela
        products.forEach(product => {
            const row = `
                <tr>
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${product.sku}</td>
                    <td>€${product.price.toFixed(2)}</td>
                    <td>
                        <button onclick="editProduct(${product.id})">Editar</button>
                        <button onclick="deleteProduct(${product.id})">Eliminar</button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
        
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        alert('Erro ao carregar produtos!');
    } finally {
        // Esconder loading
        document.getElementById('loading').style.display = 'none';
    }
}

// Carregar produtos quando a página carregar
document.addEventListener('DOMContentLoaded', loadProducts);
```

### Exemplo 2: Criar Produto com Formulário

**HTML**:
```html
<form id="productForm">
    <input type="text" id="productName" placeholder="Nome" required>
    <input type="text" id="productSku" placeholder="SKU" required>
    <textarea id="productDescription" placeholder="Descrição"></textarea>
    <input type="number" id="productPrice" placeholder="Preço" step="0.01" required>
    <button type="submit">Criar Produto</button>
</form>
```

**JavaScript**:
```javascript
document.getElementById('productForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // Obter dados do formulário
    const productData = {
        name: document.getElementById('productName').value,
        sku: document.getElementById('productSku').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value)
    };
    
    try {
        // Criar produto
        await ApiService.createProduct(productData);
        
        // Mostrar mensagem de sucesso
        alert('Produto criado com sucesso!');
        
        // Limpar formulário
        event.target.reset();
        
        // Recarregar lista de produtos
        await loadProducts();
        
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        alert('Erro ao criar produto!');
    }
});
```

### Exemplo 3: Editar Produto

```javascript
async function editProduct(productId) {
    try {
        // Buscar dados do produto
        const product = await ApiService.getProductById(productId);
        
        // Preencher formulário com os dados
        document.getElementById('productName').value = product.name;
        document.getElementById('productSku').value = product.sku;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productPrice').value = product.price;
        
        // Guardar ID para usar no update
        document.getElementById('productForm').dataset.editingId = productId;
        
        // Mudar texto do botão
        document.querySelector('#productForm button[type="submit"]').textContent = 'Atualizar';
        
    } catch (error) {
        console.error('Erro ao carregar produto:', error);
        alert('Erro ao carregar produto!');
    }
}

// Modificar o submit para suportar edição
document.getElementById('productForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const form = event.target;
    const editingId = form.dataset.editingId;
    
    const productData = {
        name: document.getElementById('productName').value,
        sku: document.getElementById('productSku').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value)
    };
    
    try {
        if (editingId) {
            // Modo edição
            productData.id = parseInt(editingId);
            await ApiService.updateProduct(productData);
            alert('Produto atualizado com sucesso!');
            delete form.dataset.editingId;
        } else {
            // Modo criação
            await ApiService.createProduct(productData);
            alert('Produto criado com sucesso!');
        }
        
        form.reset();
        await loadProducts();
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao guardar produto!');
    }
});
```

### Exemplo 4: Eliminar Produto com Confirmação

```javascript
async function deleteProduct(productId) {
    // Pedir confirmação
    if (!confirm('Tem a certeza que deseja eliminar este produto?')) {
        return;
    }
    
    try {
        // Eliminar produto
        await ApiService.deleteProduct(productId);
        
        // Mostrar mensagem de sucesso
        alert('Produto eliminado com sucesso!');
        
        // Recarregar lista
        await loadProducts();
        
    } catch (error) {
        console.error('Erro ao eliminar produto:', error);
        alert('Erro ao eliminar produto!');
    }
}
```

---

## ✅ Boas Práticas

### 1. Sempre Use Try-Catch

```javascript
// ❌ MAU - Sem tratamento de erros
const products = await ApiService.getAllProducts();

// ✅ BOM - Com tratamento de erros
try {
    const products = await ApiService.getAllProducts();
    // processar produtos
} catch (error) {
    console.error('Erro:', error);
    alert('Erro ao carregar produtos!');
}
```

### 2. Mostre Feedback ao Utilizador

```javascript
async function loadProducts() {
    // Mostrar loading
    showLoading(true);
    
    try {
        const products = await ApiService.getAllProducts();
        displayProducts(products);
    } catch (error) {
        showError('Erro ao carregar produtos');
    } finally {
        // Esconder loading (executa sempre)
        showLoading(false);
    }
}
```

### 3. Valide Dados Antes de Enviar

```javascript
async function createProduct(formData) {
    // Validação
    if (!formData.name || formData.name.trim() === '') {
        alert('Nome é obrigatório!');
        return;
    }
    
    if (formData.price <= 0) {
        alert('Preço deve ser maior que zero!');
        return;
    }
    
    // Enviar para API
    await ApiService.createProduct(formData);
}
```

### 4. Escape HTML para Prevenir XSS

```javascript
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Usar ao exibir dados do utilizador
tbody.innerHTML = `<td>${escapeHtml(product.name)}</td>`;
```

### 5. Use Async/Await em Vez de .then()

```javascript
// ❌ MAU - Difícil de ler
ApiService.getAllProducts()
    .then(products => {
        return displayProducts(products);
    })
    .catch(error => {
        console.error(error);
    });

// ✅ BOM - Mais limpo e legível
try {
    const products = await ApiService.getAllProducts();
    displayProducts(products);
} catch (error) {
    console.error(error);
}
```

---

## 🔍 Troubleshooting

### Problema 1: Erro CORS

**Sintoma**: Erro na consola do browser:
```
Access to fetch at 'http://localhost:5068/api/Products/GetProducts' from origin 'null' 
has been blocked by CORS policy
```

**Solução**:
1. Verificar se adicionou a configuração CORS no `Program.cs`
2. Verificar se `app.UseCors("AllowFrontend")` está **antes** de `app.UseAuthorization()`
3. Reiniciar a API após fazer alterações

### Problema 2: API não Responde

**Sintoma**: Erro `Failed to fetch` ou timeout

**Soluções**:
1. Verificar se a API está a correr (`dotnet run`)
2. Verificar o URL correto (`http://localhost:5068`)
3. Verificar se a porta não mudou (ver `Properties/launchSettings.json`)
4. Testar o endpoint no Swagger: `http://localhost:5068/swagger`

### Problema 3: Dados não Aparecem

**Sintoma**: A página carrega mas não mostra produtos

**Soluções**:
1. Abrir a consola do browser (F12) e verificar erros
2. Verificar se a API retorna dados (testar no Swagger)
3. Verificar se a base de dados tem produtos
4. Adicionar `console.log()` para debug:

```javascript
async function loadProducts() {
    try {
        const products = await ApiService.getAllProducts();
        console.log('Produtos recebidos:', products); // DEBUG
        displayProducts(products);
    } catch (error) {
        console.error('Erro:', error); // DEBUG
    }
}
```

### Problema 4: Erro 404 Not Found

**Sintoma**: `404 Not Found` ao chamar endpoint

**Soluções**:
1. Verificar se o URL está correto
2. Verificar se o controller tem a rota correta:
   ```csharp
   [Route("api/[controller]")]
   [ApiController]
   public class ProductsController : ControllerBase
   ```
3. Verificar se o método tem o atributo HTTP correto:
   ```csharp
   [HttpGet("GetProducts")]
   public async Task<IActionResult> GetProducts()
   ```

### Problema 5: Erro 500 Internal Server Error

**Sintoma**: Erro 500 ao criar/atualizar produto

**Soluções**:
1. Verificar logs da API na consola
2. Verificar se a base de dados está acessível
3. Verificar se os dados enviados estão no formato correto
4. Verificar validações no modelo:

```javascript
// Garantir que price é número
const productData = {
    name: "Produto",
    sku: "SKU-001",
    description: "Descrição",
    price: parseFloat(priceInput.value) // Converter para número
};
```

---

## 📚 Recursos Adicionais

### Testar a API com Swagger

1. Iniciar a API
2. Abrir `http://localhost:5068/swagger`
3. Testar endpoints diretamente no browser

### Ferramentas Úteis

- **Browser DevTools** (F12): Para ver erros JavaScript e requisições
- **Network Tab**: Para ver todas as chamadas HTTP
- **Console Tab**: Para ver logs e erros

### Próximos Passos

1. Adaptar os exemplos para outras entidades (Users, Orders, etc.)
2. Adicionar paginação para listas grandes
3. Implementar pesquisa e filtros
4. Adicionar autenticação (JWT tokens)
5. Melhorar UI com notificações toast em vez de `alert()`

---

## 📝 Resumo Rápido

1. **Backend**: Adicionar CORS no `Program.cs`
2. **Frontend**: Incluir `api-service.js` antes dos outros scripts
3. **Usar**: `await ApiService.metodo()` para chamar a API
4. **Sempre**: Usar try-catch para tratar erros
5. **Testar**: Usar Swagger para verificar se a API funciona

---

**Criado para**: Projeto Final Loja Online  
**Data**: Dezembro 2024  
**Versão**: 1.0
