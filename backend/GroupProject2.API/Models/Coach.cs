using System.ComponentModel.DataAnnotations;

namespace GroupProject2.API.Models
{
    public class Coach
    {
        public int CoachId { get; set; }
        
        [Required]
        public int YearsOfExperience { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
        
        // Navigation property
        public ICollection<Student> Students { get; set; } = new List<Student>();
    }
}
