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
        //Se que el if se entiende mas bien poco pero lo que hace es que guarda la posición de la pieza seleccionada y comprueba si se ha movido dos casillas en cualquier dirección, si lo ha hecho le resta 2 acciones
        if (this.piezaActual && (((this.piezaActual.getPosicion().fila % 2 == this.posicionPieza.fila % 2) && this.piezaActual.getPosicion().fila != this.posicionPieza.fila) ||
            ((this.piezaActual.getPosicion().col % 2 == this.posicionPieza.col % 2) && this.piezaActual.getPosicion().col != this.posicionPieza.col))) {
            this.movimientosPieza = this.movimientosPieza - 2;
            this.piezaActual.setSaltoCaballeria(false);
            console.log("Se ha usado el salto de caballeria");
        }
        else this.movimientosPieza = this.movimientosPieza - 1;

        if (this.piezaActual) {
            this.posicionPieza = this.piezaActual.getPosicion();

            if (this.piezaActual.getTipo() == 'Caballeria' && this.piezaActual.getSaltoCaballeria() == true && this.movimientosPieza < 2) {
                this.piezaActual.setSaltoCaballeria(false);
                console.log("no se ha usado el salto de caballeria");
            }
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

            for (let p of this.piezasMovidas) {
                p.resetMovida();
            }

            this.piezasMovidas = [];

            EventBus.emit(Eventos.CHANGE_TURN, turnoJugador);
        }
    }


}