import { Eventos } from "./Events.js";
import { EventBus } from "./EventBus.js";
import { turnoJugador } from "./Turno.js";

export default class TableroGrafico {
    constructor(escena, tablero, PanelLateral, tamCasilla = 64) {
        this.escena = escena;
        this.tablero = tablero;
        this.tamCasilla = tamCasilla;
        this.graficos = this.dibujarTablero(); //Este tablero visual esta lleno de "rects" //Phaser.GameObjects.Rectangle
        this.celdaSeleccionada = null; // La celda que estas seleccionando
        this.celdasColoreadas = []; // Las celdas a las que te puedes mover
        this.PanelLateral = PanelLateral;

        //Si se esta moviendo
        this.moviendoPieza = false;

        EventBus.on(Eventos.PIECE_END_ACTIONS, () => {
            this.moviendoPieza = false;
            this.movimientoIniciado = false;

            this.limpiarTablero();
            this.celdaSeleccionada = null;
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
        console.log("Click ", fila + " ", col);   
        let celda = this.tablero.getCelda(fila, col);
        let pieza = celda.getPieza();

        let jugador = "";
        if (pieza) jugador = pieza.getJugador();

        // Si no hay celda seleccionada y no esta vacía se marcan las oppciones de la pieza
        if (this.celdaSeleccionada == null && !this.moviendoPieza && !pieza.getMovida() && jugador == turnoJugador) {
            // Si la celda contiene una pieza
            if (!celda.estaVacia()) {
                this.colorearRango(fila, col);
            }
        }
        else {
            // Como ya hay una celda seleccionada, vemos si la nueva celda es vacía o enemigo, para ver si movemos o atacamos
            
            // Si es vacía se mueve
            if (this.esTipoCelda(fila, col, "vacia") && !this.tablero.getPiezaActiva().getMovida()) {

                this.moviendoPieza = true;
                //Se limpia el tablero
                this.limpiarTablero();

                //Se informa del movimiento de pieza
                this.tablero.moverPieza(fila, col);
                this.colorearRango(fila, col);
            }
            else if (this.esTipoCelda(fila, col, "enemigo") && !this.tablero.getPiezaActiva().getMovida()) {
                this.moviendoPieza = false;

                // Combate
                this.confirmarAtaque(fila, col, this.celdaSeleccionada);
                // Posible Ataque si se confirma en el panel Lateral
                this.tablero.ataque(fila, col);
            }
            else if (!this.moviendoPieza) {
                this.limpiarTablero();
                this.celdaSeleccionada = null;
            }
        }
    }

    // Colorea el rango de movimiento de la pieza
    colorearRango(fila, col) {
        let celda = this.tablero.getCelda(fila, col);

        this.celdasColoreadas = this.tablero.piezaSeleccionada(fila, col);
        //La de la ficha actual
        this.graficos[fila][col].setStrokeStyle(3, 0xf5a927);

        for (let cel of this.celdasColoreadas) {
            if (cel.tipo == "vacia") {
                this.graficos[cel.fil][cel.col].setStrokeStyle(3, 0x69CF4E);
            }
            else if (cel.tipo == "enemigo") {
                this.graficos[cel.fil][cel.col].setStrokeStyle(3, 0xF23A1D);
            }
        }

        this.celdaSeleccionada = celda;
    }

    // Mira si la celda (fil,col) esta entre las seleccionadas, y ademas mira que el tipo sea correcto
    esTipoCelda(fil, col, tipo) {
        for (let celda of this.celdasColoreadas) {
            if (celda.fil == fil && celda.col == col && celda.tipo == tipo) return true;
        }

        return false;
    }

    // Resetea todas las casillas coloreadas y la seleccionada
    limpiarTablero() {
        let i = 0;
        // Descolorear las anteriores
        for (let i = 0; i < this.celdasColoreadas.length; i++) {
            let { fil, col } = this.celdasColoreadas[i];
            this.graficos[fil][col].setStrokeStyle(1, 0x000000);
        }

        //Desmarcamos la casilla central
        let f = this.celdaSeleccionada.getPosicion().fila;
        let c = this.celdaSeleccionada.getPosicion().col;
        this.graficos[f][c].setStrokeStyle(1, 0x000000);

        this.celdasColoreadas = [];
    }

    confirmarAtaque(fila, columna, celdaSeleccionada) {

        let casillaAtacante = this.tablero.getCelda(fila, columna);
        let casillaDefensa = this.tablero.getCelda(celdaSeleccionada.fila, celdaSeleccionada.columna);
        let atacante = casillaAtacante.getPieza().getJugador();
        let defensa = casillaDefensa.getPieza().getJugador();
        let atacantePieza = this.tablero.getCelda(fila, columna).getPieza().getTipo();
        let defensaPieza = this.tablero.getCelda(celdaSeleccionada.fila, celdaSeleccionada.columna).getPieza().getTipo();
        this.PanelLateral.updateInfo(defensaPieza, atacantePieza, atacante, defensa, "Atacar", casillaAtacante, casillaDefensa);
        console.log("Confirmar Combate - TableroGráfico");
    }
}