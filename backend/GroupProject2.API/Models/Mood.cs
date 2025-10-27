using System.ComponentModel.DataAnnotations;

namespace GroupProject2.API.Models
{
    public class Mood
    {
        public int MoodId { get; set; }
        
        public int StudentId { get; set; }
        
        [Required]
        public string MoodType { get; set; } = string.Empty; // Stressed, Calm, Happy, Tired
        
        public string? Notes { get; set; }
        
        [Required]
        public DateTime Date { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public Student? Student { get; set; }
    }
}
