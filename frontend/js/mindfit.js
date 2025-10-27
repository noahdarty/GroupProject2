// MindFit App - Main JavaScript Application
class MindFitApp {
    constructor() {
        this.apiBaseUrl = 'http://localhost:5210/api';
        this.students = [];
        this.coaches = [];
        this.moods = [];
        this.workouts = [];
        this.currentStudent = null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadData();
        this.renderDashboard();
    }

    setupEventListeners() {
        // Mood logging form
        const moodForm = document.getElementById('moodForm');
        if (moodForm) {
            moodForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.logMood();
            });
        }

        // Student selection
        const studentSelect = document.getElementById('studentSelect');
        if (studentSelect) {
            studentSelect.addEventListener('change', (e) => {
                this.selectStudent(parseInt(e.target.value));
            });
        }
    }

    async loadData() {
        try {
            // Load all data in parallel
            const [students, coaches, workouts] = await Promise.all([
                this.fetchData('/students'),
                this.fetchData('/coaches'),
                this.fetchData('/workouts')
            ]);

            this.students = students;
            this.coaches = coaches;
            this.workouts = workouts;

            console.log('Data loaded successfully:', { students, coaches, workouts });
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Failed to load data. Please check if the API is running.');
        }
    }

    async fetchData(endpoint) {
        const response = await fetch(`${this.apiBaseUrl}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    async logMood() {
        const studentId = parseInt(document.getElementById('studentSelect').value);
        const moodType = document.getElementById('moodType').value;
        const notes = document.getElementById('moodNotes').value;

        if (!studentId || !moodType) {
            this.showError('Please select a student and mood type.');
            return;
        }

        try {
            const moodData = {
                studentId: studentId,
                moodType: moodType,
                notes: notes,
                date: new Date().toISOString()
            };

            const response = await fetch(`${this.apiBaseUrl}/moods`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(moodData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const newMood = await response.json();
            this.moods.push(newMood);
            
            // Get workout recommendations
            await this.getWorkoutRecommendations(moodType);
            
            this.showSuccess('Mood logged successfully!');
            document.getElementById('moodForm').reset();
            
        } catch (error) {
            console.error('Error logging mood:', error);
            this.showError('Failed to log mood. Please try again.');
        }
    }

    async getWorkoutRecommendations(moodType) {
        try {
            const workouts = await this.fetchData(`/workouts/by-mood/${moodType}`);
            this.renderWorkoutRecommendations(workouts);
        } catch (error) {
            console.error('Error fetching workout recommendations:', error);
            this.showError('Failed to load workout recommendations.');
        }
    }

    selectStudent(studentId) {
        this.currentStudent = this.students.find(s => s.StudentId === studentId);
        if (this.currentStudent) {
            this.loadStudentMoods(studentId);
        }
    }

    async loadStudentMoods(studentId) {
        try {
            const moods = await this.fetchData(`/moods/student/${studentId}`);
            this.renderStudentMoods(moods);
        } catch (error) {
            console.error('Error loading student moods:', error);
            this.showError('Failed to load student moods.');
        }
    }

    renderDashboard() {
        this.renderStudentSelector();
        this.renderCoachList();
    }

    renderStudentSelector() {
        const studentSelect = document.getElementById('studentSelect');
        if (studentSelect) {
            studentSelect.innerHTML = '<option value="">Select a student...</option>';
            this.students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.StudentId;
                option.textContent = `${student.Name} (${student.Email})`;
                studentSelect.appendChild(option);
            });
        }
    }

    renderCoachList() {
        const coachList = document.getElementById('coachList');
        if (coachList) {
            coachList.innerHTML = '';
            this.coaches.forEach(coach => {
                const coachCard = document.createElement('div');
                coachCard.className = 'coach-card';
                coachCard.innerHTML = `
                    <h3>${coach.Name}</h3>
                    <p>${coach.Email}</p>
                    <p>Students: ${this.students.filter(s => s.CoachId === coach.CoachId).length}</p>
                `;
                coachList.appendChild(coachCard);
            });
        }
    }

    renderWorkoutRecommendations(workouts) {
        const workoutContainer = document.getElementById('workoutRecommendations');
        if (workoutContainer) {
            workoutContainer.innerHTML = '<h3>Recommended Workouts:</h3>';
            workouts.forEach(workout => {
                const workoutCard = document.createElement('div');
                workoutCard.className = 'workout-card';
                workoutCard.innerHTML = `
                    <h4>${workout.IntensityLevel} Intensity</h4>
                    <p>${workout.Description}</p>
                `;
                workoutContainer.appendChild(workoutCard);
            });
        }
    }

    renderStudentMoods(moods) {
        const moodHistory = document.getElementById('moodHistory');
        if (moodHistory) {
            moodHistory.innerHTML = '<h3>Mood History:</h3>';
            if (moods.length === 0) {
                moodHistory.innerHTML += '<p>No moods logged yet.</p>';
                return;
            }
            
            moods.forEach(mood => {
                const moodCard = document.createElement('div');
                moodCard.className = 'mood-card';
                moodCard.innerHTML = `
                    <div class="mood-header">
                        <span class="mood-type">${mood.MoodType}</span>
                        <span class="mood-date">${new Date(mood.Date).toLocaleDateString()}</span>
                    </div>
                    ${mood.Notes ? `<p class="mood-notes">${mood.Notes}</p>` : ''}
                `;
                moodHistory.appendChild(moodCard);
            });
        }
    }

    showSuccess(message) {
        this.showAlert(message, 'success');
    }

    showError(message) {
        this.showAlert(message, 'error');
    }

    showAlert(message, type) {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());

        // Create new alert
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 9999;
            max-width: 300px;
            ${type === 'success' ? 'background-color: #28a745;' : 'background-color: #dc3545;'}
        `;
        alertDiv.textContent = message;

        document.body.appendChild(alertDiv);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mindFitApp = new MindFitApp();
});



