import Pieza from './Pieza.js';

export default class Artilleria extends Pieza {
    constructor(fil, col, jugador) {
        super('Artilleria', fil, col, jugador, 1);
    }

    lanzarProyectil(fil, col){
        console.log("HA CAIDO EN FILA: ", fil, " COL: ", col);
    }
}