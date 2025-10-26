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
                this.checkCoachSelection();
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
            
            // Special handling for rate-coach page
            if (pageId === 'rate-coach') {
                this.loadRateCoachPage();
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
            
            // Special handling for earnings page
            if (pageId === 'earnings') {
                console.log('Loading earnings page...');
                this.loadEarnings();
            }
            
            // Special handling for my-ratings page
            if (pageId === 'my-ratings') {
                console.log('Loading my ratings page...');
                this.loadMyRatings();
            }
            
            // Special handling for admin dashboard
            if (pageId === 'admin-dashboard') {
                window.app.loadAdminDashboard();
            }
            
            // Special handling for admin students
            if (pageId === 'admin-students') {
                window.app.loadAdminStudents();
            }
            
            // Special handling for admin profit
            if (pageId === 'admin-profit') {
                window.app.loadAdminProfit();
            }
            
            // Special handling for admin coach ratings
            if (pageId === 'admin-coach-ratings') {
                window.app.loadAdminCoachRatings();
            }
            
            // Special handling for rate-coach page
            if (pageId === 'rate-coach') {
                console.log('Loading rate coach page...');
                this.loadRateCoachPage();
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
                
                // Redirect to home page after successful registration
                setTimeout(() => {
                    this.showPage('home');
                }, 2000); // Wait 2 seconds to let user see the success message
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
                
                // Redirect to home page after successful registration
                setTimeout(() => {
                    this.showPage('home');
                }, 2000); // Wait 2 seconds to let user see the success message
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

        async displayCoaches(coaches) {
            const coachesGrid = document.getElementById('coachesGrid');
            if (!coachesGrid) return;

            coachesGrid.innerHTML = '';

            // Check if current student already has a coach
            const userData = localStorage.getItem('mindfit_user');
            let currentStudent = null;
            if (userData) {
                const user = JSON.parse(userData);
                if (user.type === 'student') {
                    try {
                        const response = await fetch(this.apiBaseUrl + '/students/' + user.id);
                        if (response.ok) {
                            currentStudent = await response.json();
                        }
                    } catch (error) {
                        console.error('Error fetching student data:', error);
                    }
                }
            }

            coaches.forEach(coach => {
                const coachCard = document.createElement('div');
                coachCard.className = 'coach-card';
                
                // Check if this is the student's current coach
                const isCurrentCoach = currentStudent && currentStudent.coachId === coach.coachId;
                const hasCoach = currentStudent && currentStudent.coachId;
                
                let buttonHTML = '';
                if (isCurrentCoach) {
                    buttonHTML = `
                        <button class="select-coach-btn selected" disabled>
                            <i class="bi bi-check-circle-fill me-2"></i>Your Coach
                        </button>
                    `;
                } else {
                    buttonHTML = `
                        <button class="select-coach-btn" onclick="app.selectCoach(${coach.coachId})">
                            ${hasCoach ? 'Change to This Coach' : 'Select Coach'}
                        </button>
                    `;
                }

                coachCard.innerHTML = `
                    <div class="coach-avatar">
                        <i class="bi bi-person-fill"></i>
                    </div>
                    <h3 class="coach-name">${coach.name}</h3>
                    <p class="coach-experience">${coach.yearsOfExperience} years of experience</p>
                    <p class="coach-email">${coach.email}</p>
                    ${buttonHTML}
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

            // Check if student already has a coach
            const studentResponse = await fetch(this.apiBaseUrl + '/students/' + user.id);
            if (studentResponse.ok) {
                const student = await studentResponse.json();
                if (student.coachId && student.coachId === coachId) {
                    this.showAlert('This is already your coach.', 'info');
                    return;
                }
                
                // If student has a different coach, check if they've used their free change
                if (student.coachId && student.coachId !== coachId) {
                    // Check if student has already used their free coach change
                    const hasUsedFreeChange = localStorage.getItem(`free_coach_change_used_${user.id}`) === 'true';
                    
                    if (hasUsedFreeChange) {
                        const confirmChange = confirm(`You currently have a coach. Changing coaches requires a payment of $80.00. Do you want to continue?`);
                        if (!confirmChange) {
                            return;
                        }
                    } else {
                        const confirmChange = confirm(`You currently have a coach. Your first coach change is FREE! Do you want to continue?`);
                        if (!confirmChange) {
                            return;
                        }
                    }
                }
            }

            // Show payment form for coach selection/change
            this.showPaymentForm(coachId);
        } catch (error) {
            console.error('Error selecting coach:', error);
            this.showAlert('Failed to select coach. Please try again.', 'danger');
        }
    }

        updateSelectedCoach(coachId) {
            // Refresh the coaches display to show updated state
            this.loadCoaches();
        }

        async showPaymentForm(coachId) {
            // Check if this is a coach change
            const userData = localStorage.getItem('mindfit_user');
            const user = JSON.parse(userData);
            let isCoachChange = false;
            let isFreeChange = false;
            
            try {
                const studentResponse = await fetch(this.apiBaseUrl + '/students/' + user.id);
                if (studentResponse.ok) {
                    const student = await studentResponse.json();
                    isCoachChange = student.coachId && student.coachId !== coachId;
                    
                    if (isCoachChange) {
                        // Check if this is their first free coach change
                        const hasUsedFreeChange = localStorage.getItem(`free_coach_change_used_${user.id}`) === 'true';
                        isFreeChange = !hasUsedFreeChange;
                    }
                }
            } catch (error) {
                console.error('Error checking current coach:', error);
            }

            // If it's a free change, handle it directly without payment form
            if (isFreeChange) {
                await this.processFreeCoachChange(coachId);
                return;
            }

            // Create payment modal
            const modalHTML = `
                <div class="modal fade" id="paymentModal" tabindex="-1" aria-labelledby="paymentModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="paymentModalLabel">${isCoachChange ? 'Change Coach - Payment Required' : 'Complete Payment'}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="payment-summary mb-4">
                                    <h6>Payment Summary</h6>
                                    <small class="text-muted">${isCoachChange ? 'Coach Change Fee' : 'Coach Subscription'}: $80.00</small>
                                    ${isCoachChange ? '<br><small class="text-warning">Note: You will be charged for the new coach subscription.</small>' : ''}
                                </div>
                                <form id="paymentForm">
                                    <div class="mb-3">
                                        <label for="cardNumber" class="form-label">Card Number</label>
                                        <input type="text" class="form-control" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19" required>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="expiryDate" class="form-label">Expiry Date</label>
                                            <input type="text" class="form-control" id="expiryDate" placeholder="MM/YY" maxlength="5" required>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label for="cvv" class="form-label">CVV</label>
                                            <input type="text" class="form-control" id="cvv" placeholder="123" maxlength="4" required>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="cardholderName" class="form-label">Cardholder Name</label>
                                        <input type="text" class="form-control" id="cardholderName" placeholder="John Doe" required>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" onclick="app.processPayment(${coachId})">Pay $80.00</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Remove existing modal if any
            const existingModal = document.getElementById('paymentModal');
            if (existingModal) {
                existingModal.remove();
            }

            // Add modal to body
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Show modal
            const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
            paymentModal.show();

            // Add input formatting
            this.addCardFormatting();
        }

        addCardFormatting() {
            const cardNumberInput = document.getElementById('cardNumber');
            const expiryInput = document.getElementById('expiryDate');
            const cvvInput = document.getElementById('cvv');

            if (cardNumberInput) {
                cardNumberInput.addEventListener('input', (e) => {
                    let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
                    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                    e.target.value = formattedValue;
                });
            }

            if (expiryInput) {
                expiryInput.addEventListener('input', (e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                        value = value.substring(0, 2) + '/' + value.substring(2, 4);
                    }
                    e.target.value = value;
                });
            }

            if (cvvInput) {
                cvvInput.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '');
                });
            }
        }

        async processPayment(coachId) {
            try {
                // Get form data
                const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
                const expiryDate = document.getElementById('expiryDate').value;
                const cvv = document.getElementById('cvv').value;
                const cardholderName = document.getElementById('cardholderName').value;

                // Validate inputs
                if (!this.validateCardNumber(cardNumber)) {
                    this.showAlert('Invalid card number', 'danger');
                    return;
                }

                if (!this.validateExpiryDate(expiryDate)) {
                    this.showAlert('Invalid expiry date', 'danger');
                    return;
                }

                if (!this.validateCVV(cvv)) {
                    this.showAlert('Invalid CVV', 'danger');
                    return;
                }

                if (!cardholderName.trim()) {
                    this.showAlert('Please enter cardholder name', 'danger');
                    return;
                }

                // Get current user data
                const userData = localStorage.getItem('mindfit_user');
                const user = JSON.parse(userData);

                // Process payment
                const paymentData = {
                    studentId: user.id,
                    coachId: coachId,
                    amount: 80.00,
                    cardNumber: cardNumber,
                    expiryDate: expiryDate,
                    cvv: cvv,
                    cardholderName: cardholderName
                };

                const response = await fetch(this.apiBaseUrl + '/payment/process', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(paymentData)
                });

                if (response.ok) {
                    const payment = await response.json();
                    console.log('Payment processed:', payment);

                    // Update student's coach in database
                    const coachResponse = await fetch(this.apiBaseUrl + '/students/' + user.id + '/coach', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ coachId: coachId })
                    });

                    if (coachResponse.ok) {
                        // Close modal
                        const paymentModal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
                        paymentModal.hide();

                        // Mark that they've used their free coach change (if they had one)
                        localStorage.setItem(`free_coach_change_used_${user.id}`, 'true');

                        // Check if this was a coach change
                        const studentResponse = await fetch(this.apiBaseUrl + '/students/' + user.id);
                        let isCoachChange = false;
                        if (studentResponse.ok) {
                            const student = await studentResponse.json();
                            isCoachChange = student.coachId && student.coachId !== coachId;
                        }

                        const successMessage = isCoachChange ? 'Payment successful! Coach changed.' : 'Payment successful! Coach selected.';
                        this.showAlert(successMessage, 'success');
                        this.updateSelectedCoach(coachId);
                    } else {
                        this.showAlert('Payment processed but failed to assign coach. Please contact support.', 'warning');
                    }
                } else {
                    const error = await response.text();
                    console.error('Payment failed:', error);
                    this.showAlert('Payment failed. Please try again.', 'danger');
                }
            } catch (error) {
                console.error('Error processing payment:', error);
                this.showAlert('Payment failed. Please try again.', 'danger');
            }
        }

        validateCardNumber(cardNumber) {
            // Remove all non-digits
            const digits = cardNumber.replace(/\D/g, '');
            
            // Just check if it's a valid length (13-19 digits)
            // Accept any card number with proper digit count
            return digits.length >= 13 && digits.length <= 19;
        }

        validateExpiryDate(expiryDate) {
            const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
            if (!regex.test(expiryDate)) return false;

            const [month, year] = expiryDate.split('/');
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear() % 100;
            const currentMonth = currentDate.getMonth() + 1;

            const expMonth = parseInt(month);
            const expYear = parseInt(year);

            if (expYear < currentYear) return false;
            if (expYear === currentYear && expMonth < currentMonth) return false;

            return true;
        }

        validateCVV(cvv) {
            return /^\d{3,4}$/.test(cvv);
        }

        async processFreeCoachChange(coachId) {
            try {
                // Get current user data
                const userData = localStorage.getItem('mindfit_user');
                const user = JSON.parse(userData);

                // Update student's coach in database
                const coachResponse = await fetch(this.apiBaseUrl + '/students/' + user.id + '/coach', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ coachId: coachId })
                });

                if (coachResponse.ok) {
                    // Mark that they've used their free coach change
                    localStorage.setItem(`free_coach_change_used_${user.id}`, 'true');
                    
                    this.showAlert('Coach changed successfully! (Free change used)', 'success');
                    this.updateSelectedCoach(coachId);
                } else {
                    this.showAlert('Failed to change coach. Please try again.', 'danger');
                }
            } catch (error) {
                console.error('Error processing free coach change:', error);
                this.showAlert('Failed to change coach. Please try again.', 'danger');
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

                // Check if student has a coach
                const studentResponse = await fetch(this.apiBaseUrl + '/students/' + user.id);
                if (studentResponse.ok) {
                    const student = await studentResponse.json();
                    if (!student.coachId) {
                        this.showAlert('You must select a coach before logging your mood.', 'warning');
                        return;
                    }
                } else {
                    this.showAlert('Failed to verify coach selection. Please try again.', 'danger');
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
                // Get current student ID from localStorage
                const userData = localStorage.getItem('mindfit_user');
                const student = JSON.parse(userData);
                const studentId = student.id;

                console.log('Loading workout for mood:', moodType, 'studentId:', studentId);

                // Fetch workout from API based on mood type, passing student ID
                const response = await fetch(this.apiBaseUrl + '/workouts/by-mood/' + moodType + '?studentId=' + studentId);
                if (response.ok) {
                    const workouts = await response.json();
                    console.log('API returned workouts:', workouts);
                    // Get the first workout for this mood type
                    const workout = workouts.length > 0 ? workouts[0] : null;
                    console.log('Selected workout:', workout);
                    if (workout) {
                        console.log('Workout description:', workout.description);
                        console.log('Workout duration:', workout.duration);
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
            console.log('Displaying workout:', workout);
            console.log('Workout description:', workout.description);
            
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
            console.log('Displaying exercises for description:', description);
            const exercisesList = document.getElementById('exercisesList');
            console.log('Exercises list element:', exercisesList);
            
            if (!exercisesList) {
                console.error('Exercises list element not found!');
                return;
            }

            // Parse the workout description (assuming it's a structured text)
            const exercises = this.parseWorkoutDescription(description);
            console.log('Parsed exercises:', exercises);
            
            exercisesList.innerHTML = '';
            
            if (exercises.length === 0) {
                console.warn('No exercises found in description');
                exercisesList.innerHTML = '<div class="exercise-item"><div class="exercise-content"><div class="exercise-name">No exercises found</div></div></div>';
                return;
            }
            
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
            const exercises = [];
            
            // Check if it's a simple single-word description (like "Rest")
            if (description && !description.includes('.')) {
                // Simple description - treat as a single exercise
                exercises.push({
                    name: description,
                    description: 'Complete the activity as described'
                });
                return exercises;
            }
            
            // Check if it's a structured description with numbered exercises
            const exercisePattern = /(\d+\.\s+[^0-9]+?)(?=\s*\d+\.|$)/g;
            const matches = description.match(exercisePattern);
            
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

        async checkCoachSelection() {
            try {
                // Get current user data
                const userData = localStorage.getItem('mindfit_user');
                if (!userData) {
                    this.showAlert('Please log in first.', 'warning');
                    return;
                }

                const user = JSON.parse(userData);
                if (user.type !== 'student') {
                    return; // Not a student, no need to check
                }

                // Check if student has a coach
                const response = await fetch(this.apiBaseUrl + '/students/' + user.id);
                if (response.ok) {
                    const student = await response.json();
                    if (!student.coachId) {
                        // Student doesn't have a coach, show message and redirect
                        this.showCoachRequiredMessage();
                    }
                } else {
                    console.error('Failed to fetch student data');
                }
            } catch (error) {
                console.error('Error checking coach selection:', error);
            }
        }

        showCoachRequiredMessage() {
            const moodForm = document.getElementById('moodForm');
            if (moodForm) {
                moodForm.innerHTML = `
                    <div class="text-center py-5">
                        <i class="bi bi-person-check text-warning" style="font-size: 4rem;"></i>
                        <h3 class="mt-4 text-white">Coach Required</h3>
                        <p class="text-white-50 mb-4">
                            You need to select a coach before you can log your mood and get personalized workouts.
                        </p>
                        <div class="alert alert-warning">
                            <i class="bi bi-exclamation-triangle me-2"></i>
                            <strong>Please choose a coach first!</strong> Use the "Choose Coach" tab in the navigation menu.
                        </div>
                        <div class="mt-4">
                            <small class="text-white-50">
                                Your coach will help track your progress and provide personalized guidance.
                            </small>
                        </div>
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
            console.log('updateMoodStats called with moods:', moods);
            console.log('Mood types in array:', moods.map(m => m.moodType));
            
            const totalMoods = document.getElementById('totalMoods');
            const currentStreak = document.getElementById('currentStreak');
            const mostCommonMood = document.getElementById('mostCommonMood');
            
            if (totalMoods) {
                totalMoods.textContent = moods.length;
                console.log('Total moods set to:', moods.length);
            }
            
            // Calculate streak (simplified - consecutive days with moods)
            if (currentStreak) {
                const streak = this.calculateStreak(moods);
                currentStreak.textContent = streak;
            }
            
            // Find most common mood
            if (mostCommonMood) {
                const mostCommon = this.findMostCommonMood(moods);
                console.log('Most common mood calculated:', mostCommon);
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
            
            console.log('Mood counts:', moodCounts);
            
            let mostCommon = '';
            let maxCount = 0;
            
            for (const [mood, count] of Object.entries(moodCounts)) {
                console.log(`Mood: ${mood}, Count: ${count}`);
                if (count > maxCount) {
                    maxCount = count;
                    mostCommon = mood;
                }
            }
            
            console.log('Most common mood result:', mostCommon, 'with count:', maxCount);
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
                        <div class="student-mood-customization mt-4">
                            <h5 class="text-white mb-4 fw-bold">
                                <i class="bi bi-gear-fill me-2"></i>Customize Workouts by Mood
                            </h5>
                            <div class="mood-customization-grid">
                                <div class="mood-item">
                                    <div class="mood-header">
                                        <button class="btn btn-outline-danger btn-sm" onclick="app.createMoodCustomWorkout(${student.studentId}, 'Stressed', '${student.name}')">
                                            <i class="bi bi-lightning-fill me-1"></i>Stressed
                                        </button>
                                    </div>
                                    <div class="mood-status mt-2">
                                        <span class="status-label">Status:</span>
                                        <button class="btn btn-sm btn-outline-secondary" id="toggle-stressed-${student.studentId}" onclick="app.toggleCustomWorkout(${student.studentId}, 'Stressed', '${student.name}')">
                                            <i class="bi bi-toggle-off me-1"></i>Inactive
                                        </button>
                                    </div>
                                </div>
                                <div class="mood-item">
                                    <div class="mood-header">
                                        <button class="btn btn-outline-success btn-sm" onclick="app.createMoodCustomWorkout(${student.studentId}, 'Calm', '${student.name}')">
                                            <i class="bi bi-heart-fill me-1"></i>Calm
                                        </button>
                                    </div>
                                    <div class="mood-status mt-2">
                                        <span class="status-label">Status:</span>
                                        <button class="btn btn-sm btn-outline-secondary" id="toggle-calm-${student.studentId}" onclick="app.toggleCustomWorkout(${student.studentId}, 'Calm', '${student.name}')">
                                            <i class="bi bi-toggle-off me-1"></i>Inactive
                                        </button>
                                    </div>
                                </div>
                                <div class="mood-item">
                                    <div class="mood-header">
                                        <button class="btn btn-outline-warning btn-sm" onclick="app.createMoodCustomWorkout(${student.studentId}, 'Tired', '${student.name}')">
                                            <i class="bi bi-moon-fill me-1"></i>Tired
                                        </button>
                                    </div>
                                    <div class="mood-status mt-2">
                                        <span class="status-label">Status:</span>
                                        <button class="btn btn-sm btn-outline-secondary" id="toggle-tired-${student.studentId}" onclick="app.toggleCustomWorkout(${student.studentId}, 'Tired', '${student.name}')">
                                            <i class="bi bi-toggle-off me-1"></i>Inactive
                                        </button>
                                    </div>
                                </div>
                                <div class="mood-item">
                                    <div class="mood-header">
                                        <button class="btn btn-outline-info btn-sm" onclick="app.createMoodCustomWorkout(${student.studentId}, 'Excited', '${student.name}')">
                                            <i class="bi bi-star-fill me-1"></i>Excited
                                        </button>
                                    </div>
                                    <div class="mood-status mt-2">
                                        <span class="status-label">Status:</span>
                                        <button class="btn btn-sm btn-outline-secondary" id="toggle-excited-${student.studentId}" onclick="app.toggleCustomWorkout(${student.studentId}, 'Excited', '${student.name}')">
                                            <i class="bi bi-toggle-off me-1"></i>Inactive
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    studentsList.appendChild(studentCard);
                    
                    // Load existing custom workout statuses for this student
                    this.loadCustomWorkoutStatuses(student.studentId);
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
                        <div class="student-mood-customization mt-4">
                            <h5 class="text-white mb-4 fw-bold">
                                <i class="bi bi-gear-fill me-2"></i>Customize Workouts by Mood
                            </h5>
                            <div class="mood-customization-grid">
                                <div class="mood-item">
                                    <div class="mood-header">
                                        <button class="btn btn-outline-danger btn-sm" onclick="app.createMoodCustomWorkout(${student.studentId}, 'Stressed', '${student.name}')">
                                            <i class="bi bi-lightning-fill me-1"></i>Stressed
                                        </button>
                                    </div>
                                    <div class="mood-status mt-2">
                                        <span class="status-label">Status:</span>
                                        <button class="btn btn-sm btn-outline-secondary" id="toggle-stressed-${student.studentId}" onclick="app.toggleCustomWorkout(${student.studentId}, 'Stressed', '${student.name}')">
                                            <i class="bi bi-toggle-off me-1"></i>Inactive
                                        </button>
                                    </div>
                                </div>
                                <div class="mood-item">
                                    <div class="mood-header">
                                        <button class="btn btn-outline-success btn-sm" onclick="app.createMoodCustomWorkout(${student.studentId}, 'Calm', '${student.name}')">
                                            <i class="bi bi-heart-fill me-1"></i>Calm
                                        </button>
                                    </div>
                                    <div class="mood-status mt-2">
                                        <span class="status-label">Status:</span>
                                        <button class="btn btn-sm btn-outline-secondary" id="toggle-calm-${student.studentId}" onclick="app.toggleCustomWorkout(${student.studentId}, 'Calm', '${student.name}')">
                                            <i class="bi bi-toggle-off me-1"></i>Inactive
                                        </button>
                                    </div>
                                </div>
                                <div class="mood-item">
                                    <div class="mood-header">
                                        <button class="btn btn-outline-warning btn-sm" onclick="app.createMoodCustomWorkout(${student.studentId}, 'Tired', '${student.name}')">
                                            <i class="bi bi-moon-fill me-1"></i>Tired
                                        </button>
                                    </div>
                                    <div class="mood-status mt-2">
                                        <span class="status-label">Status:</span>
                                        <button class="btn btn-sm btn-outline-secondary" id="toggle-tired-${student.studentId}" onclick="app.toggleCustomWorkout(${student.studentId}, 'Tired', '${student.name}')">
                                            <i class="bi bi-toggle-off me-1"></i>Inactive
                                        </button>
                                    </div>
                                </div>
                                <div class="mood-item">
                                    <div class="mood-header">
                                        <button class="btn btn-outline-info btn-sm" onclick="app.createMoodCustomWorkout(${student.studentId}, 'Excited', '${student.name}')">
                                            <i class="bi bi-star-fill me-1"></i>Excited
                                        </button>
                                    </div>
                                    <div class="mood-status mt-2">
                                        <span class="status-label">Status:</span>
                                        <button class="btn btn-sm btn-outline-secondary" id="toggle-excited-${student.studentId}" onclick="app.toggleCustomWorkout(${student.studentId}, 'Excited', '${student.name}')">
                                            <i class="bi bi-toggle-off me-1"></i>Inactive
                                        </button>
                                    </div>
                                </div>
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

        // Create custom workout functionality
        createCustomWorkout(workoutId, description, intensityLevel, duration, moodType, studentName, studentId) {
            console.log('Creating custom workout for student:', studentName, 'ID:', studentId);
            
            // Store student ID for later use
            this.currentStudentId = studentId;
            
            // Create custom workout modal
            this.showCustomWorkoutModal(workoutId, description, intensityLevel, duration, moodType, studentName, studentId);
        }

        // Create mood-specific custom workout
        async createMoodCustomWorkout(studentId, moodType, studentName) {
            console.log('Creating custom workout for student:', studentName, 'mood:', moodType);
            
            try {
                // Fetch default workout for this mood type
                const response = await fetch(this.apiBaseUrl + '/workouts/by-mood/' + moodType);
                if (response.ok) {
                    const workouts = await response.json();
                    const defaultWorkout = workouts.length > 0 ? workouts[0] : null;
                    
                    if (defaultWorkout) {
                        console.log('Default workout found:', defaultWorkout);
                        console.log('Default workout description:', defaultWorkout.description);
                        
                        // Store student ID for later use
                        this.currentStudentId = studentId;
                        
                        // Create custom workout modal with default workout data
                        this.showCustomWorkoutModal(
                            defaultWorkout.workoutId,
                            defaultWorkout.description,
                            defaultWorkout.intensityLevel,
                            defaultWorkout.duration,
                            moodType,
                            studentName,
                            studentId
                        );
                    } else {
                        this.showAlert('No default workout found for this mood type.', 'warning');
                    }
                } else {
                    this.showAlert('Failed to load default workout. Please try again.', 'danger');
                }
            } catch (error) {
                console.error('Error fetching default workout:', error);
                this.showAlert('Error loading default workout. Please try again.', 'danger');
            }
        }

        // Toggle custom workout on/off (deactivate when active)
        async toggleCustomWorkout(studentId, moodType, studentName) {
            console.log('Toggling custom workout for student:', studentName, 'mood:', moodType);
            console.log('API Base URL:', this.apiBaseUrl);
            console.log('Coach ID:', this.getCurrentCoachId());
            
            try {
                // Check if custom workout exists
                const response = await fetch(this.apiBaseUrl + '/workouts/custom/coach/' + this.getCurrentCoachId());
                console.log('Fetch response status:', response.status);
                
                if (response.ok) {
                    const customWorkouts = await response.json();
                    console.log('Custom workouts found:', customWorkouts);
                    
                    const existingWorkout = customWorkouts.find(cw => 
                        cw.studentId === studentId && cw.moodType === moodType
                    );
                    
                    console.log('Existing workout found:', existingWorkout);
                    
                    if (existingWorkout) {
                        // Only allow deactivating when it's currently active
                        if (existingWorkout.isActive) {
                            console.log('Deactivating workout:', existingWorkout.customWorkoutId);
                            
                            // Deactivate the workout
                            const toggleResponse = await fetch(this.apiBaseUrl + '/workouts/custom/' + existingWorkout.customWorkoutId + '/toggle', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(false)
                            });
                            
                            console.log('Toggle response status:', toggleResponse.status);
                            
                            if (toggleResponse.ok) {
                                // Update the button display to show "Inactive"
                                this.updateDeactivatedButton(studentId, moodType);
                                
                                this.showAlert(`Custom workout for ${studentName} (${moodType}) has been DEACTIVATED! Customize again to reactivate.`, 'success');
                            } else {
                                const errorText = await toggleResponse.text();
                                console.error('Toggle failed:', errorText);
                                this.showAlert('Failed to deactivate custom workout. Please try again.', 'danger');
                            }
                        } else {
                            // If already deactivated, show message to customize again
                            this.showAlert('Custom workout is deactivated. Please customize again to reactivate.', 'warning');
                        }
                    } else {
                        this.showAlert('No custom workout found. Please create one first.', 'warning');
                    }
                } else {
                    const errorText = await response.text();
                    console.error('Failed to fetch custom workouts:', errorText);
                    this.showAlert('Failed to check custom workouts. Please try again.', 'danger');
                }
            } catch (error) {
                console.error('Error toggling custom workout:', error);
                this.showAlert('Error toggling custom workout. Please try again.', 'danger');
            }
        }

        // Update custom workout status
        async updateCustomWorkoutStatus(customWorkoutId, isActive) {
            // This would require a new API endpoint to update the status
            // For now, we'll show a message that this is a demo
            console.log('Would update custom workout', customWorkoutId, 'to active:', isActive);
            this.showAlert('Toggle functionality is ready! (API endpoint needed for full functionality)', 'info');
        }

        // Update toggle button display
        updateToggleButton(studentId, moodType, isActive) {
            const buttonId = `toggle-${moodType.toLowerCase()}-${studentId}`;
            console.log('Looking for button with ID:', buttonId);
            const button = document.getElementById(buttonId);
            
            if (button) {
                console.log('Found button, updating to active:', isActive);
                if (isActive) {
                    button.className = 'btn btn-sm btn-success';
                    button.innerHTML = '<i class="bi bi-toggle-on me-1"></i>Active';
                } else {
                    button.className = 'btn btn-sm btn-outline-secondary';
                    button.innerHTML = '<i class="bi bi-toggle-off me-1"></i>Inactive';
                }
            } else {
                console.log('Button not found with ID:', buttonId);
                // Try to find all buttons with similar IDs for debugging
                const allButtons = document.querySelectorAll(`[id*="toggle-${moodType.toLowerCase()}"]`);
                console.log('Found similar buttons:', allButtons);
            }
        }

        // Update button to show "Inactive" when deactivated
        updateDeactivatedButton(studentId, moodType) {
            const buttonId = `toggle-${moodType.toLowerCase()}-${studentId}`;
            const button = document.getElementById(buttonId);
            
            if (button) {
                // Change button to show "Inactive" - not clickable for reactivation
                button.className = 'btn btn-sm btn-outline-secondary';
                button.innerHTML = '<i class="bi bi-toggle-off me-1"></i>Inactive';
                
                // Remove onclick handler - user must customize again to reactivate
                button.onclick = null;
            }
        }

        // Get current coach ID
        getCurrentCoachId() {
            const userData = localStorage.getItem('mindfit_user');
            const coach = JSON.parse(userData);
            return coach.coachId || coach.id;
        }

        // Load custom workout statuses for a student
        async loadCustomWorkoutStatuses(studentId) {
            try {
                const response = await fetch(this.apiBaseUrl + '/workouts/custom/coach/' + this.getCurrentCoachId());
                if (response.ok) {
                    const customWorkouts = await response.json();
                    const studentWorkouts = customWorkouts.filter(cw => cw.studentId === studentId);
                    
                    // Update toggle buttons for each mood
                    const moods = ['Stressed', 'Calm', 'Tired', 'Excited'];
                    moods.forEach(mood => {
                        const workout = studentWorkouts.find(cw => cw.moodType === mood);
                        if (workout) {
                            if (workout.isActive) {
                                this.updateToggleButton(studentId, mood, true);
                            } else {
                                // If deactivated, show "Inactive" button
                                this.updateDeactivatedButton(studentId, mood);
                            }
                        }
                    });
                }
            } catch (error) {
                console.error('Error loading custom workout statuses:', error);
            }
        }

        // Show custom workout modal
        showCustomWorkoutModal(workoutId, description, intensityLevel, duration, moodType, studentName, studentId) {
            // Create modal HTML
            const modalHTML = `
                <div class="modal fade" id="editWorkoutModal" tabindex="-1" aria-labelledby="editWorkoutModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="editWorkoutModalLabel">
                                    <i class="bi bi-pencil me-2"></i>Create Custom Workout for ${studentName}
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <form id="editWorkoutForm">
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="editMoodType" class="form-label">Mood Type</label>
                                            <select class="form-select" id="editMoodType" required>
                                                <option value="Stressed" ${moodType === 'Stressed' ? 'selected' : ''}>Stressed</option>
                                                <option value="Tired" ${moodType === 'Tired' ? 'selected' : ''}>Tired</option>
                                                <option value="Calm" ${moodType === 'Calm' ? 'selected' : ''}>Calm</option>
                                                <option value="Excited" ${moodType === 'Excited' ? 'selected' : ''}>Excited</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label for="editIntensityLevel" class="form-label">Intensity Level</label>
                                            <select class="form-select" id="editIntensityLevel" required>
                                                <option value="Low" ${intensityLevel === 'Low' ? 'selected' : ''}>Low</option>
                                                <option value="Medium" ${intensityLevel === 'Medium' ? 'selected' : ''}>Medium</option>
                                                <option value="High" ${intensityLevel === 'High' ? 'selected' : ''}>High</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="editDuration" class="form-label">Duration (minutes)</label>
                                            <input type="number" class="form-control" id="editDuration" value="${parseInt(duration.toString().replace(/\D/g, ''))}" min="5" max="120" required>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label for="editWorkoutId" class="form-label">Workout ID</label>
                                            <input type="text" class="form-control" id="editWorkoutId" value="${workoutId}" readonly>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="editDescription" class="form-label">Workout Description</label>
                                        <textarea class="form-control" id="editDescription" rows="6" required>${description}</textarea>
                                        <div class="form-text">This will create a custom workout for ${studentName}. The original default workout will remain unchanged for other students.</div>
                                    </div>
                                     <div class="mb-3">
                                         <div class="form-check form-switch">
                                             <input class="form-check-input" type="checkbox" id="editIsActive">
                                             <label class="form-check-label" for="editIsActive">
                                                 <strong>Active</strong> - Student will get this custom workout when logging ${moodType} mood
                                             </label>
                                         </div>
                                         <div class="form-text">Toggle ON to activate custom workout, OFF to use default workout</div>
                                     </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-warning" onclick="app.saveCustomWorkout()">
                                    <i class="bi bi-save me-1"></i>Create Custom Workout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Remove existing modal if any
            const existingModal = document.getElementById('editWorkoutModal');
            if (existingModal) {
                existingModal.remove();
            }

            // Add modal to body
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('editWorkoutModal'));
            modal.show();

            // Clean up modal when hidden
            document.getElementById('editWorkoutModal').addEventListener('hidden.bs.modal', function() {
                this.remove();
            });
        }

        // Save custom workout with toggle state
        async saveCustomWorkout() {
            const workoutId = document.getElementById('editWorkoutId').value;
            const moodType = document.getElementById('editMoodType').value;
            const intensityLevel = document.getElementById('editIntensityLevel').value;
            const duration = document.getElementById('editDuration').value;
            const description = document.getElementById('editDescription').value;
            const isActive = document.getElementById('editIsActive').checked;

            try {
                // Get current user (coach) data
                const userData = localStorage.getItem('mindfit_user');
                const coach = JSON.parse(userData);
                
                // Get student ID from the modal (we need to pass this when creating the modal)
                const studentId = this.currentStudentId; // This should be set when modal opens

                // Parse duration as integer
                const durationNumber = parseInt(duration);
                
                const customWorkoutData = {
                    studentId: studentId,
                    moodType: moodType,
                    intensityLevel: intensityLevel,
                    duration: durationNumber,
                    description: description,
                    isActive: isActive,
                    createdBy: coach.coachId || coach.id
                };

                console.log('Creating custom workout:', customWorkoutData);

                // Make API call to save custom workout
                const response = await fetch(this.apiBaseUrl + '/workouts/custom', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(customWorkoutData)
                });

                if (response.ok) {
                    const statusText = isActive ? 'ACTIVE' : 'INACTIVE';
                    const behaviorText = isActive ? 'Student will get this custom workout' : 'Student will get the default workout';
                    this.showAlert(`Custom workout created and set to ${statusText}! ${behaviorText} when logging ${moodType} mood.`, 'success');
                    
                    // Update the toggle button display
                    this.updateToggleButton(studentId, moodType, isActive);
                    
                    // Close modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('editWorkoutModal'));
                    modal.hide();
                } else {
                    throw new Error('Failed to create custom workout');
                }

            } catch (error) {
                console.error('Error creating custom workout:', error);
                this.showAlert('Error creating custom workout. Please try again.', 'danger');
            }
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
            let apiEndpoint;
            if (userType === 'student') {
                apiEndpoint = 'students';
            } else if (userType === 'coach') {
                apiEndpoint = 'coaches';
            } else if (userType === 'admin') {
                apiEndpoint = 'admin';
            }
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
                    let userId;
                    if (userType === 'student') {
                        userId = user.studentId;
                    } else if (userType === 'coach') {
                        userId = user.coachId;
                    } else if (userType === 'admin') {
                        userId = user.adminId;
                    }

                    localStorage.setItem('mindfit_user', JSON.stringify({
                        id: userId,
                        name: user.name || 'Admin', // Admin might not have name field
                        email: user.email,
                        type: userType
                    }));

                    // Clear any previous mood data for new user session
                    localStorage.removeItem('currentMoodType');

                    this.showAlert(`Welcome back, ${user.name || 'Admin'}!`, 'success');
                    
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
               console.log('updateLoginUI called with:', userName, userType);
               console.log('updateLoginUI - userType is admin:', userType === 'admin');
               
               // Wait for elements to be available
               const maxRetries = 10;
               let retries = 0;
               
               const tryUpdateUI = () => {
                   const loginButton = document.getElementById('loginButton');
                   const userDropdown = document.getElementById('userDropdown');
                   const userDisplayName = document.getElementById('userDisplayName');
                   const userEmail = document.getElementById('userEmail');
                   
                   console.log('UI elements found (attempt', retries + 1, '):', {
                       loginButton: !!loginButton,
                       userDropdown: !!userDropdown,
                       userDisplayName: !!userDisplayName,
                       userEmail: !!userEmail
                   });
                   
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
                       console.log('updateLoginUI completed successfully');
                   } else if (retries < maxRetries) {
                       retries++;
                       console.log('UI elements not ready, retrying in 50ms...');
                       setTimeout(tryUpdateUI, 50);
                   } else {
                       console.error('Failed to find UI elements after', maxRetries, 'attempts');
                   }
               };
               
               tryUpdateUI();
           }

           updateNavigationForUserType(userType) {
               const publicNav = document.getElementById('publicNav');
               const studentNav = document.getElementById('studentNav');
               const coachNav = document.getElementById('coachNav');
               const adminNav = document.getElementById('adminNav');
               
               if (userType === 'student') {
                   // Hide public navigation, show student navigation
                   if (publicNav) publicNav.style.display = 'none';
                   if (studentNav) studentNav.style.display = 'flex';
                   if (coachNav) coachNav.style.display = 'none';
                   if (adminNav) adminNav.style.display = 'none';
                   
                   // Set active nav item
                   this.updateActiveNav(document.querySelector('#studentNav a[href="#choose-coach"]'));
               } else if (userType === 'coach') {
                   // Hide public navigation, show coach navigation
                   if (publicNav) publicNav.style.display = 'none';
                   if (studentNav) studentNav.style.display = 'none';
                   if (coachNav) coachNav.style.display = 'flex';
                   if (adminNav) adminNav.style.display = 'none';
                   
                   // Set active nav item and navigate to view-students page
                   this.updateActiveNav(document.querySelector('#coachNav a[href="#view-students"]'));
                   this.showPage('view-students');
               } else if (userType === 'admin') {
                   // Hide public navigation, show admin navigation
                   if (publicNav) publicNav.style.display = 'none';
                   if (studentNav) studentNav.style.display = 'none';
                   if (coachNav) coachNav.style.display = 'none';
                   if (adminNav) {
                       adminNav.style.display = 'flex';
                       console.log('Admin navigation shown');
                   } else {
                       console.error('Admin navigation element not found');
                   }
                   
                   // Set active nav item and navigate to admin dashboard
                   this.updateActiveNav(document.querySelector('#adminNav a[href="#admin-dashboard"]'));
                   this.showPage('admin-dashboard');
               } else {
                   // Show public navigation, hide all user navigation
                   if (publicNav) publicNav.style.display = 'flex';
                   if (studentNav) studentNav.style.display = 'none';
                   if (coachNav) coachNav.style.display = 'none';
                   if (adminNav) adminNav.style.display = 'none';
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
        console.log('Checking for existing login...');
        const userData = localStorage.getItem('mindfit_user');
        console.log('Raw user data from localStorage:', userData);
        
        if (userData) {
            try {
                const user = JSON.parse(userData);
                console.log('Parsed user data:', user);
                
                // Validate user data structure
                if (!user.name || !user.type || !user.id) {
                    console.error('Invalid user data structure:', user);
                    localStorage.removeItem('mindfit_user');
                    return;
                }
                
                console.log('Found existing login for user:', user.name, 'type:', user.type, 'id:', user.id);
                
                // Wait for DOM to be ready before updating UI
                setTimeout(() => {
                    console.log('Updating login UI for admin user...');
                    this.updateLoginUI(user.name, user.type);
                }, 100); // Small delay to ensure DOM is ready
                
            } catch (error) {
                console.error('Error parsing user data:', error);
                console.error('Raw data that failed to parse:', userData);
                localStorage.removeItem('mindfit_user');
            }
        } else {
            console.log('No existing login found');
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

    // Earnings functionality
    window.app.loadEarnings = async function() {
        try {
            const userData = localStorage.getItem('mindfit_user');
            if (!userData) {
                this.showAlert('Please log in first.', 'warning');
                return;
            }

            const user = JSON.parse(userData);
            if (user.type !== 'coach') {
                this.showAlert('Only coaches can view earnings.', 'warning');
                return;
            }

            // Load coach's payments
            console.log('Loading earnings for coach ID:', user.id);
            const response = await fetch(this.apiBaseUrl + '/payment/coach/' + user.id);
            if (response.ok) {
                const payments = await response.json();
                console.log('Payments for coach', user.id, ':', payments);
                this.displayEarnings(payments);
            } else {
                console.error('Failed to fetch payments:', response.status);
                this.showAlert('Failed to load earnings data.', 'danger');
            }
        } catch (error) {
            console.error('Error loading earnings:', error);
            this.showAlert('Failed to load earnings data.', 'danger');
        }
    };

    window.app.displayEarnings = function(payments) {
        // Calculate totals
        const totalEarnings = payments.reduce((sum, payment) => sum + parseFloat(payment.coachEarnings), 0);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyEarnings = payments
            .filter(payment => {
                const paymentDate = new Date(payment.paymentDate);
                return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
            })
            .reduce((sum, payment) => sum + parseFloat(payment.coachEarnings), 0);

        // Update stats
        document.getElementById('totalEarnings').textContent = `$${totalEarnings.toFixed(2)}`;
        document.getElementById('monthlyEarnings').textContent = `$${monthlyEarnings.toFixed(2)}`;

        // Create charts
        this.createEarningsChart(payments);
        this.createMonthlyChart(payments);
        this.displayRecentPayments(payments);
    };

    window.app.createEarningsChart = function(payments) {
        const ctx = document.getElementById('earningsChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (window.earningsChart && typeof window.earningsChart.destroy === 'function') {
            window.earningsChart.destroy();
        }
        
        // Group payments by month
        const monthlyData = {};
        payments.forEach(payment => {
            const date = new Date(payment.paymentDate);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = 0;
            }
            monthlyData[monthKey] += parseFloat(payment.coachEarnings);
        });

        const labels = Object.keys(monthlyData).sort();
        const data = labels.map(label => monthlyData[label]);

        window.earningsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Earnings',
                    data: data,
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                layout: {
                    padding: {
                        left: 20,
                        right: 20,
                        top: 20,
                        bottom: 20
                    }
                },
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
                            color: 'white',
                            padding: 15
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: 'white',
                            padding: 15,
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    };

    window.app.createMonthlyChart = function(payments) {
        const ctx = document.getElementById('monthlyChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (window.monthlyChart && typeof window.monthlyChart.destroy === 'function') {
            window.monthlyChart.destroy();
        }
        
        // Get last 6 months
        const months = [];
        const data = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });
            
            months.push(monthName);
            
            const monthEarnings = payments
                .filter(payment => {
                    const paymentDate = new Date(payment.paymentDate);
                    const paymentMonth = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
                    return paymentMonth === monthKey;
                })
                .reduce((sum, payment) => sum + parseFloat(payment.coachEarnings), 0);
            
            data.push(monthEarnings);
        }

        window.monthlyChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: months,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#6366f1',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#8b5cf6',
                        '#06b6d4'
                    ]
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
    };

    window.app.displayRecentPayments = function(payments) {
        const paymentsList = document.getElementById('paymentsList');
        
        if (payments.length === 0) {
            paymentsList.innerHTML = `
                <div class="text-center text-white-50">
                    <i class="bi bi-wallet2 fs-1 mb-3"></i>
                    <p>No payments received yet</p>
                </div>
            `;
            return;
        }

        // Sort by date (most recent first)
        const sortedPayments = payments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
        
        // Show only last 5 payments
        const recentPayments = sortedPayments.slice(0, 5);
        
        paymentsList.innerHTML = recentPayments.map(payment => `
            <div class="payment-item">
                <div class="payment-header">
                    <div class="payment-amount">$${parseFloat(payment.coachEarnings).toFixed(2)}</div>
                    <div class="payment-date">${new Date(payment.paymentDate).toLocaleDateString()}</div>
                </div>
                <div class="payment-details">
                    <div class="payment-student">Student Payment</div>
                    <small>From: ${payment.cardholderName}</small>
                </div>
            </div>
        `).join('');
    };

    // Rate Coach functionality
    window.app.loadRateCoachPage = async function() {
        try {
            const userData = localStorage.getItem('mindfit_user');
            if (!userData) {
                this.showAlert('Please log in first.', 'warning');
                return;
            }

            const user = JSON.parse(userData);
            if (user.type !== 'student') {
                this.showAlert('Only students can rate coaches.', 'warning');
                return;
            }

            // Get student's coach
            const studentResponse = await fetch(this.apiBaseUrl + '/students/' + user.id);
            if (!studentResponse.ok) {
                this.showAlert('Failed to load student data.', 'danger');
                return;
            }

            const student = await studentResponse.json();
            
            if (!student.coachId) {
                // No coach selected
                document.getElementById('coachInfoCard').style.display = 'none';
                document.getElementById('ratingFormCard').style.display = 'none';
                document.getElementById('alreadyRatedCard').style.display = 'none';
                document.getElementById('noCoachCard').style.display = 'block';
                return;
            }

            // Get coach info
            const coachResponse = await fetch(this.apiBaseUrl + '/coaches/' + student.coachId);
            if (!coachResponse.ok) {
                this.showAlert('Failed to load coach data.', 'danger');
                return;
            }

            const coach = await coachResponse.json();
            
            // Display coach info
            document.getElementById('coachInfoCard').innerHTML = `
                <div class="text-center">
                    <div class="coach-avatar mb-3">
                        <i class="bi bi-person-fill fs-1"></i>
                    </div>
                    <h3 class="coach-name text-white">${coach.name}</h3>
                    <p class="coach-experience text-white-50">${coach.yearsOfExperience} years of experience</p>
                </div>
            `;

            // Check if student has already rated this coach
            const ratingResponse = await fetch(this.apiBaseUrl + `/coach-ratings/student/${user.id}/coach/${student.coachId}`);
            
            if (ratingResponse.ok) {
                const existingRating = await ratingResponse.json();
                // Already rated
                document.getElementById('coachInfoCard').style.display = 'block';
                document.getElementById('ratingFormCard').style.display = 'none';
                document.getElementById('alreadyRatedCard').style.display = 'block';
                document.getElementById('noCoachCard').style.display = 'none';
                
                // Display current rating
                this.displayCurrentRating(existingRating.rating);
            } else {
                // Not rated yet
                document.getElementById('coachInfoCard').style.display = 'block';
                document.getElementById('ratingFormCard').style.display = 'block';
                document.getElementById('alreadyRatedCard').style.display = 'none';
                document.getElementById('noCoachCard').style.display = 'none';
                
                // Initialize star rating
                this.initializeStarRating();
            }

        } catch (error) {
            console.error('Error loading rate coach page:', error);
            this.showAlert('Failed to load rate coach page.', 'danger');
        }
    };

    window.app.initializeStarRating = function() {
        const stars = document.querySelectorAll('#starRating .star');
        let selectedRating = 0;

        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                selectedRating = index + 1;
                this.updateStarDisplay(selectedRating);
                this.updateRatingText(selectedRating);
            });

            star.addEventListener('mouseenter', () => {
                this.highlightStars(index + 1);
            });
        });

        document.getElementById('starRating').addEventListener('mouseleave', () => {
            this.highlightStars(selectedRating);
        });
    };

    window.app.updateStarDisplay = function(rating) {
        const stars = document.querySelectorAll('#starRating .star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    };

    window.app.highlightStars = function(rating) {
        const stars = document.querySelectorAll('#starRating .star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.style.color = '#fbbf24';
            } else {
                star.style.color = 'rgba(255, 255, 255, 0.3)';
            }
        });
    };

    window.app.updateRatingText = function(rating) {
        const ratingTexts = [
            '', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'
        ];
        document.getElementById('ratingText').textContent = ratingTexts[rating] || 'Click a star to rate';
    };

    window.app.displayCurrentRating = function(rating) {
        const currentRatingDiv = document.getElementById('currentRating');
        currentRatingDiv.innerHTML = `
            <div class="stars">
                ${Array.from({length: 5}, (_, i) => 
                    `<i class="bi bi-star star ${i < rating ? 'active' : ''}" data-rating="${i + 1}"></i>`
                ).join('')}
            </div>
            <p class="rating-text mt-2">Your rating: ${rating}/5 stars</p>
        `;
    };

    window.app.submitCoachRating = async function(coachId) {
        try {
            // Get selected rating from dropdown
            const ratingSelect = document.getElementById(`ratingSelect${coachId}`);
            const rating = parseInt(ratingSelect.value);
            
            if (!rating || rating < 1 || rating > 5) {
                this.showAlert('Please select a valid rating.', 'warning');
                return;
            }

            // Submit rating using simple endpoint
            const response = await fetch(this.apiBaseUrl + `/coaches/${coachId}/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(rating)
            });

            if (response.ok) {
                this.showAlert('Thank you for your feedback!', 'success');
                // Disable the dropdown to show it was submitted
                ratingSelect.disabled = true;
                ratingSelect.style.backgroundColor = '#e9ecef';
            } else {
                this.showAlert('Failed to submit rating. Please try again.', 'danger');
            }

        } catch (error) {
            console.error('Error submitting coach rating:', error);
            this.showAlert('Failed to submit rating. Please try again.', 'danger');
        }
    };

    // My Ratings functionality for coaches
    window.app.loadMyRatings = async function() {
        try {
            const userData = localStorage.getItem('mindfit_user');
            if (!userData) {
                this.showAlert('Please log in first.', 'warning');
                return;
            }

            const user = JSON.parse(userData);
            if (user.type !== 'coach') {
                this.showAlert('Only coaches can view ratings.', 'warning');
                return;
            }

            console.log('Loading ratings for coach ID:', user.id);
            
            // Load coach's ratings
            const response = await fetch(this.apiBaseUrl + '/coachratings/coach/' + user.id);
            if (response.ok) {
                const ratings = await response.json();
                console.log('Ratings for coach', user.id, ':', ratings);
                this.displayMyRatings(ratings);
            } else {
                console.error('Failed to fetch ratings:', response.status);
                this.showAlert('Failed to load ratings data.', 'danger');
            }
        } catch (error) {
            console.error('Error loading ratings:', error);
            this.showAlert('Failed to load ratings data.', 'danger');
        }
    };

    window.app.displayMyRatings = function(ratings) {
        // Calculate statistics
        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0 ? 
            (ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings).toFixed(1) : 0;
        const topRating = totalRatings > 0 ? Math.max(...ratings.map(r => r.rating)) : 0;

        // Update stats cards
        document.getElementById('averageRating').textContent = averageRating;
        document.getElementById('totalRatings').textContent = totalRatings;
        document.getElementById('topRating').textContent = topRating;

        // Display ratings list
        const ratingsList = document.getElementById('ratingsList');
        
        if (totalRatings === 0) {
            ratingsList.innerHTML = `
                <div class="no-ratings">
                    <i class="bi bi-star"></i>
                    <h5>No ratings yet</h5>
                    <p>Students haven't rated you yet. Keep helping them and ratings will come!</p>
                </div>
            `;
            return;
        }

        // Sort ratings by date (newest first)
        const sortedRatings = ratings.sort((a, b) => new Date(b.ratingDate) - new Date(a.ratingDate));

        ratingsList.innerHTML = sortedRatings.map(rating => {
            const ratingDate = new Date(rating.ratingDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            return `
                <div class="rating-item">
                    <div class="rating-item-header">
                        <div class="rating-date">
                            ${ratingDate}
                        </div>
                    </div>
                    <div class="rating-content">
                        <div class="rating-number-display">
                            <span class="rating-value">${rating.rating}</span>
                            <span class="rating-out-of">/5</span>
                        </div>
                        ${rating.review ? `<p class="rating-review">"${rating.review}"</p>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    };

    // Admin Dashboard Functions
    window.app.loadAdminDashboard = async function() {
        try {
            // Load mood statistics and chart
            await this.loadMoodStats();
            await this.loadMoodsChart();
            
        } catch (error) {
            console.error('Error loading admin dashboard:', error);
            this.showAlert('Failed to load admin dashboard.', 'danger');
        }
    };

    window.app.loadAdminStudents = async function() {
        try {
            // Load students list and stats
            await this.loadStudentsList();
            await this.loadStudentsStats();
            
        } catch (error) {
            console.error('Error loading admin students:', error);
            this.showAlert('Failed to load students data.', 'danger');
        }
    };

    window.app.loadAdminProfit = async function() {
        try {
            // Load financial statistics and charts
            await this.loadFinancialStats();
            await this.loadRevenueChart();
            await this.loadRevenueDistributionChart();
            await this.loadRecentPayments();
            
        } catch (error) {
            console.error('Error loading admin profit:', error);
            this.showAlert('Failed to load financial data.', 'danger');
        }
    };

    window.app.loadAdminCoachRatings = async function() {
        try {
            console.log('Loading admin coach ratings...');
            
            // Load coach ratings statistics and list
            await this.loadCoachRatingsStats();
            await this.loadCoachRatingsList();
            
        } catch (error) {
            console.error('Error loading admin coach ratings:', error);
            this.showAlert('Failed to load coach ratings data.', 'danger');
        }
    };

    window.app.loadCoachRatingsStats = async function() {
        try {
            // Get all coaches
            const coachesResponse = await fetch(this.apiBaseUrl + '/coaches');
            if (!coachesResponse.ok) {
                throw new Error('Failed to fetch coaches');
            }
            const coaches = await coachesResponse.json();
            
            // Get all coach ratings
            const ratingsResponse = await fetch(this.apiBaseUrl + '/coachratings');
            if (!ratingsResponse.ok) {
                throw new Error('Failed to fetch coach ratings');
            }
            const allRatings = await ratingsResponse.json();
            
            // Calculate statistics
            const totalRatings = allRatings.length;
            const averageRating = totalRatings > 0 ? 
                (allRatings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings).toFixed(1) : 0;
            const topRating = totalRatings > 0 ? Math.max(...allRatings.map(r => r.rating)) : 0;
            
            // Update stats cards
            document.getElementById('totalCoachRatings').textContent = totalRatings;
            document.getElementById('averageCoachRating').textContent = averageRating;
            document.getElementById('topRatedCoach').textContent = topRating;
            
            console.log('Coach ratings stats loaded:', { totalRatings, averageRating, topRating });
            
        } catch (error) {
            console.error('Error loading coach ratings stats:', error);
            // Set default values on error
            document.getElementById('totalCoachRatings').textContent = '0';
            document.getElementById('averageCoachRating').textContent = '0.0';
            document.getElementById('topRatedCoach').textContent = '0';
        }
    };

    window.app.loadCoachRatingsList = async function() {
        try {
            // Get all coaches
            const coachesResponse = await fetch(this.apiBaseUrl + '/coaches');
            if (!coachesResponse.ok) {
                throw new Error('Failed to fetch coaches');
            }
            const coaches = await coachesResponse.json();
            
            // Get all coach ratings
            const ratingsResponse = await fetch(this.apiBaseUrl + '/coachratings');
            if (!ratingsResponse.ok) {
                throw new Error('Failed to fetch coach ratings');
            }
            const allRatings = await ratingsResponse.json();
            
            // Calculate ratings for each coach
            const coachRatings = coaches.map(coach => {
                const coachRatingsList = allRatings.filter(rating => rating.coachId === coach.coachId);
                const averageRating = coachRatingsList.length > 0 ? 
                    (coachRatingsList.reduce((sum, rating) => sum + rating.rating, 0) / coachRatingsList.length).toFixed(1) : 0;
                const totalRatings = coachRatingsList.length;
                const highestRating = coachRatingsList.length > 0 ? Math.max(...coachRatingsList.map(r => r.rating)) : 0;
                
                return {
                    ...coach,
                    averageRating: parseFloat(averageRating),
                    totalRatings,
                    highestRating
                };
            });
            
            // Sort by average rating (highest first)
            coachRatings.sort((a, b) => b.averageRating - a.averageRating);
            
            // Display coach ratings list
            this.displayCoachRatingsList(coachRatings);
            
        } catch (error) {
            console.error('Error loading coach ratings list:', error);
            const coachRatingsList = document.getElementById('coachRatingsList');
            coachRatingsList.innerHTML = `
                <div class="no-coach-ratings">
                    <i class="bi bi-exclamation-triangle"></i>
                    <h5>Error Loading Ratings</h5>
                    <p>Failed to load coach ratings. Please try again.</p>
                </div>
            `;
        }
    };

    window.app.displayCoachRatingsList = function(coachRatings) {
        const coachRatingsList = document.getElementById('coachRatingsList');
        
        if (coachRatings.length === 0) {
            coachRatingsList.innerHTML = `
                <div class="no-coach-ratings">
                    <i class="bi bi-star"></i>
                    <h5>No Coaches Found</h5>
                    <p>No coaches are available in the system.</p>
                </div>
            `;
            return;
        }
        
        coachRatingsList.innerHTML = coachRatings.map(coach => {
            const hasRatings = coach.totalRatings > 0;
            
            return `
                <div class="coach-rating-card">
                    <div class="coach-rating-header">
                        <h5 class="coach-name">${coach.name}</h5>
                        <div class="coach-rating-display">
                            <span class="coach-rating-number">${coach.averageRating}</span>
                            <span class="coach-rating-out-of">/5</span>
                        </div>
                    </div>
                    <div class="coach-rating-stats">
                        <div class="coach-stat">
                            <p class="coach-stat-number">${coach.totalRatings}</p>
                            <p class="coach-stat-label">Total Ratings</p>
                        </div>
                        <div class="coach-stat">
                            <p class="coach-stat-number">${coach.highestRating}</p>
                            <p class="coach-stat-label">Highest Rating</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    };

    window.app.loadAdminStats = async function() {
        try {
            console.log('Loading admin stats...');
            
            // Get total students
            const studentsResponse = await fetch(this.apiBaseUrl + '/students');
            if (studentsResponse.ok) {
                const students = await studentsResponse.json();
                document.getElementById('totalStudents').textContent = students.length;
                console.log('Total students:', students.length);
            } else {
                console.error('Failed to fetch students:', studentsResponse.status);
                document.getElementById('totalStudents').textContent = '0';
            }

            // Get total coaches
            const coachesResponse = await fetch(this.apiBaseUrl + '/coaches');
            if (coachesResponse.ok) {
                const coaches = await coachesResponse.json();
                document.getElementById('totalCoaches').textContent = coaches.length;
                console.log('Total coaches:', coaches.length);
            } else {
                console.error('Failed to fetch coaches:', coachesResponse.status);
                document.getElementById('totalCoaches').textContent = '0';
            }

            // Get total moods
            const moodsResponse = await fetch(this.apiBaseUrl + '/moods');
            if (moodsResponse.ok) {
                const moods = await moodsResponse.json();
                document.getElementById('totalMoods').textContent = moods.length;
                console.log('Total moods:', moods.length);
            } else {
                console.error('Failed to fetch moods:', moodsResponse.status);
                document.getElementById('totalMoods').textContent = '0';
            }

        } catch (error) {
            console.error('Error loading admin stats:', error);
            // Set default values on error
            document.getElementById('totalStudents').textContent = '0';
            document.getElementById('totalCoaches').textContent = '0';
            document.getElementById('totalMoods').textContent = '0';
        }
    };

    window.app.loadStudentsList = async function() {
        try {
            console.log('Loading students list...');
            
            // Fetch both students and coaches data
            const [studentsResponse, coachesResponse] = await Promise.all([
                fetch(`${this.apiBaseUrl}/students`),
                fetch(`${this.apiBaseUrl}/coaches`)
            ]);
            
            if (!studentsResponse.ok || !coachesResponse.ok) {
                throw new Error(`HTTP error! Students: ${studentsResponse.status}, Coaches: ${coachesResponse.status}`);
            }
            
            const students = await studentsResponse.json();
            const coaches = await coachesResponse.json();
            console.log('Students data:', students);
            console.log('Coaches data:', coaches);
            
            // Create a map of coach IDs to coach names
            const coachMap = {};
            coaches.forEach(coach => {
                coachMap[coach.coachId] = coach.name;
            });
            
            const studentsListContainer = document.getElementById('adminStudentsList');
            if (!studentsListContainer) {
                console.error('Admin students list container not found');
                return;
            }
            
            if (students.length === 0) {
                studentsListContainer.innerHTML = '<p class="text-center text-white-50">No students found</p>';
                return;
            }
            
            // Create students list HTML
            const studentsHTML = students.map(student => {
                const firstLetter = student.name ? student.name.charAt(0).toUpperCase() : 'S';
                const coachName = student.coachId ? (coachMap[student.coachId] || `Coach #${student.coachId}`) : 'None';
                return `
                    <div class="student-item">
                        <div class="student-avatar">
                            ${firstLetter}
                        </div>
                        <div class="student-info">
                            <div class="student-name">${student.name || 'Unknown'}</div>
                            <div class="student-email">${student.email || 'No email'}</div>
                        </div>
                        <div class="student-stats">
                            <div>ID: ${student.studentId}</div>
                            <div>Coach: ${coachName}</div>
                        </div>
                    </div>
                `;
            }).join('');
            
            studentsListContainer.innerHTML = studentsHTML;
            
        } catch (error) {
            console.error('Error loading students list:', error);
            const studentsListContainer = document.getElementById('adminStudentsList');
            if (studentsListContainer) {
                studentsListContainer.innerHTML = '<p class="text-center text-danger">Failed to load students</p>';
            }
        }
    };

    window.app.loadStudentsStats = async function() {
        try {
            console.log('Loading students stats...');
            
            const response = await fetch(`${this.apiBaseUrl}/students`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const students = await response.json();
            console.log('Students data for stats:', students);
            
            // Calculate stats
            const totalStudents = students.length;
            const assignedStudents = students.filter(student => student.coachId !== null).length;
            const unassignedStudents = totalStudents - assignedStudents;
            const assignmentRate = totalStudents > 0 ? Math.round((assignedStudents / totalStudents) * 100) : 0;
            
            // Update stats display
            const totalStudentsCount = document.getElementById('totalStudentsCount');
            const assignedStudentsCount = document.getElementById('assignedStudentsCount');
            const unassignedStudentsCount = document.getElementById('unassignedStudentsCount');
            const assignmentRateElement = document.getElementById('assignmentRate');
            
            if (totalStudentsCount) totalStudentsCount.textContent = totalStudents;
            if (assignedStudentsCount) assignedStudentsCount.textContent = assignedStudents;
            if (unassignedStudentsCount) unassignedStudentsCount.textContent = unassignedStudents;
            if (assignmentRateElement) assignmentRateElement.textContent = assignmentRate + '%';
            
            console.log('Students stats updated:', {
                total: totalStudents,
                assigned: assignedStudents,
                unassigned: unassignedStudents,
                assignmentRate: assignmentRate + '%'
            });
            
        } catch (error) {
            console.error('Error loading students stats:', error);
            // Set default values on error
            const totalStudentsCount = document.getElementById('totalStudentsCount');
            const assignedStudentsCount = document.getElementById('assignedStudentsCount');
            const unassignedStudentsCount = document.getElementById('unassignedStudentsCount');
            const assignmentRateElement = document.getElementById('assignmentRate');
            
            if (totalStudentsCount) totalStudentsCount.textContent = '0';
            if (assignedStudentsCount) assignedStudentsCount.textContent = '0';
            if (unassignedStudentsCount) unassignedStudentsCount.textContent = '0';
            if (assignmentRateElement) assignmentRateElement.textContent = '0%';
        }
    };

    window.app.loadMoodStats = async function() {
        try {
            console.log('Loading mood statistics...');
            const response = await fetch(this.apiBaseUrl + '/moods');
            
            if (!response.ok) {
                console.error('Failed to fetch moods for stats:', response.status);
                return;
            }
            
            const moods = await response.json();
            console.log('Moods data for stats:', moods);
            
            // Count moods by type
            const moodCounts = {};
            moods.forEach(mood => {
                moodCounts[mood.moodType] = (moodCounts[mood.moodType] || 0) + 1;
            });

            console.log('Mood counts:', moodCounts);

            // Calculate statistics
            const totalMoods = moods.length;
            const mostChosenMood = Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b, '');
            const mostChosenCount = moodCounts[mostChosenMood] || 0;
            const mostChosenPercentage = totalMoods > 0 ? Math.round((mostChosenCount / totalMoods) * 100) : 0;

            // Update stats display
            const totalMoodsCount = document.getElementById('totalMoodsCount');
            const mostChosenMoodElement = document.getElementById('mostChosenMood');
            const moodCountElement = document.getElementById('moodCount');
            const moodPercentageElement = document.getElementById('moodPercentage');

            if (totalMoodsCount) totalMoodsCount.textContent = totalMoods;
            if (mostChosenMoodElement) mostChosenMoodElement.textContent = mostChosenMood;
            if (moodCountElement) moodCountElement.textContent = mostChosenCount;
            if (moodPercentageElement) moodPercentageElement.textContent = mostChosenPercentage + '%';

            console.log('Mood stats updated:', {
                total: totalMoods,
                mostChosen: mostChosenMood,
                count: mostChosenCount,
                percentage: mostChosenPercentage + '%'
            });

        } catch (error) {
            console.error('Error loading mood stats:', error);
            // Set default values on error
            const totalMoodsCount = document.getElementById('totalMoodsCount');
            const mostChosenMoodElement = document.getElementById('mostChosenMood');
            const moodCountElement = document.getElementById('moodCount');
            const moodPercentageElement = document.getElementById('moodPercentage');

            if (totalMoodsCount) totalMoodsCount.textContent = '0';
            if (mostChosenMoodElement) mostChosenMoodElement.textContent = '-';
            if (moodCountElement) moodCountElement.textContent = '0';
            if (moodPercentageElement) moodPercentageElement.textContent = '0%';
        }
    };

    window.app.loadMoodsChart = async function() {
        try {
            console.log('Loading moods chart...');
            const response = await fetch(this.apiBaseUrl + '/moods');
            
            if (!response.ok) {
                console.error('Failed to fetch moods for chart:', response.status);
                return;
            }
            
            const moods = await response.json();
            console.log('Moods data for chart:', moods);
            
            // Count moods by type
            const moodCounts = {};
            moods.forEach(mood => {
                moodCounts[mood.moodType] = (moodCounts[mood.moodType] || 0) + 1;
            });

            console.log('Mood counts:', moodCounts);

            // Destroy existing chart if it exists
            if (window.moodsChart && typeof window.moodsChart.destroy === 'function') {
                window.moodsChart.destroy();
            }

            const ctx = document.getElementById('moodsChart').getContext('2d');
            window.moodsChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(moodCounts),
                    datasets: [{
                        data: Object.values(moodCounts),
                        backgroundColor: [
                            '#ff6384',
                            '#36a2eb',
                            '#ffce56',
                            '#4bc0c0',
                            '#9966ff'
                        ]
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

        } catch (error) {
            console.error('Error loading moods chart:', error);
        }
    };

    // Admin Profit Functions
    window.app.loadFinancialStats = async function() {
        try {
            console.log('Loading financial statistics...');
            const response = await fetch(`${this.apiBaseUrl}/payment`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const payments = await response.json();
            console.log('Payments data:', payments);
            
            // Calculate financial statistics
            const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
            const totalAdminFees = payments.reduce((sum, payment) => sum + payment.adminFee, 0);
            const totalCoachEarnings = payments.reduce((sum, payment) => sum + payment.coachEarnings, 0);
            const totalPayments = payments.length;
            
            // Update stats display
            const totalRevenueElement = document.getElementById('totalRevenue');
            const adminFeesElement = document.getElementById('adminFees');
            const coachEarningsElement = document.getElementById('coachEarnings');
            const totalPaymentsElement = document.getElementById('totalPayments');
            
            if (totalRevenueElement) totalRevenueElement.textContent = `$${totalRevenue.toFixed(2)}`;
            if (adminFeesElement) adminFeesElement.textContent = `$${totalAdminFees.toFixed(2)}`;
            if (coachEarningsElement) coachEarningsElement.textContent = `$${totalCoachEarnings.toFixed(2)}`;
            if (totalPaymentsElement) totalPaymentsElement.textContent = totalPayments;
            
            console.log('Financial stats updated:', {
                totalRevenue: totalRevenue,
                adminFees: totalAdminFees,
                coachEarnings: totalCoachEarnings,
                totalPayments: totalPayments
            });
            
        } catch (error) {
            console.error('Error loading financial stats:', error);
            // Set default values on error
            const totalRevenueElement = document.getElementById('totalRevenue');
            const adminFeesElement = document.getElementById('adminFees');
            const coachEarningsElement = document.getElementById('coachEarnings');
            const totalPaymentsElement = document.getElementById('totalPayments');
            
            if (totalRevenueElement) totalRevenueElement.textContent = '$0.00';
            if (adminFeesElement) adminFeesElement.textContent = '$0.00';
            if (coachEarningsElement) coachEarningsElement.textContent = '$0.00';
            if (totalPaymentsElement) totalPaymentsElement.textContent = '0';
        }
    };

    window.app.loadRevenueChart = async function() {
        try {
            console.log('Loading revenue chart...');
            const response = await fetch(`${this.apiBaseUrl}/payment`);
            
            if (!response.ok) {
                console.error('Failed to fetch payments for chart:', response.status);
                return;
            }
            
            const payments = await response.json();
            console.log('Payments data for chart:', payments);
            
            // Group payments by date
            const paymentsByDate = {};
            payments.forEach(payment => {
                const date = new Date(payment.paymentDate).toLocaleDateString();
                if (!paymentsByDate[date]) {
                    paymentsByDate[date] = 0;
                }
                paymentsByDate[date] += payment.amount;
            });
            
            const dates = Object.keys(paymentsByDate).sort();
            const revenues = dates.map(date => paymentsByDate[date]);
            
            // Destroy existing chart if it exists
            if (window.revenueChart && typeof window.revenueChart.destroy === 'function') {
                window.revenueChart.destroy();
            }
            
            const ctx = document.getElementById('revenueChart').getContext('2d');
            window.revenueChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: 'Revenue',
                        data: revenues,
                        borderColor: '#ffffff',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 3,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: '#ffffff',
                        pointRadius: 6,
                        pointHoverRadius: 8
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
                                color: 'white',
                                callback: function(value) {
                                    return '$' + value;
                                }
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        }
                    }
                }
            });
            
        } catch (error) {
            console.error('Error loading revenue chart:', error);
        }
    };

    window.app.loadRevenueDistributionChart = async function() {
        try {
            console.log('Loading revenue distribution chart...');
            const response = await fetch(`${this.apiBaseUrl}/payment`);
            
            if (!response.ok) {
                console.error('Failed to fetch payments for distribution chart:', response.status);
                return;
            }
            
            const payments = await response.json();
            console.log('Payments data for distribution chart:', payments);
            
            // Calculate admin fees and coach earnings
            const totalAdminFees = payments.reduce((sum, payment) => sum + payment.adminFee, 0);
            const totalCoachEarnings = payments.reduce((sum, payment) => sum + payment.coachEarnings, 0);
            
            // Destroy existing chart if it exists
            if (window.revenueDistributionChart && typeof window.revenueDistributionChart.destroy === 'function') {
                window.revenueDistributionChart.destroy();
            }
            
            const ctx = document.getElementById('revenueDistributionChart').getContext('2d');
            window.revenueDistributionChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Admin Fees (10%)', 'Coach Earnings (90%)'],
                    datasets: [{
                        data: [totalAdminFees, totalCoachEarnings],
                        backgroundColor: [
                            '#f59e0b',
                            '#10b981'
                        ],
                        borderColor: '#ffffff',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: 'white',
                                padding: 20
                            }
                        }
                    }
                }
            });
            
        } catch (error) {
            console.error('Error loading revenue distribution chart:', error);
        }
    };

    window.app.loadRecentPayments = async function() {
        try {
            console.log('Loading recent payments...');
            const response = await fetch(`${this.apiBaseUrl}/payment`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const payments = await response.json();
            console.log('Payments data:', payments);
            
            // Sort by date (most recent first) and take last 10
            const recentPayments = payments
                .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
                .slice(0, 10);
            
            const paymentsListContainer = document.getElementById('recentPaymentsList');
            if (!paymentsListContainer) {
                console.error('Recent payments list container not found');
                return;
            }
            
            if (recentPayments.length === 0) {
                paymentsListContainer.innerHTML = '<p class="text-center text-white-50">No payments found</p>';
                return;
            }
            
            // Create payments list HTML
            const paymentsHTML = recentPayments.map(payment => {
                const paymentDate = new Date(payment.paymentDate).toLocaleDateString();
                return `
                    <div class="payment-item">
                        <div class="payment-icon">
                            <i class="bi bi-currency-dollar"></i>
                        </div>
                        <div class="payment-info">
                            <div class="payment-amount">$${payment.amount.toFixed(2)}</div>
                            <div class="payment-details">Payment #${payment.paymentId} • ${paymentDate}</div>
                        </div>
                        <div class="payment-stats">
                            <div>Admin: $${payment.adminFee.toFixed(2)}</div>
                            <div>Coach: $${payment.coachEarnings.toFixed(2)}</div>
                        </div>
                    </div>
                `;
            }).join('');
            
            paymentsListContainer.innerHTML = paymentsHTML;
            
        } catch (error) {
            console.error('Error loading recent payments:', error);
            const paymentsListContainer = document.getElementById('recentPaymentsList');
            if (paymentsListContainer) {
                paymentsListContainer.innerHTML = '<p class="text-center text-danger">Failed to load payments</p>';
            }
        }
    };

    // Rate Coach Functions
    window.app.loadRateCoachPage = async function() {
        try {
            console.log('Loading rate coach page...');
            
            // Get current user data
            const userData = localStorage.getItem('mindfit_user');
            if (!userData) {
                console.error('No user data found');
                return;
            }
            
            const user = JSON.parse(userData);
            console.log('Current user:', user);
            
            // Get student's coach assignment from database
            const studentResponse = await fetch(`${this.apiBaseUrl}/students`);
            if (!studentResponse.ok) {
                throw new Error(`HTTP error! status: ${studentResponse.status}`);
            }
            
            const students = await studentResponse.json();
            const currentStudent = students.find(s => s.studentId === user.id);
            
            console.log('Current student from DB:', currentStudent);
            
            if (!currentStudent || !currentStudent.coachId) {
                console.log('No coach assigned, showing no coach message');
                this.showNoCoachMessage();
                return;
            }
            
            // Load coach information
            await this.loadCoachInfo(currentStudent.coachId);
            
            // Check if student already has a rating for this coach
            await this.checkExistingRating(user.id, currentStudent.coachId);
            
            // Set up form submission
            this.setupCoachRatingForm(user.id, currentStudent.coachId);
            
        } catch (error) {
            console.error('Error loading rate coach page:', error);
            this.showAlert('Failed to load rate coach page.', 'danger');
        }
    };

    window.app.loadCoachInfo = async function(coachId) {
        try {
            console.log('Loading coach info for ID:', coachId);
            
            const response = await fetch(`${this.apiBaseUrl}/coaches`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const coaches = await response.json();
            const coach = coaches.find(c => c.coachId === coachId);
            
            if (!coach) {
                console.error('Coach not found');
                this.showNoCoachMessage();
                return;
            }
            
            console.log('Found coach:', coach);
            
            // Display coach information
            const coachInfoContainer = document.getElementById('coachInfo');
            if (coachInfoContainer) {
                coachInfoContainer.innerHTML = `
                    <div class="coach-name">${coach.name}</div>
                    <div class="coach-email">${coach.email}</div>
                    <div class="coach-experience">
                        <i class="bi bi-award me-2"></i>
                        ${coach.yearsOfExperience} years of experience
                    </div>
                    <div class="coach-experience">
                        <i class="bi bi-star-fill me-2"></i>
                        Rating: ${coach.rating ? coach.rating.toFixed(1) : 'No ratings yet'} (${coach.ratingCount || 0} reviews)
                    </div>
                `;
            }
            
        } catch (error) {
            console.error('Error loading coach info:', error);
            this.showAlert('Failed to load coach information.', 'danger');
        }
    };

    window.app.setupCoachRatingForm = function(studentId, coachId) {
        const form = document.getElementById('coachRatingForm');
        if (!form) return;
        
        // Remove existing event listeners
        form.removeEventListener('submit', this.handleCoachRatingSubmit);
        
        // Add new event listener
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCoachRatingSubmit(e, studentId, coachId);
        });
    };

    window.app.handleCoachRatingSubmit = async function(event, studentId, coachId) {
        try {
            const rating = parseInt(document.getElementById('ratingSelect').value);
            const review = document.getElementById('reviewText').value.trim();
            
            if (!rating || rating < 1 || rating > 5) {
                this.showAlert('Please select a valid rating.', 'warning');
                return;
            }
            
            console.log('Submitting coach rating:', { studentId, coachId, rating, review });
            
            const response = await fetch(`${this.apiBaseUrl}/coachratings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    studentId: studentId,
                    coachId: coachId,
                    rating: rating,
                    review: review
                })
            });
            
            if (response.ok) {
                console.log('Coach rating submitted successfully');
                this.showRatingSuccess();
                
                // Reset form
                document.getElementById('coachRatingForm').reset();
            } else {
                const errorText = await response.text();
                console.error('Failed to submit rating:', response.status, errorText);
                
                if (response.status === 409) {
                    this.showAlert('You have already rated this coach. You can only rate each coach once.', 'warning');
                } else if (response.status === 500 && errorText.includes('UNIQUE constraint failed')) {
                    this.showAlert('You have already rated this coach. You can only rate each coach once.', 'warning');
                } else {
                    this.showAlert('Failed to submit rating. Please try again.', 'danger');
                }
            }
            
        } catch (error) {
            console.error('Error submitting coach rating:', error);
            this.showAlert('Failed to submit rating. Please check your connection and try again.', 'danger');
        }
    };


    window.app.showRatingSuccess = function() {
        const successMessage = document.getElementById('ratingSuccessMessage');
        const formSection = document.querySelector('.rate-coach-form-section');
        
        if (successMessage && formSection) {
            formSection.style.display = 'none';
            successMessage.style.display = 'block';
            
            // Hide success message after 3 seconds and show form again
            setTimeout(() => {
                successMessage.style.display = 'none';
                formSection.style.display = 'block';
            }, 3000);
        }
    };

    window.app.checkExistingRating = async function(studentId, coachId) {
        try {
            console.log('Checking existing rating for student:', studentId, 'coach:', coachId);
            
            const response = await fetch(`${this.apiBaseUrl}/coachratings/student/${studentId}/coach/${coachId}`);
            
            if (response.ok) {
                const existingRating = await response.json();
                console.log('Existing rating found:', existingRating);
                this.showAlreadyRatedMessage(existingRating);
            } else if (response.status === 404) {
                console.log('No existing rating found');
                // Show the form normally
            } else {
                console.error('Error checking existing rating:', response.status);
            }
            
        } catch (error) {
            console.error('Error checking existing rating:', error);
        }
    };

    window.app.showAlreadyRatedMessage = function(rating) {
        const formSection = document.querySelector('.rate-coach-form-section');
        if (!formSection) return;
        
        // Create already rated message
        const alreadyRatedMessage = document.createElement('div');
        alreadyRatedMessage.className = 'rating-success-message text-center py-4';
        alreadyRatedMessage.innerHTML = `
            <i class="bi bi-star-fill text-warning" style="font-size: 3rem;"></i>
            <h4 class="mt-3 text-white">You've Already Rated This Coach</h4>
            <p class="text-white-50">You gave this coach ${rating.rating} star${rating.rating !== 1 ? 's' : ''} on ${new Date(rating.ratingDate).toLocaleDateString()}</p>
            ${rating.review ? `<p class="text-white-50">"${rating.review}"</p>` : ''}
            <p class="text-white-50">You can only rate each coach once.</p>
        `;
        
        // Replace form with message
        formSection.innerHTML = '';
        formSection.appendChild(alreadyRatedMessage);
    };

    window.app.showNoCoachMessage = function() {
        const noCoachMessage = document.getElementById('noCoachMessage');
        const formSection = document.querySelector('.rate-coach-form-section');
        
        if (noCoachMessage && formSection) {
            formSection.style.display = 'none';
            noCoachMessage.style.display = 'block';
        }
    };


});
