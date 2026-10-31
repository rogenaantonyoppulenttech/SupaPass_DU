/* ==========================================================================
   SupaPass Kenya - Complete Application JavaScript (`js/app.js`)
   Consolidated Script: Auth Gate, LocalStorage DB, Role-Based Access & Ticketing
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    let currentUser = null;

    // DOM Elements
    const authModal = document.getElementById('auth-modal');
    const heroSection = document.getElementById('hero-section');
    const mainDashboard = document.getElementById('main-dashboard');
    const openCreateEventBtn = document.getElementById('open-create-event-btn');
    const openAuthBtn = document.getElementById('open-auth-btn');

    const addEventModal = document.getElementById('add-event-modal');
    const closeEventModal = document.getElementById('close-event-modal');

    // Auth Tabs & Forms
    const tabLoginBtn = document.getElementById('tab-login-btn');
    const tabRegisterBtn = document.getElementById('tab-register-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Filtering Inputs
    const searchInput = document.getElementById('search-input');
    const schoolFilter = document.getElementById('school-filter');
    const categoryFilter = document.getElementById('category-filter');
    const eventGridContainer = document.getElementById('event-grid-container');
    const eventsCountBadge = document.getElementById('events-count-badge');

    const createEventForm = document.getElementById('create-event-form');


    /* ==========================================================================
       1. Helper Functions: User Database in LocalStorage
       ========================================================================== */
    function getStoredUsers() {
        const users = localStorage.getItem('supapass_users');
        return users ? JSON.parse(users) : [];
    }

    function saveUserToDatabase(user) {
        const users = getStoredUsers();
        users.push(user);
        localStorage.setItem('supapass_users', JSON.stringify(users));
    }


    /* ==========================================================================
       2. Force Auth Gate on Load
       ========================================================================== */
    function checkAuthGate() {
        if (!currentUser) {
            authModal.style.display = 'flex';
            heroSection.style.display = 'none';
            mainDashboard.style.display = 'none';
            if (openCreateEventBtn) openCreateEventBtn.style.display = 'none';
        } else {
            authModal.style.display = 'none';
            heroSection.style.display = 'block';
            mainDashboard.style.display = 'block';
            
            // Show Post Event button ONLY if user is staff
            if (currentUser.role === 'staff') {
                openCreateEventBtn.style.display = 'inline-block';
            } else {
                openCreateEventBtn.style.display = 'none';
            }

            openAuthBtn.textContent = `👤 ${currentUser.name} (${currentUser.role.toUpperCase()})`;
            openAuthBtn.style.backgroundColor = '#2e7d32';
        }
    }

    checkAuthGate();


    /* ==========================================================================
       3. Auth Tab Switcher (Sign In vs Register)
       ========================================================================== */
    if (tabLoginBtn && tabRegisterBtn) {
        tabLoginBtn.addEventListener('click', () => {
            tabLoginBtn.classList.add('active');
            tabRegisterBtn.classList.remove('active');
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        });

        tabRegisterBtn.addEventListener('click', () => {
            tabRegisterBtn.classList.add('active');
            tabLoginBtn.classList.remove('active');
            registerForm.style.display = 'block';
            loginForm.style.display = 'none';
        });
    }


    /* ==========================================================================
       4. Login Logic (Checks LocalStorage + Presentation Test Defaults)
       ========================================================================== */
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const usernameInput = document.getElementById('login-username').value.trim().toLowerCase();
            const passwordInput = document.getElementById('login-password').value.trim();

            // 1. Presentation Test Defaults
            if (usernameInput === 'admin' && passwordInput === 'admin') {
                currentUser = {
                    name: 'System Admin (Staff)',
                    email: 'admin@daystar.ac.ke',
                    idNumber: 'ID-99999999',
                    schoolId: 'STAFF-001',
                    role: 'staff',
                    school: 'Central Administration'
                };
            } else if (usernameInput === 'student' && passwordInput === 'admin') {
                currentUser = {
                    name: 'Antony Owande',
                    email: '25-0141@daystar.ac.ke',
                    idNumber: '38492011',
                    schoolId: '25-0141',
                    role: 'student',
                    school: 'School of Science & Technology'
                };
            } else {
                // 2. Check Saved Registered Users in Browser Storage
                const registeredUsers = getStoredUsers();
                const matchedUser = registeredUsers.find(
                    u => (u.email.toLowerCase() === usernameInput || u.schoolId.toLowerCase() === usernameInput) && u.password === passwordInput
                );

                if (matchedUser) {
                    currentUser = matchedUser;
                } else {
                    alert('Invalid login credentials! Please check your username/ID and password, or register a new account.');
                    return;
                }
            }

            loginForm.reset();
            checkAuthGate();
            alert(`Welcome back, ${currentUser.name}! Hub access granted.`);
        });
    }


    /* ==========================================================================
       5. Registration Logic (Persists User to LocalStorage)
       ========================================================================== */
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const fullname = document.getElementById('reg-fullname').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const idNumber = document.getElementById('reg-idnumber').value.trim();
            const schoolId = document.getElementById('reg-schoolid').value.trim();
            const role = document.getElementById('reg-role').value;
            const school = document.getElementById('reg-school').value;
            const password = document.getElementById('reg-password').value.trim();

            const existingUsers = getStoredUsers();
            const userExists = existingUsers.some(u => u.email.toLowerCase() === email.toLowerCase());

            if (userExists) {
                alert('This email is already registered! Please switch to the Sign In tab.');
                return;
            }

            const newUser = {
                name: fullname,
                email: email,
                idNumber: idNumber,
                schoolId: schoolId,
                role: role,
                school: school,
                password: password
            };

            saveUserToDatabase(newUser);
            currentUser = newUser;

            registerForm.reset();
            checkAuthGate();
            alert(`Registration successful! Your account has been saved. Welcome to SupaPass, ${currentUser.name}.`);
        });
    }


    /* ==========================================================================
       6. Staff Event Posting Modal Controls
       ========================================================================== */
    if (openCreateEventBtn) {
        openCreateEventBtn.addEventListener('click', () => {
            if (currentUser && currentUser.role === 'staff') {
                addEventModal.style.display = 'flex';
            } else {
                alert('Access Denied: Only Staff members are authorized to post campus events.');
            }
        });
    }

    if (closeEventModal) {
        closeEventModal.addEventListener('click', () => {
            addEventModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === addEventModal) addEventModal.style.display = 'none';
    });


    /* ==========================================================================
       7. Live Search & Filtering Logic
       ========================================================================== */
    function filterEvents() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedSchool = schoolFilter.value;
        const selectedCategory = categoryFilter.value;

        const eventCards = eventGridContainer.querySelectorAll('.event-card');
        let visibleCount = 0;

        eventCards.forEach(card => {
            const cardSchool = card.getAttribute('data-school');
            const cardCategory = card.getAttribute('data-category');
            const cardText = card.textContent.toLowerCase();

            const matchesSearch = cardText.includes(searchTerm);
            const matchesSchool = (selectedSchool === 'all' || cardSchool === selectedSchool);
            const matchesCategory = (selectedCategory === 'all' || cardCategory === selectedCategory);

            if (matchesSearch && matchesSchool && matchesCategory) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (eventsCountBadge) {
            eventsCountBadge.textContent = `${visibleCount} Events Listed`;
        }
    }

    if (searchInput) searchInput.addEventListener('keyup', filterEvents);
    if (schoolFilter) schoolFilter.addEventListener('change', filterEvents);
    if (categoryFilter) categoryFilter.addEventListener('change', filterEvents);


    /* ==========================================================================
       8. Publish Event (Staff Only)
       ========================================================================== */
    if (createEventForm) {
        createEventForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('event-title').value;
            const school = document.getElementById('event-school-select').value;
            const category = document.getElementById('event-cat-select').value;
            const date = document.getElementById('event-date').value;
            const venue = document.getElementById('event-venue').value;
            const target = document.getElementById('event-target').value;
            const price = document.getElementById('event-price').value;

            const isFree = (price === '0' || price.toLowerCase().includes('free'));
            const priceText = isFree ? 'KSH 0 (Free Entry)' : `KSH ${price}`;
            const priceClass = isFree ? 'free-price' : 'paid-price';

            const newCard = document.createElement('article');
            newCard.className = 'event-card';
            newCard.setAttribute('data-school', school.toLowerCase().includes('science') ? 'science' : 'dusa');
            newCard.setAttribute('data-category', category);

            newCard.innerHTML = `
                <div class="card-image-wrapper">
                    <span class="badge badge-school">${school}</span>
                    <span class="badge badge-category">${category}</span>
                    <div class="placeholder-image" style="background-color: #5c1d1d;">Staff Posted</div>
                </div>
                <div class="card-content">
                    <h4 class="event-title">${title}</h4>
                    <div class="event-details">
                        <p class="detail-item"><strong>Date:</strong> ${date}</p>
                        <p class="detail-item"><strong>Venue:</strong> ${venue}</p>
                        <p class="detail-item"><strong>Target:</strong> ${target}</p>
                    </div>
                    <div class="card-footer">
                        <span class="price-badge ${priceClass}">${priceText}</span>
                        <button type="button" class="btn btn-primary book-ticket-btn">Book Pass</button>
                    </div>
                </div>
            `;

            eventGridContainer.prepend(newCard);
            createEventForm.reset();
            addEventModal.style.display = 'none';
            filterEvents();
            alert('Event published successfully to the SupaPass feed!');
        });
    }


    /* ==========================================================================
       9. Unique Ticket Booking & Digital Receipt Generation
       ========================================================================== */
    document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('book-ticket-btn')) {
            if (!currentUser) {
                alert('Authentication required!');
                return;
            }

            const card = e.target.closest('.event-card');
            const eventTitle = card ? card.querySelector('.event-title').textContent : 'Campus Event';
            
            const randomDigits = Math.floor(1000 + Math.random() * 9000);
            const uniqueTicketNo = `SP-2026-${randomDigits}`;

            const receiptMessage = 
                `🎫 OFFICIAL SUPAPASS DIGITAL RECEIPT\n` +
                `=====================================\n` +
                `• Unique Ticket No: ${uniqueTicketNo}\n` +
                `• Event: ${eventTitle}\n` +
                `-------------------------------------\n` +
                `• Holder Name: ${currentUser.name}\n` +
                `• School / Faculty: ${currentUser.school}\n` +
                `• School ID / Reg No: ${currentUser.schoolId}\n` +
                `• National ID No: ${currentUser.idNumber}\n` +
                `• Email: ${currentUser.email}\n` +
                `=====================================\n` +
                `Status: VALID & CONFIRMED`;

            alert(receiptMessage);
        }
    });

});