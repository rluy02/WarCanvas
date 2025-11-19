import Pieza from './Pieza.js';

export default class Artilleria extends Pieza {
    constructor(fil, col, jugador) {
        super('Artilleria', fil, col, jugador, 1);

        this.explosion = null;
    }

    lanzarProyectil(fil, col, escena, tamCasilla = 64) {
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

        const x = colProyectil * tamCasilla + tamCasilla / 2;
        const y = filaProyectil * tamCasilla + tamCasilla / 2;
        if (!this.explosion) {
            this.explosion = escena.add.sprite(x, y, 'explosion');
            this.explosion.on('animationcomplete', () => {
                this.explosion.visible = false;
            });
        }

        this.explosion.visible = true;
        this.explosion.setPosition(x, y);
        this.explosion.play('explotar');
    }
}