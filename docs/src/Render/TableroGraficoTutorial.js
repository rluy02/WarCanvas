import { Eventos } from "../Events.js";
import { EventBus } from "../EventBus.js";
import { turnoJugador } from "../Logica/Turno.js";

// Clase para la escena Tutorial, pinta el tablero y los rangos (Render)
// ((es como un tableroGrafico, pero mas sencilla))
/**
 * Representación gráfica simplificada del tablero para la escena de colocación de piezas.
 * Gestiona la creación de rectángulos, coloreado de rangos y la interacción de clicks.
 * @class TableroGraficoTutorial
 * @memberof Render
 */
class TableroGraficoTutorial {
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

        this.mapaTopografico = this.escena.textures.get('mapaTopo').getSourceImage();
        this.mapaSatelital = this.escena.textures.get('mapaSat').getSourceImage();

        this.mapaTopograficoWidth = this.mapaTopografico.width;
        this.mapaTopograficoHeight = this.mapaTopografico.height;

        this.fragmentoAncho = this.mapaTopograficoWidth / this.tablero.columnas;
        this.fragmentoAlto = this.mapaTopograficoHeight / this.tablero.filas;

        this.panelEventos = PanelEventos;

        this.equipo1 = equipoJ1;
        this.equipo2 = equipoJ2;

        this.equipoActual = this.equipo1;

        this.celdasColoreadas = []; 
        this.casillasPintadas = [];  
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

                //new Rectangle(scene, x, y, [width], [height], [fillColor], [fillAlpha])
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
     * Si la pieza es sobre la que se está realizando el tutorial, actua sobre ella
     * @param {number} fila - fila de la celda clicada
     * @param {number} col - columna de la celda clicada
     * @returns {void}
     */
    onCeldaClick(fila, col) {
        if(this.panelEventos.getInput()){
        let celda = this.tablero.getCelda(fila, col)
        if (!celda.estaVacia() && celda.getPieza().getJugador() === 'J1') {
                        this.colorearRango(fila, col);
        }
        else {
            // Como ya hay una celda seleccionada, vemos si la nueva celda es vacía o enemigo, para ver si movemos o atacamos
            if (!this.tablero.getPiezaActiva()) return;

            //Si es artilleria va aparte
            if (this.tablero.getPiezaActiva().getTipo() === "Artilleria" /*&& this.tablero.getPiezaActiva().puedeDisparar()*/ && this.esTipoCelda(fila, col)) {

                this.tablero.getPiezaActiva().lanzarProyectil(fila, col, this.escena, this.tablero);
                EventBus.emit(Eventos.PIECE_MOVED, this.tablero.getPiezaActiva(), false);

                this.limpiarTablero();
                this.tablero.resetPiezaActiva();
            }
            // Si es vacía se mueve
            else if (this.esTipoCelda(fila, col, "vacia") && !this.tablero.getPiezaActiva().getMovida() && this.tablero.getPiezaActiva().getJugador() == turnoJugador) {
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
        }}
    }

    /**
     * Comprueba si una coordenada dada está entre las celdas coloreadas y, opcionalmente, si coincide el tipo.
     * @param {number} fil - fila objetivo
     * @param {number} col - columna objetivo
     * @param {string} [tipo=""] - tipo de celda a comprobar ('vacia'|'enemigo')
     * @returns {boolean} true si la celda coincide con alguna de las coloreadas
     */
    esTipoCelda(fil, col, tipo = "") {
        for (let celda of this.celdasColoreadas) {
            if (tipo == "") {
                if (celda.fil == fil && celda.col == col) return true;
            }
            else {
                if (celda.fil == fil && celda.col == col && celda.tipo == tipo) return true;
            }
        }

        return false;
    }

 /**
     * Colorea el rango de movimiento/ataque de la pieza situada en (fila,col).
     * Marca la casilla de la pieza y añade capas para las celdas alcanzables.
     * @param {number} fila - fila de la pieza seleccionada
     * @param {number} col - columna de la pieza seleccionada
     */
    colorearRango(fila, col) {
        let celda = this.tablero.getCelda(fila, col);

        this.limpiarTablero();

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
        //Descolorear las anteriores
        for (let i = 0; i < this.celdasColoreadas.length; i++) {
            let f = this.celdasColoreadas[i].fil;
            let c = this.celdasColoreadas[i].col;
            this.graficos[f][c].setStrokeStyle(1, 0x000000);
        }
        // for (let fila=0; fila < this.graficos.length; fila++){
        //     for (let col=0; col < this.graficos.length; col++){
        //         if (this.graficos[fila][col].imagen){
        //     // Destruir la imagen del mapa
        // this.graficos[fila][col].imagen.destroy();
        // this.graficos[fila][col].imagen = null;}
        // //this.tablero.borrarCelda(jugadorAnterior);
        // } }
        if(this.celdaSeleccionada) this.graficos[this.celdaSeleccionada.fila][this.celdaSeleccionada.columna].setStrokeStyle(1, 0x000000);

        this.celdasColoreadas = [];
    }

    /**
     * Resetea todas las casillas conquistadas
     */
    limpiarMapas(){
        for (let fila=0; fila < this.tablero.filas; fila++){
                    for (let col=0; col < this.tablero.columnas; col++){
                        if (this.graficos[fila][col].imagen){
                    // Destruir la imagen del mapa
                this.graficos[fila][col].imagen.destroy();
                this.graficos[fila][col].imagen = null;}
                //this.tablero.borrarCelda(jugadorAnterior);
                } }
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

    /**
     * Dibuja un fragmento del mapa (topográfico o satelital) dentro de una celda.
     * @param {number} fila - fila de la celda
     * @param {number} col - columna de la celda
     * @param {string} tipoJugador - 'J1' o 'J2' para elegir mapa
     */
    dibujarFragmentoMapa(fila, col, tipoJugador) {
        // Determina qué mapa usar   
        const key = tipoJugador === 'J1' ? 'mapaTopo' : 'mapaSat';

        const textura = this.escena.textures.get(key).getSourceImage();

        const cropX = col * this.fragmentoAncho;
        const cropY = fila * this.fragmentoAlto;

        const x = col * this.tamCasilla + this.tamCasilla / 2;
        const y = fila * this.tamCasilla + this.tamCasilla / 2;

        // Borra la imagen anterior si existe
        if (this.graficos[fila][col].imagen && this.graficos[fila][col].imagen.mapKey != key) {
            this.graficos[fila][col].imagen.destroy();
            this.tablero.conquistarCelda(tipoJugador, true);
        }
        else if (!this.graficos[fila][col].imagen) {
            this.tablero.conquistarCelda(tipoJugador, false);
        }
        if ((this.graficos[fila][col].imagen && this.graficos[fila][col].imagen.mapKey != key) || !this.graficos[fila][col].imagen) {
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
        rt.mapKey = key;

        this.graficos[fila][col].imagen = rt;
        } // Si hay una capa del mismo mapa no la crea de nuevo
    }

    /**
     * Borra el fragmento de mapa renderizado en una celda y actualiza contadores.
     * @param {number} fila - fila de la celda
     * @param {number} col - columna de la celda
     * @param {string} jugadorAnterior - 'J1' o 'J2' que había conquistado la casilla
     * @returns {void}
     */
    borrarFragmentoMapa(fila, col, jugadorAnterior) {
        // Verificar que existe imagen
        if (!this.graficos[fila][col].imagen) return;

        // Destruir la imagen del mapa
        this.graficos[fila][col].imagen.destroy();
        this.graficos[fila][col].imagen = null;
        this.tablero.borrarCelda(jugadorAnterior);
    }
}

export default TableroGraficoTutorial;