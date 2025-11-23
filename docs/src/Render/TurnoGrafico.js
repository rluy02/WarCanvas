import { Eventos } from "../Events.js";
import { EventBus } from "../EventBus.js";

export default class TurnoGraficos {
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

        this.create();
    }

    create() {
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
            EventBus.emit(Eventos.PIECE_END_ACTIONS);
        })

        this.acabarText.on('pointerover', () => {
            this.acabarText.setColor('#febcbcff');
        })

        this.acabarText.on('pointerout', () => {
            this.acabarText.setColor('#ce2020ff');
        })

    }

    setAccionesPieza(acciones) {
        this.accionesPieza = acciones;
        this.accionessText.text = 'Acciones de pieza: ' + this.accionesPieza;
    }

    setAccionesTurno(acciones) {
        this.piezasMover = acciones;
        this.turnosText.text = 'Piezas a mover: ' + this.piezasMover;
    }

    setTurnoJugador(jugador) {
        this.JugadorText.text = 'Turno ' + jugador;
    }

    setPorcentaje(pJ1, pJ2){
        this.porcentajeJ1Text.text = 'J1: ' + pJ1 + '%';
        this.porcentajeJ2Text.text = 'J1: ' + pJ2 + '%';
    }
}