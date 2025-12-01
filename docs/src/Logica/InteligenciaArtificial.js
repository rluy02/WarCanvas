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
            console.log(`Pieza IA: ${pieza.getTipo()}`)
            console.log(pieza.getPosicion())

            console.log(`Enemigo más cercana: ${this.closestEnemy.getTipo()}`)
            console.log(this.closestEnemy.getPosicion())

            let movimientoX = this.closestEnemy.getPosicion().col - pieza.getPosicion().col
            let movimientoY = this.closestEnemy.getPosicion().fila - pieza.getPosicion().fila
            let inicio = this.tablero.getCelda(pieza.getPosicion().fila, pieza.getPosicion().col)
            const camino = this.PathFindingRecursivo(pieza, inicio, movimientoX, movimientoY, [])
            for (let j = 0; j < camino.length; j++){
                console.log(camino[j].getPosicion());
            }
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

    PathFindingRecursivo(pieza, celda, movX, movY, caminoActual, profundidad = 0){
        const MAX_PROFUNDIDAD = 20;

        if (movX === 0 && movY === 0){
            return caminoActual;
        }

        if (profundidad >= MAX_PROFUNDIDAD){
            return [];
        }

        const colActual = celda.getPosicion().col;
        const filaActual = celda.getPosicion().fila;
        const opciones = [];


        if (colActual > 0){
            const celdaIzq = this.tablero.getCelda(filaActual, colActual - 1);
            const nuevoMovX = movX + 1;
            const nuevoMovY = movY;
            const esDestino = (nuevoMovX === 0 && nuevoMovY === 0);
            if ((celdaIzq.estaVacia() || esDestino) && !this.estaEnCamino(celdaIzq, caminoActual)){
                opciones.push({
                    celda: celdaIzq,
                    nuevoMovX,
                    nuevoMovY,
                    distancia: Math.abs(nuevoMovX) + Math.abs(nuevoMovY)
                });
            }
        }


        if (colActual < this.tablero.columnas - 1){
            const celdaDcha = this.tablero.getCelda(filaActual, colActual + 1);
            const nuevoMovX = movX - 1;
            const nuevoMovY = movY;
            const esDestino = (nuevoMovX === 0 && nuevoMovY === 0);
            if ((celdaDcha.estaVacia() || esDestino) && !this.estaEnCamino(celdaDcha, caminoActual)){
                opciones.push({
                    celda: celdaDcha,
                    nuevoMovX,
                    nuevoMovY,
                    distancia: Math.abs(nuevoMovX) + Math.abs(nuevoMovY)
                });
            }
        }


        if (filaActual > 0){
            const celdaArriba = this.tablero.getCelda(filaActual - 1, colActual);
            const nuevoMovX = movX;
            const nuevoMovY = movY + 1;
            const esDestino = (nuevoMovX === 0 && nuevoMovY === 0);
            if ((celdaArriba.estaVacia() || esDestino) && !this.estaEnCamino(celdaArriba, caminoActual)){
                opciones.push({
                    celda: celdaArriba,
                    nuevoMovX,
                    nuevoMovY,
                    distancia: Math.abs(nuevoMovX) + Math.abs(nuevoMovY)
                });
            }  
        }


        if (filaActual < this.tablero.filas - 1){
            const celdaAbajo = this.tablero.getCelda(filaActual + 1, colActual);
            const nuevoMovX = movX;
            const nuevoMovY = movY - 1;
            const esDestino = (nuevoMovX === 0 && nuevoMovY === 0);
            if ((celdaAbajo.estaVacia() || esDestino) && !this.estaEnCamino(celdaAbajo, caminoActual)){
                opciones.push({
                    celda: celdaAbajo,
                    nuevoMovX,
                    nuevoMovY,
                    distancia: Math.abs(nuevoMovX) + Math.abs(nuevoMovY)
                });
            }
        }

        if (opciones.length === 0){
            return [];
        }

        opciones.sort((a, b) => a.distancia - b.distancia);

        for (const opcion of opciones){
            const nuevoCamino = [...caminoActual, opcion.celda];
            const resultado = this.PathFindingRecursivo(
                pieza,
                opcion.celda,
                opcion.nuevoMovX,
                opcion.nuevoMovY,
                nuevoCamino,
                profundidad + 1
            );

            if (resultado.length > 0){
                return resultado;
            }
        }
        return [];
    }

    estaEnCamino(celda, camino) {
        return camino.some(c => 
            c.getPosicion().fila === celda.getPosicion().fila && 
            c.getPosicion().col === celda.getPosicion().col
        );
    }
}
