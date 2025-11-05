import { Eventos } from "./Events.js";
import { EventBus } from "./EventBus.js";

import PanelLateral from "./PanelLateral.js";
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
        this.events;

    }

    init() {
        console.log("prueba");
    }

    preload() {
        this.load.image('mapaTopo', './imgs/mapa/mapaTopo.webp');
        this.load.image('mapaSat', './imgs/mapa/mapaSat.webp');

        for (let i = 0; i <= 6; i++) {
            this.load.image(`dice${i}`, `./imgs/dice/dice${i}.webp`);
        }
        for (let i = 0; i <= 6; i++) {
            console.log(`dice${i}:`, this.textures.exists(`dice${i}`));
        }

        this.load.image('peon', './imgs/peon.webp');
        this.load.image('peon2', './imgs/peon2.webp');
        this.load.image('caballeria', './imgs/Caballeria.webp');
        this.load.image('caballeria2', './imgs/Caballeria2.webp');
        this.load.image('comandante', './imgs/Comandante.webp');
        this.load.image('comandante2', './imgs/Comandante2.webp');
    }

    create() {
        this.piezas = [];
        this.panel = new PanelLateral(this);
        this.turnoGrafico = new TurnoGraficos(this);

        //Creamos la instancia y la guardamos en tab
        this.tab = new Tablero();

        this.piezaGrafico = new PiezaGrafico(this, this.tab);

        //Dibujamos el tablero
        this.tabGrafico = new TableroGrafico(this, this.tab, this.panel);

        this.combates = new Combates(this.tab, this.tabGrafico, this.panel);
        this.turno = new Turno(3, this.turnoGrafico);

        // Creación del equipo 1 (jugador lo controla)
        this.equipoJ1 = new Equipo("J1", this.tab);
        this.equipoJ2 = new Equipo("J2", this.tab);

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

        EventBus.on(Eventos.PIECE_ERASE, (defiende, ataca) => {
            if (defiende.getTipo() == "Comandante") {
                this.eliminarPieza(defiende);
                this.terminarPartida();
            //Si el comandante esta muerto, se deberia de:
            //Notificar el ganador de la partida
            //Volver al menu, reiniciar la escena del juego (ya sea destruyendo o manual)
            //Que el jugador pueda volver a jugar
            //NOTA: emitir y recibir un tablero que tras cada movimiento de los peones se chequee si se ha superado o llegado al 80% del tablero
            //Repetir la misma logica para ganar la partida
            }
            else {
                let move = defiende.getPosicion();
                this.eliminarPieza(defiende);
                this.tab.moverPiezaCombate(move.fila, move.col, ataca);
            }
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

    terminarPartida() {

        this.scene.stop();  // Detener la escena actual
        this.scene.start("Menu");
    }

}

