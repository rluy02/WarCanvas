import { turnoJugador } from "./Turno.js";
import { EventBus } from "../EventBus.js";
import { Eventos } from "../Events.js";

export default class InteligenciaArtificial {
    constructor(tablero, tableroGrafico, equipoIA, escena, acciones) {
        this.tablero = tablero;
        this.tableroGrafico = tableroGrafico;
        this.equipoIA = equipoIA;
        this.escena = escena;
        this.acciones = acciones
        this.closestEnemy = null;

        EventBus.on(Eventos.CHANGE_TURN, () =>{
            if (turnoJugador == 'J2')
                this.TurnoIA();
        })
    }
    TurnoIA(){
        for (let i = 0; i < this.acciones; i++){
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
            console.log(`tipo: ${this.closestEnemy.getTipo()}`)
            console.log(this.closestEnemy.getPosicion())

            let movimientoX = this.closestEnemy.getPosicion().col - pieza.getPosicion().col
            let movimientoY = this.closestEnemy.getPosicion().fila - pieza.getPosicion().fila
            let celda = this.tablero.getCelda(pieza.getPosicion().fila, pieza.getPosicion().col)
            let data = this.PathFinding(pieza, celda, celda, movimientoX, movimientoY)
            console.log(data.celda, data.found)
        }
        
    }

    FindClosestEnemy(piezaIA) {
        let minDistance = -1;
        for (let f = 0; f < this.tablero.filas; f++) {
            for (let c = 0; c < this.tablero.columnas; c++) {
                let celda = this.tablero.getCelda(f, c);
                let pieza = celda.getPieza();
                if (pieza && pieza.jugador == 'J1'){
                    let distance = Math.sqrt(Math.pow(piezaIA.getPosicion().col - pieza.getPosicion().col, 2) + Math.pow(piezaIA.getPosicion().fila - pieza.getPosicion().fila, 2));
                    if (minDistance > distance || minDistance == -1){
                        minDistance = distance
                        this.closestEnemy = pieza
                    }
                }
            }
        }
    }

    PathFinding(pieza, celda, prevCelda, movX, movY){
        let celdas = [1]; 
        celda[0] = this.tablero.getCelda(pieza.getPosicion().fila, pieza.getPosicion().col);
        let found = false;

        return {celda: celda[0], found: found}
    }
}
