using LojaOnline.Data;
using LojaOnline.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LojaOnline.Controllers
{
  
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        // --- INJEÇÃO DE DEPENDÊNCIA ---

        // 1. Remove a lista 'static' e o contador

        // 2. Declara uma variável privada para o DbContext
        private readonly ApiDbContext _context;

        // 3. Pede o DbContext no construtor (Injeção de Dependência)
        public ProductsController(ApiDbContext context)
        {
            _context = context;
        }

        // --- FIM DA INJEÇÃO ---


        // 1. GET ALL (Atualizado para ser assíncrono)
        [HttpGet("GetProducts")]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _context.Products.Select(x =>new Product
            {
                Id = x.Id,
                Name = x.Name,
                Sku = x.Sku,
                Description = x.Description,
                Price = x.Price,
                CreatedAt = x.CreatedAt

            }).ToListAsync();
            return Ok(products);
        }

        // 2. GET BY ID 
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(long id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }
            return Ok(product);
        }
        

        // 3. CREATE (Atualizado)
        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] Product product)
        {
            _context.Products.Add(product); // Adiciona o produto ao DbSet
            await _context.SaveChangesAsync(); // Salva as mudanças na BD

            return Ok(product);
        }
       

        // 4. UPDATE (Atualizado)
        [HttpPut("EditProduct")]
        public async Task<IActionResult> EditProduct([FromBody] Product product )
        {
           var rows = await _context.Products
                .Where(p => p.Id == product.Id)
                .ExecuteUpdateAsync(p => p
                    .SetProperty(p => p.Name, product.Name)
                    .SetProperty(p => p.Sku, product.Sku)
                    .SetProperty(p => p.Description, product.Description)
                    .SetProperty(p => p.Price, product.Price)
                );
            return Ok(product);
        }

        // 5. DELETE 
        [HttpDelete("DeleteProduct")]
        public async Task<IActionResult> DeleteProduct(long productId)
        {
            var rows = await _context.Products.Where(p => p.Id == productId).ExecuteDeleteAsync();
            return Ok(true);
        }
    }
}
