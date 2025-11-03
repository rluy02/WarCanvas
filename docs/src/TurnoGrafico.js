import { Eventos } from "./Events.js";
import { EventBus } from "./EventBus.js";

export default class TurnoGraficos {
    constructor(escena) {
        this.escena = escena;
        this.piezasMover = 3;
        this.accionesPieza = 0;
    }

    create() {
        const width = this.escena.scale.width;
        const height = this.escena.scale.height;

        this.JugadorText = this.escena.add.text(40, height - 70, 'Turno J1', { // Título
            fontSize: '22px',
            fontFamily: 'Arial',
            fill: '#ffffff'
        });

        this.turnosText = this.escena.add.text(170, height - 70, 'Piezas a mover: ' + this.piezasMover, { // Título
            fontSize: '22px',
            fontFamily: 'Arial',
            fill: '#ffffff'
        });

        this.accionessText = this.escena.add.text(380, height - 70, 'Acciones de pieza: ' + this.accionesPieza, { // Título
            fontSize: '22px',
            fontFamily: 'Arial',
            fill: '#ffffff'
        });

        // this.acabarText = this.escena.add.text(210, height - 40, 'Finalizar Movimiento', { // Título
        //     fontSize: '22px',
        //     fontFamily: 'Arial',
        //     fill: '#ce2020ff'
        // }).setInteractive({ useHandCursor: true })

        this.acabarText.on('pointerdown', () => {
            EventBus.emit(eventos.PIECE_END_ACTIONS);
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
}