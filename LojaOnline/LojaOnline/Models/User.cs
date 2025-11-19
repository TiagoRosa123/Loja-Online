namespace LojaOnline.Models
{
    public class User
    {
        public long Id { get; set; }

        public string Username { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        // Esta propriedade vai guardar a password depois de encriptada (hashing)
        // Nunca guardes a password real!
        public string PasswordHash { get; set; } = string.Empty;

        // Ex: "Admin" ou "Customer"
        public string Role { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }
}
