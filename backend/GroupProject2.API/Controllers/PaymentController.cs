using Microsoft.AspNetCore.Mvc;
using GroupProject2.API.Models;
using GroupProject2.API.Services;

namespace GroupProject2.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly MindFitDatabaseService _databaseService;

        public PaymentController(MindFitDatabaseService databaseService)
        {
            _databaseService = databaseService;
        }

        [HttpPost("process")]
        public async Task<ActionResult<Payment>> ProcessPayment([FromBody] PaymentRequest request)
        {
            try
            {
                // Calculate fees (10% admin fee, 90% to coach)
                var adminFee = request.Amount * 0.10m;
                var coachEarnings = request.Amount * 0.90m;

                var payment = new Payment
                {
                    StudentId = request.StudentId,
                    CoachId = request.CoachId,
                    Amount = request.Amount,
                    CoachEarnings = coachEarnings,
                    AdminFee = adminFee,
                    PaymentDate = DateTime.UtcNow,
                    CardNumber = request.CardNumber,
                    ExpiryDate = request.ExpiryDate,
                    CVV = request.CVV,
                    CardholderName = request.CardholderName
                };

                var result = await _databaseService.ProcessPaymentAsync(payment);
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing payment: {ex.Message}");
                return StatusCode(500, "Failed to process payment");
            }
        }

        [HttpGet("student/{studentId}")]
        public async Task<ActionResult<List<Payment>>> GetPaymentsByStudent(int studentId)
        {
            try
            {
                var payments = await _databaseService.GetPaymentsByStudentAsync(studentId);
                return Ok(payments);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting payments for student {studentId}: {ex.Message}");
                return StatusCode(500, "Failed to get payments");
            }
        }

        [HttpGet]
        public async Task<ActionResult<List<Payment>>> GetAllPayments()
        {
            try
            {
                Console.WriteLine("PaymentController: Getting all payments for debugging");
                var payments = await _databaseService.GetAllPaymentsAsync();
                Console.WriteLine($"PaymentController: Found {payments.Count} total payments");
                foreach (var payment in payments)
                {
                    Console.WriteLine($"Payment: ID={payment.PaymentId}, CoachId={payment.CoachId}, Amount=${payment.Amount}");
                }
                return Ok(payments);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting all payments: {ex.Message}");
                return StatusCode(500, "Failed to get payments");
            }
        }

        [HttpGet("coach/{coachId}")]
        public async Task<ActionResult<List<Payment>>> GetPaymentsByCoach(int coachId)
        {
            try
            {
                Console.WriteLine($"PaymentController: Getting payments for coach ID: {coachId}");
                var payments = await _databaseService.GetPaymentsByCoachAsync(coachId);
                Console.WriteLine($"PaymentController: Returning {payments.Count} payments for coach {coachId}");
                return Ok(payments);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting payments for coach {coachId}: {ex.Message}");
                return StatusCode(500, "Failed to get payments");
            }
        }
    }

    public class PaymentRequest
    {
        public int StudentId { get; set; }
        public int CoachId { get; set; }
        public decimal Amount { get; set; }
        public string CardNumber { get; set; } = string.Empty;
        public string ExpiryDate { get; set; } = string.Empty;
        public string CVV { get; set; } = string.Empty;
        public string CardholderName { get; set; } = string.Empty;
    }
}
