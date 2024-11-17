// Get current date
const getCurrentDate = () => new Date();

// Get the start of the week (Sunday)
const getStartOfWeek = (date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day); // Set to previous Sunday
    return startOfWeek;
};

function getWeeksBetween(startDate, endDate) {
    // Get the time difference in milliseconds
    const timeDiff = endDate - startDate;

    // Convert milliseconds to days (1 day = 86400000 ms)
    const days = timeDiff / (1000 * 3600 * 24);

    // Return the number of full weeks (rounding down to the nearest whole number)
    return Math.floor(days / 7);
}

function calcMapWidth(weeks, cellWidth, cellGap) {
    return cellWidth * weeks.length + cellGap * (weeks.length - 1);
}

// Function to generate calendar data
function generateCalendar() {
    const weeks = [];
    const today = getCurrentDate(); // Get current date
    let currentDay = getStartOfWeek(today); // Get the start of this week (Sunday)
    
    // Calculate the oldest day to go back 6 months
    let oldestDay = new Date(today); // Copy the current date
    oldestDay.setMonth(today.getMonth() - 6); // Subtract 6 months

    const nWeeks = getWeeksBetween(oldestDay, today); // Get number of weeks between the two dates
    
    // Start from the current week and go back 6 months
    for (let i = 0; i < nWeeks; ++i) {
        weeks.push(new Date(currentDay)); // Add a copy of the current start of the week
        currentDay.setDate(currentDay.getDate() - 7); // Subtract 7 days for the next week
    }

    weeks.reverse();

    return weeks;
};

// Render the calendar
const renderCalendar = () => {
    const weeks = generateCalendar();
    const monthHeader = document.querySelector('.month-header');
    const heatmapContainer = document.querySelector('.heatmap');
    const today = getCurrentDate(); // Get current date for comparison
    const cellWidth = 20;
    const cellGap = 3;
    let calcMonthLabelInc = (index) => index*(cellWidth + cellGap);
    let currentMonth = today.getMonth();


    // Render the weeks (columns) for the heatmap
    weeks.forEach((weekStart,index) => {
        const weekColumn = document.createElement('div');
        weekColumn.className = 'week';

        if (currentMonth !== weekStart.getMonth()) {
            // Only add a new month label if this is the first week of a new month
            const monthLabel = document.createElement('div');
            monthLabel.className = 'month-label';
            monthLabel.textContent = weekStart.toLocaleString('default', { month: 'short' }); // e.g., "Jan"
            monthLabel.style.left = `${calcMonthLabelInc(index)}px`; // Position it above the column
            monthHeader.appendChild(monthLabel);
            currentMonth = weekStart.getMonth(); 
        }

        // Create 7 days for each week
        for (let i = 0; i < 7; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'day';

            const currentDay = new Date(weekStart);
            currentDay.setDate(currentDay.getDate() + i); // Set the current day in the week

            if (currentDay > today) break; // Stop if the day is in the future

            dayDiv.dataset.date = currentDay.toISOString().split('T')[0]; // Store date in ISO format
            dayDiv.title = currentDay.toDateString(); // Show date as tooltip

            // Add a click handler to mark as completed
            dayDiv.addEventListener('click', () => {
                dayDiv.classList.toggle('completed');
                saveData(dayDiv.dataset.date, dayDiv.classList.contains('completed'));
            });

            weekColumn.appendChild(dayDiv);
        }

        heatmapContainer.appendChild(weekColumn);
    });
    monthHeader.style.width = `${calcMapWidth(weeks,cellWidth,cellGap)}px`;  // Set a new width (e.g., 500px)
};

// Save completion status to localStorage
const saveData = (date, completed) => {
    const habits = JSON.parse(localStorage.getItem('habits') || '{}');
    habits[date] = completed;
    localStorage.setItem('habits', JSON.stringify(habits));
};

// Load completion status from localStorage
const loadData = () => {
    const habits = JSON.parse(localStorage.getItem('habits') || '{}');
    document.querySelectorAll('.day').forEach(day => {
        if (habits[day.dataset.date]) {
            day.classList.add('completed');
        }
    });
};

// Initialize the calendar and load saved data
renderCalendar();
loadData();
