/* ==========================================================================
   SupaPass Kenya - Main Application JavaScript (`js/app.js`)
   Handles Modals, Tab Switching, Live Search/Filtering, Event Posting & Booking
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Modal Elements & Triggers
    const authModal = document.getElementById('auth-modal');
    const openAuthBtn = document.getElementById('open-auth-btn');
    const closeAuthModal = document.getElementById('close-auth-modal');

    const addEventModal = document.getElementById('add-event-modal');
    const openCreateEventBtn = document.getElementById('open-create-event-btn');
    const closeEventModal = document.getElementById('close-event-modal');

    // Auth Form Tabs
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

    // Event Creation Form
    const createEventForm = document.getElementById('create-event-form');


    /* ==========================================================================
       2. Modal Control Logic (Open / Close)
       ========================================================================== */
    
    if (openAuthBtn) {
        openAuthBtn.addEventListener('click', () => {
            authModal.style.display = 'flex';
        });
    }

    if (closeAuthModal) {
        closeAuthModal.addEventListener('click', () => {
            authModal.style.display = 'none';
        });
    }

    if (openCreateEventBtn) {
        openCreateEventBtn.addEventListener('click', () => {
            addEventModal.style.display = 'flex';
        });
    }

    if (closeEventModal) {
        closeEventModal.addEventListener('click', () => {
            addEventModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === authModal) authModal.style.display = 'none';
        if (e.target === addEventModal) addEventModal.style.display = 'none';
    });


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
       4. Live Search & Filtering Logic
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
       5. Dynamic Event Creation (Staff / Leader Post Event)
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
            newCard.setAttribute('data-school', school);
            newCard.setAttribute('data-category', category);

            newCard.innerHTML = `
                <div class="card-image-wrapper">
                    <span class="badge badge-school">${school.toUpperCase()}</span>
                    <span class="badge badge-category">${category}</span>
                    <div class="placeholder-image" style="background-color: #5c1d1d;">New Event</div>
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
            alert('Event successfully published to SupaPass Feed!');
        });
    }


    /* ==========================================================================
       6. Interactive Booking Logic for Event Cards
       ========================================================================== */
    document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('book-ticket-btn')) {
            const card = e.target.closest('.event-card');
            const title = card ? card.querySelector('.event-title').textContent : 'Selected Event';
            alert(`Booking initiated for: "${title}". Pass generation prompt triggered successfully!`);
        }
    });

});