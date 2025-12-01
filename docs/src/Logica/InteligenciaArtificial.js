import { turnoJugador } from "./Turno.js";
import { EventBus } from "../EventBus.js";
import { Eventos } from "../Events.js";

export default class InteligenciaArtificial {
    constructor(tablero, tableroGrafico, equipoIA, escena) {
        this.tablero = tablero;
        this.tableroGrafico = tableroGrafico;
        this.equipoIA = equipoIA;
        this.escena = escena;
        this.closestEnemy = null;

        EventBus.on(Eventos.CHANGE_TURN, () =>{
            if (turnoJugador == 'J2')
                this.TurnoIA();
        })
    }
    TurnoIA(){
        let selected = false;
        let pieza = null;
        while(!selected){
            let indicePieza = Phaser.Math.Between(0, this.equipoIA.piezas.length - 1)
            pieza = this.equipoIA.piezas[indicePieza];
            if (!pieza.getMovida()){
                selected = true;
                if (pieza.getTipo() == 'Artilleria' && !pieza.puedeDisparar())
                    selected = false
            }      
        }   
        this.FindClosestEnemy(pieza)
        console.log(`tipo: ${pieza.getTipo()}`)
        console.log(pieza.getPosicion())
        console.log(this.closestEnemy.getPosicion())
    }

    FindClosestEnemy(piezaIA) {
        let minDistance = -1;
        for (let f = 0; f < this.tablero.filas; f++) {
            for (let c = 0; c < this.tablero.columnas; c++) {
                let celda = this.tablero.getCelda(f, c);
                let pieza = celda.getPieza();
                if (pieza && pieza.jugador == 'J1'){
                    let distance = Math.sqrt(Math.pow(piezaIA.col - pieza.col, 2) + Math.pow(piezaIA.fil - pieza.fil, 2));
                    if (minDistance < distance){
                        minDistance = distance
                        this.closestEnemy = pieza
                    }
                }
            }
        }
    }
}
