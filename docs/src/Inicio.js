import { eventos } from "./events.js";
import { EventBus } from "./EventBus.js";

import PanelLateral from "./PanelLateral.js";
import Soldado from "./Soldado.js";
import Tablero from "./Tablero.js";
import TableroGrafico from "./TableroGrafico.js";
import PiezaGrafico from "./PiezaGrafico.js";
import TurnoGraficos from "./TurnoGrafico.js";
import Combates from "./Combates.js";


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
        this.turnoGrafico = new TurnoGraficos(this);
        this.panel.preload();
        //Cargar los sprites de las piezas aqui

        this.piezaGrafico = new PiezaGrafico(this, this.tablero);
        this.piezaGrafico.preload();
    }

    create() {
        //Creamos la instancia y la guardamos en tab
        this.tab = new Tablero();

        //Dibujamos el tablero
        this.tabGrafico = new TableroGrafico(this, this.tab, this.panel); 

        this.combates = new Combates(this.tab, this.tabGrafico, this.panel);
        
        this.soldado = new Soldado(5, 5, 'J1');
        this.tab.getCelda(5, 5).setContenido(this.soldado)
        this.piezas.push(this.soldado);


        this.soldado2 = new Soldado(3, 5, 'J2');
        this.tab.getCelda(3, 5).setContenido(this.soldado2)
        this.piezas.push(this.soldado2);

         this.soldado3 = new Soldado(6, 5, 'J2');
        this.tab.getCelda(6, 5).setContenido(this.soldado3)
        this.piezas.push(this.soldado3);

        this.soldado4 = new Soldado(6, 3, 'J1');
        this.tab.getCelda(6, 3).setContenido(this.soldado4)
        this.piezas.push(this.soldado4);

        // Recorre todas las piezas y las dibuja
        for (let p of this.piezas) {
            this.piezaGrafico.dibujarPieza(p);
        }

        // Se añade un evento para cuando se mueve la pieza
        EventBus.on(eventos.PIECE_MOVED, (pieza) => {
            this.moverPieza(pieza);
        });

        EventBus.on(eventos.PIECE_DEAD, (pieza) => {
            this.eliminarPieza(pieza);
        });


        this.panel.create();
        this.turnoGrafico.create();
    }

    update() { }

    // Busca la pieza entre la lista de piezas, la borra y la coloca en su nueva posición (esta posición esta ya asignada desde tablero.js)
    moverPieza(pieza){
        for (let p of this.piezas) {
            if (p == pieza){
                this.piezaGrafico.eliminarPieza(pieza);
                this.piezaGrafico.dibujarPieza(pieza);
            }
        }
    }

    eliminarPieza(pieza){
        for (let p of this.piezas) {
            if (p == pieza){
                this.piezaGrafico.eliminarPieza(pieza);
            }
        }
    }
}

