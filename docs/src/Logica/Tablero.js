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
        let celdasSeleccionadas = [];

        let pieza = celda.getPieza();

        // Si la pieza ya no puede actuar, no devuelvas casillas
        if (!pieza || pieza.getMovida()) return [];

        if (pieza != this.piezaActiva) {
            //Lanzamos el evento de pieza seleccionada
            EventBus.emit(Eventos.PIECE_SELECTED, pieza);
            this.piezaActiva = pieza;
        }

        if (pieza.getTipo() == "Artilleria" && !pieza.puedeDisparar()) return [];

        // Direcciones cardinales
        const direcciones = [
            { df: -1, dc: 0 },  // arriba
            { df: 1, dc: 0 },   // abajo
            { df: 0, dc: -1 },  // izquierda
            { df: 0, dc: 1 }    // derecha
        ];

        if (pieza.getTipo() == "Artilleria") {
            const jugador = pieza.getJugador();

            let iniCol;
            let maxCol;
            if (jugador === "J1") {
                iniCol = pieza.getPosicion().col + 1; // La siguiente a la artilleria
                maxCol = iniCol + 4;
            }
            else {
                iniCol = pieza.getPosicion().col - 4; // La siguiente a la artilleria
                maxCol = pieza.getPosicion().col;
            }

            for (let col = iniCol; col < maxCol; col++) {
                for (let fil = 0; fil < this.filas; fil++) {
                    let celda = this.tablero[fil][col];

                    let esRival;
                    if (!celda.estaVacia()) esRival = jugador !== celda.getPieza().getJugador();

                    if (esRival) {
                        celdasSeleccionadas.push({ fil: fil, col: col, tipo: "enemigo" });
                    }
                    else {
                        celdasSeleccionadas.push({ fil: fil, col: col, tipo: "vacia" });
                    }
                }
            }

        }
        else if (pieza.getTipo() != "Comandante") { //solo el comandante puede moverse en diagonal
            for (let dir of direcciones) {
                const f = fil + dir.df;
                const c = col + dir.dc;
                // fuera de tablero → deja de mirar en esta dirección
                if (f < 0 || c < 0 || f >= this.filas || c >= this.columnas) continue;

                const cel = this.tablero[f][c];

                if (cel.estaVacia()) {
                    // casilla libre: se puede mover; sigue mirando más lejos
                    celdasSeleccionadas.push({ fil: f, col: c, tipo: "vacia" });
                } else {
                    // hay pieza: si es rival, puedes atacar esa casilla; en ambos casos paras
                    const esRival = cel.getPieza().getJugador() !== celda.getPieza().getJugador();
                    if (esRival) celdasSeleccionadas.push({ fil: f, col: c, tipo: "enemigo" });
                    if (pieza.getTipo() == "Caballeria" && pieza.getSaltoCaballeria()) {

                        const f2 = f + dir.df;
                        const c2 = c + dir.dc;

                        // Comprobar límites correctamente
                        if (f2 >= 0 && f2 < this.filas && c2 >= 0 && c2 < this.columnas) {

                            // Puede saltar solo si la casilla destino está vacía
                            if (this.tablero[f2][c2].estaVacia()) {
                                celdasSeleccionadas.push({ fil: f2, col: c2, tipo: "vacia" });
                            }
                        }
                    }


                }
            }
        }
        else {
            for (let i = col - 1; i <= col + 1; i++) {
                for (let j = fil - 1; j <= fil + 1; j++) {
                    // fuera de tablero → deja de mirar en esta dirección
                    if (j < 0 || i < 0 || j >= this.filas || i >= this.columnas) continue;
                    if (j == fil && i == col) continue; // saltar la casilla central
                    const cel = this.tablero[j][i];

                    if (cel.estaVacia()) {
                        // casilla libre: se puede mover; sigue mirando más lejos
                        celdasSeleccionadas.push({ fil: j, col: i, tipo: "vacia" });
                    } else {
                        // hay pieza: si es rival, puedes atacar esa casilla; en ambos casos paras
                        const esRival = cel.getPieza().getJugador() !== celda.getPieza().getJugador();
                        if (esRival) celdasSeleccionadas.push({ fil: j, col: i, tipo: "enemigo" });
                    }
                }
            }
        }
        return celdasSeleccionadas;
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

        EventBus.emit(Eventos.PIECE_MOVED, this.piezaActiva, false);
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
        EventBus.emit(Eventos.PIECE_MOVED, pieza, true);
    }

    /**
     * Inicia un ataque contra una pieza enemiga en la posición especificada.
     * @param {number} fil - fila del enemigo objetivo
     * @param {number} col - columna del enemigo objetivo
     */
    ataque(fil, col) {
        let defensa = this.getCelda(fil, col)
        let origen = this.piezaActiva.getPosicion()
        let ataque = this.getCelda(origen.fila, origen.col)
        EventBus.emit(Eventos.ENEMY_SELECTED, ataque, defensa); //Se recibe en Combate 
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
     * Resetea la pieza activa (deselecciona).
     */
    resetPiezaActiva() {
        console.log("Reset pieza activa en Tablero");
        this.piezaActiva = null;
    }
}

export default Tablero;