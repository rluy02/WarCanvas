import { Eventos } from "../Events.js";
import { EventBus } from "../EventBus.js";

export default class EventosAleatorios {
    constructor(tablero) {
        this.tablero = tablero;
        this.piezasAfectadas = [];
        this.celdasAfectadas = [];  
        this.indiceEventoPrevio = null;

        EventBus.on(Eventos.RANDOM_EVENT, () => this.ejecutarEvento());
        EventBus.on(Eventos.CHANGE_TURN, () => this.resetEventos());

        this.eventos = [
            {
                id: "Terremoto",
                descripcion: "Bloquea piezas en tierra de nadie este turno.",
                ejecutar: () => {
                    for (let f = 0; f < this.tablero.filas; f++) {
                        for (let c = 3; c < 7; c++) {
                            if (Math.random() < 0.25) {
                                const celda = this.tablero.getCelda(f, c);
                                this.celdasAfectadas.push(celda);
                                if (!celda) continue;
                                const pieza = celda.getPieza();
                                if (pieza) {
                                    pieza.setMovida(true); // se bloquea este turno
                                    this.piezasAfectadas.push(pieza);
                                }
                            }
                        }
                    }
                    EventBus.emit(Eventos.TERREMOTO, this.celdasAfectadas);
                },
                reset: () => {
                    // Todas las piezas afectadas recuperan movimiento
                    this.piezasAfectadas.forEach(p => p.setMovida(false));
                    EventBus.emit(Eventos.TERREMOTO, []); // limpiar visual
                    this.piezasAfectadas = [];
                    this.celdasAfectadas = [];
                }
            }
        ];
    }

    resetEventos() {
        if (this.indiceEventoPrevio !== null) {
            this.eventos[this.indiceEventoPrevio].reset();
            this.indiceEventoPrevio = null;
        }
    }

    ejecutarEvento() {
        if (!this.eventos.length) return;
        const i = Math.floor(Math.random() * this.eventos.length);
        this.indiceEventoPrevio = i;
        this.eventos[i].ejecutar();
    }
}
