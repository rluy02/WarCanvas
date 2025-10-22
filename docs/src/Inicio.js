import Tablero from "./Tablero.js";
import TableroGrafico from "./TableroGrafico.js";

export default class Inicio extends Phaser.Scene {
    constructor(){
        super("Inicio")
    }

    init() {
        console.log("prueba");
    }

    preload() { }

    create() {
        //Creamos la instancia y la guardamos en tab
        this.tab = new Tablero();

        //Dibujamos el tablero
        this.tabGrafico = new TableroGrafico(this,this.tab);
    }



    update() { }
}

