import { Sfx } from "../AudioManager/Sfx.js";
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
import PanelEventos from "../Render/PanelEventos.js";
import InteligenciaArtificial from "../Logica/InteligenciaArtificial.js";
import Pieza from "../Logica/Pieza.js";
import BarraTerritorio from "../Render/BarraTerritorio.js";

/**
 * Escena de inicio del juego.
 * @class Inicio
 * @extends Phaser.Scene
 * @memberof Escenas
 */
class Inicio extends Phaser.Scene {
    /**
     * Constructor de la escena Inicio.
     * @constructor
     */
    constructor() {
        super("Inicio");
    }

    /**
     * Inicializa la escena con los equipos proporcionados.
     * @param {{equipo1: Equipo, equipo2: Equipo}} datos 
     */
    init(datos) {
        if (datos.equipo1) this.equipo1 = datos.equipo1;
        if (datos.equipo2) this.equipo2 = datos.equipo2;
        this.ia = datos.ia; // si la ia esta activa o no
    }

    /**
     * Se llama a este metodo cuando se despierta la escena
     */
    wake() {
        const data = this.dataWake;
        console.log("Juego Inicio", data);
        let name, nameEnemy;
        name = (data == 'J1') ? 'Drawful' : 'el equipo Realista'
        nameEnemy = (data == 'J2') ? 'Drawful' : 'el equipo Realista'
        // Aquí restauras lógica, reinicias inputs, etc.
        //let infoEvento = this.eventosAleatorios.infoEventoActual();
        this.panelEventos.mostrar('MiniJuego Terminado', `El ganador del miniJuego es ${name}, el evento no le afectará`, 'Drawful', 'ACEPTAR', () => {
            this.eventosAleatorios.runEventoActual(data);
        });
    }

    /**
     * Método create de la escena Inicio.
     * Crea los elementos gráficos y lógicos necesarios para la escena.
     */
    create() {
        Sfx.bind(this);

        //Creamos la instancia y la guardamos en tab
        this.tab = new Tablero(8, 10, this);

        this.piezas = [];
        this.acciones = 3;
        this.panelInfo = new PanelInfoPiezas(this);
        this.panel = new PanelLateral(this, this.panelInfo, this.tab);
        this.panelEventos = new PanelEventos(this);

        this.piezaGrafico = new PiezaGrafico(this, this.tab);

        //Dibujamos el tablero
        this.tabGrafico = new TableroGrafico(this, this.tab, this.panel, this.panelEventos);

        this.eventosAleatorios = new EventosAleatorios(this, this.tab, this.tabGrafico, this.panelEventos);


        this.combates = new Combates(this.tab, this.tabGrafico, this.panel);

        // Creamos el turno y su parte gráfica
        this.turnoGrafico = new TurnoGraficos(this);
        this.turno = new Turno(this, this.acciones, this.turnoGrafico);
        this.turnoGrafico.create(this.turno);
        this.turno.crearListeners();
        this.marcoConquista = new BarraTerritorio(this);

        if (this.equipo1 == undefined) this.equipo1 = new Equipo("J1", this.tab, true);
        if (this.equipo2 == undefined) this.equipo2 = new Equipo("J2", this.tab, true);

        if (this.ia) this.inteligenciaArtificial = new InteligenciaArtificial(this.tab, this.tabGrafico, this.equipo2, this, this.acciones, this.turno)

        console.log(this.equipo1);

        // Dibujamos las piezas
        for (let pieza of this.equipo1.piezas) {
            pieza.setTablero(this.tab);
            let pos = pieza.getPosicion();
            console.log(pos);
            this.tab.getCelda(pos.fila, pos.col).setContenido(pieza);
            this.piezaGrafico.dibujarPieza(pieza);
            this.piezas.push(pieza);
        }
        for (let pieza of this.equipo2.piezas) {
            pieza.setTablero(this.tab);
            let pos = pieza.getPosicion();
            this.tab.getCelda(pos.fila, pos.col).setContenido(pieza);
            this.piezaGrafico.dibujarPieza(pieza);
            this.piezas.push(pieza);
        }
        // Se añade un evento para cuando se mueve la pieza (once se ejecuta antes que on)
        EventBus.on(Eventos.PIECE_MOVED, (pieza,movConquistaSFX=false) => {
            this.moverPieza(pieza,movConquistaSFX);
        });

        //Evento eliminacion de una pieza tras combate
        EventBus.on(Eventos.PIECE_ERASE, (defiende, ataca) => {
            let move = defiende.getPosicion();
            this.eliminarPieza(defiende);
            this.tabGrafico.dibujarFragmentoMapa(move.fila, move.col, ataca.getJugador());
            this.tab.moverPiezaCombate(move.fila, move.col, ataca);
        });

        this.partidaTerminadaFlag = false;
        //Finalizacion de la partida
        EventBus.on(Eventos.END_GAME, (info) => {
            this.partidaTerminadaFlag = true;
            this.partidaTerminada(info);
        });

        this.events.on('wake', (data) => { // Evento que se llama al despertar la escena (data -> ganador MiniJuego)
            this.wake();
        });

        this.panel.create();
        this.panelInfo.crearPanel();
    }

    /**
     * Maneja la finalización de la partida.
     * Muestra un panel con el resultado y desactiva la interacción.
     * @param {*} info 
     */
    partidaTerminada(info) {
        this.bloquearInteraccion();
        //2s de delay para visualizar el mapa tras la victoria/derrota
        this.time.delayedCall(2000, () => {
            let nombre = "";
            let descripcion = "";
            let titulo = "";

            //Caso especial: auto-eliminación del Comandante
            if (info.autoEliminacion === true) {

                if (info.jugador === "J1") {
                    nombre = "¡Buena Suerte!";
                    titulo = "VICTORIA";
                    descripcion = "El enemigo cometió un grave error y destruyó a su propio comandante.";
                } else {
                    nombre = "Derrota inesperada";
                    titulo = "DERROTA";
                    descripcion = "Por eso hay que aprobar métodos matemáticos, has causado la pérdida del nuestro comandante.";
                }

                this.panelEventos.mostrar(
                    nombre,
                    descripcion,
                    titulo,
                    "IR AL MENÚ",
                    () => this.ResetInfoYcambiarEscena()
                );

                return; //evitar que siga al bloque normal
            }

            //Flujo normal del juego
            if (info.jugador === "J1") {
                nombre = '¡El equipo dibujado vence!';
                titulo = 'VICTORIA';
                if (info.tipo === "COMBATE")
                    descripcion = '¡Has conseguido derrotar al comandante rival!';
                else
                    descripcion = '¡Has logrado conquistar el territorio!'
            } else {
                nombre = 'El equipo realista vence';
                titulo = 'DERROTA';
                if (info.tipo === "COMBATE")
                    descripcion = '¡Las fuerzas enemigas han derrotado a Drawful!';
                else
                    descripcion = '¡El enemigo ha logrado dominar el territorio!'
            }

            this.panelEventos.mostrar(
                nombre,
                descripcion,
                titulo,          // Título
                'IR AL MENÚ',         // Texto del botón
                () => this.ResetInfoYcambiarEscena() // callback al cerrar
            );
        });
    }

    /**
     * Busca la pieza entre la lista de piezas, la borra y la coloca en su nueva posición (esta posición esta ya asignada desde tablero.js)
     * @param {Pieza} pieza 
     */
    moverPieza(pieza,movConquistaSFX=false) {
        for (let p of this.piezas) {
            if (p == pieza) {
                let data = this.piezaGrafico.eliminarPieza(pieza);
                this.piezaGrafico.dibujarPieza(pieza, data);
                if (!movConquistaSFX) Sfx.play('moverPieza');
            }
        }
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

        // Eliminar la pieza del equipo correspondiente
        if (pieza.getJugador() === 'J1') {
            this.equipo1.eliminarPieza(pieza);
        } else {
            this.equipo2.eliminarPieza(pieza);
        }
    }

    /**
     * Metodo que finaliza la partida actual y envia al jugador a la pantalla del menu
     */
    ResetInfoYcambiarEscena() {
        if (this.turno) {
            this.turno.reiniciarTurno();
            this.turno.destruirListeners();
        }

        this.equipo1 = undefined;
        this.equipo2 = undefined;

        EventBus.removeAllListeners(); //Los listeners persisten entre escenas. Han de destruirse para que no apunten a viejos con memoria ya destruida
        /*-- Si luego requerimos de listeners que persistan !!--> solo destruiremos los de combates, panel, ui con el EB.off()*/

        this.scene.stop();  // Detener la escena actual (que se destruya)
        this.scene.wake("Menu"); //Reactivamos la visibilidad del menu
    }

    /**
     * Bloquea la interacción del jugador con el tablero y la UI.
     */
    bloquearInteraccion() {
        // Bloquear tablero gráfico (si usa input propio)
        if (this.tabGrafico) this.tabGrafico.desactivarTablero();

        // Desactivar botón de pasar turno
        if (this.turnoGrafico) this.turnoGrafico.desactivarUI();


        //Desactivar el btn INFO de piezas
        if (this.panel) this.panel.desactivarBtnInfo();


        if (this.panelInfo) this.panelInfo.cerrarYbloquearPanel(); //si termina la partida con el panel abierto, fuerzo el cierre

        //por si necesitamos seguir desactivando objetos tener en cuenta esto...
        /* Text + .on() → Listener permanece incluso después de disableInteractive().
           Sprite / Rect + .on() o EventBus → Listener suele ser removido o ignorado cuando desactivas input o destruyes objeto. */
    }

    /**
     * Devuelve la instancia de PiezaGrafico asociada a la escena.
     * @returns {PiezaGrafico} - instancia de PiezaGrafico
     */
    getPiezaGrafico() {
        return this.piezaGrafico;
    }

    lanzarMinijuego() {
        this.scene.sleep('Inicio');
        this.scene.launch('Minijuego');
    }
}

export default Inicio;