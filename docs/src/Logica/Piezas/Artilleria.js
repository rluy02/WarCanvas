import Pieza from '../Pieza.js';
import { Eventos } from '../../Events.js';
import { EventBus } from '../../EventBus.js';
import Tablero from '../Tablero.js';

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
        super(tablero, 'Artilleria', fil, col, jugador, 1, 3, -1);

        this.cooldown = 4;
        this.turnosTranscurridos = 0;
        this.utilizable = true;

        this.explosion = null;

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
        const randomCell = Phaser.Math.Between(0, 4);
        const direcciones = [
            { df: 0, dc: 0 },     // centro
            { df: -1, dc: 0 },  // arriba
            { df: 1, dc: 0 },   // abajo
            { df: 0, dc: -1 },  // izquierda
            { df: 0, dc: 1 }    // derecha
        ];

        const filaProyectil = fil + direcciones[randomCell].df;
        const colProyectil = col + direcciones[randomCell].dc;

        while ((filaProyectil < 0 || filaProyectil > 7) || (colProyectil < 0 || colProyectil > 9)){
            randomCell = Phaser.Math.Between(0, 4);
            filaProyectil = fil + direcciones[randomCell].df;
            colProyectil = col + direcciones[randomCell].df;
        }

        const x = colProyectil * tamCasilla + tamCasilla / 2;
        const y = filaProyectil * tamCasilla + tamCasilla / 2;
        if (!this.explosion) {
            this.explosion = escena.add.sprite(x, y, 'explosion');
            this.explosion.on('animationcomplete', () => {
                this.explosion.visible = false;
            });
            this.explosion.setDepth(999);
        }

        this.explosion.visible = true;
        this.explosion.setPosition(x, y);
        this.explosion.play('explotar');

        let celda = tablero.getCelda(filaProyectil, colProyectil);
        if (!celda.estaVacia()){
            let pieza = celda.getPieza();
            escena.eliminarPieza(pieza);

            if (pieza.getTipo() == "Comandante"){
                EventBus.emit(Eventos.END_GAME, this);
            }
            celda.limpiar();
        }

        this.utilizable = false;
    }

    /**
     * Proceso de paso de turno para la pieza de artillería.
     * Cuando es el turno del jugador de esta pieza, se incrementa el contador de turnos transcurridos.
     * Si el contador alcanza el valor del cooldown, la pieza se vuelve utilizable nuevamente.
     * @param {string} jugador - jugador actual 'J1' o 'J2'
     */
    pasoTurno(jugador){
        if (!this.utilizable && jugador == this.jugador){
            this.turnosTranscurridos++;
            if (this.turnosTranscurridos >= this.cooldown){
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
}

export default Artilleria;