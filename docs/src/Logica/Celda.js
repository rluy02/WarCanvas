/**
 * Clase que representa una celda en un tablero de juego.
 * @class Celda
 * @memberof Logica
 */
class Celda {
    /**
     * Constructor de la celda.
     * @param {number} fila - fila
     * @param {number} columna - columna
     * @param {*} contenido - contenido de la celda (puede ser null)
     */
    constructor(fila, columna, contenido = null) {
        this.fila = fila;
        this.columna = columna;
        this.contenido = contenido; // podría ser una pieza, item, sprite,etc.
    }

    /**
     * Determina si la celda está vacía.
     * @returns {boolean} - true si la celda está vacía, false en caso contrario
     */
    estaVacia() {
        return this.contenido === null; //comparamos valor y tipo
    }

    /**
     * Setea el contenido de la celda.
     * @param {*} nuevoContenido - nuevo contenido de la celda
     */
    setContenido(nuevoContenido) {
        this.contenido = nuevoContenido;
    }

    /**
     * Limpia el contenido de la celda.
     */
    limpiar() {
        this.contenido = null;
    }

    /**
     * Devuelve el contenido de la celda.
     * @returns {*} - contenido de la celda
     */
    getPieza(){
        return this.contenido;
    }

    /**
     * Devuelve la posición de la celda.
     * @returns {{fila: number, col: number}} - posición de la celda
     */
    getPosicion(){
        return {fila: this.fila, col: this.columna};
    }

    /**
     * Devuelve el tipo de la pieza en la celda.
     * @returns {string} - tipo de la pieza en la celda, o cadena vacía si la celda está vacía
     */
    getTipo(){
        if (!this.estaVacia()){
            return this.contenido.getTipo();
        }
        return "";
    }
}

export default Celda;