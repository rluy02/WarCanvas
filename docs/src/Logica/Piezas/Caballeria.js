import Pieza from '../Pieza.js';

/**
 * Clase que representa la pieza de Caballería en el juego.
 * @class Caballeria
 * @extends Pieza
 * @memberof Logica
 */
class Caballeria extends Pieza {
    /**
     * Constructor de la pieza Caballería.
     * @param {number} fil - fila
     * @param {number} col - columna
     * @param {string} jugador - 'J1' o 'J2'
     */
    constructor(fil, col, jugador) {
        super('Caballeria', fil, col, jugador, 3, 2 , 0);
export default class Caballeria extends Pieza {
    constructor(tablero, fil, col, jugador) {
        super(tablero, 'Caballeria', fil, col, jugador, 3, 2 , 0);
        this.saltoCaballeria = true;
    }

    /**
     * Establece si la caballería puede saltar piezas.
     * @param {boolean} salto 
     */
    setSaltoCaballeria(salto) {
        this.saltoCaballeria = salto;
    }

    /**
     * Determina si la caballería puede saltar piezas.
     * @returns {boolean} - true si la caballería puede saltar piezas, false en caso contrario
     */
    getSaltoCaballeria() {
        return this.saltoCaballeria;
    }
}

export default Caballeria;