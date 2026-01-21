import Pieza from '../Pieza.js';
import { Eventos } from '../../Events.js';
import { EventBus } from '../../EventBus.js';
import Tablero from '../Tablero.js';
import { Sfx } from '../../AudioManager/Sfx.js';

/**
 * Clase que representa la pieza de Artillería en el juego.
 * @class Artilleria
 * @extends Pieza
 * @memberof Logica
 */
class Artilleria extends Pieza {
    /**
     * Constructor de la pieza Artillería.
     * @param {Tablero} tablero - tablero al que pertenece la pieza
     * @param {number} fil - fila
     * @param {number} col - columna
     * @param {string} jugador - 'J1' o 'J2'
     */
    constructor(tablero, fil, col, jugador) {
        super(tablero, 'Artilleria', fil, col, jugador, 1, 0, -1);

        this.cooldown = 4;
        this.turnosTranscurridos = 0;
        this.utilizable = true;

        this.explosion = null;

        this.pesoBase = 3;

        EventBus.on(Eventos.CHANGE_TURN, (jugador) => { this.pasoTurno(jugador) });
    }

    /**
     * Lanza un proyectil en una celda aleatoria dentro de un área de 3x3 centrada en (fil, col).
     * @param {number} fil - fila
     * @param {number} col - columna
     * @param {Phaser.Scene} escena - escena actual
     * @param {Tablero} tablero - tablero de juego
     * @param {number} tamCasilla - tamaño de la casilla en píxeles
     */
    lanzarProyectil(fil, col, escena, tablero, tamCasilla = 64) {
        let randomCell = Phaser.Math.Between(0, 4);
        const direcciones = [
            { df: 0, dc: 0 },    // centro
            { df: -1, dc: 0 },  // arriba
            { df: 1, dc: 0 },   // abajo
            { df: 0, dc: -1 },  // izquierda
            { df: 0, dc: 1 }    // derecha
        ];

        let filaProyectil = fil + direcciones[randomCell].df;
        let colProyectil = col + direcciones[randomCell].dc;

        while ((filaProyectil < 0 || filaProyectil > 7) || (colProyectil < 0 || colProyectil > 9)) {
            randomCell = Phaser.Math.Between(0, 4);
            filaProyectil = fil + direcciones[randomCell].df;
            colProyectil = col + direcciones[randomCell].dc;
        }

        const x = colProyectil * tamCasilla + tamCasilla / 2;
        const y = filaProyectil * tamCasilla + tamCasilla / 2;
        if (!this.explosion) {
            this.explosion = escena.add.sprite(x, y, 'explosion');
            this.explosion.on('animationcomplete', () => {
                this.explosion.visible = false;
            });
            this.explosion.setDepth(99);
        }

        this.explosion.visible = true;
        this.explosion.setPosition(x, y);
        this.explosion.play('explotar');
        Sfx.explosion();

        let celda = tablero.getCelda(filaProyectil, colProyectil);
        if (!celda.estaVacia()) {
            let pieza = celda.getPieza();
            escena.eliminarPieza(pieza);

            if (pieza.getTipo() == "Comandante") {
                const atacanteJugador = this.jugador; // La artillería pertenece a alguien
                const defensorJugador = pieza.getJugador();

                let ganadorFinal;
                let autoEliminacion = false;
                // Si un jugador mata a SU PROPIO comandante, pierde
                if (atacanteJugador === defensorJugador) {
                    autoEliminacion = true;
                    ganadorFinal = atacanteJugador === "J1" ? "J2" : "J1";
                }
                // Si mata al comandante enemigo, gana
                else {
                    ganadorFinal = atacanteJugador;
                }

                EventBus.emit(Eventos.END_GAME, {
                    jugador: ganadorFinal,
                    tipo: "COMBATE",
                    autoEliminacion: autoEliminacion //info extra
                });
            }
            celda.limpiar();
        }

        this.utilizable = false;
    }

    calculaPeso() {
        let bestCelda = null;
        let bestPeso = -Infinity;
        for (let f = 0; f < this.tablero.filas - 1; f++) {
            for (let c = this.col - 4; c < this.tablero.columnas - 1; c++) {
                let celda = this.tablero.getCelda(f, c);
                let pesoTmp = 0;

                if (!celda.estaVacia() && celda.getPieza().getJugador() === 'J1') {
                    pesoTmp += this.detectaTipo(celda)
                }
                else if (!celda.estaVacia() && celda.getPieza().getJugador() === 'J2') {
                    pesoTmp -= this.detectaTipo(celda)
                }

                let vecinos = this.getVecinos(celda);

                for (const vecino of vecinos) {
                    if (!vecino.estaVacia() && vecino.getPieza().getJugador() === 'J1') {
                        pesoTmp += this.detectaTipo(vecino)
                    }
                    else if (!vecino.estaVacia() && vecino.getPieza().getJugador() === 'J2') {
                        pesoTmp -= this.detectaTipo(vecino)
                    }
                }
                if (pesoTmp > bestPeso) {
                    bestPeso = pesoTmp
                    bestCelda = celda
                }
            }
        }

        return { peso: (bestPeso + this.pesoBase), bestCelda: bestCelda };
    }

    /**
     * Proceso de paso de turno para la pieza de artillería.
     * Cuando es el turno del jugador de esta pieza, se incrementa el contador de turnos transcurridos.
     * Si el contador alcanza el valor del cooldown, la pieza se vuelve utilizable nuevamente.
     * @param {string} jugador - jugador actual 'J1' o 'J2'
     */
    pasoTurno(jugador) {
        if (!this.utilizable && jugador == this.jugador) {
            this.turnosTranscurridos++;
            if (this.turnosTranscurridos >= this.cooldown) {
                this.utilizable = true;
                this.turnosTranscurridos = 0;
            }
        }
    }

    /**
     * Determina si la pieza de artillería puede disparar.
     * @returns {boolean} - true si la pieza puede disparar, false en caso contrario
     */
    puedeDisparar() {
        return this.utilizable;
    }

    detectaTipo(celda) {
        // Solo contabiliza piezas enemigas del jugador J1
        if (!celda.estaVacia()) {
            switch (celda.getPieza().getTipo()) {
                case 'Soldado':
                    return 2;
                case 'Caballeria':
                    return 3;
                case 'Comandante':
                    return 5;
                default:
                    return 0;
            }
        }
    }

    getVecinos(celda) {
        const pos = celda.getPosicion();
        const fila = pos.fila;
        const col = pos.col;
        const res = [];

        // Arriba
        if (fila > 0) {
            let celdaArriba = this.tablero.getCelda(fila - 1, col);
            res.push(celdaArriba);
        }

        // Izquierda
        if (col > 0) {
            let celdaIzquierda = this.tablero.getCelda(fila, col - 1);
            res.push(celdaIzquierda);
        }

        // Abajo
        if (fila < this.tablero.filas - 1) {
            let celdaAbajo = this.tablero.getCelda(fila + 1, col);
            res.push(celdaAbajo);
        }

        // Derecha
        if (col < this.tablero.columnas - 1) {
            let celdaDerecha = this.tablero.getCelda(fila, col + 1);
            res.push(celdaDerecha);
        }

        return res;
    }
}

export default Artilleria;