import Celda from "./Celda.js";
import { Eventos } from "../Events.js";
import { EventBus } from "../EventBus.js";

export default class Tablero {
    constructor(_filas = 8, _columnas = 10) {
        this.filas = _filas;
        this.columnas = _columnas;
        this.tablero = this.crearTablero(); //creamos el tablero lleno de celdas
        this.piezaActiva = null;

        this.turnoActivo = null;

        this.celdasJ1 = 0;
        this.celdasJ2 = 0;

        EventBus.on(Eventos.CHANGE_TURN, () => {
            this.piezaActiva = null;
        });
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
    moverPiezaCombate(fil, col, pieza) {

        //Limpia la celda de origen
        let origen = pieza.getPosicion();
        this.tablero[origen.fila][origen.col].limpiar();

        //Añade la pieza a la celda de destino
        pieza.moverse(fil, col);
        this.tablero[fil][col].setContenido(pieza);
        EventBus.emit(Eventos.PIECE_MOVED, pieza);
    }

    ataque(fil, col) {
        let defensa = this.getCelda(fil, col)
        let origen = this.piezaActiva.getPosicion()
        let ataque = this.getCelda(origen.fila, origen.col)
        EventBus.emit(Eventos.ENEMY_SELECTED, ataque, defensa); //Se recibe en Combate 
    }

    getPiezaActiva() {
        return this.piezaActiva;
    }

    resetPiezaActiva() {
        this.piezaActiva = null;
    }

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


    size() {
        return { fila: this.filas, col: this.columnas };
    }
}