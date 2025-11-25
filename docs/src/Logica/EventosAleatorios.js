import { Eventos } from "../Events.js";
import { EventBus } from "../EventBus.js";
import { turnoJugador } from "./Turno.js";

export default class EventosAleatorios {
    constructor(tablero, tableroGrafico) {
        this.tablero = tablero;
        this.tableroGrafico = tableroGrafico;
        this.piezasAfectadas = [];
        this.indiceEventoPrevio = null;

        EventBus.on(Eventos.RANDOM_EVENT, () => { this.triggerEvent() });
        EventBus.on(Eventos.CHANGE_TURN, () => { this.resetEvents() });
        this.eventos = [{
            nombre: "Terremoto",
            peso: 5,              // común
            runEvent: () => {
                console.log("Evento Terremoto activado");
                let celdasAfectadas = [];
                for (let f = 0; f < this.tablero.filas; f++) {
                    for (let c = 3; c < 7; c++) {
                        let celda = this.tablero.getCelda(f, c);
                        if (Math.random() < 0.25)
                            celdasAfectadas.push(celda);
                    }
                }

                for (let celda of celdasAfectadas) {
                    if (celda.getPieza()) {
                        celda.getPieza().setMovida(true);
                        this.piezasAfectadas.push(celda.getPieza());
                    }
                    this.tableroGrafico.coloreaCelda(celda.fila, celda.columna, 0x0000ff, 0.3);
                }    
            },
            reset: () => {
                for (let pieza of this.piezasAfectadas) {
                    pieza.resetMovida();
                }
                this.tableroGrafico.limpiarEventos();
                this.piezasAfectadas = [];
            }
        }, 
        {
            nombre: "Fuerte Lluvia",
            peso: 3,              // menos frecuente
            runEvent: () => {
                console.log("Evento Fuerte Lluvia activado");
                let celdasAfectadas = [];
                for (let f = 0; f < this.tablero.filas; f++) {
                    for (let c = 0; c < this.tablero.columnas; c++) {
                        if (this.tablero.getCelda(f, c).getPieza() == null) { 
                            const grafico = this.tableroGrafico.graficos[f][c];
                            // Solo afecta casillas conquistadas (con mapa) con 15% probabilidad
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
                for (let celda of celdasAfectadas) {
                    this.tableroGrafico.borrarFragmentoMapa(celda.fila, celda.columna, celda.jugadorAnterior);
                    this.tableroGrafico.coloreaCelda(celda.fila, celda.columna, 0x0000ff, 0.3);
                }
            },
            reset: () => {
                this.tableroGrafico.limpiarEventos();
            }
        }]; 
            
    }

    resetEvents(){
        if (this.indiceEventoPrevio !== null){
            this.eventos[this.indiceEventoPrevio].reset();
            this.indiceEventoPrevio = null;
        }
    }
    triggerEvent(){
        if (!this.eventos.length) return;
        const total = this.eventos.reduce((s,e)=> s + (e.peso || 1), 0);
        let r = Math.random() * total;
        for (let i = 0; i < this.eventos.length; i++){
            r -= (this.eventos[i].peso || 1);
            if (r <= 0){
                this.indiceEventoPrevio = i;
                this.eventos[i].runEvent();
                return;
            }
        }
    }
}