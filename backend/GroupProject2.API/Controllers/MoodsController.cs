using Microsoft.AspNetCore.Mvc;
using GroupProject2.API.Models;
using GroupProject2.API.Services;

namespace GroupProject2.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MoodsController : ControllerBase
    {
        private readonly MindFitDatabaseService _databaseService;

        public MoodsController(MindFitDatabaseService databaseService)
        {
            _databaseService = databaseService;
        }

        [HttpGet("student/{studentId}")]
        public async Task<ActionResult<List<Mood>>> GetMoodsByStudent(int studentId)
        {
            try
            {
                var moods = await _databaseService.GetMoodsByStudentIdAsync(studentId);
                return Ok(moods);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Mood>> CreateMood([FromBody] Mood mood)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdMood = await _databaseService.CreateMoodAsync(mood);
                return CreatedAtAction(nameof(GetMoodsByStudent), new { studentId = mood.StudentId }, createdMood);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}