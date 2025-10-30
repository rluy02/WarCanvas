import Pieza from "./Pieza";

export default class Turno{
    constructor(acciones){
        this.accionesTurno = acciones;
        this.acionActual = 0;

        this.piezaActual = null;
        this.movimientosPieza = 0;
    }

    setPieza(pieza){
        this.piezaActual = pieza;
        this.movimientosPieza = pieza.numMovimientos;
    }
}