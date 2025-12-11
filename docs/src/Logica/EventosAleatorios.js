import { Eventos } from "../Events.js";
import { EventBus } from "../EventBus.js";

/**
 * Clase que gestiona los eventos aleatorios durante el juego.
 * @class EventosAleatorios
 * @memberof Logica
 */
class EventosAleatorios {
    /**
     * Constructor de EventosAleatorios.
     * @param {Tablero} tablero - el tablero del juego
     * @param {TableroGrafico} tableroGrafico - representación gráfica del tablero
     * @param {PanelEventos} panelEventoAleatorio - panel para mostrar eventos aleatorios
     * @constructor
     */
    constructor(escena, tablero, tableroGrafico, panelEventoAleatorio) {
        this.escena = escena;
        this.tablero = tablero;
        this.tableroGrafico = tableroGrafico;
        this.panelEventoAleatorio = panelEventoAleatorio;
        this.piezasAfectadas = [];
        this.terremotoCounter = 0;
        this.indiceEventoPrevio = null;
        this.miniJuego = this.escena.ia
        this.evento;

        EventBus.on(Eventos.RANDOM_EVENT, () => { if (this.terremotoCounter == 0) this.triggerEvent() });
        EventBus.on(Eventos.CHANGE_TURN, () => { this.resetEvents() });
        this.eventos = [{
            nombre: "Terremoto",
            descripcion: "Un terremoto sacude el campo de batalla. Las piezas en las zonas afectadas no podrán moverse este turno.",
            peso: 5,
            runEvent: (jugador) => {
                this.terremotoRun(jugador);
            },
            reset: () => {
                if (this.terremotoCounter < 1) {
                    this.terremotoCounter++;
                    return;
                }
                for (let pieza of this.piezasAfectadas) {
                    pieza.resetMovida();
                }
                this.tableroGrafico.limpiarEventos();
                this.piezasAfectadas = [];
                this.terremotoCounter = 0;
            }
        },
        {
            nombre: "Fuerte Lluvia",
            descripcion: "Una fuerte lluvia erosiona el terreno conquistado, devolviendo algunas casillas a su estado neutral.",
            peso: 3,
            runEvent: (jugador) => {
                this.lluviaRun(jugador);
            },
            reset: () => {
                this.tableroGrafico.limpiarEventos();
            }
        }];
    }

    /**
     * Realiza el evento terremoto, si el minijuego se ha realizado antes, al ganador no le afecta
     * @param {*String} jugador // Jugador Ganador
     */
    terremotoRun(jugador) {
        let celdasAfectadas = [];
        for (let f = 0; f < this.tablero.filas; f++) {
            for (let c = 3; c < 7; c++) {
                let celda = this.tablero.getCelda(f, c);
                if (this.miniJuego) { // No afecta al ganador
                    if (Math.random() < 0.4) {
                        if (!celda.estaVacia()) {
                            let pieza = celda.getPieza();
                            if (!(pieza.getJugador() == jugador)) celdasAfectadas.push(celda);
                        }
                        else celdasAfectadas.push(celda);
                    }
                }
                else { // Normal
                    if (Math.random() < 0.25)
                        celdasAfectadas.push(celda);
                }
            }
        }

        for (let celda of celdasAfectadas) {
            if (celda.getPieza()) {
                celda.getPieza().setMovida(true);
                this.piezasAfectadas.push(celda.getPieza());
            }
            this.tableroGrafico.coloreaCelda(celda.fila, celda.columna, 0x0000FF, 0.4);
        }
    }

    /**
     * Ejecuta el evento de lluvia
     * @param {*String} jugador // Jugador Ganador
     */
    lluviaRun(jugador) {

        const key = (jugador === 'J1') ? 'mapaTopo' : 'mapaSat';

        let celdasAfectadas = [];
        for (let f = 0; f < this.tablero.filas; f++) {
            for (let c = 0; c < this.tablero.columnas; c++) {
                if (this.tablero.getCelda(f, c).estaVacia()) { // Solo afecta casillas conquistadas (con mapa) con 15% probabilidad
                    const grafico = this.tableroGrafico.graficos[f][c];

                    if (this.miniJuego) { // No afecta al ganador
                        if (grafico.imagen && Math.random() < 0.3) {
                            if (!(grafico.imagen.mapKey === key)) { // (Si la casilla es del ganador no le afecta)
                                celdasAfectadas.push({
                                    fila: f,
                                    columna: c,
                                    jugadorAnterior: grafico.imagen.mapKey == 'mapaTopo' ? 'J1' : 'J2'
                                });
                            }
                        }
                    }

                    else { // Normal
                        if (grafico.imagen && Math.random() < 0.15) {
                            celdasAfectadas.push({
                                fila: f,
                                columna: c,
                                jugadorAnterior: grafico.imagen.mapKey === 'mapaTopo' ? 'J1' : 'J2'
                            });
                        }
                    }
                }
            }
        }

        for (let celda of celdasAfectadas) {
            this.tableroGrafico.borrarFragmentoMapa(celda.fila, celda.columna, celda.jugadorAnterior);
            this.tableroGrafico.coloreaCelda(celda.fila, celda.columna, 0x0000ff, 0.3);
        }
    }


    /**
     * Reinicia el evento anterior ejecutando su función de reset.
     * Limpia los efectos del evento que fue disparado en el turno anterior.
     */
    resetEvents() {
        if (this.indiceEventoPrevio !== null) {
            const eventoActual = this.eventos[this.indiceEventoPrevio];
            eventoActual.reset();
            if (eventoActual.nombre === "Terremoto" && this.terremotoCounter < 2) {
                return;
            }
            this.indiceEventoPrevio = null;
        }
    }

    /**
     * Emite el evento actual despues del miniJuego
     * @param {*String} jugador 
     */
    runEventoActual(jugador) {
        this.panelEventoAleatorio.mostrar(this.evento.nombre, this.evento.descripcion, 'Evento Aleatorio', 'ACEPTAR', () => {
            this.evento.runEvent(jugador);
        });
    }

    /**
     * Dispara un evento aleatorio basado en los pesos definidos de cada evento.
     * Selecciona aleatoriamente un evento, muestra su panel y ejecuta su lógica con un delay.
     */
    triggerEvent() {
        if (!this.eventos.length) return;
        const total = this.eventos.reduce((s, e) => s + (e.peso || 1), 0);
        let r = Math.random() * total;
        for (let i = 0; i < this.eventos.length; i++) {
            r -= (this.eventos[i].peso || 1);
            if (r <= 0) {
                this.indiceEventoPrevio = i;
                this.evento = this.eventos[i];

                if (this.miniJuego) {
                    // Emitir evento para mostrar panel ANTES de ejecutar
                    this.panelEventoAleatorio.mostrar(this.evento.nombre, 'Para decidir a quien afecta el evento, preparate para un miniJuego ', 'EVENTO ALEATORIO', 'ACEPTAR', () => {
                        this.escena.lanzarMinijuego();
                    });
                }
                else this.panelEventoAleatorio.mostrar(this.evento.nombre, this.evento.descripcion, 'Evento Aleatorio', 'ACEPTAR', () => {
                    this.evento.runEvent();
                });
                //this.panelEventoAleatorio.mostrar(this.evento.evento.nombre, this.evento.evento.descripcion, 'Ha ganado' , 'ACEPTAR' );
                return;
            }
        }
    }
}

export default EventosAleatorios;