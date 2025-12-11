import { Eventos } from "../Events.js";
import { EventBus } from "../EventBus.js";
import { turnoJugador } from "../Logica/Turno.js";

// Clase para la escena Colocar Piezas, pinta el tablero y los rangos (Render)
// ((es un tableroGrafico, pero mas sencilla))
/**
 * Representación gráfica simplificada del tablero para la escena de colocación de piezas.
 * Gestiona la creación de rectángulos, coloreado de rangos y la interacción de clicks.
 * @class TableroGraficoColocarPiezas
 * @memberof Render
 */
class TableroGraficoColocarPiezas {
    /**
     * Constructor.
     * @param {Equipo} equipoJ1 - instancia del equipo J1
     * @param {Equipo} equipoJ2 - instancia del equipo J2
     * @param {Phaser.Scene} escena - escena donde se renderiza el tablero
     * @param {Tablero} tablero - lógica del tablero
     * @param {number} [tamCasilla=64] - tamaño de cada casilla en px
     */
    constructor(equipoJ1, equipoJ2, escena, tablero, PanelEventos, tamCasilla = 64) {
        this.escena = escena;
        this.tablero = tablero;
        this.tamCasilla = tamCasilla;
        this.graficos = this.dibujarTablero(); 

        this.equipo1 = equipoJ1;
        this.equipo2 = equipoJ2;

        this.panelEventos = PanelEventos;

        this.equipoActual = this.equipo1;

        this.celdasColoreadas = []; 
        this.casillasPintadas = [];  

        EventBus.on(Eventos.CHANGE_TEAM_SET_PIECES, ()=> {
            this.cambiarEquipo();
        });
    }

    /**
     * Crea la malla gráfica del tablero: rectángulos interactivos por casilla.
     * Añade listeners de clic para cada rectángulo que delegan en `onCeldaClick`.
     * @returns {Array<Array<Phaser.GameObjects.Rectangle>>} matriz de rectángulos que representan las celdas
     */
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

    /**
     * Manejador de clic sobre una celda gráfica.
     * Si la celda está vacía solicita generar una pieza; si no, la elimina.
     * @param {number} fila - fila de la celda clicada
     * @param {number} col - columna de la celda clicada
     * @returns {void}
     */
    onCeldaClick(fila, col) {
        if(this.panelEventos.getInput()){
        if (this.tablero.getCelda(fila, col).estaVacia()) {
            if(this.equipoActual == this.equipo1 && col <3 ||this.equipoActual == this.equipo2 && col > 6 ) {
            this.limpiarTablero();
            this.tablero.generarPieza(fila, col);}
        } else {
            this.tablero.eliminarPieza(fila, col, this.tablero.getCelda(fila, col).getPieza());
        }}
    }

    /**
     * Colorea el rango donde el equipo actual puede colocar piezas.
     * Pinta capas verdes para casillas vacías y naranjas para casillas ocupadas.
     * @returns {void}
     */
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

    /**
     * Crea una capa semitransparente sobre una casilla para indicar estado.
     * @param {number} fila - fila objetivo
     * @param {number} col - columna objetivo
     * @param {number} color - color en formato hexadecimal (0x...)
     * @param {number} transparencia - nivel de alfa (0.0 - 1.0)
     * @returns {Phaser.GameObjects.Rectangle} el rectángulo creado
     */
    crearCapa(fila, col, color, transparencia) {
        const x = col * this.tamCasilla + this.tamCasilla / 2;
        const y = fila * this.tamCasilla + this.tamCasilla / 2;
        const capa = this.escena.add.rectangle(x, y, this.tamCasilla, this.tamCasilla, color, transparencia);
        return capa;
    }

    /**
     * Resetea todas las capas y restaura el estilo original de las casillas coloreadas.
     * @returns {void}
     */
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
    /**
     * Alterna el equipo que está colocando piezas y limpia los marcadores gráficos.
     */
    cambiarEquipo() {
        this.limpiarTablero();
        if (this.equipoActual === this.equipo1) this.equipoActual = this.equipo2;
        else this.equipoActual = this.equipo1;
    }
}

export default TableroGraficoColocarPiezas;