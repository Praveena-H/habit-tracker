// Define available habits
const habits = [
    { name: 'Workout', key: 'workout' },
    { name: 'Reading', key: 'reading' },
    { name: 'Learn Language', key: 'language' },
    { name: 'Vibe Code', key: 'code' },
    { name: 'Stop Doom Scroll', key: 'noScroll' },
    { name: 'Eat Healthy', key: 'healthy' },
    { name: 'Save Money', key: 'saveMoney' }
];

const maxHabits = 3;
let selectedHabits = JSON.parse(localStorage.getItem('selectedHabits')) || [];

const habitSelectionDiv = document.querySelector('.habit-options');
const dashboard = document.getElementById('dashboard');
const modal = document.getElementById('habit-selection');

// Show habit selection modal if no habits selected
if(selectedHabits.length === 0) {
    modal.style.display = 'block';
}

// Generate habit selection buttons
habits.forEach(habit => {
    const btn = document.createElement('button');
    btn.textContent = habit.name;
    btn.addEventListener('click', () => toggleHabit(habit.key, btn));
    habitSelectionDiv.appendChild(btn);
});

function toggleHabit(key, btn) {
    if(selectedHabits.includes(key)) {
        selectedHabits = selectedHabits.filter(h => h !== key);
        btn.style.background = '';
    } else if(selectedHabits.length < maxHabits) {
        selectedHabits.push(key);
        btn.style.background = '#4caf50';
    } else {
        alert(`You can only select ${maxHabits} habits`);
    }
}

// Save selected habits
document.getElementById('save-habits').addEventListener('click', () => {
    if(selectedHabits.length !== maxHabits) {
        alert(`Select exactly ${maxHabits} habits to proceed`);
        return;
    }
    localStorage.setItem('selectedHabits', JSON.stringify(selectedHabits));
    modal.style.display = 'none';
    renderDashboard();
});

// Render habit cards
function renderDashboard() {
    dashboard.innerHTML = '';
    selectedHabits.forEach(key => {
        const habitCard = document.createElement('div');
        habitCard.classList.add('habit-card');
        habitCard.dataset.key = key;

        // Load completion state from LocalStorage
        const today = new Date().toDateString();
        const habitData = JSON.parse(localStorage.getItem(key)) || {};
        const doneToday = habitData[today] || false;
        if(doneToday) habitCard.classList.add('completed');

        habitCard.innerHTML = `
            <h3>${habits.find(h => h.key === key).name}</h3>
            <button>${doneToday ? 'Undo' : 'Done'}</button>
            <p>Streak: ${habitData.streak || 0} days</p>
        `;

        // Handle habit completion
        habitCard.querySelector('button').addEventListener('click', () => {
            habitData[today] = !habitData[today];
            if(habitData[today]) {
                habitCard.classList.add('completed');
                habitData.streak = (habitData.streak || 0) + 1;
            } else {
                habitCard.classList.remove('completed');
                habitData.streak = Math.max((habitData.streak || 1) - 1, 0);
            }
            habitCard.querySelector('button').textContent = habitData[today] ? 'Undo' : 'Done';
            habitCard.querySelector('p').textContent = `Streak: ${habitData.streak} days`;
            localStorage.setItem(key, JSON.stringify(habitData));
        });

        dashboard.appendChild(habitCard);
    });
}

// Initial render if habits already selected
if(selectedHabits.length > 0) renderDashboard();
