using System.Text.Json.Serialization;

namespace LojaOnline.Models
{
    public class OrderItem
    {
        public long Id { get; set; }
        public long OrderId { get; set; }
        [JsonIgnore]
        public Order? Order { get; set; }

        public long ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty; // Snapshot do nome
        public decimal Price { get; set; } // Preço na altura da compra
        public int Quantity { get; set; }
    }
}
