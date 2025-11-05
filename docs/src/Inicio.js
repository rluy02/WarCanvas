import { Eventos } from "./Events.js";
import { EventBus } from "./EventBus.js";

import PanelLateral from "./PanelLateral.js";
import Soldado from "./Soldado.js"; //cuando los equipos ya se creen por completo se puede quitar esto de aqui
import Caballeria from "./Caballeria.js";
import Tablero from "./Tablero.js";
import TableroGrafico from "./TableroGrafico.js";
import PiezaGrafico from "./PiezaGrafico.js";
import TurnoGraficos from "./TurnoGrafico.js";
import Combates from "./Combates.js";
import Turno from "./Turno.js";
import Equipo from "./Equipo.js";


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
        this.load.image('mapaTopo', './imgs/mapa/mapaTopo.webp');
        this.load.image('mapaSat', './imgs/mapa/mapaSat.webp');

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
        this.turno = new Turno(3, this.turnoGrafico);

        // Creación del equipo 1 (jugador lo controla)
        this.equipoJ1 = new Equipo("J1",this.tab);
        this.equipoJ2 = new Equipo("J2",this.tab);

         // Dibujamos las piezas
        for (let pieza of this.equipoJ1.piezas) {
            this.piezaGrafico.dibujarPieza(pieza);
            this.piezas.push(pieza);
        }
        for (let pieza of this.equipoJ2.piezas) {
            this.piezaGrafico.dibujarPieza(pieza);
            this.piezas.push(pieza);
        }

        // Se añade un evento para cuando se mueve la pieza
        EventBus.on(Eventos.PIECE_MOVED, (pieza) => {
            this.moverPieza(pieza);
        });

        EventBus.on(Eventos.PIECE_DEAD, (pieza) => {
            this.eliminarPieza(pieza);
        });


        this.panel.create();
        this.turnoGrafico.create();
    }

    update() { }

    // Busca la pieza entre la lista de piezas, la borra y la coloca en su nueva posición (esta posición esta ya asignada desde tablero.js)
    moverPieza(pieza) {
        for (let p of this.piezas) {
            if (p == pieza) {
                this.piezaGrafico.eliminarPieza(pieza);
                this.piezaGrafico.dibujarPieza(pieza);
            }
        }
    }

    eliminarPieza(pieza) {
        for (let p of this.piezas) {
            if (p == pieza) {
                this.piezaGrafico.eliminarPieza(pieza);
            }
        }
    }
}

