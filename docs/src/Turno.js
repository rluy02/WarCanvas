import { eventos } from "./events.js";
import { EventBus } from "./EventBus.js";

export default class Turno{
    constructor(acciones, turnoGrafico){
        this.accionesTurno = acciones;
        this.acionActual = 0;

        this.piezaActual = null;
        this.movimientosPieza = 0;

        this.turnoGrafico = turnoGrafico;

        EventBus.on(eventos.PIECE_SELECTED, (pieza) => { this.setPieza(pieza)});
    }

    setPieza(pieza){
        this.piezaActual = pieza;
        this.movimientosPieza = pieza.getMovimientos();

        this.turnoGrafico.setAccionesPieza(this.movimientosPieza);
    }
}