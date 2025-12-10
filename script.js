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
if(habitData[today]) {
    habitCard.classList.add('completed');
    habitData.streak = (habitData.streak || 0) + 1;

    // Reward animation on milestone streaks
    if(habitData.streak % 7 === 0) {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        alert(`🎉 Congrats! You hit a ${habitData.streak}-day streak for ${habitCard.querySelector('h3').textContent}!`);
    }
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
function renderWeeklyChart() {
    const ctx = document.getElementById('weeklyChart').getContext('2d');
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const datasets = selectedHabits.map(key => {
        const habitData = JSON.parse(localStorage.getItem(key)) || {};
        const last7Days = labels.map(day => {
            // Simple mapping: check if habit done in last 7 days
            const date = new Date();
            date.setDate(date.getDate() - (6 - labels.indexOf(day)));
            const dayStr = date.toDateString();
            return habitData[dayStr] ? 1 : 0;
        });
        return {
            label: habits.find(h => h.key === key).name,
            data: last7Days,
            fill: true,
            backgroundColor: getRandomColor(0.2),
            borderColor: getRandomColor(1),
            tension: 0.4
        };
    });

    new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } },
            scales: { y: { beginAtZero: true, max: 1 } }
        }
    });
}
function updateMotivation() {
    const streaks = selectedHabits.map(key => {
        const data = JSON.parse(localStorage.getItem(key)) || {};
        return data.streak || 0;
    });
    const maxStreak = Math.max(...streaks);
    const msg = maxStreak >= 7 ? "Keep the streak going! 🚀" :
                maxStreak >= 3 ? "Nice! You're building momentum!" :
                "Start strong and track your habits today!";
    document.getElementById('motivational-msg').textContent = msg;
}

// Call after any habit update
updateMotivation();

// Utility to generate random pastel colors
function getRandomColor(alpha) {
    const r = Math.floor(Math.random()*200 + 30);
    const g = Math.floor(Math.random()*200 + 30);
    const b = Math.floor(Math.random()*200 + 30);
    return `rgba(${r},${g},${b},${alpha})`;
}

// Call after dashboard render
renderWeeklyChart();


// Initial render if habits already selected
if(selectedHabits.length > 0) renderDashboard();
