using Microsoft.AspNetCore.Mvc;
using GroupProject2.API.Models;
using GroupProject2.API.Services;

namespace GroupProject2.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentsController : ControllerBase
    {
        private readonly MindFitDatabaseService _databaseService;

        public StudentsController(MindFitDatabaseService databaseService)
        {
            _databaseService = databaseService;
        }

        [HttpGet]
        public async Task<ActionResult<List<Student>>> GetAllStudents()
        {
            try
            {
                var students = await _databaseService.GetAllStudentsAsync();
                return Ok(students);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Student>> GetStudent(int id)
        {
            try
            {
                var students = await _databaseService.GetAllStudentsAsync();
                var student = students.FirstOrDefault(s => s.StudentId == id);
                
                if (student == null)
                {
                    return NotFound($"Student with ID {id} not found");
                }

                return Ok(student);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("by-coach/{coachId}")]
        public async Task<ActionResult<List<Student>>> GetStudentsByCoach(int coachId)
        {
            try
            {
                var students = await _databaseService.GetStudentsByCoachIdAsync(coachId);
                return Ok(students);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Student>> CreateStudent([FromBody] Student student)
        {
            try
            {
                if (string.IsNullOrEmpty(student.Name) || string.IsNullOrEmpty(student.Email) || string.IsNullOrEmpty(student.Password))
                {
                    return BadRequest("Name, Email, and Password are required");
                }

                // Check if email already exists
                var existingStudents = await _databaseService.GetAllStudentsAsync();
                if (existingStudents.Any(s => s.Email.Equals(student.Email, StringComparison.OrdinalIgnoreCase)))
                {
                    return BadRequest("Email already exists");
                }

                var createdStudent = await _databaseService.CreateStudentAsync(student);
                return CreatedAtAction(nameof(GetStudent), new { id = createdStudent.StudentId }, createdStudent);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}/coach")]
        public async Task<ActionResult<Student>> UpdateStudentCoach(int id, [FromBody] UpdateCoachRequest request)
        {
            try
            {
                if (request.CoachId == null)
                {
                    return BadRequest("CoachId is required");
                }

                // Verify the student exists
                var student = await _databaseService.GetStudentByIdAsync(id);
                if (student == null)
                {
                    return NotFound($"Student with ID {id} not found");
                }

                // Verify the coach exists
                var coach = await _databaseService.GetCoachByIdAsync(request.CoachId.Value);
                if (coach == null)
                {
                    return BadRequest($"Coach with ID {request.CoachId} not found");
                }

                // Update the student's coach
                var updatedStudent = await _databaseService.UpdateStudentCoachAsync(id, request.CoachId.Value);
                return Ok(updatedStudent);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    public class UpdateCoachRequest
    {
        public int? CoachId { get; set; }
    }
}
