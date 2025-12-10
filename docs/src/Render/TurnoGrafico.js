import { Eventos } from "../Events.js";
import { EventBus } from "../EventBus.js";
import Turno from "../Logica/Turno.js";

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

        this.JugadorText = this.escena.add.text(40, height - 75, 'J1: ', { // Título
            fontSize: '22px',
            fontFamily: 'Arial',
            fill: '#ffffff'
        });

        //Imagenes de los movimientos restantes de cada jugador
        this.procesarIconos();

        this.accionessText = this.escena.add.text(380, height - 75, 'Acciones de pieza: ' + this.accionesPieza, { // Título
            fontSize: '22px',
            fontFamily: 'Arial',
            fill: '#ffffff'
        });

        this.acabarText = this.escena.add.text(90, height - 40, 'Finalizar Movimiento', { // Título
            fontSize: '22px',
            fontFamily: 'Arial',
            fill: '#ce2020ff'
        }).setInteractive({ useHandCursor: true })

        this.acabarText.on('pointerdown', () => {
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
        const y = this.escena.scale.height - 60;

        for (let i = 0; i < this.piezasMover; i++) {
            let icon = undefined;
            if (this.jugadorTurno == "J1") {
                icon = this.escena.add.image(startX + i * 50, y, 'peon-blanco');
            } else {
                icon = this.escena.add.image(startX + i * 50, y, 'peon-rojo');
            }

            icon.setDisplaySize(20, 34);
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
     * Desactivar la UI del turno
     */
    desactivarUI() {
        if (this.acabarText) this.acabarText.disableInteractive();
    }
}

export default TurnoGraficos;