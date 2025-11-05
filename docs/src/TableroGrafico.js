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

        //Si se esta moviendo
        this.moviendoPieza = false;

        EventBus.on(Eventos.PIECE_END_ACTIONS, () => {
            this.restTablero();
        });

        for (let fila = 0; fila < this.tablero.filas; fila++) {
            for (let col = 0; col < this.tablero.columnas; col++) {

                if (col > this.tablero.columnas / 2 - 1) {
                    this.dibujarFragmentoMapa(fila, col, "J1")
                }
                else {
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

        // Selección inicial de pieza
        if (this.celdaSeleccionada == null && !this.moviendoPieza && pieza && !pieza.getMovida() && jugador == turnoJugador) {
            this.colorearRango(fila, col);
            return;
        }

        // Mover
        if (this.esTipoCelda(fila, col, "vacia")) {
            this.moviendoPieza = true;
            this.limpiarTablero();
            this.tablero.moverPieza(fila, col);

            const sigueActiva = this.tablero.getPiezaActiva() && !this.tablero.getPiezaActiva().getMovida();
            if (sigueActiva) this.colorearRango(fila, col);
            return;
        }

        // Atacar
        if (this.esTipoCelda(fila, col, "enemigo")) {
            this.moviendoPieza = false;
            this.confirmarAtaque(fila, col, this.celdaSeleccionada);
            this.tablero.ataque(fila, col);
            return;
        }

        // Si no coincide nada, limpiar
        if (!this.moviendoPieza) {
            this.limpiarTablero();
            this.celdaSeleccionada = null;
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

        if (this.celdaSeleccionada) {
            //Desmarcamos la casilla central
            let f = this.celdaSeleccionada.getPosicion().fila;
            let c = this.celdaSeleccionada.getPosicion().col;
            this.graficos[f][c].setStrokeStyle(1, 0x000000);
        }

        this.celdasColoreadas = [];
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

        const fragWidth = textura.width / this.tablero.columnas;
        const fragHeight = textura.height / this.tablero.filas;
        const cropX = col * fragWidth;
        const cropY = fila * fragHeight;

        const x = col * this.tamCasilla + this.tamCasilla / 2;
        const y = fila * this.tamCasilla + this.tamCasilla / 2;

        // Borra la imagen anterior si existe
        if (this.graficos[fila][col].imagen) {
            this.graficos[fila][col].imagen.destroy();
        }

        const zoom = 1.6;
        const renderSize = this.tamCasilla * zoom;

        // Crea un RenderTexture que actúa como "mini lienzo" para la celda
        const rt = this.escena.add.renderTexture(x, y, renderSize, renderSize)
            .setOrigin(0.5)
            .setDepth(0);

        // Escala proporcional al fragmento del mapa
        const scaleX = renderSize / fragWidth;
        const scaleY = renderSize / fragHeight;

        // Dibuja el fragmento del mapa en el renderTexture escalado a la celda
        rt.draw(key, -cropX * scaleX, -cropY * scaleY, key)
            .setScale(scaleX, scaleY);

        this.graficos[fila][col].imagen = rt;

        console.log(`Dibujo fragmento [${fila},${col}] (${cropX},${cropY},${fragWidth},${fragHeight}) del mapa ${key}`);
    }

    restTablero() {
        this.moviendoPieza = false;
        this.movimientoIniciado = false;

        this.limpiarTablero();
        this.celdaSeleccionada = null;
    }
}