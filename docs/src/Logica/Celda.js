export default class Celda {
    constructor(fila, columna, contenido = null) {
        this.fila = fila;
        this.columna = columna;
        this.contenido = contenido; // podría ser una pieza, item, sprite,etc.
    }

    estaVacia() {
        return this.contenido === null; //comparamos valor y tipo
    }

    setContenido(nuevoContenido) {
        this.contenido = nuevoContenido;
    }

    limpiar() {
        this.contenido = null;
    }

    getPieza(){
        return this.contenido;
    }

    getPosicion(){
        return {fila: this.fila, col: this.columna};
    }

    getTipo(){
        if (!this.estaVacia()){
            return this.contenido.getTipo();
        }
        return "";
    }
}
