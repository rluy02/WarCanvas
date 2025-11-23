import Pieza from '../Pieza.js';

export default class Soldado extends Pieza {
    constructor(fil, col, jugador) {
        super('Soldado', fil, col, jugador, 2);
    }
}