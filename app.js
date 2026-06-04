document.addEventListener('DOMContentLoaded', () => {
    // Client elements
    const clientNameInput = document.getElementById('clientNameInput');
    const addClientBtn = document.getElementById('addClientBtn');
    const clientTableBody = document.getElementById('clientTableBody');
    const clientTable = document.getElementById('clientTable');
    const clientEmptyState = document.getElementById('clientEmptyState');

    // Task elements
    const taskNameInput = document.getElementById('taskNameInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskTableBody = document.getElementById('taskTableBody');
    const taskTable = document.getElementById('taskTable');
    const taskEmptyState = document.getElementById('taskEmptyState');

    // Load saved data
    let clients = loadData('clientTracker');
    let tasks = loadData('taskTracker');

    renderClients();
    renderTasks();

    // Update countdowns every minute
    setInterval(() => {
        renderClients();
        renderTasks();
    }, 60000);

    // Client listeners
    addClientBtn.addEventListener('click', addClient);
    clientNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addClient();
    });

    // Task listeners
    addTaskBtn.addEventListener('click', addTask);
    taskNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // ============ SHARED UTILITIES ============

    function loadData(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    function saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function getWorkingDaysRemaining(deadlineStr) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadline = new Date(deadlineStr);
        deadline.setHours(0, 0, 0, 0);

        if (deadline <= today) return 0;

        let count = 0;
        const current = new Date(today);
        while (current < deadline) {
            current.setDate(current.getDate() + 1);
            const day = current.getDay();
            if (day !== 0 && day !== 6) {
                count++;
            }
        }
        return count;
    }

    function getDeadlineColor(days) {
        if (days <= 1) return 'red';
        if (days <= 3) return 'amber';
        return 'green';
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function removeRow(id, dataArray, storageKey) {
        const row = document.querySelector(`[data-id="${id}"]`);
        if (row) {
            row.classList.add('row-removing');
            setTimeout(() => {
                const index = dataArray.findIndex(item => item.id === id);
                if (index > -1) dataArray.splice(index, 1);
                saveData(storageKey, dataArray);
                if (storageKey === 'clientTracker') renderClients();
                else renderTasks();
            }, 300);
        }
    }

    // ============ CLIENTS ============

    function addClient() {
        const name = clientNameInput.value.trim();
        if (!name) {
            clientNameInput.focus();
            return;
        }

        clients.push({
            id: Date.now().toString(),
            name: name,
            deadline: null,
            mortgage: null,
            protection: null
        });

        saveData('clientTracker', clients);
        renderClients();
        clientNameInput.value = '';
        clientNameInput.focus();
    }

    function renderClients() {
        clientTableBody.innerHTML = '';

        if (clients.length === 0) {
            clientTable.classList.add('hidden');
            clientEmptyState.classList.add('visible');
            return;
        }

        clientTable.classList.remove('hidden');
        clientEmptyState.classList.remove('visible');

        clients.forEach(client => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', client.id);

            const isComplete = client.mortgage && client.protection;

            let deadlineHtml = '';
            if (client.deadline) {
                const days = getWorkingDaysRemaining(client.deadline);
                const color = getDeadlineColor(days);
                deadlineHtml = `<span class="days-badge ${color}" title="Click to change deadline">${days}</span>`;
            } else {
                deadlineHtml = `<input type="date" class="deadline-input">`;
            }

            row.innerHTML = `
                <td class="client-name">${escapeHtml(client.name)}</td>
                <td class="deadline-cell">${deadlineHtml}</td>
                <td>
                    <div class="radio-group">
                        <div class="radio-option">
                            <input type="radio" name="mortgage-${client.id}" id="mortgage-check-${client.id}" value="check" ${client.mortgage === 'check' ? 'checked' : ''}>
                            <label for="mortgage-check-${client.id}">Check</label>
                        </div>
                        <div class="radio-option">
                            <input type="radio" name="mortgage-${client.id}" id="mortgage-na-${client.id}" value="na" ${client.mortgage === 'na' ? 'checked' : ''}>
                            <label for="mortgage-na-${client.id}">N/A</label>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="radio-group">
                        <div class="radio-option">
                            <input type="radio" name="protection-${client.id}" id="protection-check-${client.id}" value="check" ${client.protection === 'check' ? 'checked' : ''}>
                            <label for="protection-check-${client.id}">Check</label>
                        </div>
                        <div class="radio-option">
                            <input type="radio" name="protection-${client.id}" id="protection-na-${client.id}" value="na" ${client.protection === 'na' ? 'checked' : ''}>
                            <label for="protection-na-${client.id}">N/A</label>
                        </div>
                    </div>
                </td>
                <td>
                    <button class="btn-complete" ${!isComplete ? 'disabled' : ''}>Complete</button>
                </td>
            `;

            // Deadline listener
            if (client.deadline) {
                row.querySelector('.days-badge').addEventListener('click', () => {
                    const cell = row.querySelector('.deadline-cell');
                    cell.innerHTML = `<input type="date" class="deadline-input" value="${client.deadline}">`;
                    const input = cell.querySelector('.deadline-input');
                    input.addEventListener('change', (e) => {
                        client.deadline = e.target.value || null;
                        saveData('clientTracker', clients);
                        renderClients();
                    });
                    input.focus();
                });
            } else {
                row.querySelector('.deadline-input').addEventListener('change', (e) => {
                    client.deadline = e.target.value || null;
                    saveData('clientTracker', clients);
                    renderClients();
                });
            }

            // Mortgage radio listeners
            row.querySelectorAll(`input[name="mortgage-${client.id}"]`).forEach(radio => {
                radio.addEventListener('change', (e) => {
                    client.mortgage = e.target.value;
                    saveData('clientTracker', clients);
                    const btn = row.querySelector('.btn-complete');
                    btn.disabled = !(client.mortgage && client.protection);
                });
            });

            // Protection radio listeners
            row.querySelectorAll(`input[name="protection-${client.id}"]`).forEach(radio => {
                radio.addEventListener('change', (e) => {
                    client.protection = e.target.value;
                    saveData('clientTracker', clients);
                    const btn = row.querySelector('.btn-complete');
                    btn.disabled = !(client.mortgage && client.protection);
                });
            });

            // Complete button
            row.querySelector('.btn-complete').addEventListener('click', () => {
                removeRow(client.id, clients, 'clientTracker');
            });

            clientTableBody.appendChild(row);
        });
    }

    // ============ TASKS ============

    function addTask() {
        const name = taskNameInput.value.trim();
        if (!name) {
            taskNameInput.focus();
            return;
        }

        tasks.push({
            id: Date.now().toString(),
            name: name,
            deadline: null,
            notes: ''
        });

        saveData('taskTracker', tasks);
        renderTasks();
        taskNameInput.value = '';
        taskNameInput.focus();
    }

    function renderTasks() {
        taskTableBody.innerHTML = '';

        if (tasks.length === 0) {
            taskTable.classList.add('hidden');
            taskEmptyState.classList.add('visible');
            return;
        }

        taskTable.classList.remove('hidden');
        taskEmptyState.classList.remove('visible');

        tasks.forEach(task => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', task.id);

            let deadlineHtml = '';
            if (task.deadline) {
                const days = getWorkingDaysRemaining(task.deadline);
                const color = getDeadlineColor(days);
                deadlineHtml = `<span class="days-badge ${color}" title="Click to change deadline">${days}</span>`;
            } else {
                deadlineHtml = `<input type="date" class="deadline-input">`;
            }

            row.innerHTML = `
                <td class="task-name">${escapeHtml(task.name)}</td>
                <td class="deadline-cell">${deadlineHtml}</td>
                <td class="notes-cell">
                    <textarea class="notes-input" placeholder="Add notes..." rows="1">${escapeHtml(task.notes)}</textarea>
                </td>
                <td>
                    <button class="btn-complete-task">Complete</button>
                </td>
            `;

            // Deadline listener
            if (task.deadline) {
                row.querySelector('.days-badge').addEventListener('click', () => {
                    const cell = row.querySelector('.deadline-cell');
                    cell.innerHTML = `<input type="date" class="deadline-input" value="${task.deadline}">`;
                    const input = cell.querySelector('.deadline-input');
                    input.addEventListener('change', (e) => {
                        task.deadline = e.target.value || null;
                        saveData('taskTracker', tasks);
                        renderTasks();
                    });
                    input.focus();
                });
            } else {
                row.querySelector('.deadline-input').addEventListener('change', (e) => {
                    task.deadline = e.target.value || null;
                    saveData('taskTracker', tasks);
                    renderTasks();
                });
            }

            // Notes listener
            const notesInput = row.querySelector('.notes-input');
            notesInput.addEventListener('input', (e) => {
                task.notes = e.target.value;
                saveData('taskTracker', tasks);
            });

            // Complete button
            row.querySelector('.btn-complete-task').addEventListener('click', () => {
                removeRow(task.id, tasks, 'taskTracker');
            });

            taskTableBody.appendChild(row);
        });
    }
});
