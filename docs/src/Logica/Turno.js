import { Eventos } from "../Events.js";
import { EventBus } from "../EventBus.js";

export let turnoJugador = "J1";

/**
 * Clase que gestiona el turno de los jugadores
 * @class Turno
 * @memberof Logica
 */
class Turno {
    constructor(escena, acciones, turnoGrafico) {
        this.escena = escena;
        this.accionesTurno = acciones;
        this.acionActual = 0;

        this.piezaActual = null;
        this.piezasMovidas = [];
        this.movimientosPieza = 0;
        this.posicionPieza;

        this.turnoGrafico = turnoGrafico;
    }

    /**
     * Crea los listeners necesarios para el turno
     */
    crearListeners() {
        EventBus.on(Eventos.PIECE_SELECTED, (pieza) => { this.setPieza(pieza) });
        EventBus.on(Eventos.PIECE_MOVED, (pieza, ataque) => { this.restarAccion(ataque) })
        EventBus.on(Eventos.CHANGE_TURN, (turnoJugador) => {
            this.turnoGrafico.setTurnoJugador(turnoJugador);
        })
    }

    /**
     * Setea la pieza actual y sus movimientos
     * @param {Pieza} pieza 
     */
    setPieza(pieza) {
        this.piezaActual = pieza;
        this.movimientosPieza = pieza.getMovimientos();
        this.posicionPieza = pieza.getPosicion();

        this.turnoGrafico.setAccionesPieza(this.movimientosPieza);
    }

    /**
     * Resta una acción a la pieza actual, si ataque es true, se finalliza el movimiento directamente
     * @param {*} ataque 
     */
    restarAccion(ataque = false) {
        if (!this.piezaActual) return;

        const posAntes = this.posicionPieza; // posición guardada antes de mover
        const posDespues = this.piezaActual.getPosicion();

        const df = Math.abs(posDespues.fila - posAntes.fila);
        const dc = Math.abs(posDespues.col - posAntes.col);

        const distancia = df + dc;

        // Comprobamos si se ha usado salto de caballería
        if (this.piezaActual.getTipo() === "Caballeria" &&
            this.piezaActual.getSaltoCaballeria() === true &&
            distancia === 2) {

            // Se ha usado salto
            this.movimientosPieza -= 2;
            this.piezaActual.setSaltoCaballeria(false);

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
        }

        // Actualizamos la interfaz gráfica
        this.turnoGrafico.setAccionesPieza(this.movimientosPieza);

        // Si no quedan movimientos o se ha atacado, finalizamos los movimientos de la pieza
        if (this.movimientosPieza <= 0 || ataque) {
            this.piezasMovidas.push(this.piezaActual);
            this.acabarMovimientos();
        }
    }

    /**
     * Finaliza los movimientos de la pieza actual y actualiza el turno si es necesario
     */
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

            if (!this.escena.partidaTerminadaFlag && Math.random() < 0.2) { // 20% de probabilidad de evento aleatorio y que la partida no este terminada
                EventBus.emit(Eventos.RANDOM_EVENT);
            }
        }
        EventBus.emit(Eventos.PIECE_END_ACTIONS);
    }

    /**
     * Reinicia el turno al estado inicial
     */
    reiniciarTurno() {
        this.accionesTurno = 3;
        this.movimientosPieza = 0;
        this.piezaActual = null;
        this.piezasMovidas = [];
        turnoJugador = "J1";
    }
    
    /**
     * Destruye los listeners creados por este objeto
     */
    destruirListeners() {
        EventBus.off(Eventos.PIECE_SELECTED);
        EventBus.off(Eventos.PIECE_MOVED);
        EventBus.off(Eventos.ATACK);
        EventBus.off(Eventos.PIECE_END_ACTIONS);
        EventBus.off(Eventos.CHANGE_TURN);
    }
}

export default Turno;