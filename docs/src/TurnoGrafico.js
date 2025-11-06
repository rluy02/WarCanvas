import { Eventos } from "./Events.js";
import { EventBus } from "./EventBus.js";

export default class TurnoGraficos {
    constructor(escena) {
        this.escena = escena;
        this.piezasMover = 3;
        this.accionesPieza = 0;
        this.porcentajeJ1 = 0;
        this.porcentajeJ2 = 0;


        EventBus.on(Eventos.CHANGE_TURN, () => {
            this.setAccionesTurno(3);
        })
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

        this.porcentajeJ1Text = this.escena.add.text(400, height - 40, 'J1: ' + this.porcentajeJ1 + '%', { // Título
            fontSize: '22px',
            fontFamily: 'Arial',
            fill: '#ffffff'
        });
        this.porcentajeJ2Text = this.escena.add.text(500, height - 40, 'J2: ' + this.porcentajeJ2 + '%', { // Título
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
}