using Microsoft.AspNetCore.Mvc;
using GroupProject2.API.Models;
using GroupProject2.API.Services;

namespace GroupProject2.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoachRatingsController : ControllerBase
    {
        private readonly MindFitDatabaseService _databaseService;

        public CoachRatingsController(MindFitDatabaseService databaseService)
        {
            _databaseService = databaseService;
        }

        [HttpPost]
        public async Task<ActionResult<CoachRating>> CreateCoachRating([FromBody] CoachRating rating)
        {
            try
            {
                // Set rating date to current time
                rating.RatingDate = DateTime.UtcNow;

                var result = await _databaseService.CreateCoachRatingAsync(rating);
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating coach rating: {ex.Message}");
                
                // Check if it's a UNIQUE constraint violation
                if (ex.Message.Contains("UNIQUE constraint failed"))
                {
                    return Conflict("You have already rated this coach. You can only rate each coach once.");
                }
                
                return StatusCode(500, "Failed to create coach rating");
            }
        }

        [HttpGet("student/{studentId}/coach/{coachId}")]
        public async Task<ActionResult<CoachRating>> GetCoachRating(int studentId, int coachId)
        {
            try
            {
                var rating = await _databaseService.GetCoachRatingAsync(studentId, coachId);
                if (rating == null)
                {
                    return NotFound("Rating not found");
                }
                return Ok(rating);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting coach rating: {ex.Message}");
                return StatusCode(500, "Failed to get coach rating");
            }
        }

        [HttpGet("coach/{coachId}")]
        public async Task<ActionResult<List<CoachRating>>> GetCoachRatingsByCoach(int coachId)
        {
            try
            {
                var ratings = await _databaseService.GetCoachRatingsByCoachAsync(coachId);
                return Ok(ratings);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting coach ratings: {ex.Message}");
                return StatusCode(500, "Failed to get coach ratings");
            }
        }

        [HttpGet]
        public async Task<ActionResult<List<CoachRating>>> GetAllCoachRatings()
        {
            try
            {
                var ratings = await _databaseService.GetAllCoachRatingsAsync();
                return Ok(ratings);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting all coach ratings: {ex.Message}");
                return StatusCode(500, "Failed to get coach ratings");
            }
        }

        [HttpPut]
        public async Task<ActionResult<CoachRating>> UpdateCoachRating([FromBody] CoachRating rating)
        {
            try
            {
                // Update rating date to current time
                rating.RatingDate = DateTime.UtcNow;

                var result = await _databaseService.UpdateCoachRatingAsync(rating);
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating coach rating: {ex.Message}");
                return StatusCode(500, "Failed to update coach rating");
            }
        }

        [HttpDelete("{ratingId}")]
        public async Task<ActionResult> DeleteCoachRating(int ratingId)
        {
            try
            {
                var success = await _databaseService.DeleteCoachRatingAsync(ratingId);
                if (success)
                {
                    return Ok("Rating deleted successfully");
                }
                else
                {
                    return NotFound("Rating not found");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting coach rating: {ex.Message}");
                return StatusCode(500, "Failed to delete coach rating");
            }
        }
    }
}

