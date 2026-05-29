// DATOS MOCK: Días disponibles / ocupados
const hoy = new Date();
hoy.setHours(0, 0, 0, 0);
const diasTotales = 14;

let fechasOcupadas = new Set();

// Generamos días ocupados dentro del rango
for (let i = 0; i < diasTotales; i++) {
    let fechaTemp = new Date(hoy);
    fechaTemp.setDate(hoy.getDate() + i);
    let diaSemana = fechaTemp.getDay();
    if (diaSemana === 0) fechasOcupadas.add(formatearFecha(fechaTemp));
    if (i === 3 || i === 7 || i === 10 || i === 12) {
        if (diaSemana !== 0) fechasOcupadas.add(formatearFecha(fechaTemp));
    }
}

// Horarios con rangos de 1 hora (10am a 7pm)
const HORARIOS_RANGOS = [
    { hora: "10:00 AM - 11:00 AM", cuposMax: 2 },
    { hora: "11:00 AM - 12:00 PM", cuposMax: 2 },
    { hora: "12:00 PM - 1:00 PM", cuposMax: 2 },
    { hora: "1:00 PM - 2:00 PM", cuposMax: 2 },
    { hora: "2:00 PM - 3:00 PM", cuposMax: 2 },
    { hora: "3:00 PM - 4:00 PM", cuposMax: 2 },
    { hora: "4:00 PM - 5:00 PM", cuposMax: 2 },
    { hora: "5:00 PM - 6:00 PM", cuposMax: 2 },
    { hora: "6:00 PM - 7:00 PM", cuposMax: 2 }
];

const BARBEROS = [
    { id: 1, nombre: "Alejandro Fuentes", especialidad: "Corte clásico y fade" },
    { id: 2, nombre: "Carlos Mendoza", especialidad: "Barba & diseño" },
    { id: 3, nombre: "Javier Rivas", especialidad: "Tinte y acabados" }
];

// Clave para localStorage
const STORAGE_KEY = "barbershop_reservas";

// Cargar reservas desde localStorage
function cargarReservas() {
    const guardadas = localStorage.getItem(STORAGE_KEY);
    if (guardadas) {
        return JSON.parse(guardadas);
    }
    return [];
}

// Guardar reservas en localStorage
function guardarReservas(reservas) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
}

// Obtener cupos ocupados por fecha y horario
function getCuposOcupados(fechaStr, horarioStr) {
    const reservas = cargarReservas();
    return reservas.filter(r => r.fecha === fechaStr && r.horario === horarioStr).length;
}

// Verificar si un horario está disponible
function isHorarioDisponible(fechaStr, horarioRango) {
    const ocupados = getCuposOcupados(fechaStr, horarioRango.hora);
    return ocupados < horarioRango.cuposMax;
}

function formatearFecha(date) {
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatearLegible(date) {
    return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// Elementos DOM
const calendarioDiv = document.getElementById("calendarioDias");
const modal = document.getElementById("modalHorarios");
const modalFechaSpan = document.getElementById("modalFecha");
const modalListaHorarios = document.getElementById("modalListaHorarios");
const closeModal = document.querySelector(".modal-close");
const listaReservasDiv = document.getElementById("listaReservas");
const btnLimpiarReservas = document.getElementById("btnLimpiarReservas");

let fechaSeleccionada = null;

// Renderizar calendario
function renderCalendario() {
    calendarioDiv.innerHTML = "";
    for (let i = 0; i < diasTotales; i++) {
        let fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() + i);
        let fechaStr = formatearFecha(fecha);
        let esOcupado = fechasOcupadas.has(fechaStr);
        let diaCard = document.createElement("div");
        diaCard.className = `dia-card ${esOcupado ? 'ocupado' : 'disponible'}`;
        let diaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'short' });
        let diaNumero = fecha.getDate();
        let mes = fecha.getMonth() + 1;
        diaCard.innerHTML = `<strong>${diaSemana}</strong><br>${diaNumero}<br><small>${mes}/${diaNumero}</small>`;
        
        if (!esOcupado) {
            diaCard.addEventListener("click", () => {
                fechaSeleccionada = {
                    fechaStr: fechaStr,
                    fechaObj: fecha,
                    legible: formatearLegible(fecha)
                };
                abrirModalHorarios();
            });
        }
        calendarioDiv.appendChild(diaCard);
    }
}

// Abrir modal con horarios
function abrirModalHorarios() {
    modalFechaSpan.innerText = fechaSeleccionada.legible;
    cargarHorariosEnModal();
    modal.style.display = "block";
}

function cargarHorariosEnModal() {
    modalListaHorarios.innerHTML = "";
    
    HORARIOS_RANGOS.forEach(horarioRango => {
        const disponible = isHorarioDisponible(fechaSeleccionada.fechaStr, horarioRango);
        const cuposOcupados = getCuposOcupados(fechaSeleccionada.fechaStr, horarioRango.hora);
        const cuposRestantes = horarioRango.cuposMax - cuposOcupados;
        
        const horarioItem = document.createElement("div");
        horarioItem.className = `horario-item ${disponible ? 'disponible-partial' : 'no-disponible'}`;
        
        horarioItem.innerHTML = `
            <div class="horario-info">
                <div class="horario-hora">${horarioRango.hora}</div>
                <div class="horario-cupos">Cupos: ${cuposOcupados}/${horarioRango.cuposMax} (${cuposRestantes} disponibles)</div>
            </div>
            <div class="horario-estado ${disponible ? 'disponible' : 'no-disponible'}">
                ${disponible ? '✅ Disponible' : '❌ No disponible'}
            </div>
            <button class="btn-reservar-horario" data-horario="${horarioRango.hora}" ${!disponible ? 'disabled' : ''}>
                Reservar
            </button>
        `;
        
        if (disponible) {
            const btn = horarioItem.querySelector('.btn-reservar-horario');
            btn.addEventListener('click', () => {
                abrirModalBarberos(horarioRango.hora);
            });
        }
        
        modalListaHorarios.appendChild(horarioItem);
    });
}

// Abrir modal para seleccionar barbero (usando prompt mejorado o modal)
function abrirModalBarberos(horarioSeleccionado) {
    // Crear modal de barberos dinámicamente
    const barberosModal = document.createElement("div");
    barberosModal.className = "modal";
    barberosModal.style.display = "block";
    barberosModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-users"></i> Selecciona un barbero</h3>
                <span class="modal-close-barberos">&times;</span>
            </div>
            <div class="modal-body">
                <p><strong>Horario:</strong> ${horarioSeleccionado}</p>
                <p><strong>Fecha:</strong> ${fechaSeleccionada.legible}</p>
                <div class="barberos-select-modal" style="display: flex; flex-direction: column; gap: 0.8rem; margin-top: 1rem;"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(barberosModal);
    
    const barberosContainer = barberosModal.querySelector('.barberos-select-modal');
    BARBEROS.forEach(barbero => {
        const btnBarbero = document.createElement("button");
        btnBarbero.className = "horario-btn";
        btnBarbero.style.padding = "0.8rem";
        btnBarbero.style.width = "100%";
        btnBarbero.style.textAlign = "left";
        btnBarbero.innerHTML = `<strong>${barbero.nombre}</strong><br><small>${barbero.especialidad}</small>`;
        btnBarbero.addEventListener("click", () => {
            confirmarReserva(horarioSeleccionado, barbero);
            barberosModal.remove();
        });
        barberosContainer.appendChild(btnBarbero);
    });
    
    const closeBarberos = barberosModal.querySelector('.modal-close-barberos');
    closeBarberos.addEventListener("click", () => {
        barberosModal.remove();
    });
    
    barberosModal.addEventListener("click", (e) => {
        if (e.target === barberosModal) {
            barberosModal.remove();
        }
    });
}

function confirmarReserva(horario, barbero) {
    const nuevaReserva = {
        id: Date.now(),
        fecha: fechaSeleccionada.fechaStr,
        fechaLegible: fechaSeleccionada.legible,
        horario: horario,
        barbero: barbero.nombre,
        barberoEspecialidad: barbero.especialidad,
        timestamp: new Date().toISOString()
    };
    
    const reservas = cargarReservas();
    reservas.push(nuevaReserva);
    guardarReservas(reservas);
    
    // Mostrar mensaje de confirmación
    alert(`✅ ¡Reserva confirmada!\n\n📅 Día: ${fechaSeleccionada.legible}\n⏰ Horario: ${horario}\n✂️ Barbero: ${barbero.nombre}\n📍 Sucursal: 1089 Calle, 2-42 Avenida, Zona UMG\n\n💈 ¡Te esperamos!`);
    
    // Cerrar modal principal
    modal.style.display = "none";
    
    // Actualizar vista de reservas si está visible
    if (document.getElementById("panel-reservas").classList.contains("active-panel")) {
        renderMisReservas();
    }
}

// Renderizar lista de reservas
function renderMisReservas() {
    const reservas = cargarReservas();
    listaReservasDiv.innerHTML = "";
    
    if (reservas.length === 0) {
        listaReservasDiv.innerHTML = '<p style="text-align: center; color: #8b7a6b;">No tienes reservas pendientes</p>';
        btnLimpiarReservas.style.display = "none";
        return;
    }
    
    btnLimpiarReservas.style.display = "block";
    
    // Ordenar por fecha (más reciente primero)
    reservas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    reservas.forEach(reserva => {
        const reservaCard = document.createElement("div");
        reservaCard.className = "reserva-card";
        reservaCard.innerHTML = `
            <div class="reserva-info">
                <strong>${reserva.barbero}</strong>
                <div class="reserva-fecha">
                    <i class="far fa-calendar-alt"></i> ${reserva.fechaLegible}<br>
                    <i class="far fa-clock"></i> ${reserva.horario}
                </div>
            </div>
            <button class="btn-cancelar-reserva" data-id="${reserva.id}">
                <i class="fas fa-times"></i> Cancelar
            </button>
        `;
        
        const btnCancelar = reservaCard.querySelector('.btn-cancelar-reserva');
        btnCancelar.addEventListener("click", () => {
            cancelarReserva(reserva.id);
        });
        
        listaReservasDiv.appendChild(reservaCard);
    });
}

function cancelarReserva(id) {
    let reservas = cargarReservas();
    reservas = reservas.filter(r => r.id !== id);
    guardarReservas(reservas);
    renderMisReservas();
    
    // Si el calendario está visible, actualizar no es necesario pero el modal se actualizará la próxima vez
    alert("✅ Reserva cancelada exitosamente");
}

function limpiarTodasReservas() {
    if (confirm("¿Estás seguro de que deseas cancelar TODAS tus reservas?")) {
        guardarReservas([]);
        renderMisReservas();
        alert("✅ Todas las reservas han sido canceladas");
    }
}

// Navegación entre paneles
const btnsNav = document.querySelectorAll(".nav-btn");
const panels = document.querySelectorAll(".panel");

function switchPanel(panelId) {
    panels.forEach(panel => {
        panel.classList.remove("active-panel");
    });
    const activePanel = document.getElementById(panelId);
    if (activePanel) activePanel.classList.add("active-panel");
    
    btnsNav.forEach(btn => {
        const target = btn.getAttribute("data-panel");
        if (target === panelId) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
    
    // Si es el panel de reservas, actualizar la lista
    if (panelId === "panel-reservas") {
        renderMisReservas();
    }
}

btnsNav.forEach(btn => {
    btn.addEventListener("click", (e) => {
        const targetPanel = btn.getAttribute("data-panel");
        if (targetPanel) switchPanel(targetPanel);
    });
});

// Cerrar modal
closeModal.addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

btnLimpiarReservas.addEventListener("click", limpiarTodasReservas);

// Inicializar
function init() {
    renderCalendario();
}
init();
