import { Eventos } from "../Events.js";
import { EventBus } from "../EventBus.js";
import Turno from "../Logica/Turno.js";
import { Sfx } from "../AudioManager/Sfx.js";

/**
 * Clase que gestiona la parte gráfica del turno 
 * @class TurnoGraficos
 * @memberof Render
 */
class TurnoGraficos {
    /**
     * Constructor de TurnoGrafico
     * @param {Phaser.Scene} escena 
     */
    constructor(escena) {
        this.escena = escena;
        this.piezasMover = 3;
        this.accionesPieza = 0;
        this.jugadorTurno = "J1"; //Default porque siempre es el que empieza

        EventBus.on(Eventos.CHANGE_TURN, () => {
            this.setAccionesTurno(3);
        })
    }

    /**
     * Crear los elementos gráficos del turno
     * @param {Turno} turno
     */
    create(turno) {
        const width = this.escena.scale.width;
        const height = this.escena.scale.height;

        this.escena.add.rectangle(0, height - 83, width, 83, 0x402200).setOrigin(0, 0);

        this.JugadorText = this.escena.add.text(50, height - 45, 'J1: ', { // Título
            fontSize: '32px',
            fontFamily: 'Kotton',
            fill: '#ffffff'
        }).setOrigin(0.5);

        //Imagenes de los movimientos restantes de cada jugador
        this.procesarIconos();

        this.accionessText = this.escena.add.text(width / 2, height - 60, 'Acciones de pieza: ' + this.accionesPieza, { // Título
            fontSize: '28px',
            fontFamily: 'Kotton',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.acabarText = this.escena.add.text(width / 2, height - 30, 'Finalizar Movimiento', { // Título
            fontSize: '22px',
            fontFamily: 'Kotton',
            fill: '#ce2020ff'
        }).setInteractive({ useHandCursor: true }).setOrigin(0.5);

        this.acabarText.on('pointerdown', () => {
            Sfx.play('interactuar', { volume: 0.3 });
            turno.acabarMovimientos();
        })

        this.acabarText.on('pointerover', () => {
            this.acabarText.setColor('#febcbcff');
        })

        this.acabarText.on('pointerout', () => {
            this.acabarText.setColor('#ce2020ff');
        })

    }

    /**
     * Setear las acciones de la pieza
     * @param {number} acciones 
     */
    setAccionesPieza(acciones) {
        this.accionesPieza = acciones;
        this.accionessText.text = 'Acciones de pieza: ' + this.accionesPieza;
    }

    /**
     * Setar las acciones del turno
     * @param {number} acciones 
     */
    setAccionesTurno(acciones) {
        this.piezasMover = acciones;
        this.procesarIconos();
    }

    /**
     * Crea la lista de iconos segun los movimientos restantes de cada jugador
     * 
     */
    procesarIconos() {
        // eliminar iconos y crearlos otra vez (Tras cada accion de cada jugador)
        if (this.iconosAcciones) {
            this.iconosAcciones.forEach(i => i.destroy());
        }
        this.iconosAcciones = [];

        const startX = 110;
        const y = this.escena.scale.height - 45;

        for (let i = 0; i < this.piezasMover; i++) {
            let icon = undefined;
            if (this.jugadorTurno == "J1") {
                icon = this.escena.add.sprite(startX + i * 70, y, 'peon').setScale(0.08);
            } else {
                icon = this.escena.add.sprite(startX + i * 70, y, 'peon2').setScale(0.08);
            }

            this.iconosAcciones.push(icon);
        }
    }

    /**
     * Setear el turno del jugador
     * @param {Jugador} jugador 
     */
    setTurnoJugador(jugador) {
        this.JugadorText.text = jugador + ": ";
        this.jugadorTurno = jugador;

        // Redibujar iconos según el jugador (J1 o J2)
        this.setAccionesTurno(this.piezasMover);
    }

    /**
    * Desactiva el botón "Finalizar Movimiento" durante el turno de la IA
    */
    desactivarBotonFinalizar() {
        if (this.acabarText) {
            this.acabarText.setAlpha(0.5);
            this.acabarText.disableInteractive();
        }
    }

    /**
     * Activa el botón "Finalizar Movimiento" durante el turno del jugador
     */
    activarBotonFinalizar() {
        if (this.acabarText) {
            this.acabarText.setAlpha(1);
            this.acabarText.setInteractive({ useHandCursor: true });
        }
    }

    /**
     * Desactivar la UI del turno
     */
    desactivarUI() {
        if (this.acabarText) this.acabarText.disableInteractive();
    }
}

export default TurnoGraficos;