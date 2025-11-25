import Pieza from '../Pieza.js';
import { Eventos } from '../../Events.js';
import { EventBus } from '../../EventBus.js';

export default class Artilleria extends Pieza {
    constructor(fil, col, jugador) {
        super('Artilleria', fil, col, jugador, 1, 3, -1);

        this.cooldown = 4;
        this.turnosTranscurridos = 0;
        this.utilizable = true;

        this.explosion = null;

        EventBus.on(Eventos.CHANGE_TURN, (jugador) => { this.pasoTurno(jugador) });
    }

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

    pasoTurno(jugador){
        if (!this.utilizable && jugador == this.jugador){
            this.turnosTranscurridos++;
            if (this.turnosTranscurridos >= this.cooldown){
                this.utilizable = true;
                this.turnosTranscurridos = 0;
            }
        }
    }

    puedeDisparar() {
        return this.utilizable;
    }
}