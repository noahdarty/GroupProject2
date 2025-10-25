using System.ComponentModel.DataAnnotations;

namespace GroupProject2.API.Models
{
    public class Workout
    {
        public int WorkoutId { get; set; }
        
        [Required]
        public string MoodType { get; set; } = string.Empty; // Matches Mood.MoodType
        
        [Required]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        public string IntensityLevel { get; set; } = string.Empty; // Low, Medium, High
        
        [Required]
        public string Duration { get; set; } = string.Empty; // e.g., "20 minutes", "45 minutes"
    }
}
