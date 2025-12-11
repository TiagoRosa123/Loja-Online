using System.Text.Json.Serialization;

namespace LojaOnline.Models
{
    public class Order
    {
        public long Id { get; set; }
        public long UserId { get; set; } // Quem comprou
        
        public DateTime OrderDate { get; set; } = DateTime.Now;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "Pendente"; // Pendente, Pago, Enviado

        public List<OrderItem> Items { get; set; } = new List<OrderItem>();
    }

}
