import { eventos } from "./Events.js";
import { EventBus } from "./EventBus.js";

import PanelLateral from "./PanelLateral.js";
import Soldado from "./Soldado.js";
import Tablero from "./Tablero.js";
import TableroGrafico from "./TableroGrafico.js";
import PiezaGrafico from "./PiezaGrafico.js";


export default class Inicio extends Phaser.Scene {
    constructor() {
        super("Inicio")
        this.events
        this.piezas = [];
    }

    init() {
        console.log("prueba");
    }

    preload() {
        this.panel = new PanelLateral(this);
        this.panel.preload();
        //Cargar los sprites de las piezas aqui

        this.piezaGrafico = new PiezaGrafico(this, this.tablero);
        this.piezaGrafico.preload();
    }

    create() {
        //Creamos la instancia y la guardamos en tab
        this.tab = new Tablero();

        //Dibujamos el tablero
        this.tabGrafico = new TableroGrafico(this, this.tab);

        this.soldado = new Soldado(5, 5, 'J1');
        this.tab.getCelda(5, 5).setContenido(this.soldado)
        this.piezas.push(this.soldado);


        this.soldado2 = new Soldado(3, 5, 'J1');
        this.tab.getCelda(3, 5).setContenido(this.soldado2)
        this.piezas.push(this.soldado2);

        for (let p of this.piezas) {
            this.piezaGrafico.dibujarPieza(p);
        }

        EventBus.on(eventos.PIECE_MOVED, (pieza) => {
            this.moverPieza(pieza);
        });


        this.panel.create();
    }

    update() { }

    moverPieza(pieza){
        for (let p of this.piezas) {
            if (p == pieza){
                this.piezaGrafico.eliminarPieza(pieza);
                this.piezaGrafico.dibujarPieza(pieza);
            }
        }
    }
}

