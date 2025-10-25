// Mind Fit - Main JavaScript Application
// Cache bust: 2025-01-25-01

class MindFitApp {
    constructor() {
        this.currentPage = 'home';
        this.apiBaseUrl = 'http://localhost:5210/api';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPageNavigation();
        this.setupStudentForm();
        this.setupCoachForm();
        this.setupLoginForm();
        this.setupLogoutHandler();
        this.setupChooseCoach();
        this.setupLogMood(); // New: Setup log mood functionality
        this.checkExistingLogin();
        this.testAPI(); // Test if API is running
    }

    setupEventListeners() {
        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            this.handleNavbarScroll();
        });
    }

    setupPageNavigation() {
        // Handle navigation clicks
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = anchor.getAttribute('href').substring(1);
                this.showPage(target);
                this.updateActiveNav(anchor);
            });
        });
    }

    showPage(pageId) {
        // Hide all page contents
        document.querySelectorAll('.page-content').forEach(page => {
            page.style.display = 'none';
        });

        // Show the selected page
        const targetPage = document.getElementById(pageId + '-content');
        if (targetPage) {
            targetPage.style.display = 'block';
            this.currentPage = pageId;
            
            // Scroll to top when switching pages
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            // Special handling for log-mood page
            if (pageId === 'log-mood') {
                // No special handling needed - just show the form
            }
            
            // Special handling for workout page
            if (pageId === 'workout') {
                const currentMoodType = localStorage.getItem('currentMoodType');
                if (currentMoodType) {
                    this.loadWorkoutForMood(currentMoodType);
                } else {
                    // If no current mood, show a message to log mood first
                    this.showWorkoutPlaceholder();
                }
            }
            
            // Special handling for recent-moods page
            if (pageId === 'recent-moods') {
                this.loadRecentMoods();
            }
            
            // Special handling for view-students page
            if (pageId === 'view-students') {
                this.loadMyStudents();
            }
            
            // Special handling for view-workouts page
            if (pageId === 'view-workouts') {
                console.log('Loading view-workouts page...');
                this.loadStudentWorkouts();
            }
            
            // Special handling for student-analytics page
            if (pageId === 'student-analytics') {
                console.log('Loading student analytics page...');
                console.log('Current user data:', localStorage.getItem('mindfit_user'));
                this.loadStudentAnalytics();
            }
        }
    }

    updateActiveNav(clickedLink) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to clicked link
        clickedLink.classList.add('active');
    }

    setupScrollEffects() {
        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.feature-card, .stat-item').forEach(el => {
            observer.observe(el);
        });
    }

    setupAnimations() {
        // Add CSS for animations
        const style = document.createElement('style');
        style.textContent = `
            .feature-card, .stat-item {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.6s ease;
            }
            
            .feature-card.animate-in, .stat-item.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            .feature-card.animate-in {
                animation: slideInUp 0.6s ease forwards;
            }
            
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    handleNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    }

    handleNewsletterSubscription() {
        const emailInput = document.querySelector('footer input[type="email"]');
        const email = emailInput.value.trim();
        
        if (!email) {
            this.showAlert('Please enter your email address.', 'warning');
            return;
        }
        
        if (!this.isValidEmail(email)) {
            this.showAlert('Please enter a valid email address.', 'warning');
            return;
        }
        
        // Simulate subscription
        this.showAlert('Thank you for subscribing! We\'ll keep you updated on wellness tips.', 'success');
        emailInput.value = '';
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showAlert(message, type) {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());

        // Create new alert
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alertDiv);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    // Utility method to add loading state
    setLoading(element, isLoading) {
        if (isLoading) {
            element.classList.add('loading');
            element.disabled = true;
        } else {
            element.classList.remove('loading');
            element.disabled = false;
        }
    }

    setupStudentForm() {
        const studentForm = document.getElementById('studentForm');
        if (studentForm) {
            studentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleStudentRegistration();
            });
        }
    }

    async handleStudentRegistration() {
        const name = document.getElementById('studentName').value;
        const email = document.getElementById('studentEmail').value;
        const password = document.getElementById('studentPassword').value;

        if (!name || !email || !password) {
            this.showAlert('Please fill in all required fields.', 'warning');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showAlert('Please enter a valid email address.', 'warning');
            return;
        }

        if (password.length < 6) {
            this.showAlert('Password must be at least 6 characters long.', 'warning');
            return;
        }

        try {
            // Show loading state
            const submitButton = document.querySelector('#studentForm button[type="submit"]');
            this.setLoading(submitButton, true);

            // Create student object
            const studentData = {
                name: name,
                email: email,
                password: password
            };

            // Call API to create student
            const response = await fetch(this.apiBaseUrl + '/students', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(studentData)
            });

            if (response.ok) {
                const createdStudent = await response.json();
                this.showAlert(`Welcome to MindFit, ${createdStudent.name}! Your account has been created successfully.`, 'success');
                
                // Reset form
                document.getElementById('studentForm').reset();
            } else {
                const errorData = await response.json();
                this.showAlert(errorData.message || 'Registration failed. Please try again.', 'danger');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showAlert('Registration failed. Please check your connection and try again.', 'danger');
        } finally {
            // Hide loading state
            const submitButton = document.querySelector('#studentForm button[type="submit"]');
            this.setLoading(submitButton, false);
        }
    }

    setupCoachForm() {
        const coachForm = document.getElementById('coachForm');
        if (coachForm) {
            coachForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCoachRegistration();
            });
        }
    }

    async handleCoachRegistration() {
        const name = document.getElementById('coachName').value;
        const email = document.getElementById('coachEmail').value;
        const password = document.getElementById('coachPassword').value;
        const experience = parseInt(document.getElementById('coachExperience').value);

        if (!name || !email || !password || isNaN(experience)) {
            this.showAlert('Please fill in all required fields.', 'warning');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showAlert('Please enter a valid email address.', 'warning');
            return;
        }

        if (password.length < 6) {
            this.showAlert('Password must be at least 6 characters long.', 'warning');
            return;
        }

        if (experience < 0) {
            this.showAlert('Years of experience must be a positive number.', 'warning');
            return;
        }

        try {
            // Show loading state
            const submitButton = document.querySelector('#coachForm button[type="submit"]');
            this.setLoading(submitButton, true);

            // Create coach object
            const coachData = {
                name: name,
                email: email,
                password: password,
                yearsOfExperience: experience
            };

            console.log('Submitting coach registration:', coachData);

            // Call API to create coach
            const response = await fetch(this.apiBaseUrl + '/coaches', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(coachData)
            });

            if (response.ok) {
                const createdCoach = await response.json();
                console.log('Coach created successfully:', createdCoach);
                this.showAlert(`Welcome to MindFit, ${createdCoach.name}! Your coach account has been created successfully.`, 'success');
                
                // Reset form
                document.getElementById('coachForm').reset();
            } else {
                const errorData = await response.json();
                console.error('Coach registration failed:', response.status, errorData);
                this.showAlert(`Registration failed: ${errorData.message || 'Unknown error'}`, 'danger');
            }
        } catch (error) {
            console.error('Coach registration error:', error);
            this.showAlert('Registration failed. Please check your connection and try again.', 'danger');
        } finally {
            // Hide loading state
            const submitButton = document.querySelector('#coachForm button[type="submit"]');
            this.setLoading(submitButton, false);
        }
    }

    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    }

    setupLogoutHandler() {
        const logoutLink = document.getElementById('logoutLink');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }

        setupChooseCoach() {
            // Load coaches when choose-coach page is shown
            document.addEventListener('click', (e) => {
                if (e.target.matches('a[href="#choose-coach"]')) {
                    this.loadCoaches();
                }
            });
        }

        setupLogMood() {
            // Setup mood form submission
            const moodForm = document.getElementById('moodForm');
            if (moodForm) {
                moodForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.submitMood();
                });
            }

            // Load mood history when log-mood page is shown
            document.addEventListener('click', (e) => {
                if (e.target.matches('a[href="#log-mood"]')) {
                    this.loadMoodHistory();
                }
            });
        }

    async loadCoaches() {
        try {
            const response = await fetch(this.apiBaseUrl + '/coaches');
            if (response.ok) {
                const coaches = await response.json();
                this.displayCoaches(coaches);
            } else {
                this.showAlert('Failed to load coaches. Please try again.', 'danger');
            }
        } catch (error) {
            console.error('Error loading coaches:', error);
            this.showAlert('Failed to load coaches. Please check your connection.', 'danger');
        }
    }

    displayCoaches(coaches) {
        const coachesGrid = document.getElementById('coachesGrid');
        if (!coachesGrid) return;

        coachesGrid.innerHTML = '';

        coaches.forEach(coach => {
            const coachCard = document.createElement('div');
            coachCard.className = 'coach-card';
            coachCard.innerHTML = `
                <div class="coach-avatar">
                    <i class="bi bi-person-fill"></i>
                </div>
                <h3 class="coach-name">${coach.name}</h3>
                <p class="coach-experience">${coach.yearsOfExperience} years of experience</p>
                <p class="coach-email">${coach.email}</p>
                <button class="select-coach-btn" onclick="mindFitApp.selectCoach(${coach.coachId})">
                    Select Coach
                </button>
            `;
            coachesGrid.appendChild(coachCard);
        });
    }

    async selectCoach(coachId) {
        try {
            // Get current user data
            const userData = localStorage.getItem('mindfit_user');
            if (!userData) {
                this.showAlert('Please log in first.', 'warning');
                return;
            }

            const user = JSON.parse(userData);
            if (user.type !== 'student') {
                this.showAlert('Only students can select coaches.', 'warning');
                return;
            }

            // Update student's coach in database
            const response = await fetch(this.apiBaseUrl + '/students/' + user.id + '/coach', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ coachId: coachId })
            });

            if (response.ok) {
                this.showAlert('Coach selected successfully!', 'success');
                // Update UI to show selected coach
                this.updateSelectedCoach(coachId);
            } else {
                this.showAlert('Failed to select coach. Please try again.', 'danger');
            }
        } catch (error) {
            console.error('Error selecting coach:', error);
            this.showAlert('Failed to select coach. Please try again.', 'danger');
        }
    }

        updateSelectedCoach(coachId) {
            const coachCards = document.querySelectorAll('.coach-card');
            coachCards.forEach(card => {
                card.classList.remove('selected');
                const button = card.querySelector('.select-coach-btn');
                if (button) {
                    button.textContent = 'Select Coach';
                    button.disabled = false;
                }
            });

            // Find and update the selected coach card
            const selectedCard = Array.from(coachCards).find(card => {
                const button = card.querySelector('.select-coach-btn');
                return button && button.onclick.toString().includes(`selectCoach(${coachId})`);
            });

            if (selectedCard) {
                selectedCard.classList.add('selected');
                const button = selectedCard.querySelector('.select-coach-btn');
                if (button) {
                    button.textContent = 'Selected ✓';
                    button.disabled = true;
                }
            }
        }

        async submitMood() {
            try {
                // Get current user data
                const userData = localStorage.getItem('mindfit_user');
                if (!userData) {
                    this.showAlert('Please log in first.', 'warning');
                    return;
                }

                const user = JSON.parse(userData);
                if (user.type !== 'student') {
                    this.showAlert('Only students can log moods.', 'warning');
                    return;
                }

                // Get form data
                const moodType = document.querySelector('input[name="moodType"]:checked');
                const notes = document.getElementById('moodNotes').value;

                if (!moodType) {
                    this.showAlert('Please select a mood type.', 'warning');
                    return;
                }

                // Submit mood to API
                const response = await fetch(this.apiBaseUrl + '/moods', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        studentId: user.id,
                        moodType: moodType.value,
                        notes: notes,
                        date: new Date().toISOString()
                    })
                });

                if (response.ok) {
                    this.showAlert('Mood logged successfully!', 'success');
                    // Clear form
                    document.getElementById('moodForm').reset();
                    // Navigate to workout page
                    this.navigateToWorkout(moodType.value);
                } else {
                    this.showAlert('Failed to log mood. Please try again.', 'danger');
                }
            } catch (error) {
                console.error('Error logging mood:', error);
                this.showAlert('Failed to log mood. Please try again.', 'danger');
            }
        }

        async loadMoodHistory() {
            try {
                // Get current user data
                const userData = localStorage.getItem('mindfit_user');
                if (!userData) {
                    return;
                }

                const user = JSON.parse(userData);
                if (user.type !== 'student') {
                    return;
                }

                // Fetch mood history from API
                const response = await fetch(this.apiBaseUrl + '/moods/student/' + user.id);
                if (response.ok) {
                    const moods = await response.json();
                    this.displayMoodHistory(moods);
                } else {
                    console.error('Failed to load mood history');
                }
            } catch (error) {
                console.error('Error loading mood history:', error);
            }
        }

        displayMoodHistory(moods) {
            const moodHistory = document.getElementById('moodHistory');
            const historyCards = document.getElementById('historyCards');
            
            if (!moodHistory || !historyCards) return;

            if (moods.length === 0) {
                moodHistory.style.display = 'none';
                return;
            }

            moodHistory.style.display = 'block';
            historyCards.innerHTML = '';

            // Show last 6 moods
            const recentMoods = moods.slice(0, 6);
            
            recentMoods.forEach(mood => {
                const moodCard = document.createElement('div');
                moodCard.className = 'history-card';
                
                const date = new Date(mood.date).toLocaleDateString();
                const moodIcon = this.getMoodIcon(mood.moodType);
                
                moodCard.innerHTML = `
                    <div class="history-date">${date}</div>
                    <div class="history-mood">
                        ${moodIcon} ${mood.moodType}
                    </div>
                    ${mood.notes ? `<div class="history-notes">${mood.notes}</div>` : ''}
                `;
                
                historyCards.appendChild(moodCard);
            });
        }

        getMoodIcon(moodType) {
            const icons = {
                'Stressed': '<i class="bi bi-emoji-frown-fill text-danger"></i>',
                'Excited': '<i class="bi bi-emoji-laughing-fill text-warning"></i>',
                'Calm': '<i class="bi bi-emoji-smile-fill text-success"></i>',
                'Tired': '<i class="bi bi-emoji-neutral-fill text-secondary"></i>'
            };
            return icons[moodType] || '<i class="bi bi-emoji-smile"></i>';
        }

        navigateToWorkout(moodType) {
            // Store the mood type for the workout
            localStorage.setItem('currentMoodType', moodType);
            
            // Navigate to workout page
            this.showPage('workout');
            this.updateActiveNav(document.querySelector('#studentNav a[href="#workout"]'));
            
            // Load workout based on mood
            this.loadWorkoutForMood(moodType);
        }

        async loadWorkoutForMood(moodType) {
            try {
                // Fetch workout from API based on mood type using the existing endpoint
                const response = await fetch(this.apiBaseUrl + '/workouts/by-mood/' + moodType);
                if (response.ok) {
                    const workouts = await response.json();
                    // Get the first workout for this mood type
                    const workout = workouts.length > 0 ? workouts[0] : null;
                    if (workout) {
                        this.displayWorkout(workout, moodType);
                    } else {
                        this.showAlert('No workout found for this mood type.', 'warning');
                    }
                } else {
                    this.showAlert('Failed to load workout. Please try again.', 'danger');
                }
            } catch (error) {
                console.error('Error loading workout:', error);
                this.showAlert('Failed to load workout. Please try again.', 'danger');
            }
        }

        displayWorkout(workout, moodType) {
            // Update workout header
            const workoutMoodType = document.getElementById('workoutMoodType');
            if (workoutMoodType) {
                workoutMoodType.textContent = `Based on your ${moodType} mood`;
            }

            // Update workout info
            const workoutDuration = document.getElementById('workoutDuration');
            const workoutIntensity = document.getElementById('workoutIntensity');
            const workoutExerciseCount = document.getElementById('workoutExerciseCount');
            
            if (workoutDuration) workoutDuration.textContent = workout.duration || 'N/A';
            if (workoutIntensity) workoutIntensity.textContent = workout.intensityLevel || 'N/A';
            if (workoutExerciseCount) workoutExerciseCount.textContent = '6 exercises';

            // Display exercises
            this.displayExercises(workout.description);
        }

        displayExercises(description) {
            const exercisesList = document.getElementById('exercisesList');
            if (!exercisesList) return;

            // Parse the workout description (assuming it's a structured text)
            const exercises = this.parseWorkoutDescription(description);
            
            exercisesList.innerHTML = '';
            
            exercises.forEach((exercise, index) => {
                const exerciseItem = document.createElement('div');
                exerciseItem.className = 'exercise-item';
                exerciseItem.innerHTML = `
                    <div class="exercise-content">
                        <div class="exercise-name">${index + 1}. ${exercise.name}</div>
                    </div>
                `;
                exercisesList.appendChild(exerciseItem);
            });
        }

        parseWorkoutDescription(description) {
            // Parse the workout description into individual exercises
            // The database stores it as: "1. Exercise 1 2. Exercise 2 3. Exercise 3"
            // We need to split by the pattern "number. exercise"
            const exercisePattern = /(\d+\.\s+[^0-9]+?)(?=\s*\d+\.|$)/g;
            const matches = description.match(exercisePattern);
            const exercises = [];
            
            if (matches) {
                matches.forEach((match, index) => {
                    const cleanMatch = match.trim();
                    if (cleanMatch) {
                        // Remove the existing number and add our own clean number
                        const cleanExercise = cleanMatch.replace(/^\d+\.\s*/, '');
                        exercises.push({
                            name: cleanExercise,
                            description: 'Complete the exercise as described'
                        });
                    }
                });
            } else {
                // Fallback: try to split by "number. " pattern
                const parts = description.split(/(\d+\.\s+)/);
                for (let i = 1; i < parts.length; i += 2) {
                    if (parts[i] && parts[i + 1]) {
                        const exercise = parts[i + 1].trim();
                        if (exercise) {
                            exercises.push({
                                name: exercise,
                                description: 'Complete the exercise as described'
                            });
                        }
                    }
                }
            }
            
            return exercises;
        }

        showWorkoutPlaceholder() {
            const exercisesList = document.getElementById('exercisesList');
            const workoutMoodType = document.getElementById('workoutMoodType');
            const workoutDuration = document.getElementById('workoutDuration');
            const workoutIntensity = document.getElementById('workoutIntensity');
            const workoutExerciseCount = document.getElementById('workoutExerciseCount');
            
            if (workoutMoodType) workoutMoodType.textContent = 'Log your mood first';
            if (workoutDuration) workoutDuration.textContent = 'N/A';
            if (workoutIntensity) workoutIntensity.textContent = 'N/A';
            if (workoutExerciseCount) workoutExerciseCount.textContent = 'N/A';
            
            if (exercisesList) {
                exercisesList.innerHTML = `
                    <div class="text-center py-5">
                        <i class="bi bi-emoji-smile text-primary" style="font-size: 3rem;"></i>
                        <h4 class="mt-3 text-white">No workout available</h4>
                        <p class="text-white-50">Please log your mood first to get a personalized workout.</p>
                        <a href="#log-mood" class="btn btn-primary btn-lg mt-3">
                            <i class="bi bi-heart-pulse-fill me-2"></i>
                            Log My Mood
                        </a>
                    </div>
                `;
            }
        }

        async loadRecentMoods() {
            try {
                // Get current user data
                const userData = localStorage.getItem('mindfit_user');
                if (!userData) {
                    this.showNoMoodsMessage();
                    return;
                }

                const user = JSON.parse(userData);
                if (user.type !== 'student') {
                    this.showNoMoodsMessage();
                    return;
                }

                // Fetch mood history from API
                const response = await fetch(this.apiBaseUrl + '/moods/student/' + user.id);
                if (response.ok) {
                    const moods = await response.json();
                    this.displayRecentMoods(moods);
                    this.updateMoodStats(moods);
                } else {
                    this.showNoMoodsMessage();
                }
            } catch (error) {
                console.error('Error loading recent moods:', error);
                this.showNoMoodsMessage();
            }
        }

        displayRecentMoods(moods) {
            const moodHistoryList = document.getElementById('moodHistoryList');
            const noMoodsMessage = document.getElementById('noMoodsMessage');
            
            if (!moodHistoryList) return;

            if (moods.length === 0) {
                this.showNoMoodsMessage();
                return;
            }

            // Hide no moods message
            if (noMoodsMessage) noMoodsMessage.style.display = 'none';
            
            // Show mood history
            moodHistoryList.innerHTML = '';
            
            // Show last 10 moods
            const recentMoods = moods.slice(0, 10);
            
            recentMoods.forEach(mood => {
                const moodItem = document.createElement('div');
                moodItem.className = 'mood-history-item';
                
                const date = new Date(mood.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                const moodIcon = this.getMoodIcon(mood.moodType);
                
                moodItem.innerHTML = `
                    <div class="mood-date">${date}</div>
                    <div class="mood-type">
                        ${moodIcon} ${mood.moodType}
                    </div>
                    ${mood.notes ? `<div class="mood-notes">${mood.notes}</div>` : ''}
                `;
                
                moodHistoryList.appendChild(moodItem);
            });
        }

        updateMoodStats(moods) {
            const totalMoods = document.getElementById('totalMoods');
            const currentStreak = document.getElementById('currentStreak');
            const mostCommonMood = document.getElementById('mostCommonMood');
            
            if (totalMoods) totalMoods.textContent = moods.length;
            
            // Calculate streak (simplified - consecutive days with moods)
            if (currentStreak) {
                const streak = this.calculateStreak(moods);
                currentStreak.textContent = streak;
            }
            
            // Find most common mood
            if (mostCommonMood) {
                const mostCommon = this.findMostCommonMood(moods);
                mostCommonMood.textContent = mostCommon;
            }
        }

        calculateStreak(moods) {
            if (moods.length === 0) return 0;
            
            // Sort by date (newest first)
            const sortedMoods = moods.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            let streak = 0;
            let currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            
            for (let mood of sortedMoods) {
                const moodDate = new Date(mood.date);
                moodDate.setHours(0, 0, 0, 0);
                
                const diffTime = currentDate - moodDate;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === streak) {
                    streak++;
                    currentDate = moodDate;
                } else {
                    break;
                }
            }
            
            return streak;
        }

        findMostCommonMood(moods) {
            if (moods.length === 0) return '-';
            
            const moodCounts = {};
            moods.forEach(mood => {
                moodCounts[mood.moodType] = (moodCounts[mood.moodType] || 0) + 1;
            });
            
            let mostCommon = '';
            let maxCount = 0;
            
            for (const [mood, count] of Object.entries(moodCounts)) {
                if (count > maxCount) {
                    maxCount = count;
                    mostCommon = mood;
                }
            }
            
            return mostCommon;
        }

        showNoMoodsMessage() {
            const moodHistoryList = document.getElementById('moodHistoryList');
            const noMoodsMessage = document.getElementById('noMoodsMessage');
            
            if (moodHistoryList) moodHistoryList.innerHTML = '';
            if (noMoodsMessage) noMoodsMessage.style.display = 'block';
            
            // Reset stats
            const totalMoods = document.getElementById('totalMoods');
            const currentStreak = document.getElementById('currentStreak');
            const mostCommonMood = document.getElementById('mostCommonMood');
            
            if (totalMoods) totalMoods.textContent = '0';
            if (currentStreak) currentStreak.textContent = '0';
            if (mostCommonMood) mostCommonMood.textContent = '-';
        }

        // Load My Students functionality
        async loadMyStudents() {
            try {
                const userData = localStorage.getItem('mindfit_user');
                if (!userData) {
                    console.error('No user data found');
                    return;
                }

                const user = JSON.parse(userData);
                
                // For coaches, use their id (which is their coachId)
                const coachId = user.id;

                // Fetch students assigned to this coach
                const response = await fetch(this.apiBaseUrl + '/students/by-coach/' + coachId);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const students = await response.json();
                console.log('Fetched students:', students);

                await this.displayMyStudents(students);
                await this.updateStudentsStats(students);

            } catch (error) {
                console.error('Error loading students:', error);
                this.showNoStudentsMessage();
            }
        }

        async displayMyStudents(students) {
            const studentsList = document.getElementById('studentsList');
            const noStudentsMessage = document.getElementById('noStudentsMessage');
            
            if (!studentsList) return;

            if (students.length === 0) {
                this.showNoStudentsMessage();
                return;
            }

            // Hide no students message
            if (noStudentsMessage) {
                noStudentsMessage.style.display = 'none';
            }

            // Show students list
            studentsList.style.display = 'block';
            studentsList.innerHTML = '';

            // Fetch mood data for each student
            for (const student of students) {
                try {
                    // Fetch mood history for this student
                    const response = await fetch(this.apiBaseUrl + '/moods/student/' + student.studentId);
                    let moodData = [];
                    
                    if (response.ok) {
                        moodData = await response.json();
                    }

                    // Calculate statistics
                    const totalMoods = moodData.length;
                    const now = new Date();
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    const recentMoods = moodData.filter(mood => {
                        const moodDate = new Date(mood.date);
                        return moodDate >= weekAgo;
                    }).length;
                    
                    const lastMood = moodData.length > 0 ? moodData[0].moodType : '-';

                    const studentCard = document.createElement('div');
                    studentCard.className = 'student-card';
                    studentCard.innerHTML = `
                        <div class="student-header">
                            <div>
                                <h5 class="student-name">${student.name}</h5>
                                <p class="student-email">${student.email}</p>
                            </div>
                        </div>
                        <div class="student-stats">
                            <div class="student-stat">
                                <p class="student-stat-number">${totalMoods}</p>
                                <p class="student-stat-label">Total Moods</p>
                            </div>
                            <div class="student-stat">
                                <p class="student-stat-number">${recentMoods}</p>
                                <p class="student-stat-label">This Week</p>
                            </div>
                            <div class="student-stat">
                                <p class="student-stat-number">${lastMood}</p>
                                <p class="student-stat-label">Last Mood</p>
                            </div>
                        </div>
                    `;
                    studentsList.appendChild(studentCard);
                } catch (error) {
                    console.error('Error fetching mood data for student:', student.name, error);
                    
                    // Show student card with default values if mood fetch fails
                    const studentCard = document.createElement('div');
                    studentCard.className = 'student-card';
                    studentCard.innerHTML = `
                        <div class="student-header">
                            <div>
                                <h5 class="student-name">${student.name}</h5>
                                <p class="student-email">${student.email}</p>
                            </div>
                        </div>
                        <div class="student-stats">
                            <div class="student-stat">
                                <p class="student-stat-number">-</p>
                                <p class="student-stat-label">Total Moods</p>
                            </div>
                            <div class="student-stat">
                                <p class="student-stat-number">-</p>
                                <p class="student-stat-label">This Week</p>
                            </div>
                            <div class="student-stat">
                                <p class="student-stat-number">-</p>
                                <p class="student-stat-label">Last Mood</p>
                            </div>
                        </div>
                    `;
                    studentsList.appendChild(studentCard);
                }
            }
        }

        async updateStudentsStats(students) {
            const totalStudents = document.getElementById('totalStudents');
            const activeStudents = document.getElementById('activeStudents');
            const avgMoodsPerDay = document.getElementById('avgMoodsPerDay');

            if (totalStudents) {
                totalStudents.textContent = students.length;
            }

            if (activeStudents || avgMoodsPerDay) {
                let activeCount = 0;
                let totalMoods = 0;

                // Fetch mood data for all students to calculate stats
                for (const student of students) {
                    try {
                        const response = await fetch(this.apiBaseUrl + '/moods/student/' + student.studentId);
                        if (response.ok) {
                            const moodData = await response.json();
                            totalMoods += moodData.length;

                            // Check if student was active this week
                            const now = new Date();
                            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                            const recentMoods = moodData.filter(mood => {
                                const moodDate = new Date(mood.date);
                                return moodDate >= weekAgo;
                            });
                            
                            if (recentMoods.length > 0) {
                                activeCount++;
                            }
                        }
                    } catch (error) {
                        console.error('Error fetching mood data for stats:', error);
                    }
                }

                if (activeStudents) {
                    activeStudents.textContent = activeCount;
                }

                if (avgMoodsPerDay) {
                    const avgMoods = students.length > 0 ? (totalMoods / students.length).toFixed(1) : 0;
                    avgMoodsPerDay.textContent = avgMoods;
                }
            }
        }

        showNoStudentsMessage() {
            const noStudentsMessage = document.getElementById('noStudentsMessage');
            const studentsList = document.getElementById('studentsList');
            
            if (noStudentsMessage && studentsList) {
                studentsList.style.display = 'none';
                noStudentsMessage.style.display = 'block';
            }
        }

        getWorkoutPreview(description) {
            if (!description) return 'No workout available';
            
            // Parse the workout description to get the first few exercises
            const exercises = this.parseWorkoutDescription(description);
            const previewExercises = exercises.slice(0, 3); // Show first 3 exercises
            
            return previewExercises.map((exercise, index) => 
                `<div class="exercise-preview">${index + 1}. ${exercise.name}</div>`
            ).join('');
        }

        // Load Student Workouts functionality
        async loadStudentWorkouts() {
            try {
                console.log('loadStudentWorkouts called');
                const userData = localStorage.getItem('mindfit_user');
                if (!userData) {
                    console.error('No user data found');
                    return;
                }

                const user = JSON.parse(userData);
                const coachId = user.id;

                console.log('Loading students for workout selection:', coachId);

                // Fetch students assigned to this coach
                const studentsResponse = await fetch(this.apiBaseUrl + '/students/by-coach/' + coachId);
                if (!studentsResponse.ok) {
                    throw new Error(`HTTP error! status: ${studentsResponse.status}`);
                }

                const students = await studentsResponse.json();
                console.log('Fetched students for workout selection:', students);

                await this.displayStudentsForWorkoutSelection(students);

            } catch (error) {
                console.error('Error loading students for workout selection:', error);
                this.showNoWorkoutsMessage();
            }
        }

        // Display students for workout selection
        async displayStudentsForWorkoutSelection(students) {
            const workoutsList = document.getElementById('workoutsList');
            const noWorkoutsMessage = document.getElementById('noWorkoutsMessage');
            
            if (!workoutsList) return;

            if (students.length === 0) {
                this.showNoWorkoutsMessage();
                return;
            }

            // Hide no workouts message
            if (noWorkoutsMessage) {
                noWorkoutsMessage.style.display = 'none';
            }

            // Show workouts list
            workoutsList.style.display = 'block';
            workoutsList.innerHTML = '';

            // Update workout statistics
            await this.updateWorkoutStatsForSelection(students);

            // Display students for selection
            for (const student of students) {
                try {
                    // Fetch mood count for this student
                    const moodResponse = await fetch(this.apiBaseUrl + '/moods/student/' + student.studentId);
                    const moodData = moodResponse.ok ? await moodResponse.json() : [];
                    
                    const studentCard = document.createElement('div');
                    studentCard.className = 'student-selection-card';
                    studentCard.innerHTML = `
                        <div class="student-selection-content">
                            <div class="student-info">
                                <h5 class="student-name">${student.name}</h5>
                                <p class="student-email">${student.email}</p>
                                <div class="student-workout-stats">
                                    <span class="badge bg-primary">${moodData.length} Workouts</span>
                                    ${moodData.length > 0 ? `<span class="badge bg-success">Last: ${moodData[0].moodType}</span>` : ''}
                                </div>
                            </div>
                            <div class="student-action">
                                <button class="btn btn-primary" onclick="app.loadSpecificStudentWorkouts(${student.studentId}, '${student.name}')">
                                    <i class="bi bi-eye-fill me-2"></i>
                                    View Workouts
                                </button>
                            </div>
                        </div>
                    `;
                    workoutsList.appendChild(studentCard);
                } catch (error) {
                    console.error('Error fetching student data:', student.name, error);
                }
            }
        }

        // Load workouts for a specific student
        async loadSpecificStudentWorkouts(studentId, studentName) {
            try {
                // Update the page header to show which student we're viewing
                const pageTitle = document.querySelector('#view-workouts-content h2');
                if (pageTitle) {
                    pageTitle.textContent = `${studentName}'s Workouts`;
                }

                // Add back button
                const backButton = document.createElement('div');
                backButton.className = 'mb-4 text-center';
                backButton.innerHTML = `
                    <button class="btn back-to-students-btn" onclick="app.loadStudentWorkouts()">
                        <i class="bi bi-arrow-left me-2"></i>
                        Back to Students
                    </button>
                `;

                // Fetch mood history for this specific student
                const moodResponse = await fetch(this.apiBaseUrl + '/moods/student/' + studentId);
                if (!moodResponse.ok) {
                    throw new Error(`HTTP error! status: ${moodResponse.status}`);
                }

                const moodData = await moodResponse.json();

                if (moodData.length === 0) {
                    this.showNoWorkoutsMessage();
                    return;
                }

                // Fetch workouts for each mood
                const workoutsList = document.getElementById('workoutsList');
                workoutsList.innerHTML = '';
                workoutsList.appendChild(backButton);

                for (const mood of moodData) {
                    try {
                        const workoutResponse = await fetch(this.apiBaseUrl + '/workouts/by-mood/' + mood.moodType);
                        if (workoutResponse.ok) {
                            const workouts = await workoutResponse.json();
                            const workout = workouts.length > 0 ? workouts[0] : null;
                            
                            if (workout) {
                                const workoutCard = document.createElement('div');
                                workoutCard.className = 'workout-card';
                                workoutCard.innerHTML = `
                                    <div class="workout-header">
                                        <div>
                                            <h5 class="student-name">${studentName}</h5>
                                            <p class="workout-date">${new Date(mood.date).toLocaleDateString()}</p>
                                        </div>
                                        <div class="workout-actions">
                                            <button class="btn btn-outline-primary btn-sm" onclick="app.showStudentLastWorkout(${studentId}, '${studentName}', '${mood.moodType}')">
                                                <i class="bi bi-eye-fill me-1"></i>
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                    <div class="workout-details">
                                        <div class="workout-detail workout-mood-detail">
                                            <i class="bi bi-heart-pulse-fill"></i>
                                            <span>${mood.moodType}</span>
                                        </div>
                                        <div class="workout-detail workout-duration-detail">
                                            <i class="bi bi-clock-fill"></i>
                                            <span>${workout.duration || 'N/A'}</span>
                                        </div>
                                        <div class="workout-detail workout-intensity-detail">
                                            <i class="bi bi-speedometer2"></i>
                                            <span>${workout.intensityLevel}</span>
                                        </div>
                                    </div>
                                    <div class="workout-exercises">
                                        <h6 class="workout-exercises-title">Workout Plan</h6>
                                        ${this.getWorkoutExercisesList(workout.description)}
                                    </div>
                                `;
                                workoutsList.appendChild(workoutCard);
                            }
                        }
                    } catch (error) {
                        console.error('Error fetching workout for mood:', error);
                    }
                }

            } catch (error) {
                console.error('Error loading specific student workouts:', error);
                this.showAlert('Error loading student workouts. Please try again.', 'danger');
            }
        }

        getWorkoutExercisesList(description) {
            if (!description) return '<p class="text-muted">No workout plan available</p>';
            
            const exercises = this.parseWorkoutDescription(description);
            return exercises.map((exercise, index) => 
                `<div class="workout-exercise-item">${index + 1}. ${exercise.name}</div>`
            ).join('');
        }

        async updateWorkoutStats(students) {
            const totalWorkouts = document.getElementById('totalWorkouts');
            const activeWorkouts = document.getElementById('activeWorkouts');
            const avgWorkoutDuration = document.getElementById('avgWorkoutDuration');

            let totalCount = 0;
            let thisWeekCount = 0;
            let totalDuration = 0;
            let workoutCount = 0;

            // Calculate stats from all student workouts
            for (const student of students) {
                try {
                    const moodResponse = await fetch(this.apiBaseUrl + '/moods/student/' + student.studentId);
                    if (moodResponse.ok) {
                        const moodData = await moodResponse.json();
                        totalCount += moodData.length;

                        // Count workouts within the last 7 days
                        const now = new Date();
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        const recentMoods = moodData.filter(mood => {
                            const moodDate = new Date(mood.date);
                            return moodDate >= weekAgo;
                        });
                        
                        thisWeekCount += recentMoods.length;

                        // Calculate average duration
                        for (const mood of moodData) {
                            try {
                                const workoutResponse = await fetch(this.apiBaseUrl + '/workouts/by-mood/' + mood.moodType);
                                if (workoutResponse.ok) {
                                    const workouts = await workoutResponse.json();
                                    const workout = workouts.length > 0 ? workouts[0] : null;
                                    if (workout && workout.duration) {
                                        const duration = parseInt(workout.duration);
                                        if (!isNaN(duration)) {
                                            totalDuration += duration;
                                            workoutCount++;
                                        }
                                    }
                                }
                            } catch (error) {
                                console.error('Error fetching workout duration:', error);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error fetching workout stats:', error);
                }
            }

            if (totalWorkouts) {
                totalWorkouts.textContent = totalCount;
            }

            if (activeWorkouts) {
                activeWorkouts.textContent = thisWeekCount;
            }

            if (avgWorkoutDuration) {
                const avgDuration = workoutCount > 0 ? Math.round(totalDuration / workoutCount) : 0;
                avgWorkoutDuration.textContent = avgDuration + ' min';
            }
        }

        // Update workout stats for student selection page
        async updateWorkoutStatsForSelection(students) {
            const totalWorkouts = document.getElementById('totalWorkouts');
            const activeWorkouts = document.getElementById('activeWorkouts');
            const avgWorkoutDuration = document.getElementById('avgWorkoutDuration');

            let totalCount = 0;
            let thisWeekCount = 0;
            let totalDuration = 0;
            let workoutCount = 0;

            // Calculate stats from all student workouts
            for (const student of students) {
                try {
                    const moodResponse = await fetch(this.apiBaseUrl + '/moods/student/' + student.studentId);
                    if (moodResponse.ok) {
                        const moodData = await moodResponse.json();
                        totalCount += moodData.length;

                        // Count workouts within the last 7 days
                        const now = new Date();
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        const recentMoods = moodData.filter(mood => {
                            const moodDate = new Date(mood.date);
                            return moodDate >= weekAgo;
                        });
                        
                        thisWeekCount += recentMoods.length;

                        // Calculate average duration
                        for (const mood of moodData) {
                            try {
                                const workoutResponse = await fetch(this.apiBaseUrl + '/workouts/by-mood/' + mood.moodType);
                                if (workoutResponse.ok) {
                                    const workouts = await workoutResponse.json();
                                    const workout = workouts.length > 0 ? workouts[0] : null;
                                    if (workout && workout.duration) {
                                        const duration = parseInt(workout.duration);
                                        if (!isNaN(duration)) {
                                            totalDuration += duration;
                                            workoutCount++;
                                        }
                                    }
                                }
                            } catch (error) {
                                console.error('Error fetching workout duration:', error);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error fetching workout stats:', error);
                }
            }

            if (totalWorkouts) {
                totalWorkouts.textContent = totalCount;
            }

            if (activeWorkouts) {
                activeWorkouts.textContent = thisWeekCount;
            }

            if (avgWorkoutDuration) {
                const avgDuration = workoutCount > 0 ? Math.round(totalDuration / workoutCount) : 0;
                avgWorkoutDuration.textContent = avgDuration + ' min';
            }
        }

        showNoWorkoutsMessage() {
            const noWorkoutsMessage = document.getElementById('noWorkoutsMessage');
            const workoutsList = document.getElementById('workoutsList');
            
            if (noWorkoutsMessage && workoutsList) {
                workoutsList.style.display = 'none';
                noWorkoutsMessage.style.display = 'block';
            }
        }

        // Load Student Analytics functionality
        async loadStudentAnalytics() {
            try {
                console.log('loadStudentAnalytics called');
                const userData = localStorage.getItem('mindfit_user');
                if (!userData) {
                    console.error('No user data found');
                    return;
                }

                const user = JSON.parse(userData);
                const coachId = user.id;

                console.log('Loading analytics for coach:', coachId);

                // Fetch students assigned to this coach
                const studentsResponse = await fetch(this.apiBaseUrl + '/students/by-coach/' + coachId);
                if (!studentsResponse.ok) {
                    throw new Error(`HTTP error! status: ${studentsResponse.status}`);
                }

                const students = await studentsResponse.json();
                console.log('Fetched students for analytics:', students);

                await this.displayAnalytics(students);

            } catch (error) {
                console.error('Error loading student analytics:', error);
                this.showAlert('Error loading analytics. Please try again.', 'danger');
            }
        }

        // Display analytics with charts and insights
        async displayAnalytics(students) {
            console.log('displayAnalytics called with students:', students);
            console.log('Students length:', students.length);
            
            // Update total students count
            this.updateAnalyticsTotalStudents(students.length);
            
            // Create mood trends chart
            await this.createMoodTrendsChart(students);
            
            // Create mood distribution chart
            await this.createMoodDistributionChart(students);
            
            // Create activity chart
            await this.createActivityChart(students);
            
            // Generate student insights
            await this.generateStudentInsights(students);
        }

        // Update analytics total students count
        updateAnalyticsTotalStudents(count) {
            const totalStudentsEl = document.getElementById('analyticsTotalStudents');
            if (totalStudentsEl) {
                totalStudentsEl.textContent = count;
                console.log('Updated analytics total students:', count);
            } else {
                console.log('analyticsTotalStudents element not found');
            }
        }

        // Create mood trends chart
        async createMoodTrendsChart(students) {
            const ctx = document.getElementById('moodTrendsChart');
            if (!ctx) return;

            // Destroy existing chart if it exists
            if (this.moodTrendsChart) {
                this.moodTrendsChart.destroy();
            }

            // Collect all mood data (simplified - no time filtering)
            let allMoods = [];
            for (const student of students) {
                try {
                    const moodResponse = await fetch(this.apiBaseUrl + '/moods/student/' + student.studentId);
                    if (moodResponse.ok) {
                        const moodData = await moodResponse.json();
                        allMoods = allMoods.concat(moodData);
                    }
                } catch (error) {
                    console.error('Error fetching mood data:', error);
                }
            }

            // Group moods by type (simple count)
            const moodCounts = { Stressed: 0, Tired: 0, Calm: 0, Excited: 0 };
            allMoods.forEach(mood => {
                if (moodCounts.hasOwnProperty(mood.moodType)) {
                    moodCounts[mood.moodType]++;
                }
            });

            // Create simple bar chart (like student activity)
            this.moodTrendsChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: Object.keys(moodCounts),
                    datasets: [{
                        label: 'Total Moods',
                        data: Object.values(moodCounts),
                        backgroundColor: [
                            'rgba(220, 53, 69, 0.8)',   // Stressed - Red
                            'rgba(108, 117, 125, 0.8)', // Tired - Gray  
                            'rgba(40, 167, 69, 0.8)',   // Calm - Green
                            'rgba(253, 126, 20, 0.8)'   // Excited - Orange
                        ],
                        borderColor: [
                            '#dc3545',
                            '#6c757d', 
                            '#28a745',
                            '#fd7e14'
                        ],
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: 'white',
                            bodyColor: 'white',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            borderWidth: 1
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: 'white',
                                font: {
                                    size: 12
                                }
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)',
                                drawBorder: false
                            }
                        },
                        x: {
                            ticks: {
                                color: 'white',
                                font: {
                                    size: 12
                                }
                            },
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }

        // Create mood distribution chart
        async createMoodDistributionChart(students) {
            const ctx = document.getElementById('moodDistributionChart');
            if (!ctx) return;

            if (this.moodDistributionChart) {
                this.moodDistributionChart.destroy();
            }

            // Collect mood data
            let moodCounts = { Stressed: 0, Tired: 0, Calm: 0, Excited: 0 };
            
            for (const student of students) {
                try {
                    const moodResponse = await fetch(this.apiBaseUrl + '/moods/student/' + student.studentId);
                    if (moodResponse.ok) {
                        const moodData = await moodResponse.json();
                        moodData.forEach(mood => {
                            if (moodCounts.hasOwnProperty(mood.moodType)) {
                                moodCounts[mood.moodType]++;
                            }
                        });
                    }
                } catch (error) {
                    console.error('Error fetching mood data:', error);
                }
            }

            this.moodDistributionChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Stressed', 'Tired', 'Calm', 'Excited'],
                    datasets: [{
                        data: [moodCounts.Stressed, moodCounts.Tired, moodCounts.Calm, moodCounts.Excited],
                        backgroundColor: [
                            'rgba(220, 53, 69, 0.8)',
                            'rgba(255, 193, 7, 0.8)',
                            'rgba(25, 135, 84, 0.8)',
                            'rgba(253, 126, 20, 0.8)'
                        ],
                        borderColor: [
                            '#dc3545',
                            '#ffc107',
                            '#198754',
                            '#fd7e14'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            labels: {
                                color: 'white'
                            }
                        }
                    }
                }
            });
        }

        // Create activity chart
        async createActivityChart(students) {
            const ctx = document.getElementById('activityChart');
            if (!ctx) return;

            if (this.activityChart) {
                this.activityChart.destroy();
            }

            // Calculate activity for each student
            const studentActivity = [];
            for (const student of students) {
                try {
                    const moodResponse = await fetch(this.apiBaseUrl + '/moods/student/' + student.studentId);
                    if (moodResponse.ok) {
                        const moodData = await moodResponse.json();
                        studentActivity.push({
                            name: student.name,
                            activity: moodData.length
                        });
                    }
                } catch (error) {
                    console.error('Error fetching mood data:', error);
                }
            }

            // Sort by activity
            studentActivity.sort((a, b) => b.activity - a.activity);

            this.activityChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: studentActivity.map(s => s.name),
                    datasets: [{
                        label: 'Mood Logs',
                        data: studentActivity.map(s => s.activity),
                        backgroundColor: 'rgba(13, 110, 253, 0.8)',
                        borderColor: '#0d6efd',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            labels: {
                                color: 'white'
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: 'white'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        y: {
                            ticks: {
                                color: 'white'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        }
                    }
                }
            });
        }

        // Generate student insights
        async generateStudentInsights(students) {
            const insightsContainer = document.getElementById('studentInsights');
            if (!insightsContainer) return;

            insightsContainer.innerHTML = '';

            // Collect insights
            const insights = [];

            // Analyze each student
            for (const student of students) {
                try {
                    const moodResponse = await fetch(this.apiBaseUrl + '/moods/student/' + student.studentId);
                    if (moodResponse.ok) {
                        const moodData = await moodResponse.json();
                        
                        if (moodData.length > 0) {
                            // Recent mood analysis
                            const recentMoods = moodData.slice(0, 3);
                            const stressedCount = recentMoods.filter(m => m.moodType === 'Stressed').length;
                            
                            if (stressedCount >= 2) {
                                insights.push({
                                    icon: '⚠️',
                                    title: `${student.name} seems stressed lately`,
                                    description: 'Consider suggesting calming workouts or checking in with them.'
                                });
                            }

                            // Activity analysis
                            const now = new Date();
                            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                            const recentActivity = moodData.filter(mood => new Date(mood.date) >= weekAgo).length;
                            
                            if (recentActivity === 0) {
                                insights.push({
                                    icon: '📉',
                                    title: `${student.name} hasn't logged moods recently`,
                                    description: 'They might need encouragement to stay engaged with the program.'
                                });
                            } else if (recentActivity >= 5) {
                                insights.push({
                                    icon: '⭐',
                                    title: `${student.name} is very active`,
                                    description: 'Great engagement! Consider them for leadership opportunities.'
                                });
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error generating insights:', error);
                }
            }

            // Display insights
            if (insights.length === 0) {
                insightsContainer.innerHTML = `
                    <div class="text-center text-white-50">
                        <i class="bi bi-info-circle me-2"></i>
                        No specific insights available yet. Check back after more mood data is collected.
                    </div>
                `;
            } else {
                insights.forEach(insight => {
                    const insightCard = document.createElement('div');
                    insightCard.className = 'insight-card';
                    insightCard.innerHTML = `
                        <div class="insight-header">
                            <span class="insight-icon">${insight.icon}</span>
                            <h6 class="insight-title">${insight.title}</h6>
                        </div>
                        <p class="insight-description">${insight.description}</p>
                    `;
                    insightsContainer.appendChild(insightCard);
                });
            }
        }

        // Show student's last workout in a modal
        async showStudentLastWorkout(studentId, studentName, lastMood) {
            try {
                // Fetch the workout for the student's last mood
                const workoutResponse = await fetch(this.apiBaseUrl + '/workouts/by-mood/' + lastMood);
                if (!workoutResponse.ok) {
                    throw new Error(`HTTP error! status: ${workoutResponse.status}`);
                }

                const workouts = await workoutResponse.json();
                const workout = workouts.length > 0 ? workouts[0] : null;

                if (!workout) {
                    this.showAlert('No workout found for this mood type.', 'warning');
                    return;
                }

                // Create and show modal
                this.showWorkoutModal(studentName, lastMood, workout);

            } catch (error) {
                console.error('Error fetching student workout:', error);
                this.showAlert('Error loading workout. Please try again.', 'danger');
            }
        }

        showWorkoutModal(studentName, moodType, workout) {
            // Remove existing modal if it exists
            const existingModal = document.getElementById('studentWorkoutModal');
            if (existingModal) {
                existingModal.remove();
            }

            // Create modal HTML
            const modalHTML = `
                <div class="modal fade" id="studentWorkoutModal" tabindex="-1" aria-labelledby="studentWorkoutModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="studentWorkoutModalLabel">
                                    <i class="bi bi-lightning-fill me-2"></i>
                                    ${studentName}'s Last Workout
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="workout-modal-content">
                                    <div class="workout-info-section mb-4">
                                        <div class="row">
                                            <div class="col-md-4">
                                                <div class="workout-info-item">
                                                    <i class="bi bi-heart-pulse-fill text-primary"></i>
                                                    <div>
                                                        <h6>Mood</h6>
                                                        <span class="badge bg-primary">${moodType}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-4">
                                                <div class="workout-info-item">
                                                    <i class="bi bi-clock-fill text-success"></i>
                                                    <div>
                                                        <h6>Duration</h6>
                                                        <span>${workout.duration || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-4">
                                                <div class="workout-info-item">
                                                    <i class="bi bi-speedometer2 text-warning"></i>
                                                    <div>
                                                        <h6>Intensity</h6>
                                                        <span>${workout.intensityLevel}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="workout-exercises-section">
                                        <h5 class="mb-3">Workout Plan</h5>
                                        <div class="exercises-list">
                                            ${this.getWorkoutExercisesList(workout.description)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Add modal to body
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('studentWorkoutModal'));
            modal.show();

            // Clean up modal when hidden
            document.getElementById('studentWorkoutModal').addEventListener('hidden.bs.modal', function() {
                this.remove();
            });
        }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const userType = document.getElementById('userType').value;

        if (!email || !password || !userType) {
            this.showAlert('Please fill in all required fields.', 'warning');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showAlert('Please enter a valid email address.', 'warning');
            return;
        }

        try {
            // Show loading state
            const submitButton = document.querySelector('#loginForm button[type="submit"]');
            this.setLoading(submitButton, true);

            // Determine API endpoint based on user type
            const apiEndpoint = userType === 'student' ? 'students' : 'coaches';
            const apiUrl = this.apiBaseUrl + '/' + apiEndpoint;
            
            console.log('Attempting to fetch from:', apiUrl); // Debug log
            
            // Get all users of the selected type to find matching credentials
            const response = await fetch(apiUrl);
            
            if (response.ok) {
                const users = await response.json();
                console.log('Fetched users:', users); // Debug log
                       console.log('Looking for:', email, password, userType); // Debug log
                       
                       // Log all users to see what's in the database
                       console.log('All users in database:', users);
                       users.forEach((user, index) => {
                           console.log(`User ${index}:`, {
                               email: user.email,
                               password: user.password,
                               name: user.name
                           });
                       });
                
                const user = users.find(u => 
                    u.email.toLowerCase() === email.toLowerCase() && 
                    u.password === password
                );

                console.log('Found user:', user); // Debug log

                if (user) {
                    // Store user data in localStorage
                    localStorage.setItem('mindfit_user', JSON.stringify({
                        id: userType === 'student' ? user.studentId : user.coachId,
                        name: user.name,
                        email: user.email,
                        type: userType
                    }));

                    this.showAlert(`Welcome back, ${user.name}!`, 'success');
                    
                    // Close modal
                    const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                    loginModal.hide();
                    
                    // Reset form
                    document.getElementById('loginForm').reset();
                    
                    // Update UI to show logged in state
                    this.updateLoginUI(user.name, userType);
                } else {
                    this.showAlert('Invalid email or password.', 'danger');
                }
            } else {
                console.error('API response not ok:', response.status, response.statusText);
                this.showAlert('Login failed. Please try again.', 'danger');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showAlert('Login failed. Please check your connection and try again.', 'danger');
        } finally {
            // Hide loading state
            const submitButton = document.querySelector('#loginForm button[type="submit"]');
            this.setLoading(submitButton, false);
        }
    }

           updateLoginUI(userName, userType) {
               // Hide login button and show user dropdown
               const loginButton = document.getElementById('loginButton');
               const userDropdown = document.getElementById('userDropdown');
               const userDisplayName = document.getElementById('userDisplayName');
               const userEmail = document.getElementById('userEmail');
               
               if (loginButton && userDropdown && userDisplayName && userEmail) {
                   // Hide login button
                   loginButton.style.display = 'none';
                   
                   // Show user dropdown
                   userDropdown.style.display = 'block';
                   
                   // Update user info
                   userDisplayName.textContent = `${userName} (${userType})`;
                   userEmail.textContent = this.getCurrentUserEmail();
                   
                   // Update navigation based on user type
                   this.updateNavigationForUserType(userType);
               }
           }

           updateNavigationForUserType(userType) {
               const publicNav = document.getElementById('publicNav');
               const studentNav = document.getElementById('studentNav');
               const coachNav = document.getElementById('coachNav');
               
               if (userType === 'student') {
                   // Hide public navigation, show student navigation
                   if (publicNav) publicNav.style.display = 'none';
                   if (studentNav) studentNav.style.display = 'flex';
                   if (coachNav) coachNav.style.display = 'none';
                   
                   // Set active nav item
                   this.updateActiveNav(document.querySelector('#studentNav a[href="#choose-coach"]'));
               } else if (userType === 'coach') {
                   // Hide public navigation, show coach navigation
                   if (publicNav) publicNav.style.display = 'none';
                   if (studentNav) studentNav.style.display = 'none';
                   if (coachNav) coachNav.style.display = 'flex';
                   
                   // Set active nav item and navigate to view-students page
                   this.updateActiveNav(document.querySelector('#coachNav a[href="#view-students"]'));
                   this.showPage('view-students');
               } else {
                   // Show public navigation, hide all user navigation
                   if (publicNav) publicNav.style.display = 'flex';
                   if (studentNav) studentNav.style.display = 'none';
                   if (coachNav) coachNav.style.display = 'none';
               }
           }

           getCurrentUserEmail() {
               const userData = localStorage.getItem('mindfit_user');
               if (userData) {
                   try {
                       const user = JSON.parse(userData);
                       return user.email;
                   } catch (error) {
                       console.error('Error parsing user data:', error);
                       return '';
                   }
               }
               return '';
           }

           logout() {
               localStorage.removeItem('mindfit_user');
               location.reload(); // Simple way to reset the UI
           }

    checkExistingLogin() {
        const userData = localStorage.getItem('mindfit_user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                this.updateLoginUI(user.name, user.type);
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('mindfit_user');
            }
        }
    }

    // Test function to check if API is running
    async testAPI() {
        try {
            const response = await fetch(this.apiBaseUrl + '/students');
            console.log('API Test - Students endpoint:', response.status);
            if (response.ok) {
                const data = await response.json();
                console.log('Sample students:', data);
            }
        } catch (error) {
            console.error('API Test failed:', error);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MindFitApp();
});

// Add navbar scroll effect CSS
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        .navbar-scrolled {
            background-color: rgba(255, 255, 255, 0.95) !important;
            backdrop-filter: blur(10px);
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        }
        
        .navbar-scrolled .navbar-brand,
        .navbar-scrolled .nav-link {
            color: var(--text-dark) !important;
        }
    `;
    document.head.appendChild(style);
});

// Add some interactive hover effects
document.addEventListener('DOMContentLoaded', () => {
    // Add hover effects to feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add click effects to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add ripple animation CSS
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);
});
