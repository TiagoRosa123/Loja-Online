using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using LojaOnline.Data;
using LojaOnline.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace LojaOnline.Services
{
    public interface IAuthService
    {
        Task<User?> RegisterAsync(RegisterDto request);
        Task<string?> LoginAsync(LoginDto request);
    }

    public class AuthService : IAuthService
    {
        private readonly ApiDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ApiDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<User?> RegisterAsync(RegisterDto request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email || u.Username == request.Username))
            {
                return null; // User already exists
            }

            // Create Password Hash (Simple SHA256 for demo purposes, use BCrypt/PBKDF2 in production)
            CreatePasswordHash(request.Password, out string passwordHash);

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = passwordHash,
                Role = "User" // Default role
            };

            // First user is Admin
            if (!await _context.Users.AnyAsync())
            {
                user.Role = "Admin";
            }

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<string?> LoginAsync(LoginDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                Console.WriteLine($"[AuthDebug] User not found: {request.Email}");
                return null;
            }

            if (!VerifyPasswordHash(request.Password, user.PasswordHash))
            {
                Console.WriteLine($"[AuthDebug] Password check failed for: {request.Email}");
                return null;
            }

            try 
            {
                Console.WriteLine($"[AuthDebug] User validated, generating token for: {request.Email}");
                return CreateToken(user);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AuthDebug] Token generation failed: {ex.Message}");
                throw;
            }
        }

        private string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration.GetSection("AppSettings:Token").Value ?? "MySuperSecretKeyForDevelopmentJustForExamples!"));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private void CreatePasswordHash(string password, out string passwordHash)
        {
            using (var hmac = new HMACSHA512())
            {
                // Return "Salt.Hash" string
                var salt = hmac.Key;
                var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
                
                // Format: <Base64Salt>.<Base64Hash>
                passwordHash = Convert.ToBase64String(salt) + "." + Convert.ToBase64String(hash);
            }
        }

        private bool VerifyPasswordHash(string password, string storedHash)
        {
            var parts = storedHash.Split('.');
            if (parts.Length != 2) return false;

            var salt = Convert.FromBase64String(parts[0]);
            var hash = Convert.FromBase64String(parts[1]);

            using (var hmac = new HMACSHA512(salt))
            {
                var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
                return computedHash.SequenceEqual(hash);
            }
        }
    }
}
