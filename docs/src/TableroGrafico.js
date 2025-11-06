import { Eventos } from "./Events.js";
import { EventBus } from "./EventBus.js";
import { turnoJugador } from "./Turno.js";

export default class TableroGrafico {
    constructor(escena, tablero, PanelLateral, tamCasilla = 64) {
        this.escena = escena;
        this.tablero = tablero;
        this.tamCasilla = tamCasilla;
        this.graficos = this.dibujarTablero(); //Este tablero visual esta lleno de "rects" //Phaser.GameObjects.Rectangle

        this.mapaTopografico = this.escena.textures.get('mapaTopo').getSourceImage();
        this.mapaSatelital = this.escena.textures.get('mapaSat').getSourceImage();

        this.mapaTopograficoWidth = this.mapaTopografico.width;
        this.mapaTopograficoHeight = this.mapaTopografico.height;

        this.fragmentoAncho = this.mapaTopograficoWidth / this.tablero.columnas;
        this.fragmentoAlto = this.mapaTopograficoHeight / this.tablero.filas;

        this.celdaSeleccionada = null; // La celda que estas seleccionando
        this.celdasColoreadas = []; // Las celdas a las que te puedes mover
        this.PanelLateral = PanelLateral;

        this.casillasPintadas = [];

        //Si se esta moviendo
        this.moviendoPieza = false;

        EventBus.on(Eventos.PIECE_END_ACTIONS, () => {
            this.restTablero();
        });

        for (let fila = 0; fila < this.tablero.filas; fila++) {
            for (let col = 0; col < this.tablero.columnas; col++) {

                if (col < 3) {
                    this.dibujarFragmentoMapa(fila, col, "J1")
                }
                else if (col > 6) {
                    this.dibujarFragmentoMapa(fila, col, "J2")
                }
            }
        }
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
        const celda = this.tablero.getCelda(fila, col);
        const pieza = celda.getPieza();
        const jugador = pieza ? pieza.getJugador() : "";

        // Si no hay celda seleccionada y no esta vacía se marcan las oppciones de la pieza
        if (pieza && this.celdaSeleccionada == null && !this.moviendoPieza && !pieza.getMovida() && jugador == turnoJugador) {
            // Si la celda contiene una pieza
            if (!celda.estaVacia()) {
                this.colorearRango(fila, col);
            }
        }
        else {
            // Como ya hay una celda seleccionada, vemos si la nueva celda es vacía o enemigo, para ver si movemos o atacamos

            // Si es vacía se mueve
            if (this.esTipoCelda(fila, col, "vacia") && !this.tablero.getPiezaActiva().getMovida() && this.tablero.getPiezaActiva().getJugador() == turnoJugador) {
                //Dibuja la conquista
                this.dibujarFragmentoMapa(fila, col, this.tablero.getPiezaActiva().getJugador())

                this.moviendoPieza = true;
                //Se limpia el tablero
                this.limpiarTablero();

                //Se informa del movimiento de pieza
                this.tablero.moverPieza(fila, col);
                this.colorearRango(fila, col);

            }
            else if (this.esTipoCelda(fila, col, "enemigo") && !this.tablero.getPiezaActiva().getMovida() && this.tablero.getPiezaActiva().getJugador() == turnoJugador) {
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

        this.limpiarCapas();

        this.celdasColoreadas = this.tablero.piezaSeleccionada(fila, col);
        //La de la ficha actual
        this.graficos[fila][col].setStrokeStyle(3, 0xf5a927);
        this.casillasPintadas.push(this.crearCapa(fila, col, 0xffc107, 0.3));

        for (let cel of this.celdasColoreadas) {
            if (cel.tipo == "vacia") {
                this.graficos[cel.fil][cel.col].setStrokeStyle(3, 0x69CF4E);
                this.casillasPintadas.push(this.crearCapa(cel.fil, cel.col, 0x00ff00, 0.3));
            }
            else if (cel.tipo == "enemigo") {
                this.graficos[cel.fil][cel.col].setStrokeStyle(3, 0xF23A1D);
                this.casillasPintadas.push(this.crearCapa(cel.fil, cel.col, 0xff0000, 0.3));
            }
        }

        this.celdaSeleccionada = celda;
    }

    crearCapa(fila, col, color, transparencia) {
        const x = col * this.tamCasilla + this.tamCasilla / 2;
        const y = fila * this.tamCasilla + this.tamCasilla / 2;
        const capa = this.escena.add.rectangle(x, y, this.tamCasilla, this.tamCasilla, color, transparencia);
        return capa;
    }

    limpiarCapas() {
        this.casillasPintadas.forEach(o => o.destroy());
        this.casillasPintadas = [];
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

        this.limpiarCapas();
        let i = 0;
        // Descolorear las anteriores
        for (let i = 0; i < this.celdasColoreadas.length; i++) {
            let { fil, col } = this.celdasColoreadas[i];
            this.graficos[fil][col].setStrokeStyle(1, 0x000000);
        }

        if (this.celdaSeleccionada) {
            //Desmarcamos la casilla central
            let f = this.celdaSeleccionada.getPosicion().fila;
            let c = this.celdaSeleccionada.getPosicion().col;
            this.graficos[f][c].setStrokeStyle(1, 0x000000);
        }

        this.celdasColoreadas = [];
        EventBus.emit(Eventos.CLEAN_SIDE_PANEL);
    }

    confirmarAtaque(fila, columna, celdaSeleccionada) {

        let casillaAtacante = this.tablero.getCelda(celdaSeleccionada.fila, celdaSeleccionada.columna);
        let casillaDefensa = this.tablero.getCelda(fila, columna);
        let atacante = casillaAtacante.getPieza().getJugador();
        let defensa = casillaDefensa.getPieza().getJugador();
        let atacantePieza = this.tablero.getCelda(celdaSeleccionada.fila, celdaSeleccionada.columna).getPieza().getTipo();
        let defensaPieza = this.tablero.getCelda(fila, columna).getPieza().getTipo();
        this.PanelLateral.updateInfo(defensaPieza, atacantePieza, atacante, defensa, "Atacar", casillaAtacante, casillaDefensa);
    }

    dibujarFragmentoMapa(fila, col, tipoJugador) {
        // Determina qué mapa usar
        const key = tipoJugador === 'J1' ? 'mapaTopo' : 'mapaSat';

        const textura = this.escena.textures.get(key).getSourceImage();

        const cropX = col * this.fragmentoAncho;
        const cropY = fila * this.fragmentoAlto;

        const x = col * this.tamCasilla + this.tamCasilla / 2;
        const y = fila * this.tamCasilla + this.tamCasilla / 2;

        // Borra la imagen anterior si existe
        if (this.graficos[fila][col].imagen) {
            this.graficos[fila][col].imagen.destroy();

            this.tablero.conquistarCelda(tipoJugador, true);
        }

        this.tablero.conquistarCelda(tipoJugador, false);


        const zoom = 1.3;
        const renderSize = this.tamCasilla * zoom;

        // Crea un RenderTexture que actúa como "mini lienzo" para la celda
        const rt = this.escena.add.renderTexture(x, y, renderSize, renderSize)
            .setOrigin(0.5)
            .setDepth(0);

        // Escala proporcional al fragmento del mapa
        const scaleX = renderSize / this.fragmentoAncho;
        const scaleY = renderSize / this.fragmentoAlto;

        // Dibuja el fragmento del mapa en el renderTexture escalado a la celda
        rt.draw(key, -cropX * scaleX, -cropY * scaleY, key)
            .setScale(scaleX, scaleY);

        this.graficos[fila][col].imagen = rt;

    }

    restTablero() {
        this.moviendoPieza = false;
        this.movimientoIniciado = false;

        this.limpiarTablero();
        this.celdaSeleccionada = null;
    }
}