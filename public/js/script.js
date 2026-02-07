document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const scheduleContainer = document.getElementById('schedule-container');
    const categoryFilter = document.getElementById('category-filter');
    const dateFilter = document.getElementById('date-filter');
    const addTalkBtn = document.getElementById('add-talk-btn');
    const formOverlay = document.getElementById('form-overlay');
    const addTalkForm = document.getElementById('add-talk-form');
    const cancelTalkBtn = document.getElementById('cancel-talk-btn');
    const timeSelect = document.getElementById('talk-time');
    // New Category Elements
    const categoryInput = document.getElementById('talk-category-input');
    const addCategoryBtn = document.getElementById('add-category-btn');
    const categoryDatalist = document.getElementById('category-datalist');
    const selectedCategoriesContainer = document.getElementById('selected-categories-container');


    // --- State and Constants ---
    let allTalks = [];
    const ALL_SLOTS = ["10:00:00", "11:10:00", "12:20:00", "14:20:00", "15:30:00", "16:40:00"];
    const toYYYYMMDD = (date) => new Date(date).toISOString().split('T')[0];

    // --- Initial Setup ---
    fetchAndRender();

    // --- Event Listeners ---
    categoryFilter.addEventListener('change', filterAndRender);
    dateFilter.addEventListener('change', filterAndRender);
    addTalkBtn.addEventListener('click', showAddTalkForm);
    cancelTalkBtn.addEventListener('click', hideAddTalkForm);
    addTalkForm.addEventListener('submit', handleFormSubmit);
    scheduleContainer.addEventListener('click', handleScheduleClick);
    // New Category Listeners
    addCategoryBtn.addEventListener('click', addCategoryFromInput);
    categoryInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCategoryFromInput();
        }
    });
    selectedCategoriesContainer.addEventListener('click', handleRemoveCategory);


    // --- Main Functions ---
    function fetchAndRender() {
        fetch('/api/talks').then(response => response.json()).then(talks => {
            allTalks = talks.sort((a, b) => new Date(b.date) - new Date(a.date));
            populateFilters();
            filterAndRender();
        });
    }

    function filterAndRender() {
        const selectedCategory = categoryFilter.value;
        const selectedDate = dateFilter.value;
        const filteredTalks = allTalks.filter(talk => {
            const matchesCategory = selectedCategory === 'all' || talk.categories.includes(selectedCategory);
            const matchesDate = selectedDate === 'all' || talk.date === selectedDate;
            return matchesCategory && matchesDate;
        });
        renderSchedule(filteredTalks);
    }

    function renderSchedule(talksToRender) {
        scheduleContainer.innerHTML = '';
        if (talksToRender.length === 0) {
            scheduleContainer.innerHTML = '<p style="text-align: center; padding: 2rem 0;">No talks match the selected criteria.</p>';
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
            const talksForDay = talksByDate[dateStr].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
            talksForDay.forEach((talk) => scheduleContainer.appendChild(createTalkElement(talk)));
        });
    }

    // --- Form & Action Handling ---
    function showAddTalkForm() {
        const tomorrow = new Date();
        tomorrow.setDate(new Date().getDate() + 1);
        const tomorrowStr = toYYYYMMDD(tomorrow);
        const talksForTomorrow = allTalks.filter(talk => talk.date === tomorrowStr);
        const occupiedSlots = talksForTomorrow.map(talk => new Date(talk.startTime).toTimeString().split(' ')[0]);
        const availableSlots = ALL_SLOTS.filter(slot => !occupiedSlots.includes(slot));
        timeSelect.innerHTML = '';
        if (availableSlots.length > 0) {
            availableSlots.forEach(slot => {
                const option = document.createElement('option');
                const startTime = new Date(`${tomorrowStr}T${slot}`);
                const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
                option.value = slot;
                option.textContent = `${startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} - ${endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
                timeSelect.appendChild(option);
            });
        } else {
            const option = document.createElement('option');
            option.textContent = 'No available slots for tomorrow';
            option.disabled = true;
            timeSelect.appendChild(option);
        }
        // Populate category datalist and clear selected container
        populateCategoryDatalist();
        selectedCategoriesContainer.innerHTML = '';
        formOverlay.classList.remove('hidden');
    }

    function hideAddTalkForm() {
        addTalkForm.reset();
        selectedCategoriesContainer.innerHTML = ''; // Clear selected categories on hide
        formOverlay.classList.add('hidden');
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        const tomorrow = new Date();
        tomorrow.setDate(new Date().getDate() + 1);
        const tomorrowStr = toYYYYMMDD(tomorrow);
        const selectedTime = document.getElementById('talk-time').value;
        if (!selectedTime) {
            alert('No available time slots to book.');
            return;
        }
        // Get categories from the new UI
        const categories = [...selectedCategoriesContainer.children].map(tag => tag.dataset.category);
        if (categories.length === 0) {
            alert('Please add at least one category.');
            return;
        }

        const startTime = new Date(`${tomorrowStr}T${selectedTime}`);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        const newTalk = {
            date: tomorrowStr,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            title: document.getElementById('talk-title').value,
            speakers: document.getElementById('talk-speakers').value.split(',').map(s => s.trim()),
            description: document.getElementById('talk-description').value,
            categories: categories
        };

        try {
            const response = await fetch('/api/talks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTalk)
            });
            if (!response.ok) throw new Error('Failed to save the talk.');
            hideAddTalkForm();
            const savedTalk = await response.json();
            allTalks.unshift(savedTalk);
            allTalks.sort((a, b) => new Date(b.date) - new Date(a.date));
            populateFilters();
            filterAndRender();
        } catch (error) {
            console.error(error);
            alert('An error occurred while saving the talk. Please try again.');
        }
    }
    
    function handleScheduleClick(e) {
        if (e.target.classList.contains('delete-talk-btn')) {
            const talkId = parseInt(e.target.dataset.id, 10);
            if (confirm('Are you sure you want to delete this talk?')) deleteTalk(talkId);
        }
    }

    async function deleteTalk(id) {
        try {
            const response = await fetch(`/api/talks/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete the talk.');
            allTalks = allTalks.filter(talk => talk.id !== id);
            populateFilters();
            filterAndRender();
        } catch (error) {
            console.error(error);
            alert('An error occurred while deleting the talk.');
        }
    }

    // --- Category Input Functions ---
    function addCategoryFromInput() {
        const category = categoryInput.value.trim();
        if (category) {
            const existingTags = [...selectedCategoriesContainer.children].map(tag => tag.dataset.category);
            if (!existingTags.includes(category)) {
                const tag = document.createElement('div');
                tag.className = 'selected-category-tag';
                tag.dataset.category = category;
                tag.textContent = category;
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-category-btn';
                removeBtn.innerHTML = '&times;'; // 'x' symbol
                tag.appendChild(removeBtn);
                selectedCategoriesContainer.appendChild(tag);
            }
            categoryInput.value = '';
        }
    }

    function handleRemoveCategory(e) {
        if (e.target.classList.contains('remove-category-btn')) {
            e.target.parentElement.remove();
        }
    }

    // --- UI Population & Element Creation ---
    function populateFilters() {
        const allCategories = new Set();
        allTalks.forEach(talk => talk.categories.forEach(category => allCategories.add(category)));
        const selectedCategory = categoryFilter.value;
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        [...allCategories].sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
        categoryFilter.value = selectedCategory;

        const allDates = new Set();
        allTalks.forEach(talk => allDates.add(talk.date));
        const selectedDate = dateFilter.value;
        dateFilter.innerHTML = '<option value="all">All Dates</option>';
        [...allDates].sort((a,b) => new Date(b) - new Date(a)).forEach(date => {
            const option = document.createElement('option');
            option.value = date;
            option.textContent = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            dateFilter.appendChild(option);
        });
        dateFilter.value = selectedDate;
    }

    function populateCategoryDatalist() {
        const allCategories = new Set();
        allTalks.forEach(talk => talk.categories.forEach(category => allCategories.add(category)));
        categoryDatalist.innerHTML = '';
        [...allCategories].sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            categoryDatalist.appendChild(option);
        });
    }
    
    function createTalkElement(talk) {
        const item = document.createElement('div');
        item.className = 'schedule-item';
        const talkStartTime = new Date(talk.startTime);
        let deleteButtonHTML = '';
        if (talkStartTime > new Date()) {
            deleteButtonHTML = `<button class="delete-talk-btn" data-id="${talk.id}">Delete</button>`;
        }
        item.innerHTML = `
            <div class="time">${talkStartTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} - ${new Date(talk.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
            <h2>${talk.title}</h2>
            <div class="speakers">${talk.speakers.join(', ')}</div>
            <p>${talk.description}</p>
            <div class="categories">
                ${talk.categories.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
            </div>
            ${deleteButtonHTML}
        `;
        return item;
    }
});