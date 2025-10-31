import Celda from "./Celda.js";
import { eventos } from "./events.js";
import { EventBus } from "./EventBus.js";

export default class Tablero {
    constructor(_filas = 8, _columnas = 10) {
        this.filas = _filas;
        this.columnas = _columnas;
        this.tablero = this.crearTablero(); //creamos el tablero lleno de celdas
        this.piezaActiva = null;

        this.turnoActivo = null;
    }

    crearTablero() {
        let tab = [];
        for (let i = 0; i < this.filas; i++) {
            tab[i] = [];
            for (let j = 0; j < this.columnas; j++) {
                tab[i][j] = new Celda(i, j);
            }
        }
        return tab;
    }

    getCelda(fila, columna) {
        return this.tablero[fila][columna];
    }

    // Selecciona las casillas de movimiento/ataque de la pieza
    piezaSeleccionada(fil, col) {

        let celda = this.tablero[fil][col];
        let celdasSeleccionadas = [];

        let pieza = celda.getPieza();

        if (pieza != this.piezaActiva) {
            //Lanzamos el evento de pieza seleccionada
            EventBus.emit(eventos.PIECE_SELECTED, pieza);
            this.piezaActiva = pieza;
        }

        // Direcciones cardinales
        const direcciones = [
            { df: -1, dc: 0 },  // arriba
            { df: 1, dc: 0 },   // abajo
            { df: 0, dc: -1 },  // izquierda
            { df: 0, dc: 1 }    // derecha
        ];

        for (let dir of direcciones) {
            let f = fil + dir.df;
            let c = col + dir.dc;
            // Evitar índices fuera de rango
            if (f > 0 && c > 0 && f < this.filas && c < this.columnas) {
                //La celda que se está pintando
                let cel = this.tablero[f][c];

                if (cel.estaVacia()) {
                    celdasSeleccionadas.push({ fil: f, col: c, tipo: "vacia" }); //Solo hay 2 tipos, o "vacia" o "enemigo"
                }
                else if (cel.getPieza().getJugador() != celda.getPieza().getJugador()) {
                    celdasSeleccionadas.push({ fil: f, col: c, tipo: "enemigo" });
                }
            }
        }

        return celdasSeleccionadas;
    }

    // Mueve la pieza a fil, col
    moverPieza(fil, col) {

        //Limpia la celda de origen
        let origen = this.piezaActiva.getPosicion()
        this.tablero[origen.fila][origen.col].limpiar();

        //Añade la pieza a la celda de destino
        this.piezaActiva.moverse(fil, col);
        this.tablero[fil][col].setContenido(this.piezaActiva);

        EventBus.emit(eventos.PIECE_MOVED, this.piezaActiva);
    }

    ataque(fil, col) {
        let defensa = this.getCelda(fil, col)
        let origen = this.piezaActiva.getPosicion()
        let ataque = this.getCelda(origen.fila, origen.col)
        EventBus.emit(eventos.ENEMY_SELECTED, ataque, defensa);
    }

    getPiezaActiva(){
        return this.piezaActiva;
    }

}