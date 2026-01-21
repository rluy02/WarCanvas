import { Sfx } from "../AudioManager/Sfx.js";
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
     * Método create de la escena Tutorial.
     * Crea los elementos gráficos y lógicos necesarios para la escena.
     */
    create() {
        Sfx.bind(this);
        this.todasLasPiezas = true;

        this.equipoJ1 = new Equipo("J1");
        this.equipoJ2 = new Equipo("J2");

        //Creamos la instancia y la guardamos en tab
        this.tab = new ColocarPiezas(this.equipoJ1, this.equipoJ2);

        this.piezas = [];
        this.piezaGrafico = new PiezaGrafico(this, this.tab);

        this.PanelEventos = new PanelEventos(this);
        //Dibujamos el tablero
        this.tabGrafico = new TableroGraficoTutorial(this.equipoJ1, this.equipoJ2, this, this.tab, this.PanelEventos);
        this.PanelEventos.mostrar('Tutorial', 'Pulsa Aceptar y empieza a jugar', 'WarCanvas');

        this.tutorial = new PanelTutorial(this, this.tab, this.tabGrafico, this.PanelEventos);
        EventBus.on(Eventos.PIECE_POSITION, (pieza) => {
            this.piezaPosicionada(pieza); // Emit en ElegirPieza Tablero
            //this.tabGrafico.colorearRango();
        });
        EventBus.on(Eventos.PIECE_DELETE, (pieza) => {
            this.piezaEliminada(pieza); // Emit en ElegirPieza Tablero
            //this.tabGrafico.colorearRango();
        });
        // Se añade un evento para cuando se mueve la pieza
        EventBus.on(Eventos.PIECE_MOVED, (pieza, movConquistaSFX = false) => {
            this.moverPieza(pieza, movConquistaSFX);
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
        if (celda) {
            let posicion = celda.getPosicion();
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
        this.piezaGrafico.eliminarPieza(pieza);
    }

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
    moverPieza(pieza, movConquistaSFX = false) {
        for (let p of this.piezas) {
            if (p == pieza) {
                this.piezaGrafico.eliminarPieza(pieza);
                this.piezaGrafico.dibujarPieza(pieza);
                if (!movConquistaSFX) Sfx.play('moverPieza');
            }
        }
    }

    /**
     * Cambiar de escena -> elegir piezas
     */
    cambiarEscena() {
        this.scene.start('ElegirPiezas');
    }

}

export default Tutorial;