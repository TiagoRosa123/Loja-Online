namespace LojaOnline.Models
{
    public class Product
    {
        // { get; set; } é a forma de C# dizer que isto é uma propriedade
        // que pode ser lida (get) e escrita (set).

        public long Id { get; set; }

        // string.Empty é um valor inicial para evitar avisos de "null"
        public string Sku { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        // O '?' diz que a Descrição é opcional (pode ser 'null')
        public string Description { get; set; } = string.Empty; 

        // 'decimal' é o tipo correto para dinheiro, nunca uses 'double' ou 'float'
        public decimal Price { get; set; }
        
        // New Fields for Storefront
        public string Category { get; set; } = string.Empty; // T-Shirt, Sweat, Casaco
        public string Gender { get; set; } = string.Empty;   // Homem, Mulher
        public string ImageUrl { get; set; } = string.Empty; // Link para imagem

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
