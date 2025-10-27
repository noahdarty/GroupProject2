using System.ComponentModel.DataAnnotations;

namespace GroupProject2.API.Models
{
    public class Admin
    {
        public int AdminId { get; set; }
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
    }
}


