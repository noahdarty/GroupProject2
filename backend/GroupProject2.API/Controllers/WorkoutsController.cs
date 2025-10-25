using Microsoft.AspNetCore.Mvc;
using GroupProject2.API.Models;
using GroupProject2.API.Services;

namespace GroupProject2.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WorkoutsController : ControllerBase
    {
        private readonly MindFitDatabaseService _databaseService;

        public WorkoutsController(MindFitDatabaseService databaseService)
        {
            _databaseService = databaseService;
        }

        [HttpGet]
        public async Task<ActionResult<List<Workout>>> GetAllWorkouts()
        {
            try
            {
                var workouts = await _databaseService.GetAllWorkoutsAsync();
                return Ok(workouts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("by-mood/{moodType}")]
        public async Task<ActionResult<List<Workout>>> GetWorkoutsByMoodType(string moodType)
        {
            try
            {
                var workouts = await _databaseService.GetWorkoutsByMoodTypeAsync(moodType);
                return Ok(workouts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("mood/{moodType}")]
        public async Task<ActionResult<Workout>> GetWorkoutByMoodType(string moodType)
        {
            try
            {
                var workout = await _databaseService.GetWorkoutByMoodTypeAsync(moodType);
                if (workout == null)
                {
                    return NotFound($"No workout found for mood type: {moodType}");
                }
                return Ok(workout);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
