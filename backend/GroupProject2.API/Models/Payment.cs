using System.ComponentModel.DataAnnotations;

namespace GroupProject2.API.Models
{
    public class Payment
    {
        public int PaymentId { get; set; }
        
        [Required]
        public int StudentId { get; set; }
        
        [Required]
        public int CoachId { get; set; }
        
        [Required]
        public decimal Amount { get; set; }
        
        [Required]
        public decimal CoachEarnings { get; set; }
        
        [Required]
        public decimal AdminFee { get; set; }
        
        public DateTime PaymentDate { get; set; }
        
        [Required]
        public string CardNumber { get; set; } = string.Empty;
        
        [Required]
        public string ExpiryDate { get; set; } = string.Empty;
        
        [Required]
        public string CVV { get; set; } = string.Empty;
        
        [Required]
        public string CardholderName { get; set; } = string.Empty;
    }
}

