import Pieza from '../Pieza.js';

export default class Comandante extends Pieza {
    constructor(tablero, fil, col, jugador) {
        super(tablero, 'Comandante', fil, col, jugador, 4, 4, 5);
    }
}