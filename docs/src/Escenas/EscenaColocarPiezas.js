import { Sfx } from "../AudioManager/Sfx.js";
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
        EventBus.on(Eventos.PIECE_DELETE, (pieza) => {
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

        if (this.todasLasPiezas) { //hay que colocar todo...
            let e1 = this.equipoJ1.getNumSoldados() + this.equipoJ1.getNumCaballerias() + this.equipoJ1.getNumArtillerias() + this.equipoJ1.getNumComandantes();
            let e2 = this.equipoJ2.getNumSoldados() + this.equipoJ2.getNumCaballerias() + this.equipoJ2.getNumArtillerias() + this.equipoJ2.getNumComandantes();

            if (e1 > 0 || e2 > 0) { //quedan piezas por colocar
                this.PanelEventos.mostrar('Colocar el tablero', 'Para continuar todas las piezas deben estar posicionadas.', 'Coloca todas las piezas');
                return;
            }


        } else { //modo "cheat" pero necesita 1 comandante por equipo. (Para que tenga sentido probar la partida y evitar bugs).
            const { J1, J2 } = this.contarComandantesColocados();
            if (J1 != 1 || J2 != 1) {
                this.PanelEventos.mostrar(
                    "Modo Escena CHEAT",
                    "En este modo puedes iniciar sin poner todas las piezas, pero necesitas colocar al menos los 2 comandantes (uno por cada equipo).",
                    "Faltan comandantes"
                );
                return;
            }
        }

        //En este caso, ya puede iniciar partida
        EventBus.removeAllListeners();
        this.scene.start('Inicio', { // Le pasamos los equipos y si se utiliza la IA o no
            equipo1: this.equipoJ1,
            equipo2: this.equipoJ2,
            ia: false
        });
        this.equipoJ1 = undefined;
        this.equipoJ2 = undefined;
    }

    /**
    * Cuenta los comandantes colocados actualmente en el tablero por jugador.
    * @returns {{J1:number, J2:number}}
    */
    contarComandantesColocados() {
        let J1 = 0, J2 = 0;

        for (let f = 0; f < this.tab.filas; f++) {
            for (let c = 0; c < this.tab.columnas; c++) {
                const celda = this.tab.getCelda(f, c);
                if (!celda || celda.estaVacia()) continue;

                const p = celda.getPieza();
                if (p && p.getTipo && p.getTipo() === "Comandante") {
                    if (p.getJugador() === "J1") J1++;
                    else if (p.getJugador() === "J2") J2++;
                }
            }
        }
        return { J1, J2 };
    }


    /**
     * Activa o desactiva el modo de colocar todas las piezas.
     */
    Cheat() {
        this.todasLasPiezas = !this.todasLasPiezas;

        //un poco mas de feedback al usuario para saber en que modo esta
        if (!this.todasLasPiezas) {
            this.PanelEventos.mostrar(
                "Modo CHEAT activado",
                "Puedes iniciar sin poner todas las piezas, pero debes colocar al menos los 2 comandantes (uno por equipo).",
                "CHEAT"
            );
        } else {
            this.PanelEventos.mostrar(
                "Modo CHEAT desactivado",
                "Vuelve a ser obligatorio colocar todas las piezas para iniciar.",
                "CHEAT"
            );
        }
    }
}

export default EscenaColocarPiezas;