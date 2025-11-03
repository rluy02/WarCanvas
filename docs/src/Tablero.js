import Celda from "./Celda.js";
import { Eventos } from "./Events.js";
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

        // Si la pieza ya no puede actuar, no devuelvas casillas
        if (!pieza || pieza.getMovida()) return [];

        if (pieza != this.piezaActiva) {
            //Lanzamos el evento de pieza seleccionada
            EventBus.emit(Eventos.PIECE_SELECTED, pieza);
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
                    if ((f + dir.df > 0 || c + dir.dc > 0 || f + dir.df <= this.filas || c + dir.dc <= this.columnas) && pieza.getTipo() == "Caballeria" && pieza.getSaltoCaballeria() == true){
                        if (this.tablero[f + dir.df][c + dir.dc].estaVacia()){
                            console.log("se puede usar salto de caballeria");
                            celdasSeleccionadas.push({ fil: f + dir.df, col: c + dir.dc, tipo: "vacia" });
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

    ataque(fil, col) {
        let defensa = this.getCelda(fil, col)
        let origen = this.piezaActiva.getPosicion()
        let ataque = this.getCelda(origen.fila, origen.col)
        EventBus.emit(Eventos.ENEMY_SELECTED, ataque, defensa);
    }

    getPiezaActiva(){
        return this.piezaActiva;
    }

}