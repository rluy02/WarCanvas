import Celda from "./Celda.js";

export default class Tablero {
    constructor(_filas = 8, _columnas = 10) {
        this.filas = _filas;
        this.columnas = _columnas;
        this.tablero = this.crearTablero(); //creamos el tablero lleno de celdas
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

}