export default class TurnoGraficos{
    constructor (escena){
        this.escena = escena;
        this.piezasMover = 3;
        this.accionesPieza = 0;
    }
    
    create() {
        const width = this.escena.scale.width;
        const height = this.escena.scale.height;
        
        this.JugadorText = this.escena.add.text(40, height - 60, 'Jugador 1', { // Título
            fontSize: '22px',
            fontFamily: 'Arial',
            fill: '#ffffff'
        });

        this.turnosText = this.escena.add.text(170, height - 60, 'Piezas a mover: ' + this.piezasMover, { // Título
            fontSize: '22px',
            fontFamily: 'Arial',
            fill: '#ffffff'
        });

        this.accionessText = this.escena.add.text(380, height - 60, 'Acciones de pieza: ' + this.accionesPieza, { // Título
            fontSize: '22px',
            fontFamily: 'Arial',
            fill: '#ffffff'
        });
    }

    setAccionesPieza(acciones){
        this.accionesPieza = acciones;
    }
}