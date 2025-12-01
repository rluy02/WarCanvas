import { turnoJugador } from "./Turno.js";
import { EventBus } from "../EventBus.js";
import Eventos from "../Eventos.js";

export default class InteligenciaArtificial {
    constructor(tablero, tableroGrafico, equipoIA, escena) {
        this.tablero = tablero;
        this.tableroGrafico = tableroGrafico;
        this.equipoIA = equipoIA;
        this.escena = escena;
        this.closestEnemy = null;

    }

    FindClosestEnemy(piezaIA) {
        let minDistance = -1;
        for (f = 0; f < this.tablero.filas; f++) {
            for (c = 0; c < this.tablero.columnas; c++) {
                let celda = this.tablero.getCelda(f, c);
                let pieza = celda.getPieza();
                if (pieza && pieza.jugador == 'J1'){
                    if (minDistance == -1){
                        mindistance = Math.sqrt(Math.pow(piezaIA.col - pieza.col, 2) + Math.pow(piezaIA.fil - pieza.fil, 2))
                    }
                }
            }
        }
    }
}
