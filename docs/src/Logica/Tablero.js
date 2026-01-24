import Celda from "./Celda.js";
import { Eventos } from "../Events.js";
import { EventBus } from "../EventBus.js";

/**
 * Clase que representa el tablero de juego.
 * @class Tablero
 * @memberof Logica
 */
class Tablero {
    /**
     * Constructor del tablero.
     * @param {number} _filas - número de filas del tablero (default: 8)
     * @param {number} _columnas - número de columnas del tablero (default: 10)
     * @param {Phaser.Scene} escena - escena asociada al tablero
     * @constructor
     */
    constructor(_filas = 8, _columnas = 10, escena) {
        this.filas = _filas;
        this.columnas = _columnas;
        this.tablero = this.crearTablero(); //creamos el tablero lleno de celdas
        this.piezaActiva = null;
        this.escena = escena;
        this.turnoActivo = null;

        this.celdasJ1 = 0;
        this.celdasJ2 = 0;
    }

    /**
     * Crea una matriz bidimensional de celdas que representan el tablero.
     * @returns {Array<Array<Celda>>} matriz de celdas
     * @private
     */
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

    /**
     * Obtiene la celda en una posición específica del tablero.
     * @param {number} fila - fila de la celda
     * @param {number} columna - columna de la celda
     * @returns {Celda} celda solicitada
     */
    getCelda(fila, columna) {
        return this.tablero[fila][columna];
    }

    // Selecciona las casillas de movimiento/ataque de la pieza
    /**
     * Calcula las casillas disponibles para mover o atacar cuando se selecciona una pieza.
     * Devuelve las casillas según el tipo de pieza y su alcance.
     * @param {number} fil - fila de la pieza seleccionada
     * @param {number} col - columna de la pieza seleccionada
     * @returns {Array<Object>} array de objetos con coordenadas y tipo de acción (vacia/enemigo)
     */
    piezaSeleccionada(fil, col) {
        let celda = this.tablero[fil][col];
        let pieza = celda.getPieza();

        // Si la pieza ya no puede actuar, no devuelvas casillas
        if (!pieza || pieza.getMovida()) return [];

        if (pieza != this.piezaActiva) {
            //Lanzamos el evento de pieza seleccionada
            EventBus.emit(Eventos.PIECE_SELECTED, pieza);
            this.piezaActiva = pieza;
        }

        return pieza.piezaSeleccionada(fil, col, this);
    }

    // Mueve la pieza a fil, col
    /**
     * Mueve la pieza activa a una nueva posición en el tablero.
     * @param {number} fil - fila de destino
     * @param {number} col - columna de destino
     */
    moverPieza(fil, col) {

        //Limpia la celda de origen
        let origen = this.piezaActiva.getPosicion()
        this.tablero[origen.fila][origen.col].limpiar();

        //Añade la pieza a la celda de destino
        this.piezaActiva.moverse(fil, col);
        this.tablero[fil][col].setContenido(this.piezaActiva);

        EventBus.emit(Eventos.PIECE_MOVED, this.piezaActiva);
    }

    // Mueve la pieza a fil, col cuando gana un combate
    /**
     * Mueve una pieza a una nueva posición después de ganar un combate.
     * @param {number} fil - fila de destino
     * @param {number} col - columna de destino
     * @param {Pieza} pieza - pieza a mover
     */
    moverPiezaCombate(fil, col, pieza) {

        //Limpia la celda de origen
        let origen = pieza.getPosicion();
        this.tablero[origen.fila][origen.col].limpiar();

        //Añade la pieza a la celda de destino
        pieza.moverse(fil, col);
        this.tablero[fil][col].setContenido(pieza);
        EventBus.emit(Eventos.PIECE_MOVED, pieza);
    }

    /**
     * Inicia un ataque contra una pieza enemiga en la posición especificada.
     * @param {number} fil - fila del enemigo objetivo
     * @param {number} col - columna del enemigo objetivo
     */
    ataque(fil, col) {
        if (!this.piezaActiva) {
            console.error('Error: No hay pieza activa para atacar');
            return;
        }
        
        let defensa = this.getCelda(fil, col);
        let origen = this.piezaActiva.getPosicion();
        let ataque = this.getCelda(origen.fila, origen.col);
        EventBus.emit(Eventos.ENEMY_SELECTED, ataque, defensa);
    }

    /**
     * Obtiene la pieza actualmente seleccionada.
     * @returns {Pieza|null} pieza activa o null si ninguna está seleccionada
     */
    getPiezaActiva() {
        return this.piezaActiva;
    }

    /**
     * Reinicia la pieza activa (deselecciona).
     */
    resetPiezaActiva() {
        this.piezaActiva = null;
    }

    /**
     * Registra la conquista de una celda por un jugador.
     * Actualiza los contadores de territorio y verifica condición de victoria.
     * @param {string} jugador - identificador del jugador ('J1' o 'J2')
     * @param {boolean} ocupada - indica si la celda estaba previamente ocupada por el enemigo
     */
    conquistarCelda(jugador, ocupada) {
        if (jugador == "J1") {
            this.celdasJ1++;
            if (ocupada) this.celdasJ2--;
        }
        else {
            this.celdasJ2++;
            if (ocupada) this.celdasJ1--;
        }
        let j1Porcentaje = this.celdasJ1 * 100 / 80;
        let j2Porcentaje = this.celdasJ2 * 100 / 80;

        EventBus.emit(Eventos.CONQUER_CELL, j1Porcentaje, j2Porcentaje)

        if (this.celdasJ1 >= 64 || this.celdasJ2 >= 64) EventBus.emit(Eventos.END_GAME, {
            jugador: this.piezaActiva.getJugador(),
            tipo: "TERRITORIO"
        });
    }

    /**
     * Elimina una celda conquistada por el jugador especificado (por lluvia).
     * @param {string} jugadorAnterior - identificador del jugador anterior ('J1' o 'J2')
     */
    borrarCelda(jugadorAnterior) {
        if (jugadorAnterior === 'J1') {
            this.celdasJ1--;
        } else if (jugadorAnterior === 'J2') {
            this.celdasJ2--;
        }

        let j1Porcentaje = this.celdasJ1 * 100 / 80;
        let j2Porcentaje = this.celdasJ2 * 100 / 80;
        EventBus.emit(Eventos.UPDATE_PERCENTAGES, j1Porcentaje, j2Porcentaje);
    }


    /**
     * Obtiene el tamaño del tablero.
     * @returns {Object} objeto con propiedades fila y col
     */
    size() {
        return { fila: this.filas, col: this.columnas };
    }

    /**
     * Devuelve la escena asociada al tablero.
     * @returns {Phaser.Scene} escena asociada al tablero
     */
    getEscena() {
        return this.escena;
    }

    /**
     * Devuelve el tablero del juego
     * @returns {Tablero}
     */
    getTableroDeJuego(){
        return this.tablero;
    }

    /**
     * Resetea la pieza activa (deselecciona).
     */
    resetPiezaActiva() {
        console.log("Reset pieza activa en Tablero");
        this.piezaActiva = null;
    }
}

export default Tablero;