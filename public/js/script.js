document.addEventListener('DOMContentLoaded', () => {
    const scheduleContainer = document.getElementById('schedule-container');
    const categoryFilter = document.getElementById('category-filter');

    let allTalks = [];
    const allCategories = new Set();

    // Fetch talk data from the API
    fetch('/api/talks')
        .then(response => response.json())
        .then(talks => {
            allTalks = talks;
            renderSchedule(allTalks);
            populateCategoryFilter();
        });

    function populateCategoryFilter() {
        allTalks.forEach(talk => {
            talk.categories.forEach(category => allCategories.add(category));
        });

        allCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    function formatTime(date) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    function renderSchedule(talksToRender) {
        scheduleContainer.innerHTML = ''; // Clear existing schedule

        let currentTime = new Date();
        currentTime.setHours(10, 0, 0, 0); // Event starts at 10:00 AM

        talksToRender.forEach((talk, index) => {
            const startTime = new Date(currentTime);
            const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

            // Create and append talk item
            scheduleContainer.appendChild(createTalkElement(talk, startTime, endTime));
            
            currentTime = endTime;

            // Handle breaks
            if (index === 2) { // Lunch break after the 3rd talk
                const lunchStartTime = new Date(currentTime);
                const lunchEndTime = new Date(lunchStartTime.getTime() + 60 * 60 * 1000);
                scheduleContainer.appendChild(createBreakElement('Lunch Break', lunchStartTime, lunchEndTime, true));
                currentTime = lunchEndTime;
            } else if (index < talksToRender.length - 1) { // Transition break
                const breakStartTime = new Date(currentTime);
                const breakEndTime = new Date(breakStartTime.getTime() + 10 * 60 * 1000);
                scheduleContainer.appendChild(createBreakElement('Transition', breakStartTime, breakEndTime, false));
                currentTime = breakEndTime;
            }
        });
    }

    function createTalkElement(talk, startTime, endTime) {
        const item = document.createElement('div');
        item.className = 'schedule-item';
        item.dataset.categories = talk.categories.join(',');

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
        breakItem.className = isLunch ? 'schedule-item lunch' : 'schedule-item break';
        breakItem.innerHTML = `
            <div class="time">${formatTime(startTime)} - ${formatTime(endTime)}</div>
            <p>${title}</p>
        `;
        return breakItem;
    }

    // Event listener for the category filter
    categoryFilter.addEventListener('change', (e) => {
        const selectedCategory = e.target.value;
        const talkElements = document.querySelectorAll('#schedule-container .schedule-item:not(.break):not(.lunch)');

        talkElements.forEach(talkElement => {
            if (selectedCategory === 'all' || talkElement.dataset.categories.includes(selectedCategory)) {
                talkElement.classList.remove('hidden');
            } else {
                talkElement.classList.add('hidden');
            }
        });
    });
});
