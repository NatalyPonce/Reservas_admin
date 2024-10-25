import express from 'express';
import { pool } from './db.js';
import { PORT } from './config.js';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json()); 

app.get('/', (req, res) => {
    res.send('Welcome to server');
});

app.get('/create', async (req, res) => {
    const result = await pool.query(`
        INSERT INTO reserva (IdCliente, Fecha, HoraEntrada, HoraSalida, NumPersonas, Telefono, IdEstado) VALUES
(3, '2024-10-21', '18:00:00', '20:00:00', 5, '12345678', 4);
    `);
    res.json(result);
});

app.get('/Extract', async (req, res) => {
    const [result] = await pool.query(`
        SELECT r.id, r.HoraEntrada, e.Nombre AS NombreEstado, r.Fecha
        FROM reserva r
        JOIN estado e ON r.IdEstado = e.IdEstado
    `);
    res.json(result); // Cambiado a result directamente
});

app.get('/reservas', async (req, res) => {
    const [resultsquery] = await pool.query(`
        SELECT r.id, r.HoraEntrada, e.Nombre AS NombreEstado, r.Fecha, r.HoraSalida, c.Nombre, r.NumPersonas, r.Telefono
        FROM reserva r
        JOIN estado e ON r.IdEstado = e.IdEstado
        JOIN cliente c ON c.IdCliente = r.Idcliente
    `);
    console.log(resultsquery); // Verifica que los datos son correctos
    res.json(resultsquery); // Cambiado a resultsquery directamente
});


app.patch('/reservas/:id', async (req, res) => {
    const { estado, horaSalida } = req.body; // Esperamos que el estado y la hora de salida vengan en el cuerpo de la solicitud
    const { id } = req.params;

    try {
        const query = `
            UPDATE reserva SET IdEstado = (
                SELECT IdEstado FROM estado WHERE Nombre = ?), 
                HoraSalida = ? 
            WHERE id = ?`;

        const result = await pool.query(query, [estado, horaSalida || null, id]); // Permitir que HoraSalida sea nulo

        if (result.affectedRows === 0) {
            return res.status(404).send('Reserva no encontrada');
        }

        res.send('Reserva actualizada correctamente');
    } catch (error) {
        console.error('Error al actualizar la reserva:', error);
        res.status(500).send('Error del servidor');
    }
});

// Endpoint para modificar parcialmente una reserva
app.patch('/reserva/:id', (req, res) => {
    const reservaId = req.params.id;
    const { fecha, numPersonas, horaEntrada } = req.body; // Valores potenciales a actualizar

    // Construir un objeto de actualización dinámico
    let camposActualizar = {};
    if (fecha) {
        camposActualizar.Fecha = fecha;
    }
    if (numPersonas) {
        camposActualizar.NumPersonas = numPersonas;
    }
    if (horaEntrada) {
        camposActualizar.HoraEntrada = horaEntrada;
    }

    // Verificar si hay campos a actualizar
    if (Object.keys(camposActualizar).length === 0) {
        return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }

    // Actualizar en la base de datos
    pool.query('UPDATE reserva SET ? WHERE id = ?', [camposActualizar, reservaId], (error, results) => {
        if (error) {
            console.error('Error al actualizar la reserva:', error);
            return res.status(500).json({ error: 'Error al actualizar la reserva' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }
        res.status(200).json({ message: 'Reserva actualizada correctamente' });
    });
});


app.listen(PORT, () => {
    console.log('Server on port ', PORT);
});
