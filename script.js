// DATOS MOCK: Días disponibles / ocupados (simulando un mes actual)
const hoy = new Date();
hoy.setHours(0, 0, 0, 0);
const diasTotales = 14; // mostramos 14 días

// Lista de días ocupados (fechas string YYYY-MM-DD)
let fechasOcupadas = new Set();

// Generamos días ocupados dentro del rango
for (let i = 0; i < diasTotales; i++) {
    let fechaTemp = new Date(hoy);
    fechaTemp.setDate(hoy.getDate() + i);
    let diaSemana = fechaTemp.getDay();
    // Ocupamos domingos
    if (diaSemana === 0) fechasOcupadas.add(formatearFecha(fechaTemp));
    // Días específicos ocupados: día 3, día 7, día 10, día 12
    if (i === 3 || i === 7 || i === 10 || i === 12) {
        if (diaSemana !== 0) fechasOcupadas.add(formatearFecha(fechaTemp));
    }
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

// Horarios disponibles base
const HORARIOS_POSIBLES = ["10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"];

function obtenerHorariosDisponibles(fechaStr) {
    let fechaDate = new Date(fechaStr);
    let diaNum = fechaDate.getDate();
    let todos = [...HORARIOS_POSIBLES];
    // Simulación: días pares no tienen 7pm, días impares no tienen 10am
    if (diaNum % 2 === 0) {
        return todos.filter(h => h !== "7:00 PM");
    } else {
        return todos.filter(h => h !== "10:00 AM");
    }
}

// Lista de barberos
const BARBEROS = [
    { id: 1, nombre: "Alejandro Fuentes", especialidad: "Corte clásico y fade" },
    { id: 2, nombre: "Carlos Mendoza", especialidad: "Barba & diseño" },
    { id: 3, nombre: "Javier Rivas", especialidad: "Tinte y acabados" }
];

// Estado de la reserva
let estado = {
    diaSeleccionado: null,
    horarioSeleccionado: null,
    barberoSeleccionado: null
};

// Elementos DOM
const calendarioDiv = document.getElementById("calendarioDias");
const seccionHorarios = document.getElementById("seccionHorariosBarbero");
const diaSeleccionadoSpan = document.getElementById("diaSeleccionadoTexto");
const listaHorariosDiv = document.getElementById("listaHorarios");
const listaBarberosDiv = document.getElementById("listaBarberos");
const btnReservar = document.getElementById("btnConfirmarReserva");
const mensajeReservaDiv = document.getElementById("mensajeReserva");

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
            diaCard.addEventListener("click", (function(fechaObj, fechaStrClean, legible) {
                return function() {
                    estado.diaSeleccionado = {
                        fechaStr: fechaStrClean,
                        fechaObj: fechaObj,
                        legible: legible
                    };
                    estado.horarioSeleccionado = null;
                    estado.barberoSeleccionado = null;
                    diaSeleccionadoSpan.innerText = legible;
                    seccionHorarios.style.display = "block";
                    cargarHorarios(fechaStrClean);
                    cargarBarberos();
                    mensajeReservaDiv.innerHTML = "";
                    // Scroll suave hacia la sección
                    document.querySelector('.horarios-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
                };
            })(fecha, fechaStr, formatearLegible(fecha)));
        }
        calendarioDiv.appendChild(diaCard);
    }
}

function cargarHorarios(fechaStr) {
    let horariosDisponibles = obtenerHorariosDisponibles(fechaStr);
    listaHorariosDiv.innerHTML = "";
    if (horariosDisponibles.length === 0) {
        listaHorariosDiv.innerHTML = "<p>No hay horarios libres para este día.</p>";
        return;
    }
    horariosDisponibles.forEach(horario => {
        let btn = document.createElement("button");
        btn.innerText = horario;
        btn.classList.add("horario-btn");
        btn.addEventListener("click", () => {
            document.querySelectorAll(".horario-btn").forEach(btn => {
                btn.style.background = "#f0eae3";
                btn.style.color = "#4a3b2c";
            });
            btn.style.background = "#b87c4f";
            btn.style.color = "white";
            estado.horarioSeleccionado = horario;
        });
        listaHorariosDiv.appendChild(btn);
    });
}

function cargarBarberos() {
    listaBarberosDiv.innerHTML = "";
    BARBEROS.forEach(barbero => {
        const divBar = document.createElement("div");
        divBar.className = "barbero-option";
        divBar.innerHTML = `<strong>${barbero.nombre}</strong><br><small>${barbero.especialidad}</small>`;
        divBar.addEventListener("click", () => {
            document.querySelectorAll(".barbero-option").forEach(el => el.classList.remove("selected"));
            divBar.classList.add("selected");
            estado.barberoSeleccionado = barbero;
        });
        listaBarberosDiv.appendChild(divBar);
    });
}

function mostrarResumenReserva() {
    if (!estado.diaSeleccionado) {
        mensajeReservaDiv.innerHTML = "⚠️ Por favor selecciona un día disponible del calendario.";
        return;
    }
    if (!estado.horarioSeleccionado) {
        mensajeReservaDiv.innerHTML = "⚠️ Selecciona un horario disponible para tu cita.";
        return;
    }
    if (!estado.barberoSeleccionado) {
        mensajeReservaDiv.innerHTML = "⚠️ Elige uno de los 3 barberos disponibles para tu reserva.";
        return;
    }
    
    const { diaSeleccionado, horarioSeleccionado, barberoSeleccionado } = estado;
    const mensaje = `
        ✅ ¡Reserva confirmada! <br><br>
        📅 <strong>Día:</strong> ${diaSeleccionado.legible} <br>
        ⏰ <strong>Horario:</strong> ${horarioSeleccionado} <br>
        ✂️ <strong>Barbero:</strong> ${barberoSeleccionado.nombre} (${barberoSeleccionado.especialidad}) <br>
        📍 <strong>Sucursal:</strong> 1089 Calle, 2-42 Avenida, Zona UMG <br><br>
        💈 ¡Te esperamos! Recuerda llegar 5 minutos antes.
    `;
    mensajeReservaDiv.innerHTML = mensaje;
    
    // Opcional: resetear selecciones después de confirmar
    // (comentado para que el usuario pueda ver su reserva)
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
}

btnsNav.forEach(btn => {
    btn.addEventListener("click", (e) => {
        const targetPanel = btn.getAttribute("data-panel");
        if (targetPanel) switchPanel(targetPanel);
    });
});

// Evento confirmación
btnReservar.addEventListener("click", mostrarResumenReserva);

// Inicializar
function init() {
    renderCalendario();
    seccionHorarios.style.display = "none";
    estado.diaSeleccionado = null;
    estado.horarioSeleccionado = null;
    estado.barberoSeleccionado = null;
}
init();

// Observador para mantener coherencia al cambiar de panel
const observerReservas = new MutationObserver(() => {
    const calendarioPanel = document.getElementById("panel-calendario");
    if (calendarioPanel && calendarioPanel.classList.contains("active-panel")) {
        if (!estado.diaSeleccionado) {
            seccionHorarios.style.display = "none";
        } else {
            seccionHorarios.style.display = "block";
            diaSeleccionadoSpan.innerText = estado.diaSeleccionado.legible;
            if (estado.diaSeleccionado.fechaStr) {
                cargarHorarios(estado.diaSeleccionado.fechaStr);
                cargarBarberos();
            }
        }
    }
});
observerReservas.observe(document.getElementById("panel-calendario"), { attributes: true, attributeFilter: ["class"] });
