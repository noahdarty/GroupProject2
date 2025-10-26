namespace GroupProject2.API.Models
{
    public class CustomWorkout
    {
        public int CustomWorkoutId { get; set; }
        public int StudentId { get; set; }
        public string MoodType { get; set; } = string.Empty;
        public string IntensityLevel { get; set; } = string.Empty;
        public int Duration { get; set; }
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class CustomWorkoutRequest
    {
        public int StudentId { get; set; }
        public string MoodType { get; set; } = string.Empty;
        public string IntensityLevel { get; set; } = string.Empty;
        public int Duration { get; set; }
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public int CreatedBy { get; set; }
    }
}


