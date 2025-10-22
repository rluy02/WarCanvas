export default class Tablero {
    constructor(_filas = 8, _columnas = 10) {
        this.filas = _filas;
        this.columnas = _columnas;
        this.grid = this.crearTablero(); //creamos el tablero vacio con el constructor
    }

    crearTablero() {
        let tablero = [];
        for (let i = 0; i < this.filas; i++) {
            tablero[i] = [];
            for (let j = 0; j < this.columnas; j++) {
                tablero[i][j] = null;
            }
        }
        return tablero;
    }

}