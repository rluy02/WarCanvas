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
    }

    /**
     * Método preload de la escena Inicio.
     * Carga las imágenes necesarias para la escena.
     */
    preload() {
        this.crearImagenes();
    }

    /**
     * Método create de la escena Inicio.
     * Crea los elementos gráficos y lógicos necesarios para la escena.
     */
    create() {
        this.crearAnimaciones();

        //Creamos la instancia y la guardamos en tab
        this.tab = new Tablero(8,10,this);

        this.piezas = [];
        this.acciones = 3;
        this.panelInfo = new PanelInfoPiezas(this);
        this.panel = new PanelLateral(this, this.panelInfo, this.tab);
        this.panelEventos = new PanelEventos(this);

        this.piezaGrafico = new PiezaGrafico(this, this.tab);

        //Dibujamos el tablero
        this.tabGrafico = new TableroGrafico(this, this.tab, this.panel);

        this.eventosAleatorios = new EventosAleatorios(this.tab, this.tabGrafico, this.panelEventos);


        this.combates = new Combates(this.tab, this.tabGrafico, this.panel);

        // Creamos el turno y su parte gráfica
        this.turnoGrafico = new TurnoGraficos(this);
        this.turno = new Turno(this, this.acciones, this.turnoGrafico);
        this.turnoGrafico.create(this.turno);
        this.turno.crearListeners();

        if (this.equipo1 == undefined) this.equipo1 = new Equipo("J1", this.tab, true);
        if (this.equipo2 == undefined) this.equipo2 = new Equipo("J2", this.tab, true);

        this.inteligenciaArtificial = new InteligenciaArtificial(this.tab, this.tabGrafico, this.equipo2, this, this.acciones)

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

        this.partidaTerminadaFlag = false;
        //Finalizacion de la partida
        EventBus.on(Eventos.END_GAME, (info) => {
            this.partidaTerminadaFlag = true;
            this.partidaTerminada(info);
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
    moverPieza(pieza) {
        for (let p of this.piezas) {
            if (p == pieza) {
                let data =this.piezaGrafico.eliminarPieza(pieza);
                this.piezaGrafico.dibujarPieza(pieza, data);
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

    /**
     * Método crearImagenes de la escena Inicio.
     * Carga las imágenes necesarias para la escena.
     */
    crearImagenes() {
        for (let i = 0; i <= 6; i++) {
            this.load.image(`dice${i}`, `./imgs/dice/dice${i}.webp`);
        }

        this.load.image('mapaTopo', './imgs/mapa/mapaTopo.webp');
        this.load.image('mapaSat', './imgs/mapa/mapaSat.webp');

        this.load.image('peon', './imgs/piezas/peon.webp');
        this.load.image('peon-blanco', './imgs/piezas/white-pawn.webp');
        this.load.image('peon-rojo', './imgs/piezas/red-pawn.webp');
        this.load.image('peon2', './imgs/piezas/peon2.webp');
        this.load.image('caballeria', './imgs/piezas/caballeria-dibujada.webp');
        this.load.image('caballeria2', './imgs/piezas/Caballeria2.webp');
        this.load.image('comandante', './imgs/piezas/Comandante.webp');
        this.load.image('comandante2', './imgs/piezas/Comandante2.webp');
        this.load.image('artilleria', './imgs/piezas/artilleriaJ1.webp');
        this.load.image('artilleria2', './imgs/piezas/artilleriaJ1.webp');

        this.load.spritesheet('explosion', 'imgs/efectos/explosion.png', { frameWidth: 144, frameHeight: 128 });
    }

    /**
     * Devuelve la instancia de PiezaGrafico asociada a la escena.
     * @returns {PiezaGrafico} - instancia de PiezaGrafico
     */
    getPiezaGrafico() {
        return this.piezaGrafico;
    }

     lanzarMinijuego() {
        this.scene.sleep();
        this.scene.launch('Minijuego');
     }
}

export default Inicio;