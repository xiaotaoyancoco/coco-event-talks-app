document.addEventListener('DOMContentLoaded', () => {
    const scheduleContainer = document.getElementById('schedule-container');
    const categoryFilter = document.getElementById('category-filter');
    const dateFilter = document.getElementById('date-filter');
    const clearDateFilterBtn = document.getElementById('clear-date-filter');

    let allTalks = [];
    const allCategories = new Set();
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    const toYYYYMMDD = (date) => date.toISOString().split('T')[0];

    // --- Initialize Date Filter ---
    dateFilter.max = toYYYYMMDD(today);
    dateFilter.min = toYYYYMMDD(sevenDaysAgo);

    // --- Fetch Data and Initial Render ---
    fetch('/api/talks')
        .then(response => response.json())
        .then(talks => {
            allTalks = talks.sort((a, b) => new Date(b.date) - new Date(a.date));
            populateCategoryFilter();
            filterAndRender();
        });

    // --- Event Listeners ---
    categoryFilter.addEventListener('change', filterAndRender);
    dateFilter.addEventListener('change', filterAndRender);
    clearDateFilterBtn.addEventListener('click', () => {
        dateFilter.value = '';
        filterAndRender();
    });

    // --- Helper Functions ---
    const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // --- UI Population Functions ---
    function populateCategoryFilter() {
        allTalks.forEach(talk => talk.categories.forEach(category => allCategories.add(category)));
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        allCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    // --- Core Filtering and Rendering Logic ---
    function filterAndRender() {
        const selectedCategory = categoryFilter.value;
        const selectedDate = dateFilter.value;

        const filteredTalks = allTalks.filter(talk => {
            const talkDate = new Date(talk.date + "T00:00:00"); // Use T00:00:00 to avoid timezone issues
            const matchesCategory = selectedCategory === 'all' || talk.categories.includes(selectedCategory);

            if (selectedDate) {
                return talk.date === selectedDate && matchesCategory;
            }
            
            const dateInInitialRange = talkDate >= sevenDaysAgo && talkDate <= today;
            return dateInInitialRange && matchesCategory;
        });

        renderSchedule(filteredTalks);
    }

    function renderSchedule(talksToRender) {
        scheduleContainer.innerHTML = '';
        if (talksToRender.length === 0) {
            scheduleContainer.innerHTML = '<p style="text-align: center;">No talks match the selected criteria.</p>';
            return;
        }

        const talksByDate = talksToRender.reduce((acc, talk) => {
            (acc[talk.date] = acc[talk.date] || []).push(talk);
            return acc;
        }, {});

        const sortedDates = Object.keys(talksByDate).sort((a, b) => new Date(b) - new Date(a));

        sortedDates.forEach(dateStr => {
            const dateHeading = document.createElement('h2');
            dateHeading.className = 'date-heading';
            dateHeading.textContent = new Date(dateStr + "T00:00:00").toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            scheduleContainer.appendChild(dateHeading);

            const talksForDay = talksByDate[dateStr];
            let currentTime = new Date(dateStr + "T10:00:00"); // Start each day at 10:00 AM

            talksForDay.forEach((talk, index) => {
                const startTime = new Date(currentTime);
                const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
                scheduleContainer.appendChild(createTalkElement(talk, startTime, endTime));
                currentTime = endTime;

                // Handle breaks for the specific day
                if (index === 2) { // Lunch break after the 3rd talk
                    const lunchStartTime = new Date(currentTime);
                    const lunchEndTime = new Date(lunchStartTime.getTime() + 60 * 60 * 1000);
                    scheduleContainer.appendChild(createBreakElement('Lunch Break', lunchStartTime, lunchEndTime, true));
                    currentTime = lunchEndTime;
                } else if (index < talksForDay.length - 1) { // Transition break
                    const breakStartTime = new Date(currentTime);
                    const breakEndTime = new Date(breakStartTime.getTime() + 10 * 60 * 1000);
                    scheduleContainer.appendChild(createBreakElement('Transition', breakStartTime, breakEndTime, false));
                    currentTime = breakEndTime;
                }
            });
        });
    }

    function createTalkElement(talk, startTime, endTime) {
        const item = document.createElement('div');
        item.className = 'schedule-item';
        item.innerHTML = `
            <div class="time">${formatTime(startTime)} - ${formatTime(endTime)}</div>
            <h2>${talk.title}</h2>
            <div class="speakers">${talk.speakers.join(', ')}</div>
            <p>${talk.description}</p>
            <div class="categories">
                ${talk.categories.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
            </div>
        `;
        return item;
    }

    function createBreakElement(title, startTime, endTime, isLunch) {
        const breakItem = document.createElement('div');
        // Re-add classes from original implementation for styling
        const baseClass = 'schedule-item';
        const typeClass = isLunch ? 'lunch' : 'break';
        // The original implementation had unique styling for breaks, which was lost.
        // Let's add it back via CSS or directly, but for now, we add classes.
        // We will need to add .lunch and .break styles to css file.
        breakItem.className = `${baseClass} ${typeClass}`;
        
        breakItem.innerHTML = `
            <div class="time">${formatTime(startTime)} - ${formatTime(endTime)}</div>
            <p style="font-weight: bold;">${title}</p>
        `;
        return breakItem;
    }
});
