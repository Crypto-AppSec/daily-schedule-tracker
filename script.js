// Daily Productivity Habit Tracker with Routine Sections
class HabitTracker {
    constructor() {
        this.habits = JSON.parse(localStorage.getItem('habits')) || [];
        this.schedules = JSON.parse(localStorage.getItem('schedules')) || [];
        this.completedToday = JSON.parse(localStorage.getItem('completedToday')) || [];
        this.streak = parseInt(localStorage.getItem('streak')) || 0;
        this.lastCompletedDate = localStorage.getItem('lastCompletedDate') || '';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDefaultHabits();
        this.loadHabits();
        this.loadSchedules();
        this.updateStats();
        this.checkStreak();
    }

    setupEventListeners() {
        // Modal controls for all routine sections
        document.querySelectorAll('.add-habit-btn').forEach(btn => {
            btn.addEventListener('click', () => this.openModal('habit-modal'));
        });
        
        document.getElementById('add-schedule-btn').addEventListener('click', () => this.openModal('schedule-modal'));
        
        // Close modals
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal').id));
        });

        // Cancel buttons
        document.getElementById('cancel-habit').addEventListener('click', () => this.closeModal('habit-modal'));
        document.getElementById('cancel-schedule').addEventListener('click', () => this.closeModal('schedule-modal'));

        // Form submissions
        document.getElementById('habit-form').addEventListener('submit', (e) => this.handleHabitSubmit(e));
        document.getElementById('schedule-form').addEventListener('submit', (e) => this.handleScheduleSubmit(e));

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    loadDefaultHabits() {
        // Only add default habits if no habits exist
        if (this.habits.length === 0) {
            const defaultMorningHabits = [
                {
                    id: 'morning-light-1',
                    name: 'Get outside within 30-60 minutes of waking for natural light exposure',
                    routine: 'morning',
                    category: 'health',
                    time: '07:00',
                    createdAt: new Date().toISOString(),
                    completedDates: [],
                    description: 'Sunny day: 5-10 minutes, Cloudy day: 10-15 minutes, Overcast day: up to 30 minutes'
                },
                {
                    id: 'morning-light-2',
                    name: 'Look toward the sunrise (never stare directly at the sun)',
                    routine: 'morning',
                    category: 'health',
                    time: '07:05',
                    createdAt: new Date().toISOString(),
                    completedDates: []
                },
                {
                    id: 'morning-walk',
                    name: 'Take a morning walk for combined light exposure and optic flow benefits',
                    routine: 'morning',
                    category: 'health',
                    time: '07:10',
                    createdAt: new Date().toISOString(),
                    completedDates: []
                },
                {
                    id: 'morning-hydration',
                    name: 'Drink 32 ounces (1 liter) of water with a pinch of sea salt',
                    routine: 'morning',
                    category: 'health',
                    time: '07:00',
                    createdAt: new Date().toISOString(),
                    completedDates: []
                },
                {
                    id: 'morning-caffeine-delay',
                    name: 'Delay caffeine for 90-120 minutes after waking (unless exercising first)',
                    routine: 'morning',
                    category: 'health',
                    time: '08:30',
                    createdAt: new Date().toISOString(),
                    completedDates: [],
                    description: 'This helps optimize cortisol and adenosine receptor function'
                },
                {
                    id: 'morning-breathing',
                    name: 'Use cyclic hyperventilation breathing (if needed for energy)',
                    routine: 'morning',
                    category: 'health',
                    time: '07:15',
                    createdAt: new Date().toISOString(),
                    completedDates: [],
                    description: 'Optional: Use when you need an energy boost'
                }
            ];

            this.habits.push(...defaultMorningHabits);
            this.saveHabits();
        }
    }

    openModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
        
        // Pre-select routine based on which button was clicked
        if (modalId === 'habit-modal') {
            const clickedButton = event.target.closest('.add-habit-btn');
            if (clickedButton) {
                const routine = clickedButton.getAttribute('data-routine');
                document.getElementById('habit-routine').value = routine;
            }
        }
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        // Reset form
        document.getElementById(modalId).querySelector('form').reset();
    }

    handleHabitSubmit(e) {
        e.preventDefault();
        
        const habitData = {
            id: Date.now(),
            name: document.getElementById('habit-name').value,
            routine: document.getElementById('habit-routine').value,
            category: document.getElementById('habit-category').value,
            time: document.getElementById('habit-time').value,
            createdAt: new Date().toISOString(),
            completedDates: []
        };

        this.habits.push(habitData);
        this.saveHabits();
        this.loadHabits();
        this.closeModal('habit-modal');
    }

    handleScheduleSubmit(e) {
        e.preventDefault();
        
        const scheduleData = {
            id: Date.now(),
            title: document.getElementById('schedule-title').value,
            startTime: document.getElementById('schedule-start').value,
            endTime: document.getElementById('schedule-end').value,
            type: document.getElementById('schedule-type').value,
            createdAt: new Date().toISOString()
        };

        this.schedules.push(scheduleData);
        this.saveSchedules();
        this.loadSchedules();
        this.closeModal('schedule-modal');
    }

    loadHabits() {
        // Clear all routine containers
        document.getElementById('morning-habits-container').innerHTML = '';
        document.getElementById('midday-habits-container').innerHTML = '';
        document.getElementById('evening-habits-container').innerHTML = '';

        // Group habits by routine
        const morningHabits = this.habits.filter(h => h.routine === 'morning');
        const middayHabits = this.habits.filter(h => h.routine === 'midday');
        const eveningHabits = this.habits.filter(h => h.routine === 'evening');

        // Load morning habits
        this.loadRoutineHabits('morning-habits-container', morningHabits, 'morning');
        
        // Load midday habits
        this.loadRoutineHabits('midday-habits-container', middayHabits, 'midday');
        
        // Load evening habits
        this.loadRoutineHabits('evening-habits-container', eveningHabits, 'evening');
    }

    loadRoutineHabits(containerId, habits, routineType) {
        const container = document.getElementById(containerId);
        
        if (habits.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-plus-circle"></i>
                    <p>No ${routineType} habits added yet. Click "Add Habit" to get started!</p>
                </div>
            `;
            return;
        }

        habits.forEach(habit => {
            const isCompletedToday = this.completedToday.includes(habit.id);
            const habitElement = document.createElement('div');
            habitElement.className = `habit-item ${isCompletedToday ? 'completed' : ''}`;
            habitElement.setAttribute('data-category', habit.category);
            habitElement.setAttribute('data-id', habit.id);

            habitElement.innerHTML = `
                <div class="habit-info">
                    <div class="habit-name">${habit.name}</div>
                    <div class="habit-category">
                        <i class="fas fa-tag"></i>
                        ${this.getCategoryDisplayName(habit.category)}
                        ${habit.time ? `<i class="fas fa-clock"></i> ${habit.time}` : ''}
                    </div>
                    ${habit.description ? `<div class="habit-description"><i class="fas fa-info-circle"></i> ${habit.description}</div>` : ''}
                </div>
                <div class="habit-actions">
                    <button class="btn-complete ${isCompletedToday ? 'completed' : ''}" 
                            onclick="habitTracker.toggleHabit('${habit.id}')">
                        ${isCompletedToday ? '<i class="fas fa-check"></i> Done' : '<i class="fas fa-check"></i> Complete'}
                    </button>
                    <button class="btn-delete" onclick="habitTracker.deleteHabit('${habit.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            container.appendChild(habitElement);
        });
    }

    loadSchedules() {
        const container = document.getElementById('schedule-container');
        container.innerHTML = '';

        if (this.schedules.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clock"></i>
                    <p>No schedule items added yet. Click "Add Time Block" to get started!</p>
                </div>
            `;
            return;
        }

        // Sort schedules by start time
        const sortedSchedules = [...this.schedules].sort((a, b) => a.startTime.localeCompare(b.startTime));

        sortedSchedules.forEach(schedule => {
            const scheduleElement = document.createElement('div');
            scheduleElement.className = 'schedule-item';
            scheduleElement.setAttribute('data-type', schedule.type);
            scheduleElement.setAttribute('data-id', schedule.id);

            scheduleElement.innerHTML = `
                <div class="schedule-info">
                    <div class="schedule-title">${schedule.title}</div>
                    <div class="schedule-time">
                        <i class="fas fa-clock"></i>
                        ${schedule.startTime} - ${schedule.endTime}
                        <span class="schedule-type">${this.getTypeDisplayName(schedule.type)}</span>
                    </div>
                </div>
                <div class="schedule-actions">
                    <button class="btn-delete" onclick="habitTracker.deleteSchedule(${schedule.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            container.appendChild(scheduleElement);
        });
    }

    toggleHabit(habitId) {
        const today = new Date().toDateString();
        const habitIndex = this.habits.findIndex(h => h.id === habitId);
        
        if (habitIndex === -1) return;

        const isCompletedToday = this.completedToday.includes(habitId);
        
        if (isCompletedToday) {
            // Remove from completed today
            this.completedToday = this.completedToday.filter(id => id !== habitId);
        } else {
            // Add to completed today
            this.completedToday.push(habitId);
        }

        // Update habit's completed dates
        if (isCompletedToday) {
            this.habits[habitIndex].completedDates = this.habits[habitIndex].completedDates.filter(date => date !== today);
        } else {
            this.habits[habitIndex].completedDates.push(today);
        }

        this.saveHabits();
        this.saveCompletedToday();
        this.loadHabits();
        this.updateStats();
        this.checkStreak();
    }

    deleteHabit(habitId) {
        if (confirm('Are you sure you want to delete this habit?')) {
            this.habits = this.habits.filter(h => h.id !== habitId);
            this.completedToday = this.completedToday.filter(id => id !== habitId);
            this.saveHabits();
            this.saveCompletedToday();
            this.loadHabits();
            this.updateStats();
        }
    }

    deleteSchedule(scheduleId) {
        if (confirm('Are you sure you want to delete this schedule item?')) {
            this.schedules = this.schedules.filter(s => s.id !== scheduleId);
            this.saveSchedules();
            this.loadSchedules();
        }
    }

    updateStats() {
        const completedCount = this.completedToday.length;
        const totalHabits = this.habits.length;
        const completionRate = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

        document.getElementById('completed-today').textContent = completedCount;
        document.getElementById('completion-rate').textContent = `${completionRate}%`;
    }

    checkStreak() {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

        if (this.lastCompletedDate === today) {
            // Already completed today, no need to update
            return;
        }

        if (this.lastCompletedDate === yesterday) {
            // Continue streak
            this.streak++;
        } else if (this.lastCompletedDate !== today) {
            // Break in streak
            this.streak = 0;
        }

        // Update streak if completed today
        if (this.completedToday.length > 0) {
            this.streak = Math.max(this.streak, 1);
            this.lastCompletedDate = today;
        }

        document.getElementById('current-streak').textContent = this.streak;
        this.saveStreak();
    }

    getCategoryDisplayName(category) {
        const categories = {
            'health': 'Health & Wellness',
            'productivity': 'Productivity',
            'learning': 'Learning',
            'mindfulness': 'Mindfulness',
            'social': 'Social'
        };
        return categories[category] || category;
    }

    getTypeDisplayName(type) {
        const types = {
            'work': 'Work',
            'break': 'Break',
            'exercise': 'Exercise',
            'learning': 'Learning',
            'social': 'Social'
        };
        return types[type] || type;
    }

    saveHabits() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }

    saveSchedules() {
        localStorage.setItem('schedules', JSON.stringify(this.schedules));
    }

    saveCompletedToday() {
        localStorage.setItem('completedToday', JSON.stringify(this.completedToday));
    }

    saveStreak() {
        localStorage.setItem('streak', this.streak.toString());
        localStorage.setItem('lastCompletedDate', this.lastCompletedDate);
    }
}

// Initialize the habit tracker when the page loads
let habitTracker;
document.addEventListener('DOMContentLoaded', () => {
    habitTracker = new HabitTracker();
});
