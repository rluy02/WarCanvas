import { eventos } from "./events.js";
import { EventBus } from "./EventBus.js";

export let turnoJugador = "J1";

export default class Turno{
    constructor(acciones, turnoGrafico){
        this.accionesTurno = acciones;
        this.acionActual = 0;

        this.piezaActual = null;
        this.movimientosPieza = 0;

        this.turnoGrafico = turnoGrafico;

        EventBus.on(eventos.PIECE_SELECTED, (pieza) => { this.setPieza(pieza)});
        EventBus.on(eventos.PIECE_MOVED, (pieza) => { this.restarAccion()})
        EventBus.on(eventos.ATACK, () => {this.acabarMovimientos()})
        EventBus.on(eventos.PIECE_END_ACTIONS, () => {this.acabarMovimientos()})
        EventBus.on(eventos.CHANGE_TURN, (turnoJugador) => {
            this.turnoGrafico.setTurnoJugador(turnoJugador);
        })
    }

    setPieza(pieza){
        this.piezaActual = pieza;
        this.movimientosPieza = pieza.getMovimientos();

        console.log(this.piezaActual);
        this.turnoGrafico.setAccionesPieza(this.movimientosPieza);
    }

    restarAccion(){
        this.movimientosPieza = this.movimientosPieza - 1;
        this.turnoGrafico.setAccionesPieza(this.movimientosPieza);
        if (this.movimientosPieza <= 0) {
            EventBus.emit(eventos.PIECE_END_ACTIONS);
        }

        if (this.accionesTurno <= 0) {
            if (turnoJugador == "J1") turnoJugador = "J2"
            else turnoJugador = "J1"
            this.accionesTurno = 3;
            this.movimientosPieza = 0;
            
            EventBus.emit(eventos.CHANGE_TURN, turnoJugador);
        }
    }

    acabarMovimientos(){
        if (!this.piezaActual) return;

        this.piezaActual.setMovida();

        this.piezaActual = null;

        this.accionesTurno--;
        this.turnoGrafico.setAccionesTurno(this.accionesTurno);
    }


}