import PanelColocarPiezas from "../Render/PanelColocarPiezas.js";
import ColocarPiezas from "../Logica/ColocarPiezas.js";
import TableroGraficoColocarPiezas from "../Render/TableroGraficoColocarPiezas.js";
import PiezaGrafico from "../Render/PiezaGrafico.js";
import PanelEventos from "../Render/PanelEventos.js";
import Equipo from "../Logica/Equipo.js";
import { Eventos } from "../Events.js";
import { EventBus } from "../EventBus.js";
import Pieza from "../Logica/Pieza.js";

/**
 * Escena para colocar las piezas en el tablero antes de iniciar la partida.
 * @class EscenaColocarPiezas
 * @extends Phaser.Scene
 * @memberof Escenas
 */
class EscenaColocarPiezas extends Phaser.Scene {
    /**
     * Constructor de la escena EscenaColocarPiezas.
     * @constructor
     */
    constructor() {
        super("ElegirPiezas")
    }

    /**
     * Método create de la escena EscenaColocarPiezas.
     * Crea los elementos gráficos y lógicos necesarios para la escena.
     */
    create() {
       // this.crearAnimaciones();
       this.todasLasPiezas = true;

        this.equipoJ1 = new Equipo("J1");
        this.equipoJ2 = new Equipo("J2");

        //Creamos la instancia y la guardamos en tab
        this.tab = new ColocarPiezas(this.equipoJ1, this.equipoJ2);

        this.piezas = [];
        this.piezaGrafico = new PiezaGrafico(this, this.tab);

        this.PanelEventos = new PanelEventos(this);

        //Dibujamos el tablero
        this.tabGrafico = new TableroGraficoColocarPiezas(this.equipoJ1, this.equipoJ2, this, this.tab, this.PanelEventos);

        this.panelElegirPiezas = new PanelColocarPiezas(this, this.tab, this.tabGrafico, this.equipoJ1, this.equipoJ2, this.PanelEventos);
        this.PanelEventos.mostrar('Colocar el tablero', 'Para posicionar las piezas en el tablero, pulsa las casillas disponibles. Para modificar una pieza, pulsa sobre ella y selecciona su nueva posición.', 'WarCanvas');

         EventBus.on(Eventos.PIECE_POSITION, (pieza) => {
            this.piezaPosicionada(pieza); // Emit en ElegirPieza Tablero
            this.tabGrafico.colorearRango();
        });
        EventBus.on(Eventos.PIECE_DELETE, (pieza)=> {
            this.piezaEliminada(pieza); // Emit en ElegirPieza Tablero
            this.tabGrafico.colorearRango();
        });
    }

    /**
     * Dibuja la pieza en la posición indicada.
     * @param {Pieza} pieza 
     */
    piezaPosicionada(pieza) {
        this.piezaGrafico.dibujarPieza(pieza);
    }

    /**
     * Elimina la pieza del tablero.
     * @param {Pieza} pieza 
     */
    piezaEliminada(pieza) {
        this.piezaGrafico.eliminarPieza(pieza)
    }

    /**
     * Cambia a la escena de inicio si todas las piezas están colocadas.
     */
    cambiarEscena() {
        let e1 = this.equipoJ1.getNumSoldados() + this.equipoJ1.getNumCaballerias() + this.equipoJ1.getNumArtillerias() + this.equipoJ1.getNumComandantes();
        let e2 = this.equipoJ2.getNumSoldados() + this.equipoJ2.getNumCaballerias() + this.equipoJ2.getNumArtillerias() + this.equipoJ2.getNumComandantes();
        if(this.todasLasPiezas && (e1 > 0 || e2 > 0)) this.PanelEventos.mostrar('Colocar el tablero', 'Para continuar todas las piezas deben estar posicionadas.', 'Coloca todas las piezas');
        else {
        EventBus.removeAllListeners();
        this.scene.start('Inicio', { // Le pasamos los equipos y si se utiliza la IA o no
                equipo1: this.equipoJ1,
                equipo2: this.equipoJ2,
                ia: false 
        });
        this.equipoJ1 = undefined;
        this.equipoJ2 = undefined;}
    }

    /**
     * Activa o desactiva el modo de colocar todas las piezas.
     */
    Cheat() {
        this.todasLasPiezas = !this.todasLasPiezas;
    }
}

export default EscenaColocarPiezas;