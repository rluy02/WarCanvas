import Soldado from "./Piezas/Soldado.js";
import Caballeria from "./Piezas/Caballeria.js";
import Comandante from "./Piezas/Comandante.js";
import Artilleria from "./Piezas/Artilleria.js";
import Celda from "./Celda.js";
import { Eventos } from "../Events.js";
import { EventBus } from "../EventBus.js";
import Equipo from "./Equipo.js";
import Tablero from "./Tablero.js";
import Pieza from "./Pieza.js";

/**
 * Clase que gestiona la colocación de piezas en el tablero.
 * @class ColocarPiezas
 * @memberof Logica
 * @extends Tablero
 */
class ColocarPiezas {
    /**
     * Constructor de la clase ColocarPiezas.
     * @param {Equipo} equipo1 - primer equipo
     * @param {Equipo} equipo2 - segundo equipo
     * @param {number} _filas - número de filas del tablero
     * @param {number} _columnas - número de columnas del tablero
     */
    constructor(equipo1, equipo2, _filas = 8, _columnas = 10) {
        this.filas = _filas;
        this.columnas = _columnas;
        this.tablero = this.crearTablero(); //creamos el tablero lleno de celdas

        this.equipo1 = equipo1;
        this.equipo2 = equipo2;

        this.equipoActual = this.equipo1;

        this.tipo;

        EventBus.on(Eventos.CHANGE_TEAM_SET_PIECES, ()=> {
            this.cambiarEquipo();
        });
    }

    /**
     * Crea el tablero lleno de celdas.
     * @returns {Tablero}
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
     * Devuelve la celda en la posición (fila, columna).
     * @param {number} fila - fila
     * @param {number} columna - columna
     * @returns {Celda} - celda en la posición (fila, columna)
     */
    getCelda(fila, columna) {
        return this.tablero[fila][columna];
    }

    /**
     * Genera una pieza del tipo seleccionado en la posición (fil, col).
     * @param {number} fil - fila
     * @param {number} col - columna
     */
    generarPieza(fil, col) {
        let nombre = this.equipoActual.getNombre();
        if((this.equipoActual === this.equipo1 && col < 3) || (this.equipoActual === this.equipo2 && col < 10 && col > 6) ) {
        let pieza = null;
        if (this.tipo == 'Soldado' && this.equipoActual.getSoldados() > 0)  {
            pieza =  new Soldado(fil, col, nombre);
            this.equipoActual.setSoldado(pieza);
        }
        else if (this.tipo == 'Artilleria' && this.equipoActual.getArtilleria() > 0) {
            pieza = new Artilleria(fil, col, nombre);
            this.equipoActual.setArtilleria(pieza);
        }
        else if (this.tipo == 'Caballeria' && this.equipoActual.getCaballeria() > 0) {
            pieza = new Caballeria(fil, col, nombre);
            this.equipoActual.setCaballeria(pieza);
        }
        else if (this.tipo == 'Comandante' && this.equipoActual.getComandante() > 0){
            pieza = new Comandante(fil, col, nombre);
            this.equipoActual.setComandante(pieza);
        }
        this.tablero[fil][col].setContenido(pieza);
        if (pieza != null)EventBus.emit(Eventos.PIECE_POSITION, pieza); // On ElegirPiezaEscena - Inicio
    }}

    /**
     * Elimina la pieza en la posición (fil, col).
     * @param {number} fil - 
     * @param {number} col - columna
     * @param {Pieza} pieza - pieza a eliminar
     */
    eliminarPieza(fil, col, pieza) {
        if((this.equipoActual === this.equipo1 && col < 3) || (this.equipoActual === this.equipo2 && col < 10 && col > 6) ) {
        this.equipoActual.eliminarPieza(pieza);
        this.tablero[fil][col].setContenido(null);
        EventBus.emit(Eventos.PIECE_DELETE, pieza); }// On ElegirPiezaEscena - Inicio
    }
    
    /**
     * Establece el tipo de pieza a colocar.
     * @param {string} tipo - tipo de pieza a colocar
     */
    setTipo(tipo) {
        this.tipo = tipo;
    }

    /**
     * Cambia el equipo actual.
     */
    cambiarEquipo() {
        this.equipoActual = (this.equipoActual === this.equipo1) ? this.equipo2 : this.equipo1;
    }

    
}

export default ColocarPiezas;