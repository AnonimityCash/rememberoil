document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const elements = {
        saveVehicleButton: document.querySelector('#saveVehicleButton'),
        getVehicleButton: document.querySelector('#getVehicleButton'),
        deleteVehicleButton: document.querySelector('#deleteVehicleButton'),
        clearVehicleButton: document.querySelector('#clearVehicleButton'),
        clearProfileButton: document.querySelector('#clearProfileButton'),
        clearDeleteButton: document.querySelector('#clearDeleteButton'),
        viewProfileButton: document.querySelector('#viewProfile'),
        addVehicleButton: document.querySelector('#addVehicle'),
        deleteVehicleNavButton: document.querySelector('#deleteVehicle'),
        revisionHistoryButton: document.querySelector('#revisionHistoryButton'), // Boton para mostrar historial

        addVehicleSection: document.querySelector('#addVehicleSection'),
        profileSection: document.querySelector('#profileSection'),
        deleteVehicleSection: document.querySelector('#deleteVehicleSection'),
        revisionHistorySection: document.querySelector('#revisionHistorySection'), // Nueva seccion

        vehicleInfo: document.querySelector('#vehicleInfo'),
        forms: {
            vehicle: document.querySelector('#vehicleForm'),
            profile: document.querySelector('#profileForm'),
            delete: document.querySelector('#deleteVehicleForm')
        }
    };

    // Funcion para mostrar una seccion y ocultar las demas
    function showSection(sectionId) {
        const sections = ['addVehicleSection', 'profileSection', 'deleteVehicleSection', 'revisionHistorySection'];
        sections.forEach(id => {
            if (elements[id]) {
                elements[id].classList.add('hidden');
            }
        });
        if (sectionId && elements[sectionId]) {
            elements[sectionId].classList.remove('hidden');
        }
    }

    // Funcion para limpiar los campos del formulario
    function clearForm(form) {
        if (form && form.reset) form.reset();
    }

    // Funcion para limpiar la seccion actual y volver a la pantalla principal
    function clearAndShowMain() {
        Object.values(elements.forms).forEach(clearForm);
        elements.vehicleInfo.innerHTML = '';
        showSection('');
    }

    // Manejo de eventos de clic
    function setupEventListeners() {
        if (elements.viewProfileButton) {
            elements.viewProfileButton.addEventListener('click', () => showSection('profileSection'));
        }
        if (elements.addVehicleButton) {
            elements.addVehicleButton.addEventListener('click', () => showSection('addVehicleSection'));
        }
        if (elements.deleteVehicleNavButton) {
            elements.deleteVehicleNavButton.addEventListener('click', () => showSection('deleteVehicleSection'));
        }
        if (elements.revisionHistoryButton) {
            elements.revisionHistoryButton.addEventListener('click', () => showSection('revisionHistorySection')); // Evento para historial
        }

        if (elements.saveVehicleButton) {
            elements.saveVehicleButton.addEventListener('click', () => handleSaveVehicle());
        }
        if (elements.getVehicleButton) {
            elements.getVehicleButton.addEventListener('click', () => handleGetVehicle());
        }
        if (elements.deleteVehicleButton) {
            elements.deleteVehicleButton.addEventListener('click', () => handleDeleteVehicle());
        }

        if (elements.clearVehicleButton) {
            elements.clearVehicleButton.addEventListener('click', () => clearForm(elements.forms.vehicle));
        }
        if (elements.clearProfileButton) {
            elements.clearProfileButton.addEventListener('click', () => {
                clearForm(elements.forms.profile);
                elements.vehicleInfo.innerHTML = '';
                showSection('');
            });
        }
        if (elements.clearDeleteButton) {
            elements.clearDeleteButton.addEventListener('click', () => {
                clearForm(elements.forms.delete);
                showSection('');
            });
        }
    }

    // Funcion para guardar un vehiculo
    async function handleSaveVehicle() {
        const vehicleData = {
            licensePlate: document.querySelector('#licensePlate').value,
            changeDate: document.querySelector('#changeDate').value,
            kilometers: parseInt(document.querySelector('#kilometers').value, 10),
            oilType: document.querySelector('#oilType').value,
            density: document.querySelector('#density').value,
            withFilter: document.querySelector('#withFilter').value,
            interval: parseInt(document.querySelector('#interval').value, 10),
            torque: parseInt(document.querySelector('#torque').value, 10),
            brand: document.querySelector('#brand').value,
            model: document.querySelector('#model').value,
            engine: document.querySelector('#engine').value,
            password: document.querySelector('#vehiclePassword').value
        };

        try {
            const response = await fetch('/api/vehicles/saveVehicle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vehicleData)
            });
            const result = await response.json();
            if (response.ok) {
                alert('Vehiculo guardado con exito.');
            } else {
                alert(`Error al guardar el vehiculo: ${result.message}`);
            }
        } catch (error) {
            alert('Error al guardar el vehiculo.');
        }
    }

    // Funcion para obtener un vehiculo
    async function handleGetVehicle() {
        const licensePlate = document.querySelector('#searchLicensePlate').value;
        const password = document.querySelector('#passwordGet').value;

        try {
            const response = await fetch(`/api/vehicles/getVehicle/${licensePlate}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const result = await response.json();
            if (response.ok) {
                // Excluir la contrasena del resultado mostrado
                const { password, ...filteredResult } = result;

                elements.vehicleInfo.innerHTML = `
                    <div class="vehicle-info">
                        <h2>Informacion del Vehiculo</h2>
                        ${Object.entries(filteredResult).map(([key, value]) => `<p><strong>${translateKey(key)}:</strong> ${value}</p>`).join('')}
                    </div>
                `;
                // Mostrar historial de revisiones del vehiculo
                showRevisionHistory(licensePlate);
            } else {
                elements.vehicleInfo.innerHTML = `<p>Error: ${result.message}</p>`;
            }
        } catch (error) {
            elements.vehicleInfo.innerHTML = '<p>Error al obtener el vehiculo.</p>';
        }
    }

    // Funcion para mostrar el historial de revisiones
    async function showRevisionHistory(licensePlate) {
        try {
            const response = await fetch(`/api/vehicles/revisionHistory/${licensePlate}`);
            const revisions = await response.json();
            if (response.ok) {
                const tableBody = document.querySelector('#revisionHistoryTable tbody');
                if (tableBody) {
                    tableBody.innerHTML = revisions.map(revision => `
                        <tr>
                            <td>${revision.changeDate}</td>
                            <td>${revision.description}</td>
                            <td>${revision.kilometers}</td>
                            <td>${revision.oilType}</td>
                            <td>${revision.density}</td>
                            <td>${revision.withFilter}</td>
                        </tr>
                    `).join('');
                }
            } else {
                alert(`Error al obtener el historial de revisiones: ${result.message}`);
            }
        } catch (error) {
            alert('Error al obtener el historial de revisiones.');
        }
    }

    // Funcion para traducir claves al espanol
    function translateKey(key) {
        const translations = {
            id: 'ID',
            licensePlate: 'Matricula',
            changeDate: 'Fecha del Cambio',
            kilometers: 'Kilometros',
            oilType: 'Tipo de Aceite',
            density: 'Densidad',
            withFilter: 'Con Filtro',
            interval: 'Intervalo de Cambio',
            torque: 'Par de Apriete Tornillo Carter (Nm)',
            brand: 'Marca',
            model: 'Modelo',
            engine: 'Motor'
        };
        return translations[key] || key;
    }

    // Funcion para eliminar un vehiculo
    async function handleDeleteVehicle() {
        const licensePlate = document.querySelector('#deleteLicensePlate').value;
        const password = document.querySelector('#deleteVehiclePassword').value;

        try {
            const response = await fetch(`/api/vehicles/deleteVehicle/${licensePlate}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const result = await response.json();
            if (response.ok) {
                alert('Vehiculo eliminado con exito.');
            } else {
                alert(`Error al eliminar el vehiculo: ${result.message}`);
            }
        } catch (error) {
            alert('Error al eliminar el vehiculo.');
        }
    }

    // Configuracion inicial de eventos
    setupEventListeners();
});
