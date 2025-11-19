using System.ComponentModel.DataAnnotations.Schema;

namespace LojaOnline.Models
{
    public class Order
    {
        public long Id { get; set; }

        public long UserId { get; set; } // Chave estrangeira
        public User? User { get; set; } // Propriedade de navegação

        public string Status { get; set; } = string.Empty; // Ex: "Pending"

        [Column(TypeName = "decimal(18, 2)")]
        public decimal TotalPrice { get; set; }

        public string? PaymentTransactionId { get; set; }

        public DateTime CreatedAt { get; set; }

        // Uma encomenda tem MUITOS itens
        public List<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
