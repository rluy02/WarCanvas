import { eventos } from "./events.js";
import PanelLateral from "./PanelLateral.js";
import Tablero from "./Tablero.js";
import TableroGrafico from "./TableroGrafico.js";

export default class Inicio extends Phaser.Scene {
    constructor(){
        super("Inicio")
        this.events
    }

    init() {
        console.log("prueba");
    }

    preload() {
        this.panel = new PanelLateral(this);
        this.panel.preload();
    }

    create() {
        //Creamos la instancia y la guardamos en tab
        this.tab = new Tablero();

        //Dibujamos el tablero
        this.tabGrafico = new TableroGrafico(this,this.tab);

         this.panel.create();

        eventos.PIECE_MOVED
    }



    update() { }
}

