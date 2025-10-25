using Microsoft.Data.Sqlite;
using GroupProject2.API.Models;

namespace GroupProject2.API.Services
{
    public class MindFitDatabaseService
    {
        private readonly string _connectionString;

        public MindFitDatabaseService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? 
                throw new ArgumentNullException("Connection string not found");
        }

        public async Task InitializeDatabaseAsync()
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            // Check if database is already initialized
            var checkCommand = connection.CreateCommand();
            checkCommand.CommandText = "SELECT name FROM sqlite_master WHERE type='table' AND name='Coaches'";
            var tableExists = await checkCommand.ExecuteScalarAsync();
            
            if (tableExists != null)
            {
                Console.WriteLine("Database already initialized, skipping table creation.");
                return;
            }

            Console.WriteLine("Initializing database for the first time...");

            // Create Coaches table
            var createCoachesCommand = connection.CreateCommand();
            createCoachesCommand.CommandText = @"
                CREATE TABLE IF NOT EXISTS Coaches (
                    CoachId INTEGER PRIMARY KEY AUTOINCREMENT,
                    YearsOfExperience INTEGER NOT NULL,
                    Name TEXT NOT NULL,
                    Email TEXT NOT NULL UNIQUE,
                    Password TEXT NOT NULL
                )";
            await createCoachesCommand.ExecuteNonQueryAsync();

            // Create Students table
            var createStudentsCommand = connection.CreateCommand();
            createStudentsCommand.CommandText = @"
                CREATE TABLE IF NOT EXISTS Students (
                    StudentId INTEGER PRIMARY KEY AUTOINCREMENT,
                    Name TEXT NOT NULL,
                    Email TEXT NOT NULL UNIQUE,
                    Password TEXT NOT NULL,
                    CoachId INTEGER,
                    FOREIGN KEY (CoachId) REFERENCES Coaches(CoachId)
                )";
            await createStudentsCommand.ExecuteNonQueryAsync();


            // Create Moods table
            var createMoodsCommand = connection.CreateCommand();
            createMoodsCommand.CommandText = @"
                CREATE TABLE IF NOT EXISTS Moods (
                    StudentId INTEGER NOT NULL,
                    MoodId INTEGER PRIMARY KEY AUTOINCREMENT,
                    MoodType TEXT NOT NULL,
                    Notes TEXT,
                    Date TEXT NOT NULL,
                    FOREIGN KEY (StudentId) REFERENCES Students(StudentId)
                )";
            await createMoodsCommand.ExecuteNonQueryAsync();

            // Create Workouts table
            var createWorkoutsCommand = connection.CreateCommand();
            createWorkoutsCommand.CommandText = @"
                CREATE TABLE IF NOT EXISTS Workouts (
                    WorkoutId INTEGER PRIMARY KEY AUTOINCREMENT,
                    MoodType TEXT NOT NULL,
                    Description TEXT NOT NULL,
                    IntensityLevel TEXT NOT NULL,
                    Duration TEXT NOT NULL
                )";
            await createWorkoutsCommand.ExecuteNonQueryAsync();

            // Insert sample data
            await InsertSampleDataAsync(connection);
        }

        private async Task InsertSampleDataAsync(SqliteConnection connection)
        {
            // Check if sample data already exists
            var checkCoachesCommand = connection.CreateCommand();
            checkCoachesCommand.CommandText = "SELECT COUNT(*) FROM Coaches";
            var coachCount = Convert.ToInt32(await checkCoachesCommand.ExecuteScalarAsync());
            
            if (coachCount == 0)
            {
                Console.WriteLine("Inserting sample data...");
                
                // Insert sample coaches
                var insertCoachesCommand = connection.CreateCommand();
                insertCoachesCommand.CommandText = @"
                    INSERT INTO Coaches (YearsOfExperience, Name, Email, Password) VALUES 
                    (5, 'Sarah Johnson', 'sarah.johnson@mindfit.com', 'password123'),
                    (8, 'Mike Chen', 'mike.chen@mindfit.com', 'password123'),
                    (3, 'Emily Davis', 'emily.davis@mindfit.com', 'password123')";
                await insertCoachesCommand.ExecuteNonQueryAsync();

                // Insert sample students (without coaches)
                var insertStudentsCommand = connection.CreateCommand();
                insertStudentsCommand.CommandText = @"
                    INSERT INTO Students (Name, Email, Password, CoachId) VALUES 
                    ('Alex Smith', 'alex.smith@student.edu', 'password123', NULL),
                    ('Jordan Brown', 'jordan.brown@student.edu', 'password123', NULL),
                    ('Taylor Wilson', 'taylor.wilson@student.edu', 'password123', NULL),
                    ('Casey Lee', 'casey.lee@student.edu', 'password123', NULL)";
                await insertStudentsCommand.ExecuteNonQueryAsync();
            }
            else
            {
                Console.WriteLine("Sample data already exists, skipping insertion.");
            }

            // Mood table will be created empty - ready for data entry

            // Check if workouts already exist
            var checkWorkoutsCommand = connection.CreateCommand();
            checkWorkoutsCommand.CommandText = "SELECT COUNT(*) FROM Workouts";
            var workoutCount = Convert.ToInt32(await checkWorkoutsCommand.ExecuteScalarAsync());
            
            if (workoutCount == 0)
            {
                // Insert sample workouts (4 unique workouts - one per mood type)
                var insertWorkoutsCommand = connection.CreateCommand();
                insertWorkoutsCommand.CommandText = @"
                    INSERT INTO Workouts (MoodType, Description, IntensityLevel, Duration) VALUES 
                    ('Stressed', '1. Deep breathing exercises (5 min) 2. Cat-cow stretches (3 min) 3. Child''s pose hold (2 min) 4. Seated forward fold (3 min) 5. Legs up the wall (5 min) 6. Guided meditation (2 min)', 'Low', '20 minutes'),
                    ('Excited', '1. Barbell squats (4 sets x 8 reps) 2. Deadlifts (4 sets x 6 reps) 3. Bench press (4 sets x 8 reps) 4. Pull-ups/assisted (3 sets x 6 reps) 5. Overhead press (3 sets x 8 reps) 6. Plank hold (3 sets x 60 sec)', 'High', '75 minutes'),
                    ('Calm', '1. Bodyweight squats (3 sets x 12 reps) 2. Push-ups (3 sets x 10 reps) 3. Lunges (3 sets x 10 each leg) 4. Plank (3 sets x 30 sec) 5. Glute bridges (3 sets x 15 reps) 6. Cool-down stretches (5 min)', 'Medium', '45 minutes'),
                    ('Tired', '1. Gentle neck rolls (2 min) 2. Shoulder shrugs (2 min) 3. Seated spinal twists (3 min) 4. Ankle circles (2 min) 5. Deep breathing (3 min) 6. Restorative pose (3 min)', 'Low', '15 minutes')";
                await insertWorkoutsCommand.ExecuteNonQueryAsync();
            }
        }

        // Coach methods
        public async Task<List<Coach>> GetAllCoachesAsync()
        {
            var coaches = new List<Coach>();
            
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            Console.WriteLine("Fetching all coaches from database...");

            var command = connection.CreateCommand();
            command.CommandText = "SELECT CoachId, YearsOfExperience, Name, Email, Password FROM Coaches ORDER BY Name";

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                coaches.Add(new Coach
                {
                    CoachId = reader.GetInt32(0),
                    YearsOfExperience = reader.GetInt32(1),
                    Name = reader.GetString(2),
                    Email = reader.GetString(3),
                    Password = reader.GetString(4)
                });
            }

            return coaches;
        }

        public async Task<Coach?> GetCoachByIdAsync(int id)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = "SELECT CoachId, YearsOfExperience, Name, Email, Password FROM Coaches WHERE CoachId = @id";
            command.Parameters.AddWithValue("@id", id);

            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new Coach
                {
                    CoachId = reader.GetInt32(0),
                    YearsOfExperience = reader.GetInt32(1),
                    Name = reader.GetString(2),
                    Email = reader.GetString(3),
                    Password = reader.GetString(4)
                };
            }

            return null;
        }

        // Student methods
        public async Task<List<Student>> GetAllStudentsAsync()
        {
            var students = new List<Student>();
            
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT s.StudentId, s.Name, s.Email, s.Password, s.CoachId, c.Name as CoachName 
                FROM Students s 
                LEFT JOIN Coaches c ON s.CoachId = c.CoachId 
                ORDER BY s.Name";

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                students.Add(new Student
                {
                    StudentId = reader.GetInt32(0),
                    Name = reader.GetString(1),
                    Email = reader.GetString(2),
                    Password = reader.GetString(3),
                    CoachId = reader.IsDBNull(4) ? null : reader.GetInt32(4),
                    Coach = reader.IsDBNull(5) ? null : new Coach { Name = reader.GetString(5) }
                });
            }

            return students;
        }

        public async Task<List<Student>> GetStudentsByCoachIdAsync(int coachId)
        {
            var students = new List<Student>();
            
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT s.StudentId, s.Name, s.Email, s.CoachId 
                FROM Students s 
                WHERE s.CoachId = @coachId 
                ORDER BY s.Name";
            command.Parameters.AddWithValue("@coachId", coachId);

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                students.Add(new Student
                {
                    StudentId = reader.GetInt32(0),
                    Name = reader.GetString(1),
                    Email = reader.GetString(2),
                    CoachId = reader.GetInt32(3)
                });
            }

            return students;
        }

        public async Task<Student?> GetStudentByIdAsync(int id)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT s.StudentId, s.Name, s.Email, s.Password, s.CoachId, c.Name as CoachName 
                FROM Students s 
                LEFT JOIN Coaches c ON s.CoachId = c.CoachId 
                WHERE s.StudentId = @id";

            command.Parameters.AddWithValue("@id", id);

            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new Student
                {
                    StudentId = reader.GetInt32(0),
                    Name = reader.GetString(1),
                    Email = reader.GetString(2),
                    Password = reader.GetString(3),
                    CoachId = reader.IsDBNull(4) ? null : reader.GetInt32(4),
                    Coach = reader.IsDBNull(5) ? null : new Coach { Name = reader.GetString(5) }
                };
            }

            return null;
        }

        // Mood methods
        public async Task<List<Mood>> GetMoodsByStudentIdAsync(int studentId)
        {
            var moods = new List<Mood>();
            
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT StudentId, MoodId, MoodType, Notes, Date 
                FROM Moods 
                WHERE StudentId = @studentId 
                ORDER BY Date DESC";
            command.Parameters.AddWithValue("@studentId", studentId);

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                moods.Add(new Mood
                {
                    StudentId = reader.GetInt32(0),
                    MoodId = reader.GetInt32(1),
                    MoodType = reader.GetString(2),
                    Notes = reader.IsDBNull(3) ? null : reader.GetString(3),
                    Date = DateTime.Parse(reader.GetString(4))
                });
            }

            return moods;
        }

        public async Task<Mood> CreateMoodAsync(Mood mood)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"
                INSERT INTO Moods (StudentId, MoodType, Notes, Date)
                VALUES (@studentId, @moodType, @notes, @date);
                SELECT last_insert_rowid();";

            command.Parameters.AddWithValue("@studentId", mood.StudentId);
            command.Parameters.AddWithValue("@moodType", mood.MoodType);
            command.Parameters.AddWithValue("@notes", mood.Notes ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@date", mood.Date.ToString("yyyy-MM-dd HH:mm:ss"));

            var id = Convert.ToInt32(await command.ExecuteScalarAsync());
            mood.MoodId = id;

            return mood;
        }

        // Workout methods
        public async Task<List<Workout>> GetWorkoutsByMoodTypeAsync(string moodType)
        {
            var workouts = new List<Workout>();
            
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT WorkoutId, MoodType, Description, IntensityLevel, Duration
                FROM Workouts 
                WHERE MoodType = @moodType 
                ORDER BY IntensityLevel";
            command.Parameters.AddWithValue("@moodType", moodType);

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                workouts.Add(new Workout
                {
                    WorkoutId = reader.GetInt32(0),
                    MoodType = reader.GetString(1),
                    Description = reader.GetString(2),
                    IntensityLevel = reader.GetString(3),
                    Duration = reader.GetString(4)
                });
            }

            return workouts;
        }

        public async Task<List<Workout>> GetAllWorkoutsAsync()
        {
            var workouts = new List<Workout>();
            
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT WorkoutId, MoodType, Description, IntensityLevel 
                FROM Workouts 
                ORDER BY MoodType, IntensityLevel";

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                workouts.Add(new Workout
                {
                    WorkoutId = reader.GetInt32(0),
                    MoodType = reader.GetString(1),
                    Description = reader.GetString(2),
                    IntensityLevel = reader.GetString(3)
                });
            }

            return workouts;
        }

        public async Task<Workout?> GetWorkoutByMoodTypeAsync(string moodType)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT WorkoutId, MoodType, Description, IntensityLevel, Duration
                FROM Workouts 
                WHERE MoodType = @moodType 
                LIMIT 1";
            command.Parameters.AddWithValue("@moodType", moodType);

            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new Workout
                {
                    WorkoutId = reader.GetInt32(0),
                    MoodType = reader.GetString(1),
                    Description = reader.GetString(2),
                    IntensityLevel = reader.GetString(3),
                    Duration = reader.GetString(4)
                };
            }

            return null;
        }

        public async Task<Student> CreateStudentAsync(Student student)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"
                INSERT INTO Students (Name, Email, Password, CoachId) 
                VALUES (@name, @email, @password, @coachId);
                SELECT last_insert_rowid();";

            command.Parameters.AddWithValue("@name", student.Name);
            command.Parameters.AddWithValue("@email", student.Email);
            command.Parameters.AddWithValue("@password", student.Password);
            command.Parameters.AddWithValue("@coachId", student.CoachId ?? (object)DBNull.Value);

            var studentId = Convert.ToInt32(await command.ExecuteScalarAsync());

            return new Student
            {
                StudentId = studentId,
                Name = student.Name,
                Email = student.Email,
                Password = student.Password,
                CoachId = student.CoachId
            };
        }

        public async Task<Student> UpdateStudentCoachAsync(int studentId, int coachId)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"
                UPDATE Students 
                SET CoachId = @coachId 
                WHERE StudentId = @studentId";

            command.Parameters.AddWithValue("@coachId", coachId);
            command.Parameters.AddWithValue("@studentId", studentId);

            await command.ExecuteNonQueryAsync();

            // Return the updated student
            var updatedStudent = await GetStudentByIdAsync(studentId);
            if (updatedStudent == null)
            {
                throw new InvalidOperationException($"Student with ID {studentId} not found after update");
            }
            return updatedStudent;
        }

        public async Task<Coach> CreateCoachAsync(Coach coach)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            Console.WriteLine($"Creating coach: {coach.Name}, {coach.Email}, {coach.Password}");

            var command = connection.CreateCommand();
            command.CommandText = @"
                INSERT INTO Coaches (YearsOfExperience, Name, Email, Password) 
                VALUES (@yearsOfExperience, @name, @email, @password);
                SELECT last_insert_rowid();";

            command.Parameters.AddWithValue("@yearsOfExperience", coach.YearsOfExperience);
            command.Parameters.AddWithValue("@name", coach.Name);
            command.Parameters.AddWithValue("@email", coach.Email);
            command.Parameters.AddWithValue("@password", coach.Password);

            var coachId = Convert.ToInt32(await command.ExecuteScalarAsync());
            Console.WriteLine($"Coach created with ID: {coachId}");

            return new Coach
            {
                CoachId = coachId,
                YearsOfExperience = coach.YearsOfExperience,
                Name = coach.Name,
                Email = coach.Email,
                Password = coach.Password
            };
        }
    }
}
