import Pieza from '../Pieza.js';

/**
 * Clase que representa la pieza de Comandante en el juego.
 * @class Comandante
 * @extends Pieza
 * @memberof Logica
 */
class Comandante extends Pieza {
    /**
     * Constructor de la pieza Comandante.
     * @param {Tablero} tablero - tablero al que pertenece la pieza
     * @param {number} fil - fila
     * @param {number} col - columna
     * @param {string} jugador - 'J1' o 'J2'
     */
    constructor(tablero, fil, col, jugador) {
        super(tablero, 'Comandante', fil, col, jugador, 4, 4, 5);
    }
}

export default Comandante;