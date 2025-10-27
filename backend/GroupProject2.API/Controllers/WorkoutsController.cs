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
        public async Task<ActionResult<List<Workout>>> GetWorkoutsByMoodType(string moodType, [FromQuery] int? studentId = null)
        {
            try
            {
                Console.WriteLine($"Getting workout for mood: {moodType}, studentId: {studentId}");
                
                // If studentId is provided, check for custom workout first
                if (studentId.HasValue)
                {
                    var customWorkout = await _databaseService.GetActiveCustomWorkoutAsync(studentId.Value, moodType);
                    Console.WriteLine($"Custom workout found: {customWorkout != null}");
                    
                    if (customWorkout != null)
                    {
                        Console.WriteLine($"Returning custom workout for student {studentId}, mood {moodType}");
                        Console.WriteLine($"Custom workout description: '{customWorkout.Description}'");
                        Console.WriteLine($"Custom workout duration: {customWorkout.Duration}");
                        Console.WriteLine($"Custom workout intensity: {customWorkout.IntensityLevel}");
                        
                        // Convert custom workout to workout format
                        var workout = new Workout
                        {
                            WorkoutId = customWorkout.CustomWorkoutId,
                            MoodType = customWorkout.MoodType,
                            IntensityLevel = customWorkout.IntensityLevel,
                            Duration = customWorkout.Duration.ToString(),
                            Description = customWorkout.Description
                        };
                        return Ok(new List<Workout> { workout });
                    }
                }
                
                Console.WriteLine($"Falling back to default workout for mood: {moodType}");
                // Fall back to default workout
                var workouts = await _databaseService.GetWorkoutsByMoodTypeAsync(moodType);
                return Ok(workouts);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetWorkoutsByMoodType: {ex.Message}");
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

        // Custom Workout Endpoints
        [HttpPost("custom")]
        public async Task<ActionResult<CustomWorkout>> CreateCustomWorkout([FromBody] CustomWorkoutRequest request)
        {
            try
            {
                var customWorkout = await _databaseService.CreateCustomWorkoutAsync(request);
                return Ok(customWorkout);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("custom/coach/{coachId}")]
        public async Task<ActionResult<List<CustomWorkout>>> GetCustomWorkoutsByCoach(int coachId)
        {
            try
            {
                var customWorkouts = await _databaseService.GetCustomWorkoutsByCoachAsync(coachId);
                return Ok(customWorkouts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("custom/{customWorkoutId}/toggle")]
        public async Task<ActionResult<CustomWorkout>> ToggleCustomWorkout(int customWorkoutId, [FromBody] bool isActive)
        {
            try
            {
                var customWorkout = await _databaseService.ToggleCustomWorkoutAsync(customWorkoutId, isActive);
                if (customWorkout == null)
                {
                    return NotFound($"Custom workout with ID {customWorkoutId} not found");
                }
                return Ok(customWorkout);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
