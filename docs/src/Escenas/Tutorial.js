import ColocarPiezas from "../Logica/ColocarPiezas.js";
import TableroGraficoTutorial from "../Render/TableroGraficoTutorial.js";
import PiezaGrafico from "../Render/PiezaGrafico.js";
import PanelEventos from "../Render/PanelEventos.js";
import Equipo from "../Logica/Equipo.js";
import { Eventos } from "../Events.js";
import { EventBus } from "../EventBus.js";
import Pieza from "../Logica/Pieza.js";
import PanelTutorial from "../Render/PanelTutorial.js";


/**
 * Escena tutorial antes de iniciar la partida.
 * @class Tutorial
 * @extends Phaser.Scene
 * @memberof Escenas
 */
class Tutorial extends Phaser.Scene {
    /**
     * Constructor de la escena Tutorial.
     * @constructor
     */
    constructor() {
        super("Tutorial")
    }

    /**
     * Método preload de la escena Tutorial.
     * Carga las imágenes necesarias para la escena.
     */
    preload() {
       this.crearImagenes();
    }

    /**
     * Método create de la escena Tutorial.
     * Crea los elementos gráficos y lógicos necesarios para la escena.
     */
    create() {
       this.crearAnimaciones();
       this.todasLasPiezas = true;

        this.equipoJ1 = new Equipo("J1");
        this.equipoJ2 = new Equipo("J2");

        //Creamos la instancia y la guardamos en tab
        this.tab = new ColocarPiezas(this.equipoJ1, this.equipoJ2);

        this.piezas = [];
        this.piezaGrafico = new PiezaGrafico(this, this.tab);

        //Dibujamos el tablero
        this.tabGrafico = new TableroGraficoTutorial(this.equipoJ1, this.equipoJ2, this, this.tab);
        this.PanelEventos = new PanelEventos(this);
        this.PanelEventos.mostrar('Tutorial', 'Pulsa Aceptar y empieza a jugar', 'WarCanvas');

        this.tutorial = new PanelTutorial(this, this.tab, this.tabGrafico);
         EventBus.on(Eventos.PIECE_POSITION, (pieza) => {
            this.piezaPosicionada(pieza); // Emit en ElegirPieza Tablero
            //this.tabGrafico.colorearRango();
        });
        EventBus.on(Eventos.PIECE_DELETE, (pieza)=> {
            this.piezaEliminada(pieza); // Emit en ElegirPieza Tablero
            //this.tabGrafico.colorearRango();
        });
                // Se añade un evento para cuando se mueve la pieza
        EventBus.on(Eventos.PIECE_MOVED, (pieza) => {
            this.moverPieza(pieza);
        });

    }

    /**
     * Dibuja la pieza en la posición indicada.
     * @param {Pieza} pieza 
     */
    piezaPosicionada(pieza) {
        this.tabGrafico.dibujarFragmentoMapa(pieza.fil, pieza.col, pieza.getJugador());
        this.piezaGrafico.dibujarPieza(pieza);
        this.piezas.push(pieza);
        this.tabGrafico.limpiarTablero();
        let celda = this.tab.getPiezaActiva();
        if (celda) {let posicion = celda.getPosicion();
        this.tabGrafico.onCeldaClick(posicion.fila, posicion.col);
        }
    }

    /**
     * Elimina la pieza del tablero.
     * @param {Pieza} pieza 
     */
    piezaEliminada(pieza) {
        //this.piezas.eliminarPieza(pieza);
        this.tabGrafico.borrarFragmentoMapa(pieza.fil, pieza.col, pieza.getJugador())
        Phaser.Utils.Array.Remove(this.piezas, pieza);
        this.piezaGrafico.eliminarPieza(pieza);    }

    /**
     * Elimina la pieza del tablero y de la lista de piezas.
     * @param {Pieza} pieza 
     */
    eliminarPieza(pieza) {
        for (let p of this.piezas) {
            if (p == pieza) {
                this.piezaGrafico.eliminarPieza(pieza);
            }
        }
    }

        /**
     * Busca la pieza entre la lista de piezas, la borra y la coloca en su nueva posición (esta posición esta ya asignada desde tablero.js)
     * @param {Pieza} pieza 
     */
    moverPieza(pieza) {
        for (let p of this.piezas) {
            if (p == pieza) {
                this.piezaGrafico.eliminarPieza(pieza);
                this.piezaGrafico.dibujarPieza(pieza);
            }
        }
    }

    /**
     * Cambiar de escena -> elegir piezas
     */
    cambiarEscena() {
         this.scene.start('ElegirPiezas');
    }

    /**
     * Método crearImagenes de la escena Tutorial.
     * Carga las imágenes necesarias para las piezas del juego.
     */
    crearImagenes(){
        
        this.load.image('mapaTopo', './imgs/mapa/mapaTopo.webp');
        this.load.image('mapaSat', './imgs/mapa/mapaSat.webp');

    this.load.image('peon', './imgs/piezas/soldado-dibujado.webp');
        this.load.image('peon-blanco', './imgs/piezas/white-pawn.webp');
        this.load.image('peon-rojo', './imgs/piezas/red-pawn.webp');
        this.load.image('peon2', './imgs/piezas/soldado-realista.webp');
        this.load.image('caballeria', './imgs/piezas/caballeria-dibujada.webp');
        this.load.image('caballeria2', './imgs/piezas/caballeria-realista.webp');
        this.load.image('comandante', './imgs/piezas/Comandante.webp');
        this.load.image('comandante2', './imgs/piezas/comandante-realista.webp');
        this.load.image('artilleria', './imgs/piezas/artilleria-dibujada.webp');
        this.load.image('artilleria2', './imgs/piezas/artilleria-realista.webp');
        this.load.image('dialogo', './imgs/Tutorial/dialogue.webp');

        this.load.spritesheet('explosion', 'imgs/efectos/explosion.png', { frameWidth: 144, frameHeight: 128 });

    }    
    /**
     * Crea las animaciones necesarias para la escena.
     */
    crearAnimaciones() {
        if (!this.anims.exists('explotar')) {
            this.anims.create({
                key: 'explotar',
                frames: this.anims.generateFrameNumbers('explosion', { frames: [0, 1, 2, 3, 4, 5, 6, 7] }),
                frameRate: 10,
                repeat: 0
            });
        }
    }
}

export default Tutorial;