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

        this.celdasJ1 = 0;
        this.celdasJ2 = 0;

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
     * Genera una pieza del tipo seleccionado / especificado en la posición (fil, col).
     * @param {number} fil - fila
     * @param {number} col - columna
     * @param {string} p - tipo de pieza
     */
    generarPieza(fil, col, p=null) {
        let nombre = this.equipoActual.getNombre();
        let pieza = null;
        let tipo;
        if(!p) tipo = this.tipo;
        else tipo = p;
        if (tipo == 'Soldado' && this.equipoActual.getNumSoldados() > 0)  {
            pieza =  new Soldado(this.tablero, fil, col, nombre);
            this.equipoActual.setSoldado(pieza);
        }
        else if (tipo == 'Artilleria' && this.equipoActual.getNumArtillerias() > 0) {
            pieza = new Artilleria(this.tablero, fil, col, nombre);
            this.equipoActual.setArtilleria(pieza);
        }
        else if (tipo == 'Caballeria' && this.equipoActual.getNumCaballerias() > 0) {
            pieza = new Caballeria(this.tablero, fil, col, nombre);
            this.equipoActual.setCaballeria(pieza);
        }
        else if (tipo == 'Comandante' && this.equipoActual.getNumComandantes() > 0){
            pieza = new Comandante(this.tablero, fil, col, nombre);
            this.equipoActual.setComandante(pieza);
        }
        this.tablero[fil][col].setContenido(pieza);
        if (pieza != null)EventBus.emit(Eventos.PIECE_POSITION, pieza); // On ElegirPiezaEscena - Inicio
        return pieza;
    }

    /**
     * Genera una pieza del tipo seleccionado / especificado en la posición (fil, col) - del equipo contrario
     * @param {number} fil - fila
     * @param {number} col - columna
     * @param {string} p - tipo de pieza
     */
    generarPiezaEnemiga(fil, col, p=null) {
        console.log(fil, col);
        let nombre;
        nombre = ((this.equipoActual === this.equipo1)) ? this.equipo2.getNombre() : this.equipo1.getNombre();
        console.log(nombre);
        let pieza = null;
        let tipo;

        let casillas = this.piezaSeleccionada(fil, col);
        console.log(casillas);
        let select = false;
        for (let i=0; i < casillas.length && !select; i++)
        { console.log(casillas[i].tipo);
            if (casillas[i].tipo == "vacia") {
            fil = casillas[i].fil;
            col = casillas[i].col;
            console.log(i, fil, col);
            select = true;}
        }
        if(this.tablero[fil][col].estaVacia()) {
        if(!p) tipo = this.tipo;
        else tipo = p;
        if (tipo == 'Soldado' && this.equipoActual.getNumSoldados() > 0)  {
            pieza =  new Soldado(this.tablero, fil, col, nombre);
        }
        else if (tipo == 'Artilleria' && this.equipoActual.getNumArtillerias() > 0) {
            pieza = new Artilleria(this.tablero, fil, col, nombre);
        }
        else if (tipo == 'Caballeria' && this.equipoActual.getNumCaballerias() > 0) {
            pieza = new Caballeria(this.tablero, fil, col, nombre);
        }
        else if (tipo == 'Comandante' && this.equipoActual.getNumComandantes() > 0){
            pieza = new Comandante(this.tablero, fil, col, nombre);
        }
        this.tablero[fil][col].setContenido(pieza);
        if (pieza != null){EventBus.emit(Eventos.PIECE_POSITION, pieza); // On ElegirPiezaEscena - Inicio
        ((this.equipoActual === this.equipo1)) ? this.equipo2.piezas.push(pieza) : this.equipo1.piezas.push(pieza);}
        return pieza;}
    }

    /**
     * Genera soldados en la cruz de ataque de la artilleria, empezando por la fila y columna especificadas (fil, col) - del equipo contrario
     * @param {number} fil - fila
     * @param {number} col - columna
     */
    generarPiezaEnemigaArtilleria(fil, col) 
    {
        let nombre;
        nombre = ((this.equipoActual === this.equipo1)) ? this.equipo2.getNombre() : this.equipo1.getNombre();
        const direcciones = [
            { df: 0, dc: 0 },     // centro
            { df: -1, dc: 0 },  // arriba
            { df: 1, dc: 0 },   // abajo
            { df: 0, dc: -1 },  // izquierda
            { df: 0, dc: 1 }    // derecha
        ];
        let fila ;
        let columna;
        for(let i=0; i<5;i++){
            fila = fil + direcciones[i].df;
            columna = col + direcciones[i].dc;
            let pieza = new Soldado(this.tablero, fila, columna, nombre);
            this.tablero[fila][columna].setContenido(pieza);
        if (pieza != null){EventBus.emit(Eventos.PIECE_POSITION, pieza); // On ElegirPiezaEscena - Inicio
        ((this.equipoActual === this.equipo1)) ? this.equipo2.piezas.push(pieza) : this.equipo1.piezas.push(pieza);
        }   
        }
    }

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
     * Elimina todas las piezas 
     */
    eliminarTodasLasPiezas(){
        for (let i = 0; i < this.filas; i++) {
            for (let j = 0; j < this.columnas; j++) {
                if (!this.tablero[i][j].estaVacia()) {
                let pieza = this.tablero[i][j].getPieza();
                EventBus.emit(Eventos.PIECE_DELETE, pieza); // On ElegirPiezaEscena - Inicio
                this.tablero[pieza.fil][pieza.col].setContenido(null);
                (pieza.getJugador == 'J2') ? this.equipo2.eliminarPieza(pieza) : this.equipo1.eliminarPieza(pieza);
            }}
        }
        
    }
    
    /**
     * Establece el tipo de pieza a colocar.
     * @param {string} tipo - tipo de pieza a colocar
     */
    setTipo(tipo) {
        this.tipo = tipo;
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
     * Cambia el equipo actual.
     */
    cambiarEquipo() {
        this.equipoActual = (this.equipoActual === this.equipo1) ? this.equipo2 : this.equipo1;
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

        //if (pieza.getTipo() == "Artilleria" && !pieza.puedeDisparar()) return [];

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
}

export default ColocarPiezas;