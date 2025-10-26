using System.ComponentModel.DataAnnotations;

namespace GroupProject2.API.Models
{
    public class CoachRating
    {
        public int RatingId { get; set; }
        
        [Required]
        public int StudentId { get; set; }
        
        [Required]
        public int CoachId { get; set; }
        
        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int Rating { get; set; }
        
        public string? Review { get; set; }
        
        public DateTime RatingDate { get; set; }
    }
}

