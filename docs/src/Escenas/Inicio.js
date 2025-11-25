import { Eventos } from "../Events.js"
import { EventBus } from "../EventBus.js";

import PanelLateral from "../Render/PanelLateral.js";
import Tablero from "../Logica/Tablero.js";
import TableroGrafico from "../Render/TableroGrafico.js";
import PiezaGrafico from "../Render/PiezaGrafico.js";
import TurnoGraficos from "../Render/TurnoGrafico.js";
import Combates from "../Logica/Combates.js";
import Turno, { turnoJugador } from "../Logica/Turno.js";
import Equipo from "../Logica/Equipo.js";
import PanelInfoPiezas from "../Render/PanelInfoPiezas.js";
import EventosAleatorios from "../Logica/EventosAleatorios.js";
import PanelEventoAleatorio from "../Render/PanelEventoAleatorio.js";


export default class Inicio extends Phaser.Scene {
    constructor() {
        super("Inicio")
    }

    init() {
        console.log("prueba");
    }

    preload() {
        this.crearImagenes();
    }

    create() {
        this.crearAnimaciones();

        //Creamos la instancia y la guardamos en tab
        this.tab = new Tablero();

        this.piezas = [];
        this.panelInfo = new PanelInfoPiezas(this);
        this.panel = new PanelLateral(this, this.panelInfo, this.tab);
        this.turnoGrafico = new TurnoGraficos(this);
        this.panelEventoAleatorio = new PanelEventoAleatorio(this);

        this.piezaGrafico = new PiezaGrafico(this, this.tab);

        //Dibujamos el tablero
        this.tabGrafico = new TableroGrafico(this, this.tab, this.panel);

        this.eventosAleatorios = new EventosAleatorios(this.tab, this.tabGrafico, this.panelEventoAleatorio);


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

        //Evento eliminacion de una pieza tras combate
        EventBus.on(Eventos.PIECE_ERASE, (defiende, ataca) => {
            let move = defiende.getPosicion();
            this.eliminarPieza(defiende);
            this.tabGrafico.dibujarFragmentoMapa(move.fila, move.col, ataca.getJugador());
            this.tab.moverPiezaCombate(move.fila, move.col, ataca);
        });

        //Finalizacion de la partida
        EventBus.on(Eventos.END_GAME, (piezaGanadora) => {
            console.log("Victoria para el jugador: " + piezaGanadora.getJugador());
            //esperamos 1seg para que se vea la animacion de derrota del comandante
            //esto luego podria interesar para animaciones o pantallas,botones,etc de victoria
            this.time.delayedCall(1000, () => this.terminarPartida());
        });

        this.panel.create();
        this.panelInfo.crearPanel();
    }

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

    //Metodo que finaliza la partida actual y envia al jugador a la pantalla del menu
    terminarPartida() {
        if (this.turno) {
            this.turno.reiniciarTurno();
            this.turno.destruirListeners();
        }
        console.log(turnoJugador);

        EventBus.removeAllListeners(); //Los listeners persisten entre escenas. Han de destruirse para que no apunten a viejos con memoria ya destruida
        /*-- Si luego requerimos de listeners que persistan !!--> solo destruiremos los de combates, panel, ui con el EB.off()*/

        this.scene.stop();  // Detener la escena actual (que se destruya)
        this.scene.wake("Menu"); //Reactivamos la visibilidad del menu
    }

    crearAnimaciones() {
        this.anims.create({
            key: 'explotar',
            frames: this.anims.generateFrameNumbers('explosion', { frames:[0,1,2,3,4,5,6,7]}),
            frameRate: 10,
            repeat: 0
        });
    }

    crearImagenes(){
        for (let i = 0; i <= 6; i++) {
            this.load.image(`dice${i}`, `./imgs/dice/dice${i}.webp`);
        }
        for (let i = 0; i <= 6; i++) {
            console.log(`dice${i}:`, this.textures.exists(`dice${i}`));
        }

        this.load.image('mapaTopo', './imgs/mapa/mapaTopo.webp');
        this.load.image('mapaSat', './imgs/mapa/mapaSat.webp');

        this.load.image('peon', './imgs/piezas/peon.webp');
        this.load.image('peon2', './imgs/piezas/peon2.webp');
        this.load.image('caballeria', './imgs/piezas/caballeria-dibujada.webp');
        this.load.image('caballeria2', './imgs/piezas/Caballeria2.webp');
        this.load.image('comandante', './imgs/piezas/Comandante.webp');
        this.load.image('comandante2', './imgs/piezas/Comandante2.webp');
        this.load.image('artilleria', './imgs/piezas/artilleriaJ1.webp');
        this.load.image('artilleria2', './imgs/piezas/artilleriaJ1.webp');

        this.load.spritesheet('explosion', 'imgs/efectos/explosion.png', {frameWidth: 144, frameHeight: 128});
        console.log(this.textures.get('explosion').frameTotal);
    }

}

