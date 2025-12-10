import { EventBus } from "../EventBus.js";
import { Eventos } from "../Events.js";

/**
 * Se encarga de mostrar graficamente el porcentaje conquistado por cada jugador.
 * @class BarraTerritorio
 * @memberof Render
 */
class BarraTerritorio {
    /**
     * Es el constructor de la clase, crea las barras del porcentaje de jugadores y calcula su ancho
     * @param {Phaser.Scene} escena - escena del juego
     */
    constructor(escena) {
        this.colorJ1 = 0x18700B;
        this.colorJ2 = 0xDE1616;
        this.colorNeutral = 0x9C9C9C;

        this.porcentajeJ1;
        this.porcentajeJ2;
        this.maxCarga = 230;

        this.marco = escena.add.sprite(escena.scale.width - 180, escena.scale.height - 44, 'marcoConquista').setOrigin(0.5).setScale(0.23).setDepth(100);
        this.barraFondo = escena.add.rectangle(escena.scale.width-180, escena.scale.height - 44, 230, 50, this.colorNeutral).setOrigin(0.5);
        this.barraJ1 = escena.add.rectangle(escena.scale.width - 295, escena.scale.height - 70, this.calcularAncho(0), 50, this.colorJ1).setOrigin(0, 0);
        this.barraJ2 = escena.add.rectangle(escena.scale.width - 65, escena.scale.height - 70, this.calcularAncho(0), 50, this.colorJ2).setOrigin(1, 0);

        EventBus.on(Eventos.UPDATE_PERCENTAGES, (j1, j2) => {
            this.establecerPorcentaje(j1,j2);
        });

        EventBus.on(Eventos.CONQUER_CELL, (j1, j2) => {
            this.establecerPorcentaje(j1,j2);
        });
    }

    establecerPorcentaje(j1, j2){
        this.barraJ1.setSize(this.calcularAncho(j1), this.barraJ1.height);
        this.barraJ2.setSize(this.calcularAncho(j2), this.barraJ2.height);
    }

    calcularAncho(porcentaje){
        return porcentaje * this.maxCarga / 100;
    }
}

export default BarraTerritorio;