import Pieza from '../Pieza.js';

export default class Comandante extends Pieza {
    constructor(fil, col, jugador) {
        super('Comandante', fil, col, jugador, 4, 4, 5);
    }
}