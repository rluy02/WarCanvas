import { Eventos } from "../Events.js";
import { EventBus } from "../EventBus.js";
import { turnoJugador } from "../Logica/Turno.js";

// Clase para la escena Colocar Piezas, pinta el tablero y los rangos (Render)
// ((es un tableroGrafico, pero mas sencilla))
export default class TableroGraficoColocarPiezas {
    constructor(equipoJ1, equipoJ2, escena, tablero, tamCasilla = 64) {
        this.escena = escena;
        this.tablero = tablero;
        this.tamCasilla = tamCasilla;
        this.graficos = this.dibujarTablero(); 

        this.equipo1 = equipoJ1;
        this.equipo2 = equipoJ2;

        this.equipoActual = this.equipo1;

        this.celdasColoreadas = []; 
        this.casillasPintadas = [];  

        EventBus.on(Eventos.CHANGE_TEAM_SET_PIECES, ()=> {
            this.cambiarEquipo();
        });
    }

    dibujarTablero() {
        let graficos = [];

        for (let fila = 0; fila < this.tablero.filas; fila++) {
            graficos[fila] = [];
            for (let col = 0; col < this.tablero.columnas; col++) {
                const color = (fila + col) % 2 === 0 ? 0xffffff : 0xcccccc;
                //los rectangulos se empiezan a dibujar desde el centro (por eso, +tamCasillas/2)
                const x = col * this.tamCasilla + this.tamCasilla / 2;
                const y = fila * this.tamCasilla + this.tamCasilla / 2;

                // new Rectangle(scene, x, y, [width], [height], [fillColor], [fillAlpha])
                const rect = this.escena.add.rectangle(
                    x, y, this.tamCasilla, this.tamCasilla, color
                ).setStrokeStyle(1, 0x000000)
                    .setInteractive();

                // Detectar click
                rect.on('pointerdown', () => {

                    this.onCeldaClick(fila, col);
                });

                graficos[fila][col] = rect;
            }
        }
        return graficos;
    }

    onCeldaClick(fila, col) {
        if(this.tablero.getCelda(fila, col).estaVacia()){
            this.limpiarTablero();
            this.tablero.generarPieza(fila, col);}
        else 
            this.tablero.eliminarPieza(fila, col, this.tablero.getCelda(fila, col).getPieza());
    }

    // Colorea el rango donde se puede colocar las piezas
    colorearRango() {
        this.limpiarTablero();

        let c, colLimite = 0;
        if (this.equipoActual === this.equipo1) {
            c = 0;
            colLimite = 3;
        }
        else if (this.equipoActual === this.equipo2) {
            c = 7;
            colLimite = this.tablero.columnas;
        }
        for (let fila = 0; fila < this.tablero.filas; fila++) {
            for (let col = c; col < colLimite; col++) {
                
                if (this.tablero.getCelda(fila, col).estaVacia()) {
                    this.graficos[fila][col].setStrokeStyle(3, 0x69CF4E);
                    this.casillasPintadas.push(this.crearCapa(fila, col, 0x00ff00, 0.3));
                    this.celdasColoreadas.push({ fila, col });
                } 
                if (!this.tablero.getCelda(fila, col).estaVacia()) {
                    this.graficos[fila][col].setStrokeStyle(3, 0xFF8000);
                    this.casillasPintadas.push(this.crearCapa(fila, col, 0xFF8000, 0.3));
                    this.celdasColoreadas.push({ fila, col });
                } } }
        }

    crearCapa(fila, col, color, transparencia) {
        const x = col * this.tamCasilla + this.tamCasilla / 2;
        const y = fila * this.tamCasilla + this.tamCasilla / 2;
        const capa = this.escena.add.rectangle(x, y, this.tamCasilla, this.tamCasilla, color, transparencia);
        return capa;
    }

    // Resetea todas las casillas coloreadas y la seleccionada
    limpiarTablero() {

        this.casillasPintadas.forEach(o => o.destroy());
        this.casillasPintadas = [];
        let i = 0;
        
        // Descolorear las anteriores
        for (let i = 0; i < this.celdasColoreadas.length; i++) {
            let { fila, col } = this.celdasColoreadas[i];
            this.graficos[fila][col].setStrokeStyle(1, 0x000000);
        }
        this.celdasColoreadas = [];
    }

    // Cambia el equipo actual que coloca sus piezas
    cambiarEquipo() {
        this.limpiarTablero();
        if (this.equipoActual === this.equipo1) this.equipoActual = this.equipo2;
        else this.equipoActual = this.equipo1;
    }
}