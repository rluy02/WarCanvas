import { Eventos } from "./Events.js";
import { EventBus } from "./EventBus.js";

export let turnoJugador = "J1";

export default class Turno {
    constructor(acciones, turnoGrafico) {
        this.accionesTurno = acciones;
        this.acionActual = 0;

        this.piezaActual = null;
        this.piezasMovidas = [];
        this.movimientosPieza = 0;
        this.posicionPieza;

        this.turnoGrafico = turnoGrafico;

        EventBus.on(Eventos.PIECE_SELECTED, (pieza) => { this.setPieza(pieza) });
        EventBus.on(Eventos.PIECE_MOVED, (pieza) => { this.restarAccion() })
        EventBus.on(Eventos.ATACK, () => { this.acabarMovimientos() })
        EventBus.on(Eventos.PIECE_END_ACTIONS, () => { this.acabarMovimientos() })
        EventBus.on(Eventos.CHANGE_TURN, (turnoJugador) => {
            this.turnoGrafico.setTurnoJugador(turnoJugador);
        })
    }

    setPieza(pieza) {
        this.piezaActual = pieza;
        this.movimientosPieza = pieza.getMovimientos();
        this.posicionPieza = pieza.getPosicion();

        console.log(this.piezaActual);
        this.turnoGrafico.setAccionesPieza(this.movimientosPieza);
    }

    restarAccion() {

    if (!this.piezaActual) return;

    const posAntes = this.posicionPieza; // posición guardada antes de mover
    const posDespues = this.piezaActual.getPosicion();

    const df = Math.abs(posDespues.fila - posAntes.fila);
    const dc = Math.abs(posDespues.col - posAntes.col);

    const distancia = df + dc; // movimiento Manhattan

    if (this.piezaActual.getTipo() === "Caballeria" &&
        this.piezaActual.getSaltoCaballeria() === true &&
        distancia === 2) {

        // Se ha usado salto
        this.movimientosPieza -= 2;
        this.piezaActual.setSaltoCaballeria(false);
        console.log("Se ha usado el salto de caballeria");

    } else {

        // Movimiento normal
        this.movimientosPieza -= 1;
    }

    // Actualizamos la posición guardada
    this.posicionPieza = this.piezaActual.getPosicion();

    // Evitar que el salto quede 'activo' sin usarlo
    if (this.piezaActual.getTipo() === "Caballeria" &&
        this.piezaActual.getSaltoCaballeria() === true &&
        this.movimientosPieza < 2) {

        this.piezaActual.setSaltoCaballeria(false);
        console.log("no se ha usado el salto de caballeria");
    }

    this.turnoGrafico.setAccionesPieza(this.movimientosPieza);

    if (this.movimientosPieza <= 0) {
        this.piezasMovidas.push(this.piezaActual);
        EventBus.emit(Eventos.PIECE_END_ACTIONS);
    }
}


    acabarMovimientos() {
        if (!this.piezaActual) {
            console.log("La pieza al acabar movimientos es null")
        }
        else {
            this.piezasMovidas.push(this.piezaActual);

            this.piezaActual.setMovida();
            if (this.piezaActual.getTipo() == "Caballeria") {
                this.piezaActual.setSaltoCaballeria(true);
            }
            this.piezaActual = null;
        }

        this.accionesTurno--;
        this.turnoGrafico.setAccionesTurno(this.accionesTurno);

        //Ver si se cambia de jugador
        if (this.accionesTurno <= 0) {
            if (turnoJugador == "J1") turnoJugador = "J2"
            else turnoJugador = "J1"
            this.accionesTurno = 3;
            this.movimientosPieza = 0;

            for (let p of this.piezasMovidas) { //logica conflictiva en situaciones poco reproducibles (falta mejorar)
                if (p) p.resetMovida();
            }

            this.piezasMovidas = [];

            EventBus.emit(Eventos.CHANGE_TURN, turnoJugador);
        }
    }

    //Al finalizar el juego nos aseguramos que si se inicia otra partida todo este por default
    reiniciarTurno() {
        this.accionesTurno = 3;
        this.movimientosPieza = 0;
        this.piezaActual = null;
        this.piezasMovidas = [];
        turnoJugador = "J1";
    }
    //Nos aseguramos de que no se registren llamadas mientras se esta acabando la partida
    destruirListeners() {
        EventBus.off(Eventos.PIECE_SELECTED);
        EventBus.off(Eventos.PIECE_MOVED);
        EventBus.off(Eventos.ATACK);
        EventBus.off(Eventos.PIECE_END_ACTIONS);
        EventBus.off(Eventos.CHANGE_TURN);
    }
}