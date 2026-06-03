document.addEventListener('DOMContentLoaded', () => {
    const clientNameInput = document.getElementById('clientNameInput');
    const addClientBtn = document.getElementById('addClientBtn');
    const clientTableBody = document.getElementById('clientTableBody');
    const clientTable = document.getElementById('clientTable');
    const emptyState = document.getElementById('emptyState');

    let clients = loadClients();
    renderAll();

    addClientBtn.addEventListener('click', addClient);
    clientNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addClient();
    });

    function addClient() {
        const name = clientNameInput.value.trim();
        if (!name) {
            clientNameInput.focus();
            return;
        }

        const client = {
            id: Date.now().toString(),
            name: name,
            mortgage: null,
            protection: null
        };

        clients.push(client);
        saveClients();
        renderAll();
        clientNameInput.value = '';
        clientNameInput.focus();
    }

    function removeClient(id) {
        const row = document.querySelector(`[data-id="${id}"]`);
        if (row) {
            row.classList.add('row-removing');
            setTimeout(() => {
                clients = clients.filter(c => c.id !== id);
                saveClients();
                renderAll();
            }, 300);
        }
    }

    function updateClientField(id, field, value) {
        const client = clients.find(c => c.id === id);
        if (client) {
            client[field] = value;
            saveClients();
            updateCompleteButton(id);
        }
    }

    function updateCompleteButton(id) {
        const client = clients.find(c => c.id === id);
        const btn = document.querySelector(`[data-id="${id}"] .btn-complete`);
        if (client && btn) {
            btn.disabled = !(client.mortgage && client.protection);
        }
    }

    function renderAll() {
        clientTableBody.innerHTML = '';

        if (clients.length === 0) {
            clientTable.classList.add('hidden');
            emptyState.classList.add('visible');
            return;
        }

        clientTable.classList.remove('hidden');
        emptyState.classList.remove('visible');

        clients.forEach(client => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', client.id);

            const isComplete = client.mortgage && client.protection;

            row.innerHTML = `
                <td class="client-name">${escapeHtml(client.name)}</td>
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

            // Mortgage radio listeners
            row.querySelectorAll(`input[name="mortgage-${client.id}"]`).forEach(radio => {
                radio.addEventListener('change', (e) => {
                    updateClientField(client.id, 'mortgage', e.target.value);
                });
            });

            // Protection radio listeners
            row.querySelectorAll(`input[name="protection-${client.id}"]`).forEach(radio => {
                radio.addEventListener('change', (e) => {
                    updateClientField(client.id, 'protection', e.target.value);
                });
            });

            // Complete button listener
            row.querySelector('.btn-complete').addEventListener('click', () => {
                removeClient(client.id);
            });

            clientTableBody.appendChild(row);
        });
    }

    function saveClients() {
        localStorage.setItem('clientTracker', JSON.stringify(clients));
    }

    function loadClients() {
        const data = localStorage.getItem('clientTracker');
        return data ? JSON.parse(data) : [];
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
