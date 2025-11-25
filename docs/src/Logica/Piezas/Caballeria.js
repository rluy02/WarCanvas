import Pieza from '../Pieza.js';

export default class Caballeria extends Pieza {
    constructor(fil, col, jugador) {
        super('Caballeria', fil, col, jugador, 3, 2 , 0);
        this.saltoCaballeria = true;
    }
    setSaltoCaballeria(salto) {
        this.saltoCaballeria = salto;
    }
    getSaltoCaballeria() {
        return this.saltoCaballeria;
    }
}