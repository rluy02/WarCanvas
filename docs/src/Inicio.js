import { eventos } from "./Events.js";
import PanelLateral from "./PanelLateral.js";
import Soldado from "./Soldado.js";
import Tablero from "./Tablero.js";
import TableroGrafico from "./TableroGrafico.js";
import PiezaGrafico from "./PiezaGrafico.js";


export default class Inicio extends Phaser.Scene {
    constructor() {
        super("Inicio")
        this.events
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
        this.tab.getCelda(5,5).setContenido(this.soldado)

        this.piezaGrafico.dibujarPieza(this.soldado);

        console.log( this.tab.getCelda(5,5).setContenido(this.soldado));
        // console.log( this.tab.getCelda(0,0));

        this.panel.create();

        eventos.PIECE_MOVED
    }



    update() { }
}

