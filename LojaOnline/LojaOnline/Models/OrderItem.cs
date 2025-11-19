using System.ComponentModel.DataAnnotations.Schema;

namespace LojaOnline.Models
{
    public class OrderItem
    {
        public long Id { get; set; }

        public long OrderId { get; set; } // Chave estrangeira
        public Order? Order { get; set; } // Propriedade de navegação

        public long ProductId { get; set; } // Chave estrangeira
        public Product? Product { get; set; } // Propriedade de navegação

        public int Quantity { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal UnitPrice { get; set; } // Preço no momento da compra
    }
}
