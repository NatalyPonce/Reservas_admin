document.addEventListener('DOMContentLoaded', function () {
    const calendarBody = document.getElementById('calendar-body');
    const monthSelect = document.getElementById('month-select');
    const yearSelect = document.getElementById('year-select');

    let currentDate = new Date();

    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    let reservas = []; // Arreglo para almacenar reservas

    // Función para obtener las reservas del servidor
    function fetchReservas() {
        fetch('http://localhost:3000/reservas')
            .then(response => response.json())
            .then(data => {
                console.log(data); // Verifica la estructura de los datos
                reservas = data; // Guarda las reservas en la variable
                renderCalendar(); // Renderiza el calendario después de obtener las reservas
                checkExpiredReservations(); // Llama a la función para verificar el tiempo restante
            })
            .catch(error => console.error('Error al obtener las reservas:', error));
    }

    function checkExpiredReservations() {
        const now = new Date();

        reservas.forEach(reserva => {
            const horaEntradaParts = reserva.HoraEntrada.split(':'); // Separar horas, minutos y segundos
            const fechaReserva = new Date(reserva.Fecha); // Crear un objeto Date para la fecha de la reserva
            const horaEntrada = new Date(fechaReserva.getFullYear(), fechaReserva.getMonth(), fechaReserva.getDate(), ...horaEntradaParts); // Crear un objeto Date para la hora de entrada

            // Verificar si la reserva es posterior a la fecha actual
            if (fechaReserva > now) {
                console.log(`Reserva ${reserva.id} es posterior a la fecha actual y no se cancelará.`);
                return; // No hacer nada si la reserva es futura
            }

            // Calcular el tiempo hasta la cancelación (30 minutos después de la hora de entrada)
            const tiempoHastaCancelacion = horaEntrada.getTime() + 30 * 60 * 1000; // 30 minutos en milisegundos
            const tiempoRestante = tiempoHastaCancelacion - now.getTime(); // Tiempo restante para la cancelación

            const minutosRestantes = Math.max(Math.floor(tiempoRestante / (1000 * 60)), 0); // Convertir a minutos y asegurarse de que no sea negativo

            // Solo mostrar para reservas pendientes
            if (reserva.NombreEstado === 'Pendiente') {
                console.log(`Reserva ${reserva.id}: Tiempo restante para cancelación: ${minutosRestantes} minutos`);

                // Cancelar si el tiempo restante es menor o igual a 0
                if (tiempoRestante <= 0) {
                    console.log(`Cancelando reserva ${reserva.id} automáticamente por tiempo restante menor o igual a 30 minutos.`);
                    cancelarReserva(reserva.id);
                }
            }
        });
    }

    function populateMonthSelect() {
        months.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.text = month;
            monthSelect.appendChild(option);
        });
    }

    function populateYearSelect() {
        const currentYear = currentDate.getFullYear();
        for (let year = currentYear - 5; year <= currentYear + 5; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.text = year;
            yearSelect.appendChild(option);
        };
    }

    function renderCalendar() {
        calendarBody.innerHTML = ''; // Limpiar el calendario

        const month = parseInt(monthSelect.value);
        const year = parseInt(yearSelect.value);

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let date = 1;
        let popupActive = false; // Para controlar si hay un popup abierto


        for (let i = 0; i < 6; i++) {
            const row = document.createElement('tr');

            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');

                if (i === 0 && j < firstDayOfMonth) {
                    cell.innerHTML = '';
                } else if (date > daysInMonth) {
                    cell.innerHTML = '';
                } else {
                    cell.innerHTML = date;

                    // Verifica si hay reservas para esa fecha
                    const reservasDelDia = reservas.filter(reserva => {
                        const reservaDate = new Date(reserva.Fecha);
                        return reservaDate.getDate() === date && reservaDate.getMonth() === month && reservaDate.getFullYear() === year;
                    });

                    if (reservasDelDia.length > 0) {
                        reservasDelDia.forEach(reserva => {
                            const id = reserva.id;
                            const horaFormateada = reserva.HoraEntrada.slice(0, 5);
                            const estado = reserva.NombreEstado;
                            const horaSlaidaF = reserva.HoraSalida ? reserva.HoraSalida.slice(0, 5) : 'N/A';
                            const nombre = reserva.Nombre;
                            const cantidadPer = reserva.NumPersonas;
                            const telefon = reserva.Telefono;

                            let estadoClass = '';
                            switch (estado.toLowerCase()) {
                                case 'en curso':
                                    estadoClass = 'reserva-curso';
                                    break;
                                case 'cancelada':
                                    estadoClass = 'reserva-cancelada';
                                    break;
                                case 'pendiente':
                                    estadoClass = 'reserva-pendiente';
                                    break;
                                case 'finalizada':
                                    estadoClass = 'reserva-finalizada';
                                    break;
                                default:
                                    estadoClass = '';
                                    break;
                            }

                            cell.innerHTML += `<div class="reserva-calend ${estadoClass}">
                                <span> Reserva ${id} </span>
                                <span> Cliente: ${nombre}</span>
                                <span> Hora Entrada: ${horaFormateada}</span>
                                <span class="FinalH"> Hora final: ${horaSlaidaF} </span>
                                <span> N° comensales: ${cantidadPer}</span>
                                <span> Telefono: ${telefon}</span>
                                <span> Estado: ${estado} </span>
                                <br>
                                <button class="btn-cancelar" data-id="${id}">Cancelar reserva</button>
                                <button class="btn-modificar" data-id="${id}">Modificar</button>
                                <button class="btn-finalizar" data-id="${id}">Finalizar</button>
                                <button class="btn-confirmar" data-id="${id}">Confirmar llegada</button>
                            </div>`;
                        });
                    }

                    date++;
                }

                row.appendChild(cell);
            }

            calendarBody.appendChild(row);
        }

        // Agregar evento para el botón "Finalizar"
        document.querySelectorAll('.btn-finalizar').forEach(button => {
            button.addEventListener('click', function () {
                const reservaId = this.getAttribute('data-id');
                finalizarReserva(reservaId);
            });
        });

        // Agregar evento para el botón "Modificar"
        document.querySelectorAll('.btn-modificar').forEach(button => {
            button.addEventListener('click', function () {
                if (popupActive) {
                    alert('Ya hay una modificación en curso. Por favor, completa o cancela la actual modificación.');
                    return;
                }
                const idReserva = this.getAttribute('data-id'); // Obtener el ID de la reserva
                mostrarPopupModificar(idReserva);
            });
        });


        // Agregar evento para el botón "Confirmar llegada"
        document.querySelectorAll('.btn-confirmar').forEach(button => {
            button.addEventListener('click', function () {
                const reservaId = this.getAttribute('data-id');
                confirmarLlegada(reservaId);
            });
        });

        // Agregar evento para el botón "Cancelar reserva"
        document.querySelectorAll('.btn-cancelar').forEach(button => {
            button.addEventListener('click', function () {
                const reservaId = this.getAttribute('data-id');
                mostrarPopupCancelar(reservaId);
            });
        });
    }

    function mostrarPopupCancelar(id) {
        // Crear el popup
        const popup = document.createElement('div');
        popup.classList.add('popup');
        popup.innerHTML = `  
            <div class="popup-content">
                <h2>¿Estás seguro de que deseas cancelar la reserva?</h2>
                <button id="confirmar-cancelar" class="btn-confirmar">Confirmar</button>
                <button id="cancelar-popup" class="btn-cancelar">Cancelar</button>
            </div>
        `;

        document.body.appendChild(popup);

        // Agregar eventos a los botones del popup
        document.getElementById('confirmar-cancelar').addEventListener('click', function () {
            cancelarReserva(id);
            document.body.removeChild(popup); // Cerrar el popup
        });

        document.getElementById('cancelar-popup').addEventListener('click', function () {
            document.body.removeChild(popup); // Cerrar el popup
        });
    }

    function cancelarReserva(id) {
        const nuevoEstado = 'Cancelada';

        fetch(`http://localhost:3000/reservas/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                estado: nuevoEstado
            })
        })
            .then(response => {
                if (response.ok) {
                    console.log(`Reserva ${id} cancelada`);
                    // Eliminar la reserva del arreglo
                    reservas = reservas.filter(reserva => reserva.id !== parseInt(id)); // Filtra la reserva cancelada
                    fetchReservas(); // Refresca las reservas para actualizar el calendario
                } else {
                    console.error('Error al cancelar la reserva');
                }
            })
            .catch(error => console.error('Error:', error));
    }

    function confirmarLlegada(id) {
        const nuevoEstado = 'En curso';

        fetch(`http://localhost:3000/reservas/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                estado: nuevoEstado,
                horaSalida: null // No se requiere hora de salida
            })
        })
            .then(response => {
                if (response.ok) {
                    console.log(`Reserva ${id} confirmada como "en curso"`);
                    fetchReservas(); // Refresca las reservas para actualizar el calendario
                } else {
                    console.error('Error al confirmar la llegada');
                }
            })
            .catch(error => console.error('Error:', error));
    }

    function finalizarReserva(id) {
        const nuevoEstado = 'Finalizada';
        const horaSalida = new Date().toTimeString().split(' ')[0]; // Obtener la hora actual como hora de salida

        fetch(`http://localhost:3000/reservas/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                estado: nuevoEstado,
                horaSalida: horaSalida // Guardar la hora actual como hora de salida
            })
        })
            .then(response => {
                if (response.ok) {
                    console.log(`Reserva ${id} finalizada`);
                    fetchReservas(); // Refresca las reservas para actualizar el calendario
                } else {
                    console.error('Error al finalizar la reserva');
                }
            })
            .catch(error => console.error('Error:', error));
    }

    // Al cambiar mes o año, se vuelve a renderizar el calendario
    monthSelect.addEventListener('change', renderCalendar);
    yearSelect.addEventListener('change', renderCalendar);

    // Poblamos los selectores de mes y año
    populateMonthSelect();
    populateYearSelect();

    // Establece el mes y año actual en los selectores
    monthSelect.value = currentDate.getMonth();
    yearSelect.value = currentDate.getFullYear();



    function mostrarPopupModificar(idReserva) {
        const reserva = reservas.find(r => r.id === parseInt(idReserva)); // Encuentra la reserva por ID

        // Crear el popup
        const popup = document.createElement('div');
        popup.classList.add('popup');
        popup.innerHTML = `
        <div class="popup-content">
            <h2>Modificar Reserva ${idReserva}</h2>
            <label>Modificar:</label>
            <select id="opciones-modificar">
                <option value="fecha">Fecha</option>
                <option value="numPersonas">Número de Personas</option>
                <option value="hora">Hora Entrada</option>
            </select>
            <div id="nueva-info">
                <label>Nueva Valor:</label>
                <input type="text" id="nuevo-valor" placeholder="Introduce nuevo valor" style="display: none;">
            </div>
            <button id="confirmar-modificacion" class="btn-confirmar">Confirmar</button>
            <button id="cancelar-popup" class="btn-cancelar">Cancelar</button>
        </div>
    `;

        document.body.appendChild(popup);

        const opcionesModificar = document.getElementById('opciones-modificar');
        const nuevaInfoDiv = document.getElementById('nueva-info');

        // Función para actualizar el campo de entrada según la opción seleccionada
        const actualizarCampo = () => {
            const seleccion = opcionesModificar.value;
            let inputHTML = '';

            if (seleccion === 'fecha') {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0'); // Los meses son de 0 a 11
                const dd = String(today.getDate()).padStart(2, '0');
                const formattedDate = `${yyyy}-${mm}-${dd}`;
                inputHTML = `<input name="fecha" type="date" id="nuevo-valor" min="${formattedDate}">`;
            } else if (seleccion === 'numPersonas') {
                inputHTML = `<input type="number" id="nuevo-valor" min="1" max="10" placeholder="Número de personas">`;
            } else if (seleccion === 'hora') {
                inputHTML = `<input type="time" id="nuevo-valor">`;
            }

            nuevaInfoDiv.innerHTML = `<label>Nueva Valor:</label> ${inputHTML}`;
        };

        // Actualizar el campo al inicio
        actualizarCampo();

        // Agregar evento para cuando se cambia la selección
        opcionesModificar.addEventListener('change', actualizarCampo);

        // Agregar evento para el botón "Confirmar"
        document.getElementById('confirmar-modificacion').addEventListener('click', function () {
            const nuevoValor = document.getElementById('nuevo-valor').value;

            // Validaciones
            if (opcionesModificar.value === 'hora') {
                const [hora, minutos] = nuevoValor.split(':').map(Number);
                const ahora = new Date();
                const fechaReserva = new Date(reserva.Fecha); // Obtener la fecha de la reserva ya existente
                const fechaSeleccionada = new Date(fechaReserva.getFullYear(), fechaReserva.getMonth(), fechaReserva.getDate(), hora, minutos);
                const horaLimiteInicio = new Date(fechaReserva.getFullYear(), fechaReserva.getMonth(), fechaReserva.getDate(), 9, 0); // 09:00
                const horaLimiteFin = new Date(fechaReserva.getFullYear(), fechaReserva.getMonth(), fechaReserva.getDate(), 19, 0); // 19:00

                // Validar si la hora está dentro del rango permitido
                if (fechaSeleccionada < horaLimiteInicio) {
                    alert('La hora de entrada debe ser después de las 09:00.');
                    return;
                } else if (fechaSeleccionada > horaLimiteFin) {
                    alert('La hora de entrada debe ser antes de las 19:00.');
                    return;
                } else if (nuevoValor == null || nuevoValor.trim() === '') {
                    alert('La hora no puede estar vacía.');
                    return;
                }
                // Validar si la fecha es hoy y la hora es futura
                if (fechaReserva.toDateString() === ahora.toDateString() && fechaSeleccionada < ahora) {
                    alert('La hora de entrada debe ser posterior a la hora actual si la reserva es hoy.');
                    return;
                }
            } else if (opcionesModificar.value === 'numPersonas') {
                if (nuevoValor < 1 || nuevoValor > 10) {
                    alert('El número de personas debe estar entre 1 y 10.');
                    return; // Salir si el número de personas no es válido
                }
            } else if (opcionesModificar.value == 'fecha') {
                if (nuevoValor == null || nuevoValor.trim() === '') {
                    alert('La fecha no puede estar vacía.');
                    return;
                }
                const fechaActual = new Date();
                fechaActual.setHours(0, 0, 0, 0); // Establecer a medianoche
                const nuevaFecha = new Date(nuevoValor);
                nuevaFecha.setHours(0, 0, 0, 0); // Establecer a medianoche para la nueva fecha
                nuevaFecha.setDate(nuevaFecha.getDate() + 1);

                // Comprobar si la fecha nueva es anterior a la fecha actual
                if (nuevaFecha < fechaActual) {
                    alert('No se puede reprogramar a una fecha anterior a la actual.');
                    return;
                }
                const mismaFecha = (nuevaFecha.getFullYear() === fechaActual.getFullYear()) &&
                    (nuevaFecha.getMonth() === fechaActual.getMonth()) &&
                    (nuevaFecha.getDate() === fechaActual.getDate());

                if (mismaFecha) {
                    const now = new Date();
                    const horaActual = now.getHours() + ":" + now.getMinutes();
                    if (reserva.HoraEntrada < horaActual) {
                        alert("No se puede hacer una reserva para hoy si la hora es posterior a la actual.");
                        return;
                    }

                }

            }

            // Creando un nuevo objeto para definir las posibles opciones por modificar
            // como solo se puede modificar una opción a la vez, el objeto siempre tendrá el valor nuevo
            const nuevosValores = {};
            nuevosValores[opcionesModificar.value] = nuevoValor;

            modificarReserva(idReserva, nuevosValores);
            document.body.removeChild(popup); // Cerrar el popup
            location.reload();
        });

        document.getElementById('cancelar-popup').addEventListener('click', function () {
            document.body.removeChild(popup); // Cerrar el popup
        });
    }


    function modificarReserva(id, nuevosValores) {
        // Desestructurar los valores del objeto que pasamos a la funcion arriba
        const { fecha, numPersonas, hora } = nuevosValores; // Valores potenciales a actualizar

        fetch(`http://localhost:3000/reserva/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fecha: fecha,
                horaEntrada: hora, // Cambiado a horaEntrada
                numPersonas: numPersonas,
            })
        })
            .then(response => {
                if (response.ok) {
                    console.log(`Reserva ${id} modificada correctamente`);
                    location.reload(); // Redirige a la misma URL
                } else {
                    console.error('Error al modificar la reserva');
                }
            })
            .catch(error => console.error('Error:', error));
    }

    // Obtener las reservas iniciales al cargar la página
    fetchReservas();
});
