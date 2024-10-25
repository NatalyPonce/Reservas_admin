-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 16-10-2024 a las 07:15:44
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `reservas`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `IdCliente` int(11) NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Contrasena` varchar(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`IdCliente`, `Nombre`, `Email`, `Contrasena`) VALUES
(1, 'Juan Pérez', 'juan.perez@example.com', 'contrasena123'),
(2, 'María López', 'maria.lopez@example.com', 'secreta456'),
(3, 'Carlos García', 'carlos.garcia@example.com', 'miClave789');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado`
--

CREATE TABLE `estado` (
  `IdEstado` int(11) NOT NULL,
  `Nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estado`
--

INSERT INTO `estado` (`IdEstado`, `Nombre`) VALUES
(1, 'Pendiente'),
(2, 'En curso'),
(3, 'Cancelada'),
(4, 'Finalizada');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `peticiones`
--

CREATE TABLE `peticiones` (
  `IdPeticion` int(11) NOT NULL,
  `Detalles` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `peticiones`
--

INSERT INTO `peticiones` (`IdPeticion`, `Detalles`) VALUES
(1, 'Mesa junto a la ventana'),
(2, 'Mesa en área exterior'),
(3, 'Cubiertos para niños');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reserva`
--

CREATE TABLE `reserva` (
  `IdReserva` int(11) NOT NULL,
  `IdCliente` int(11) NOT NULL,
  `Fecha` date NOT NULL,
  `HoraEntrada` time NOT NULL,
  `HoraSalida` time DEFAULT NULL,
  `NumPersonas` int(11) NOT NULL,
  `Telefono` varchar(8) NOT NULL,
  `IdEstado` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reserva`
--

INSERT INTO `reserva` (`IdReserva`, `IdCliente`, `Fecha`, `HoraEntrada`, `HoraSalida`, `NumPersonas`, `Telefono`, `IdEstado`) VALUES
(1, 1, '2024-10-20', '14:00:00', '16:00:00', 2, '98765432', 2),
(2, 2, '2024-10-21', '12:00:00', NULL, 4, '12345678', 1),
(3, 3, '2024-10-22', '15:00:00', '18:00:00', 1, '87654321', 3),
(4, 1, '2024-10-21', '18:00:00', NULL, 4, '12345678', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservaxpeticiones`
--

CREATE TABLE `reservaxpeticiones` (
  `IdReserva` int(11) NOT NULL,
  `IdPeticion` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reservaxpeticiones`
--

INSERT INTO `reservaxpeticiones` (`IdReserva`, `IdPeticion`) VALUES
(1, 1),
(1, 2),
(2, 3);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`IdCliente`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- Indices de la tabla `estado`
--
ALTER TABLE `estado`
  ADD PRIMARY KEY (`IdEstado`);

--
-- Indices de la tabla `peticiones`
--
ALTER TABLE `peticiones`
  ADD PRIMARY KEY (`IdPeticion`);

--
-- Indices de la tabla `reserva`
--
ALTER TABLE `reserva`
  ADD PRIMARY KEY (`IdReserva`),
  ADD KEY `IdCliente` (`IdCliente`),
  ADD KEY `IdEstado` (`IdEstado`);

--
-- Indices de la tabla `reservaxpeticiones`
--
ALTER TABLE `reservaxpeticiones`
  ADD PRIMARY KEY (`IdReserva`,`IdPeticion`),
  ADD KEY `IdPeticion` (`IdPeticion`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `IdCliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `estado`
--
ALTER TABLE `estado`
  MODIFY `IdEstado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `peticiones`
--
ALTER TABLE `peticiones`
  MODIFY `IdPeticion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `reserva`
--
ALTER TABLE `reserva`
  MODIFY `IdReserva` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `reserva`
--
ALTER TABLE `reserva`
  ADD CONSTRAINT `reserva_ibfk_1` FOREIGN KEY (`IdCliente`) REFERENCES `cliente` (`IdCliente`),
  ADD CONSTRAINT `reserva_ibfk_2` FOREIGN KEY (`IdEstado`) REFERENCES `estado` (`IdEstado`);

--
-- Filtros para la tabla `reservaxpeticiones`
--
ALTER TABLE `reservaxpeticiones`
  ADD CONSTRAINT `reservaxpeticiones_ibfk_1` FOREIGN KEY (`IdReserva`) REFERENCES `reserva` (`IdReserva`),
  ADD CONSTRAINT `reservaxpeticiones_ibfk_2` FOREIGN KEY (`IdPeticion`) REFERENCES `peticiones` (`IdPeticion`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
