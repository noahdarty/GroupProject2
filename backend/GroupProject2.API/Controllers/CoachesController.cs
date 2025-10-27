using Microsoft.AspNetCore.Mvc;
using GroupProject2.API.Models;
using GroupProject2.API.Services;

namespace GroupProject2.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoachesController : ControllerBase
    {
        private readonly MindFitDatabaseService _databaseService;

        public CoachesController(MindFitDatabaseService databaseService)
        {
            _databaseService = databaseService;
        }

        [HttpGet]
        public async Task<ActionResult<List<Coach>>> GetAllCoaches()
        {
            try
            {
                var coaches = await _databaseService.GetAllCoachesAsync();
                return Ok(coaches);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Coach>> GetCoach(int id)
        {
            try
            {
                var coach = await _databaseService.GetCoachByIdAsync(id);
                
                if (coach == null)
                {
                    return NotFound($"Coach with ID {id} not found");
                }

                return Ok(coach);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Coach>> CreateCoach([FromBody] Coach coach)
        {
            try
            {
                if (string.IsNullOrEmpty(coach.Name) || string.IsNullOrEmpty(coach.Email) || string.IsNullOrEmpty(coach.Password))
                {
                    return BadRequest("Name, Email, and Password are required");
                }

                if (coach.YearsOfExperience < 0)
                {
                    return BadRequest("Years of experience must be a positive number");
                }

                // Check if email already exists
                var existingCoaches = await _databaseService.GetAllCoachesAsync();
                if (existingCoaches.Any(c => c.Email.Equals(coach.Email, StringComparison.OrdinalIgnoreCase)))
                {
                    return BadRequest("Email already exists");
                }

                var createdCoach = await _databaseService.CreateCoachAsync(coach);
                return CreatedAtAction(nameof(GetCoach), new { id = createdCoach.CoachId }, createdCoach);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

    }
}
