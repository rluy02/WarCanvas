import { Eventos } from "../Events.js";
import { EventBus } from "../EventBus.js";
import { turnoJugador } from "./Turno.js";

export default class EventosAleatorios {
    constructor(tablero, tableroGrafico, panelEventoAleatorio) {
        this.tablero = tablero;
        this.tableroGrafico = tableroGrafico;
        this.panelEventoAleatorio = panelEventoAleatorio;
        this.piezasAfectadas = [];
        this.indiceEventoPrevio = null;

        EventBus.on(Eventos.RANDOM_EVENT, () => { this.triggerEvent() });
        EventBus.on(Eventos.CHANGE_TURN, () => { this.resetEvents() });
        this.eventos = [{
            nombre: "Terremoto",
            descripcion: "Un terremoto sacude el campo de batalla. Las piezas en las zonas afectadas no podrán moverse este turno.",
            peso: 5,
            runEvent: () => {
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
                    this.tableroGrafico.coloreaCelda(celda.fila, celda.columna, 0x0000FF, 0.4);
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
            descripcion: "Una fuerte lluvia erosiona el terreno conquistado, devolviendo algunas casillas a su estado neutral.",
            peso: 2,
            runEvent: () => {
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
                const evento = this.eventos[i];
                
                // Emitir evento para mostrar panel ANTES de ejecutar
                this.panelEventoAleatorio.mostrar(evento.nombre, evento.descripcion);
                
                // Ejecutar después de un pequeño delay para que se vea el panel
                setTimeout(() => {
                    evento.runEvent();
                }, 100);
                return;
            }
        }
    }
}