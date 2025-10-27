using System.ComponentModel.DataAnnotations;

namespace GroupProject2.API.Models
{
    public class Student
    {
        public int StudentId { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
        
        public int? CoachId { get; set; }
        
        // Navigation property
        public Coach? Coach { get; set; }
        public ICollection<Mood> Moods { get; set; } = new List<Mood>();
    }
}
