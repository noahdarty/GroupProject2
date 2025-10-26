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
                Console.WriteLine("Database already initialized, checking for CustomWorkouts table...");
                // Check if CustomWorkouts table exists
                var customWorkoutsCheck = connection.CreateCommand();
                customWorkoutsCheck.CommandText = "SELECT name FROM sqlite_master WHERE type='table' AND name='CustomWorkouts'";
                var customWorkoutsExists = await customWorkoutsCheck.ExecuteScalarAsync();
                
                if (customWorkoutsExists == null)
                {
                    Console.WriteLine("Creating CustomWorkouts table...");
                    // Create CustomWorkouts table
                    var addCustomWorkoutsCommand = connection.CreateCommand();
                    addCustomWorkoutsCommand.CommandText = @"
                        CREATE TABLE IF NOT EXISTS CustomWorkouts (
                            CustomWorkoutId INTEGER PRIMARY KEY AUTOINCREMENT,
                            StudentId INTEGER NOT NULL,
                            MoodType TEXT NOT NULL,
                            IntensityLevel TEXT NOT NULL,
                            Duration INTEGER NOT NULL,
                            Description TEXT NOT NULL,
                            IsActive BOOLEAN DEFAULT 1,
                            CreatedBy INTEGER NOT NULL,
                            CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (StudentId) REFERENCES Students(StudentId),
                            FOREIGN KEY (CreatedBy) REFERENCES Coaches(CoachId),
                            UNIQUE(StudentId, MoodType)
                        )";
                    await addCustomWorkoutsCommand.ExecuteNonQueryAsync();
                    Console.WriteLine("CustomWorkouts table created successfully.");
                }

                // Check if Payments table exists
                var paymentsCheck = connection.CreateCommand();
                paymentsCheck.CommandText = "SELECT name FROM sqlite_master WHERE type='table' AND name='Payments'";
                var paymentsExists = await paymentsCheck.ExecuteScalarAsync();
                
                if (paymentsExists == null)
                {
                    Console.WriteLine("Creating Payments table...");
                    // Create Payments table
                    var addPaymentsCommand = connection.CreateCommand();
                    addPaymentsCommand.CommandText = @"
                        CREATE TABLE IF NOT EXISTS Payments (
                            PaymentId INTEGER PRIMARY KEY AUTOINCREMENT,
                            StudentId INTEGER NOT NULL,
                            CoachId INTEGER NOT NULL,
                            Amount DECIMAL(10,2) NOT NULL,
                            CoachEarnings DECIMAL(10,2) NOT NULL,
                            AdminFee DECIMAL(10,2) NOT NULL,
                            PaymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                            CardNumber TEXT NOT NULL,
                            ExpiryDate TEXT NOT NULL,
                            CVV TEXT NOT NULL,
                            CardholderName TEXT NOT NULL,
                            FOREIGN KEY (StudentId) REFERENCES Students(StudentId),
                            FOREIGN KEY (CoachId) REFERENCES Coaches(CoachId)
                        )";
                    await addPaymentsCommand.ExecuteNonQueryAsync();
                    Console.WriteLine("Payments table created successfully.");
                }

                // Check if Admin table exists
                var adminCheck = connection.CreateCommand();
                adminCheck.CommandText = "SELECT name FROM sqlite_master WHERE type='table' AND name='Admin'";
                var adminExists = await adminCheck.ExecuteScalarAsync();
                
                if (adminExists == null)
                {
                    Console.WriteLine("Creating Admin table...");
                    // Create Admin table
                    var addAdminCommand = connection.CreateCommand();
                    addAdminCommand.CommandText = @"
                        CREATE TABLE IF NOT EXISTS Admin (
                            AdminId INTEGER PRIMARY KEY AUTOINCREMENT,
                            Email TEXT NOT NULL UNIQUE,
                            Password TEXT NOT NULL
                        )";
                    await addAdminCommand.ExecuteNonQueryAsync();
                    Console.WriteLine("Admin table created successfully.");
                }

                // Check if CoachRatings table exists
                var coachRatingsCheck = connection.CreateCommand();
                coachRatingsCheck.CommandText = "SELECT name FROM sqlite_master WHERE type='table' AND name='CoachRatings'";
                var coachRatingsExists = await coachRatingsCheck.ExecuteScalarAsync();
                
                if (coachRatingsExists == null)
                {
                    Console.WriteLine("Creating CoachRatings table...");
                    // Create CoachRatings table
                    var addCoachRatingsCommand = connection.CreateCommand();
                    addCoachRatingsCommand.CommandText = @"
                        CREATE TABLE IF NOT EXISTS CoachRatings (
                            RatingId INTEGER PRIMARY KEY AUTOINCREMENT,
                            StudentId INTEGER NOT NULL,
                            CoachId INTEGER NOT NULL,
                            Rating INTEGER NOT NULL CHECK (Rating >= 1 AND Rating <= 5),
                            Review TEXT,
                            RatingDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                            UNIQUE(StudentId, CoachId)
                        )";
                    await addCoachRatingsCommand.ExecuteNonQueryAsync();
                    Console.WriteLine("CoachRatings table created successfully.");
                }
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

            // Create CustomWorkouts table
            var createCustomWorkoutsCommand = connection.CreateCommand();
            createCustomWorkoutsCommand.CommandText = @"
                CREATE TABLE IF NOT EXISTS CustomWorkouts (
                    CustomWorkoutId INTEGER PRIMARY KEY AUTOINCREMENT,
                    StudentId INTEGER NOT NULL,
                    MoodType TEXT NOT NULL,
                    IntensityLevel TEXT NOT NULL,
                    Duration INTEGER NOT NULL,
                    Description TEXT NOT NULL,
                    IsActive BOOLEAN DEFAULT 1,
                    CreatedBy INTEGER NOT NULL,
                    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (StudentId) REFERENCES Students(StudentId),
                    FOREIGN KEY (CreatedBy) REFERENCES Coaches(CoachId),
                    UNIQUE(StudentId, MoodType)
                )";
            await createCustomWorkoutsCommand.ExecuteNonQueryAsync();

            // Create Payments table
            var createPaymentsCommand = connection.CreateCommand();
            createPaymentsCommand.CommandText = @"
                CREATE TABLE IF NOT EXISTS Payments (
                    PaymentId INTEGER PRIMARY KEY AUTOINCREMENT,
                    StudentId INTEGER NOT NULL,
                    CoachId INTEGER NOT NULL,
                    Amount DECIMAL(10,2) NOT NULL,
                    CoachEarnings DECIMAL(10,2) NOT NULL,
                    AdminFee DECIMAL(10,2) NOT NULL,
                    PaymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                    CardNumber TEXT NOT NULL,
                    ExpiryDate TEXT NOT NULL,
                    CVV TEXT NOT NULL,
                    CardholderName TEXT NOT NULL,
                    FOREIGN KEY (StudentId) REFERENCES Students(StudentId),
                    FOREIGN KEY (CoachId) REFERENCES Coaches(CoachId)
                )";
            await createPaymentsCommand.ExecuteNonQueryAsync();

            // Create Admin table
            var createAdminCommand = connection.CreateCommand();
            createAdminCommand.CommandText = @"
                CREATE TABLE IF NOT EXISTS Admin (
                    AdminId INTEGER PRIMARY KEY AUTOINCREMENT,
                    Email TEXT NOT NULL UNIQUE,
                    Password TEXT NOT NULL
                )";
            await createAdminCommand.ExecuteNonQueryAsync();

            // Create CoachRatings table
            var createCoachRatingsCommand = connection.CreateCommand();
            createCoachRatingsCommand.CommandText = @"
                CREATE TABLE IF NOT EXISTS CoachRatings (
                    RatingId INTEGER PRIMARY KEY AUTOINCREMENT,
                    StudentId INTEGER NOT NULL,
                    CoachId INTEGER NOT NULL,
                    Rating INTEGER NOT NULL CHECK (Rating >= 1 AND Rating <= 5),
                    Review TEXT,
                    RatingDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(StudentId, CoachId)
                )";
            await createCoachRatingsCommand.ExecuteNonQueryAsync();

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

            // Force insert admin account - ALWAYS INSERT
            var insertAdminCommand = connection.CreateCommand();
            insertAdminCommand.CommandText = @"
                INSERT OR REPLACE INTO Admin (AdminId, Email, Password) VALUES 
                (1, 'admin@mindfit.com', 'admin123')";
            try {
                await insertAdminCommand.ExecuteNonQueryAsync();
                Console.WriteLine("Admin account inserted successfully.");
            } catch (Exception ex) {
                Console.WriteLine($"Admin insert error: {ex.Message}");
            }
        }

        // Coach methods
        public async Task<List<Coach>> GetAllCoachesAsync()
        {
            var coaches = new List<Coach>();
            
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = "SELECT CoachId, YearsOfExperience, Name, Email, Password FROM Coaches ORDER BY Name";

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var coach = new Coach
                {
                    CoachId = reader.GetInt32(0),
                    YearsOfExperience = reader.GetInt32(1),
                    Name = reader.GetString(2),
                    Email = reader.GetString(3),
                    Password = reader.GetString(4)
                };
                coaches.Add(coach);
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
            
            Console.WriteLine($"Database query: Getting moods for student {studentId}");

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

            Console.WriteLine($"Database returned {moods.Count} moods for student {studentId}");
            return moods;
        }

        public async Task<List<Mood>> GetAllMoodsAsync()
        {
            var moods = new List<Mood>();
            
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT StudentId, MoodId, MoodType, Notes, Date 
                FROM Moods 
                ORDER BY Date DESC";
            
            Console.WriteLine("Database query: Getting all moods for admin dashboard");

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

            Console.WriteLine($"Database returned {moods.Count} total moods");
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

            return new Coach
            {
                CoachId = coachId,
                YearsOfExperience = coach.YearsOfExperience,
                Name = coach.Name,
                Email = coach.Email,
                Password = coach.Password
            };
        }

        // Custom Workout Methods
        public async Task<CustomWorkout?> GetActiveCustomWorkoutAsync(int studentId, string moodType)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT CustomWorkoutId, StudentId, MoodType, IntensityLevel, Duration, Description, IsActive, CreatedBy, CreatedDate
                FROM CustomWorkouts 
                WHERE StudentId = @studentId 
                AND MoodType = @moodType 
                AND IsActive = 1";

            command.Parameters.AddWithValue("@studentId", studentId);
            command.Parameters.AddWithValue("@moodType", moodType);

            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new CustomWorkout
                {
                    CustomWorkoutId = reader.GetInt32(0),
                    StudentId = reader.GetInt32(1),
                    MoodType = reader.GetString(2),
                    IntensityLevel = reader.GetString(3),
                    Duration = reader.GetInt32(4),
                    Description = reader.GetString(5),
                    IsActive = reader.GetBoolean(6),
                    CreatedBy = reader.GetInt32(7),
                    CreatedDate = reader.GetDateTime(8)
                };
            }

            return null;
        }

        public async Task<CustomWorkout> CreateCustomWorkoutAsync(CustomWorkoutRequest request)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"
                INSERT OR REPLACE INTO CustomWorkouts 
                (StudentId, MoodType, IntensityLevel, Duration, Description, IsActive, CreatedBy)
                VALUES (@studentId, @moodType, @intensityLevel, @duration, @description, @isActive, @createdBy);
                SELECT last_insert_rowid();";

            command.Parameters.AddWithValue("@studentId", request.StudentId);
            command.Parameters.AddWithValue("@moodType", request.MoodType);
            command.Parameters.AddWithValue("@intensityLevel", request.IntensityLevel);
            command.Parameters.AddWithValue("@duration", request.Duration);
            command.Parameters.AddWithValue("@description", request.Description);
            command.Parameters.AddWithValue("@isActive", request.IsActive);
            command.Parameters.AddWithValue("@createdBy", request.CreatedBy);

            var customWorkoutId = Convert.ToInt32(await command.ExecuteScalarAsync());

            return new CustomWorkout
            {
                CustomWorkoutId = customWorkoutId,
                StudentId = request.StudentId,
                MoodType = request.MoodType,
                IntensityLevel = request.IntensityLevel,
                Duration = request.Duration,
                Description = request.Description,
                IsActive = request.IsActive,
                CreatedBy = request.CreatedBy,
                CreatedDate = DateTime.Now
            };
        }

        public async Task<List<CustomWorkout>> GetCustomWorkoutsByCoachAsync(int coachId)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT cw.CustomWorkoutId, cw.StudentId, cw.MoodType, cw.IntensityLevel, cw.Duration, cw.Description, cw.IsActive, cw.CreatedBy, cw.CreatedDate,
                       s.Name as StudentName
                FROM CustomWorkouts cw
                JOIN Students s ON cw.StudentId = s.StudentId
                WHERE cw.CreatedBy = @coachId
                ORDER BY cw.CreatedDate DESC";

            command.Parameters.AddWithValue("@coachId", coachId);

            var customWorkouts = new List<CustomWorkout>();
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                customWorkouts.Add(new CustomWorkout
                {
                    CustomWorkoutId = reader.GetInt32(0),
                    StudentId = reader.GetInt32(1),
                    MoodType = reader.GetString(2),
                    IntensityLevel = reader.GetString(3),
                    Duration = reader.GetInt32(4),
                    Description = reader.GetString(5),
                    IsActive = reader.GetBoolean(6),
                    CreatedBy = reader.GetInt32(7),
                    CreatedDate = reader.GetDateTime(8)
                });
            }

            return customWorkouts;
        }

        public async Task<CustomWorkout?> ToggleCustomWorkoutAsync(int customWorkoutId, bool isActive)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"
                UPDATE CustomWorkouts 
                SET IsActive = @isActive 
                WHERE CustomWorkoutId = @customWorkoutId;
                
                SELECT CustomWorkoutId, StudentId, MoodType, IntensityLevel, Duration, Description, IsActive, CreatedBy, CreatedDate
                FROM CustomWorkouts 
                WHERE CustomWorkoutId = @customWorkoutId";

            command.Parameters.AddWithValue("@isActive", isActive);
            command.Parameters.AddWithValue("@customWorkoutId", customWorkoutId);

            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new CustomWorkout
                {
                    CustomWorkoutId = reader.GetInt32(0),
                    StudentId = reader.GetInt32(1),
                    MoodType = reader.GetString(2),
                    IntensityLevel = reader.GetString(3),
                    Duration = reader.GetInt32(4),
                    Description = reader.GetString(5),
                    IsActive = reader.GetBoolean(6),
                    CreatedBy = reader.GetInt32(7),
                    CreatedDate = reader.GetDateTime(8)
                };
            }

            return null;
        }

        public async Task<Payment> ProcessPaymentAsync(Payment payment)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"
                INSERT INTO Payments (StudentId, CoachId, Amount, CoachEarnings, AdminFee, PaymentDate, CardNumber, ExpiryDate, CVV, CardholderName)
                VALUES (@studentId, @coachId, @amount, @coachEarnings, @adminFee, @paymentDate, @cardNumber, @expiryDate, @cvv, @cardholderName);
                
                SELECT PaymentId, StudentId, CoachId, Amount, CoachEarnings, AdminFee, PaymentDate, CardNumber, ExpiryDate, CVV, CardholderName
                FROM Payments 
                WHERE PaymentId = last_insert_rowid()";

            command.Parameters.AddWithValue("@studentId", payment.StudentId);
            command.Parameters.AddWithValue("@coachId", payment.CoachId);
            command.Parameters.AddWithValue("@amount", payment.Amount);
            command.Parameters.AddWithValue("@coachEarnings", payment.CoachEarnings);
            command.Parameters.AddWithValue("@adminFee", payment.AdminFee);
            command.Parameters.AddWithValue("@paymentDate", payment.PaymentDate);
            command.Parameters.AddWithValue("@cardNumber", payment.CardNumber);
            command.Parameters.AddWithValue("@expiryDate", payment.ExpiryDate);
            command.Parameters.AddWithValue("@cvv", payment.CVV);
            command.Parameters.AddWithValue("@cardholderName", payment.CardholderName);

            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new Payment
                {
                    PaymentId = reader.GetInt32(0),
                    StudentId = reader.GetInt32(1),
                    CoachId = reader.GetInt32(2),
                    Amount = reader.GetDecimal(3),
                    CoachEarnings = reader.GetDecimal(4),
                    AdminFee = reader.GetDecimal(5),
                    PaymentDate = reader.GetDateTime(6),
                    CardNumber = reader.GetString(7),
                    ExpiryDate = reader.GetString(8),
                    CVV = reader.GetString(9),
                    CardholderName = reader.GetString(10)
                };
            }

            throw new Exception("Failed to process payment");
        }

        public async Task<List<Payment>> GetPaymentsByStudentAsync(int studentId)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT PaymentId, StudentId, CoachId, Amount, CoachEarnings, AdminFee, PaymentDate, CardNumber, ExpiryDate, CVV, CardholderName
                FROM Payments 
                WHERE StudentId = @studentId
                ORDER BY PaymentDate DESC";

            command.Parameters.AddWithValue("@studentId", studentId);

            var payments = new List<Payment>();
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                payments.Add(new Payment
                {
                    PaymentId = reader.GetInt32(0),
                    StudentId = reader.GetInt32(1),
                    CoachId = reader.GetInt32(2),
                    Amount = reader.GetDecimal(3),
                    CoachEarnings = reader.GetDecimal(4),
                    AdminFee = reader.GetDecimal(5),
                    PaymentDate = reader.GetDateTime(6),
                    CardNumber = reader.GetString(7),
                    ExpiryDate = reader.GetString(8),
                    CVV = reader.GetString(9),
                    CardholderName = reader.GetString(10)
                });
            }

            return payments;
        }

        public async Task<List<Payment>> GetPaymentsByCoachAsync(int coachId)
        {
            Console.WriteLine($"Getting payments for coach ID: {coachId}");
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT PaymentId, StudentId, CoachId, Amount, CoachEarnings, AdminFee, PaymentDate, CardNumber, ExpiryDate, CVV, CardholderName
                FROM Payments 
                WHERE CoachId = @coachId
                ORDER BY PaymentDate DESC";

            command.Parameters.AddWithValue("@coachId", coachId);
            Console.WriteLine($"Database query: SELECT * FROM Payments WHERE CoachId = {coachId}");

            var payments = new List<Payment>();
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                payments.Add(new Payment
                {
                    PaymentId = reader.GetInt32(0),
                    StudentId = reader.GetInt32(1),
                    CoachId = reader.GetInt32(2),
                    Amount = reader.GetDecimal(3),
                    CoachEarnings = reader.GetDecimal(4),
                    AdminFee = reader.GetDecimal(5),
                    PaymentDate = reader.GetDateTime(6),
                    CardNumber = reader.GetString(7),
                    ExpiryDate = reader.GetString(8),
                    CVV = reader.GetString(9),
                    CardholderName = reader.GetString(10)
                });
            }

            Console.WriteLine($"Database returned {payments.Count} payments for coach {coachId}");
            foreach (var payment in payments)
            {
                Console.WriteLine($"Payment: CoachId={payment.CoachId}, Amount=${payment.Amount}, CoachEarnings=${payment.CoachEarnings}");
            }
            return payments;
        }

        public async Task<List<Payment>> GetAllPaymentsAsync()
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT PaymentId, StudentId, CoachId, Amount, CoachEarnings, AdminFee, PaymentDate, CardNumber, ExpiryDate, CVV, CardholderName
                FROM Payments 
                ORDER BY PaymentDate DESC";

            var payments = new List<Payment>();
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                payments.Add(new Payment
                {
                    PaymentId = reader.GetInt32(0),
                    StudentId = reader.GetInt32(1),
                    CoachId = reader.GetInt32(2),
                    Amount = reader.GetDecimal(3),
                    CoachEarnings = reader.GetDecimal(4),
                    AdminFee = reader.GetDecimal(5),
                    PaymentDate = reader.GetDateTime(6),
                    CardNumber = reader.GetString(7),
                    ExpiryDate = reader.GetString(8),
                    CVV = reader.GetString(9),
                    CardholderName = reader.GetString(10)
                });
            }

            Console.WriteLine($"Database returned {payments.Count} total payments");
            return payments;
        }

        // Admin methods
        public async Task<Admin?> GetAdminByEmailAsync(string email)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT AdminId, Email, Password
                FROM Admin 
                WHERE Email = @email";

            command.Parameters.AddWithValue("@email", email);

            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new Admin
                {
                    AdminId = reader.GetInt32(0),
                    Email = reader.GetString(1),
                    Password = reader.GetString(2)
                };
            }

            return null;
        }

        public async Task<Admin?> GetAdminByIdAsync(int adminId)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT AdminId, Email, Password
                FROM Admin 
                WHERE AdminId = @adminId";

            command.Parameters.AddWithValue("@adminId", adminId);

            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new Admin
                {
                    AdminId = reader.GetInt32(0),
                    Email = reader.GetString(1),
                    Password = reader.GetString(2)
                };
            }

            return null;
        }

        public async Task<IEnumerable<Admin>> GetAllAdminsAsync()
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = "SELECT AdminId, Email, Password FROM Admin ORDER BY Email";

            var admins = new List<Admin>();
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                admins.Add(new Admin
                {
                    AdminId = reader.GetInt32(0),
                    Email = reader.GetString(1),
                    Password = reader.GetString(2)
                });
            }

            return admins;
        }

        // Coach Rating methods
        public async Task<CoachRating> CreateCoachRatingAsync(CoachRating rating)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"
                INSERT INTO CoachRatings (StudentId, CoachId, Rating, Review, RatingDate)
                VALUES (@studentId, @coachId, @rating, @review, @ratingDate);
                
                SELECT RatingId, StudentId, CoachId, Rating, Review, RatingDate
                FROM CoachRatings 
                WHERE RatingId = last_insert_rowid()";

            command.Parameters.AddWithValue("@studentId", rating.StudentId);
            command.Parameters.AddWithValue("@coachId", rating.CoachId);
            command.Parameters.AddWithValue("@rating", rating.Rating);
            command.Parameters.AddWithValue("@review", rating.Review ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@ratingDate", rating.RatingDate);

            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new CoachRating
                {
                    RatingId = reader.GetInt32(0),
                    StudentId = reader.GetInt32(1),
                    CoachId = reader.GetInt32(2),
                    Rating = reader.GetInt32(3),
                    Review = reader.IsDBNull(4) ? null : reader.GetString(4),
                    RatingDate = reader.GetDateTime(5)
                };
            }

            throw new Exception("Failed to create coach rating");
        }

        public async Task<CoachRating?> GetCoachRatingAsync(int studentId, int coachId)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT RatingId, StudentId, CoachId, Rating, Review, RatingDate
                FROM CoachRatings 
                WHERE StudentId = @studentId AND CoachId = @coachId";

            command.Parameters.AddWithValue("@studentId", studentId);
            command.Parameters.AddWithValue("@coachId", coachId);

            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new CoachRating
                {
                    RatingId = reader.GetInt32(0),
                    StudentId = reader.GetInt32(1),
                    CoachId = reader.GetInt32(2),
                    Rating = reader.GetInt32(3),
                    Review = reader.IsDBNull(4) ? null : reader.GetString(4),
                    RatingDate = reader.GetDateTime(5)
                };
            }

            return null;
        }

        public async Task<List<CoachRating>> GetCoachRatingsByCoachAsync(int coachId)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT RatingId, StudentId, CoachId, Rating, Review, RatingDate
                FROM CoachRatings 
                WHERE CoachId = @coachId
                ORDER BY RatingDate DESC";

            command.Parameters.AddWithValue("@coachId", coachId);

            var ratings = new List<CoachRating>();
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                ratings.Add(new CoachRating
                {
                    RatingId = reader.GetInt32(0),
                    StudentId = reader.GetInt32(1),
                    CoachId = reader.GetInt32(2),
                    Rating = reader.GetInt32(3),
                    Review = reader.IsDBNull(4) ? null : reader.GetString(4),
                    RatingDate = reader.GetDateTime(5)
                });
            }

            return ratings;
        }

        public async Task<List<CoachRating>> GetAllCoachRatingsAsync()
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"
                SELECT RatingId, StudentId, CoachId, Rating, Review, RatingDate
                FROM CoachRatings 
                ORDER BY RatingDate DESC";

            var ratings = new List<CoachRating>();
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                ratings.Add(new CoachRating
                {
                    RatingId = reader.GetInt32(0),
                    StudentId = reader.GetInt32(1),
                    CoachId = reader.GetInt32(2),
                    Rating = reader.GetInt32(3),
                    Review = reader.IsDBNull(4) ? null : reader.GetString(4),
                    RatingDate = reader.GetDateTime(5)
                });
            }

            return ratings;
        }

        public async Task<CoachRating> UpdateCoachRatingAsync(CoachRating rating)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = @"
                UPDATE CoachRatings 
                SET Rating = @rating, Review = @review, RatingDate = @ratingDate
                WHERE StudentId = @studentId AND CoachId = @coachId;
                
                SELECT RatingId, StudentId, CoachId, Rating, Review, RatingDate
                FROM CoachRatings 
                WHERE StudentId = @studentId AND CoachId = @coachId";

            command.Parameters.AddWithValue("@studentId", rating.StudentId);
            command.Parameters.AddWithValue("@coachId", rating.CoachId);
            command.Parameters.AddWithValue("@rating", rating.Rating);
            command.Parameters.AddWithValue("@review", rating.Review ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@ratingDate", rating.RatingDate);

            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new CoachRating
                {
                    RatingId = reader.GetInt32(0),
                    StudentId = reader.GetInt32(1),
                    CoachId = reader.GetInt32(2),
                    Rating = reader.GetInt32(3),
                    Review = reader.IsDBNull(4) ? null : reader.GetString(4),
                    RatingDate = reader.GetDateTime(5)
                };
            }

            throw new Exception("Failed to update coach rating");
        }

        public async Task<bool> DeleteCoachRatingAsync(int ratingId)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var command = connection.CreateCommand();
            command.CommandText = "DELETE FROM CoachRatings WHERE RatingId = @ratingId";
            command.Parameters.AddWithValue("@ratingId", ratingId);

            var rowsAffected = await command.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }

    }
}
