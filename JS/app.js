/* ==========================================================================
   SupaPass Kenya - Complete Application Logic (`js/app.js`)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    let currentUser = null;

    // Elements
    const authModal = document.getElementById('auth-modal');
    const heroSection = document.getElementById('hero-section');
    const mainDashboard = document.getElementById('main-dashboard');
    const openCreateEventBtn = document.getElementById('open-create-event-btn');
    const openMyTicketsBtn = document.getElementById('open-my-tickets-btn');
    const openAuthBtn = document.getElementById('open-auth-btn');

    // Modals
    const addEventModal = document.getElementById('add-event-modal');
    const closeEventModal = document.getElementById('close-event-modal');

    const eventDetailModal = document.getElementById('event-detail-modal');
    const closeDetailModal = document.getElementById('close-detail-modal');

    const ticketReceiptModal = document.getElementById('ticket-receipt-modal');
    const closeReceiptModal = document.getElementById('close-receipt-modal');

    const myTicketsModal = document.getElementById('my-tickets-modal');
    const closeMyTicketsModal = document.getElementById('close-my-tickets-modal');

    // Forms
    const tabLoginBtn = document.getElementById('tab-login-btn');
    const tabRegisterBtn = document.getElementById('tab-register-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const createEventForm = document.getElementById('create-event-form');

    // Filters
    const searchInput = document.getElementById('search-input');
    const schoolFilter = document.getElementById('school-filter');
    const categoryFilter = document.getElementById('category-filter');
    const eventGridContainer = document.getElementById('event-grid-container');
    const eventsCountBadge = document.getElementById('events-count-badge');


    /* 1. LocalStorage Helpers */
    function getStoredUsers() {
        const users = localStorage.getItem('supapass_users');
        return users ? JSON.parse(users) : [];
    }

    function saveUserToDatabase(user) {
        const users = getStoredUsers();
        users.push(user);
        localStorage.setItem('supapass_users', JSON.stringify(users));
    }

    function getStoredTickets() {
        const tickets = localStorage.getItem('supapass_tickets');
        return tickets ? JSON.parse(tickets) : [];
    }

    function saveTicketToDatabase(ticket) {
        const tickets = getStoredTickets();
        tickets.push(ticket);
        localStorage.setItem('supapass_tickets', JSON.stringify(tickets));
    }


    /* 2. Auth Gate Enforcement */
    function checkAuthGate() {
        if (!currentUser) {
            authModal.style.display = 'flex';
            heroSection.style.display = 'none';
            mainDashboard.style.display = 'none';
            if (openCreateEventBtn) openCreateEventBtn.style.display = 'none';
            if (openMyTicketsBtn) openMyTicketsBtn.style.display = 'none';
        } else {
            authModal.style.display = 'none';
            heroSection.style.display = 'block';
            mainDashboard.style.display = 'block';
            if (openMyTicketsBtn) openMyTicketsBtn.style.display = 'inline-block';
            
            if (currentUser.role === 'staff') {
                openCreateEventBtn.style.display = 'inline-block';
            } else {
                openCreateEventBtn.style.display = 'none';
            }

            openAuthBtn.textContent = `👤 ${currentUser.name} (${currentUser.role.toUpperCase()})`;
            openAuthBtn.style.backgroundColor = '#2e7d32';

            renderStaffControls();
        }
    }

    checkAuthGate();


    /* 3. Auth Tabs & Login/Register Handlers */
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

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('login-username').value.trim().toLowerCase();
            const passwordInput = document.getElementById('login-password').value.trim();

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
                const registeredUsers = getStoredUsers();
                const matchedUser = registeredUsers.find(
                    u => (u.email.toLowerCase() === usernameInput || u.schoolId.toLowerCase() === usernameInput) && u.password === passwordInput
                );

                if (matchedUser) {
                    currentUser = matchedUser;
                } else {
                    alert('Invalid login credentials!');
                    return;
                }
            }

            loginForm.reset();
            checkAuthGate();
            alert(`Welcome back, ${currentUser.name}! Hub unlocked.`);
        });
    }

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

            const newUser = { name: fullname, email, idNumber, schoolId, role, school, password };
            saveUserToDatabase(newUser);
            currentUser = newUser;

            registerForm.reset();
            checkAuthGate();
            alert(`Registration complete! Welcome, ${currentUser.name}.`);
        });
    }


    /* 4. Render Staff Delete Controls */
    function renderStaffControls() {
        const cards = document.querySelectorAll('.event-card');
        cards.forEach(card => {
            let deleteBtn = card.querySelector('.btn-danger');
            if (currentUser && currentUser.role === 'staff') {
                if (!deleteBtn) {
                    deleteBtn = document.createElement('button');
                    deleteBtn.type = 'button';
                    deleteBtn.className = 'btn btn-danger delete-event-btn';
                    deleteBtn.textContent = '🗑 Delete';
                    card.querySelector('.card-actions').prepend(deleteBtn);
                }
            } else {
                if (deleteBtn) deleteBtn.remove();
            }
        });
    }


    /* 5. Modal Open/Close Controls */
    if (openCreateEventBtn) {
        openCreateEventBtn.addEventListener('click', () => {
            if (currentUser && currentUser.role === 'staff') {
                addEventModal.style.display = 'flex';
            }
        });
    }

    if (openMyTicketsBtn) {
        openMyTicketsBtn.addEventListener('click', renderMyTicketsList);
    }

    if (closeEventModal) closeEventModal.addEventListener('click', () => addEventModal.style.display = 'none');
    if (closeDetailModal) closeDetailModal.addEventListener('click', () => eventDetailModal.style.display = 'none');
    if (closeReceiptModal) closeReceiptModal.addEventListener('click', () => ticketReceiptModal.style.display = 'none');
    if (closeMyTicketsModal) closeMyTicketsModal.addEventListener('click', () => myTicketsModal.style.display = 'none');


    /* 6. Filter Events */
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

        if (eventsCountBadge) eventsCountBadge.textContent = `${visibleCount} Events Listed`;
    }

    if (searchInput) searchInput.addEventListener('keyup', filterEvents);
    if (schoolFilter) schoolFilter.addEventListener('change', filterEvents);
    if (categoryFilter) categoryFilter.addEventListener('change', filterEvents);


    /* 7. Post Event (Staff Only) */
    if (createEventForm) {
        createEventForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('event-title').value;
            const description = document.getElementById('event-description').value;
            const school = document.getElementById('event-school-select').value;
            const category = document.getElementById('event-cat-select').value;
            const date = document.getElementById('event-date').value;
            const venue = document.getElementById('event-venue').value;
            const target = document.getElementById('event-target').value;
            const price = document.getElementById('event-price').value;

            const isFree = (price === '0' || price.toLowerCase().includes('free'));
            const priceText = isFree ? 'KSH 0 (Free Entry)' : `KSH ${price}`;
            const priceClass = isFree ? 'free-price' : 'paid-price';

            let schoolDataAttr = 'dusa';
            const lowerSchool = school.toLowerCase();
            if (lowerSchool.includes('science')) schoolDataAttr = 'science';
            else if (lowerSchool.includes('law')) schoolDataAttr = 'law';
            else if (lowerSchool.includes('nursing')) schoolDataAttr = 'nursing';
            else if (lowerSchool.includes('business')) schoolDataAttr = 'business';
            else if (lowerSchool.includes('psychology')) schoolDataAttr = 'psychology';

            const newCard = document.createElement('article');
            newCard.className = 'event-card';
            newCard.setAttribute('data-id', Date.now());
            newCard.setAttribute('data-school', schoolDataAttr);
            newCard.setAttribute('data-category', category);

            newCard.innerHTML = `
                <div class="card-image-wrapper">
                    <span class="badge badge-school">${school}</span>
                    <span class="badge badge-category">${category}</span>
                    <div class="placeholder-image" style="background-color: #5c1d1d;">Staff Posted</div>
                </div>
                <div class="card-content">
                    <h4 class="event-title">${title}</h4>
                    <p class="event-desc-snippet">${description.substring(0, 80)}...</p>
                    <div class="event-details">
                        <p class="detail-item"><strong>Date:</strong> ${date}</p>
                        <p class="detail-item"><strong>Venue:</strong> ${venue}</p>
                        <p class="detail-item"><strong>Target:</strong> ${target}</p>
                    </div>
                    <div class="card-footer">
                        <span class="price-badge ${priceClass}">${priceText}</span>
                        <div class="card-actions">
                            <button type="button" class="btn btn-outline view-details-btn">Details</button>
                            <button type="button" class="btn btn-primary book-ticket-btn">Book Pass</button>
                        </div>
                    </div>
                </div>
            `;

            eventGridContainer.prepend(newCard);
            createEventForm.reset();
            addEventModal.style.display = 'none';
            filterEvents();
            renderStaffControls();
            alert('Event published to feed!');
        });
    }


    /* 8. Event Card Click, Booking & Deletion Listeners */
    document.addEventListener('click', (e) => {
        
        // A. Delete Event Button
        if (e.target && e.target.classList.contains('delete-event-btn')) {
            e.stopPropagation();
            const card = e.target.closest('.event-card');
            if (card && confirm('Are you sure you want to remove this event posting?')) {
                card.remove();
                filterEvents();
            }
            return;
        }

        // B. Book Ticket Button
        if (e.target && (e.target.classList.contains('book-ticket-btn') || e.target.id === 'detail-book-now-btn')) {
            e.stopPropagation();
            if (!currentUser) return;

            const card = e.target.closest('.event-card');
            const eventTitle = card ? card.querySelector('.event-title').textContent : document.getElementById('detail-title').textContent;
            const uniqueTicketNo = `SP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

            const ticketData = {
                ticketNo: uniqueTicketNo,
                eventTitle: eventTitle,
                userEmail: currentUser.email,
                userName: currentUser.name,
                schoolId: currentUser.schoolId,
                nationalId: currentUser.idNumber,
                school: currentUser.school,
                date: new Date().toLocaleDateString()
            };

            saveTicketToDatabase(ticketData);

            document.getElementById('receipt-event-title').textContent = ticketData.eventTitle;
            document.getElementById('receipt-ticket-no').textContent = ticketData.ticketNo;
            document.getElementById('receipt-holder-name').textContent = ticketData.userName;
            document.getElementById('receipt-school-id').textContent = ticketData.schoolId;
            document.getElementById('receipt-national-id').textContent = ticketData.nationalId;
            document.getElementById('receipt-school').textContent = ticketData.school;

            if (eventDetailModal) eventDetailModal.style.display = 'none';
            ticketReceiptModal.style.display = 'flex';
            return;
        }

        // C. Details Button or Card Click
        const card = e.target.closest('.event-card');
        if (card) {
            document.getElementById('detail-title').textContent = card.querySelector('.event-title').textContent;
            
            const desc = card.querySelector('.event-desc-snippet');
            document.getElementById('detail-description').textContent = desc ? desc.textContent : 'Full event information and agenda for Daystar University students.';
            
            document.getElementById('detail-school').textContent = card.querySelector('.badge-school').textContent;
            document.getElementById('detail-category').textContent = card.querySelector('.badge-category').textContent;
            document.getElementById('detail-price').textContent = card.querySelector('.price-badge').textContent;

            const details = card.querySelectorAll('.detail-item');
            document.getElementById('detail-date').textContent = details[0] ? details[0].textContent.replace('Date:', '') : '';
            document.getElementById('detail-venue').textContent = details[1] ? details[1].textContent.replace('Venue:', '') : '';
            document.getElementById('detail-target').textContent = details[2] ? details[2].textContent.replace('Target:', '') : '';

            eventDetailModal.style.display = 'flex';
        }
    });


    /* 9. Render "My Booked Passes" */
    function renderMyTicketsList() {
        const allTickets = getStoredTickets();
        const userTickets = allTickets.filter(t => t.userEmail === currentUser.email);
        const container = document.getElementById('my-tickets-list');

        if (userTickets.length === 0) {
            container.innerHTML = `<p style="text-align: center; color: #666; padding: 1rem;">No passes booked yet.</p>`;
        } else {
            container.innerHTML = userTickets.map(t => `
                <div class="ticket-history-item">
                    <div style="display:flex; justify-between; align-items:center;">
                        <h4 style="color: #b40000;">${t.eventTitle}</h4>
                        <span style="font-family:monospace; font-weight:bold;">${t.ticketNo}</span>
                    </div>
                    <p style="font-size: 0.8rem; color: #666; margin-top:0.3rem;">
                        Holder: ${t.userName} (${t.schoolId}) • Booked on: ${t.date}
                    </p>
                </div>
            `).join('');
        }

        myTicketsModal.style.display = 'flex';
    }

});