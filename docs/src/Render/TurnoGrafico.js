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

        EventBus.on(Eventos.CHANGE_TURN, () => {
            this.setAccionesTurno(3);
        })

        EventBus.on(Eventos.CONQUER_CELL, (pJ1, pJ2) => {
            this.setPorcentaje(pJ1, pJ2);
        })

        EventBus.on(Eventos.UPDATE_PERCENTAGES, (pJ1, pJ2) => {
            this.setPorcentaje(pJ1, pJ2);
        })
    }

    /**
     * Crear los elementos gráficos del turno
     * @param {Turno} turno
     */
    create(turno) {
        const width = this.escena.scale.width;
        const height = this.escena.scale.height;

        this.JugadorText = this.escena.add.text(40, height - 75, 'Turno J1', { // Título
            fontSize: '22px',
            fontFamily: 'Arial',
            fill: '#ffffff'
        });

        this.turnosText = this.escena.add.text(170, height - 75, 'Piezas a mover: ' + this.piezasMover, { // Título
            fontSize: '22px',
            fontFamily: 'Arial',
            fill: '#ffffff'
        });

        this.accionessText = this.escena.add.text(380, height - 75, 'Acciones de pieza: ' + this.accionesPieza, { // Título
            fontSize: '22px',
            fontFamily: 'Arial',
            fill: '#ffffff'
        });

        this.porcentajeJ1Text = this.escena.add.text(390, height - 40, 'J1: ' + 0 + '%', { // Título
            fontSize: '22px',
            fontFamily: 'Arial',
            fill: '#ffffff'
        });
        this.porcentajeJ2Text = this.escena.add.text(510, height - 40, 'J2: ' + 0 + '%', { // Título
            fontSize: '22px',
            fontFamily: 'Arial',
            fill: '#ff6666ff'
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
        this.turnosText.text = 'Piezas a mover: ' + this.piezasMover;
    }

    /**
     * Setear el turno del jugador
     * @param {Jugador} jugador 
     */
    setTurnoJugador(jugador) {
        this.JugadorText.text = 'Turno ' + jugador;
    }

    /**
     * Establecer el porcentaje de control de cada jugador
     * @param {number} pJ1 
     * @param {number} pJ2 
     */
    setPorcentaje(pJ1, pJ2){
        this.porcentajeJ1Text.text = 'J1: ' + pJ1 + '%';
        this.porcentajeJ2Text.text = 'J1: ' + pJ2 + '%';
    }

    /**
     * Desactivar la UI del turno
     */
    desactivarUI() {
        if (this.acabarText) this.acabarText.disableInteractive();
    }
}

export default TurnoGraficos;