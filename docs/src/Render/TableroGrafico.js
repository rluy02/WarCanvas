import { Eventos } from "../Events.js";
import { EventBus } from "../EventBus.js";
import { turnoJugador } from "../Logica/Turno.js";
import Celda from "../Logica/Celda.js";

/**
 * Gestión gráfica del tablero principal: crea rectángulos por casilla,
 * pinta rangos de movimiento, fragmentos de mapa y gestiona interacciones.
 * @class TableroGrafico
 * @memberof Render
 */
class TableroGrafico {
    /**
     * Constructor de la capa gráfica del tablero.
     * @param {Phaser.Scene} escena - escena de Phaser donde se dibuja
     * @param {Tablero} tablero - instancia de la lógica del tablero
     * @param {PanelLateral} PanelLateral - panel lateral para mostrar confirmaciones
     * @param {number} [tamCasilla=64] - tamaño en píxeles de cada casilla
     */
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

        // Separar capas de selección/movimiento de capas de eventos
        this.casillasPintadas = [];      // Para selección/movimiento (se limpian con limpiarTablero)
        this.casillasEventos = [];       // Para eventos (persisten hasta limpiarEventos)

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

    /**
     * Dibuja la malla gráfica del tablero: rectángulos interactivos por casilla.
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
     * Manejador de clic en una celda gráfica.
     * Determina acciones (seleccionar pieza, mover, atacar o disparar artillería).
     * @param {number} fila - fila de la celda clicada
     * @param {number} col - columna de la celda clicada
     */
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
            if (!this.tablero.getPiezaActiva()) return;

            //Si es artilleria va aparte
            if (this.tablero.getPiezaActiva().getTipo() === "Artilleria" && this.tablero.getPiezaActiva().puedeDisparar() && this.esTipoCelda(fila, col)) {

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
        }
    }

    /**
     * Colorea el rango de movimiento/ataque de la pieza situada en (fila,col).
     * Marca la casilla de la pieza y añade capas para las celdas alcanzables.
     * @param {number} fila - fila de la pieza seleccionada
     * @param {number} col - columna de la pieza seleccionada
     */
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

    /**
     * Crea una capa coloreada sobre una celda.
     * @param {number} fila - fila
     * @param {number} col - columna
     * @param {number|string} color - color en formato hexadecimal (0x...)
     * @param {number} transparencia - nivel de alfa (0.0 - 1.0)
     * @returns {Phaser.GameObjects.Rectangle} la capa creada
     */
    crearCapa(fila, col, color, transparencia) {
        const x = col * this.tamCasilla + this.tamCasilla / 2;
        const y = fila * this.tamCasilla + this.tamCasilla / 2;
        const capa = this.escena.add.rectangle(x, y, this.tamCasilla, this.tamCasilla, color, transparencia);
        return capa;
    }

    /**
     * Limpia todas las capas coloreadas del tablero.
     */
    limpiarCapas() {
        this.casillasPintadas.forEach(o => o.destroy());
        this.casillasPintadas = [];
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
     * Resetea las casillas coloreadas y elimina la selección actual.
     * Restaura el estilo por defecto de las casillas afectadas.
     */
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
    }

    /**
     * Confirma un ataque entre la pieza seleccionada y la celda objetivo.
     * @param {number} fila - fila de la celda objetivo
     * @param {number} columna - columna de la celda objetivo
     * @param {Celda} celdaSeleccionada - celda de la pieza atacante
     */
    confirmarAtaque(fila, columna, celdaSeleccionada) {

        let casillaAtacante = this.tablero.getCelda(celdaSeleccionada.fila, celdaSeleccionada.columna);
        let casillaDefensa = this.tablero.getCelda(fila, columna);
        let atacante = casillaAtacante.getPieza().getJugador();
        let defensa = casillaDefensa.getPieza().getJugador();
        let atacantePieza = this.tablero.getCelda(celdaSeleccionada.fila, celdaSeleccionada.columna).getPieza().getTipo();
        let defensaPieza = this.tablero.getCelda(fila, columna).getPieza().getTipo();
        this.PanelLateral.updateInfo(defensaPieza, atacantePieza, atacante, defensa, "Atacar", casillaAtacante, casillaDefensa);
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
    }

    /**
     * Borra el fragmento de mapa renderizado en una celda y actualiza contadores.
     * @param {number} fila - fila de la celda
     * @param {number} col - columna de la celda
     * @param {string} jugadorAnterior - 'J1' o 'J2' que había conquistado la casilla
     */
    borrarFragmentoMapa(fila, col, jugadorAnterior) {
        // Verificar que existe imagen
        if (!this.graficos[fila][col].imagen) return;

        // Destruir la imagen del mapa
        this.graficos[fila][col].imagen.destroy();
        this.graficos[fila][col].imagen = null;
        this.tablero.borrarCelda(jugadorAnterior);
    }

    /**
     * Colorea una celda específica con un color dado y nivel de alfa.
     * @param {number} fila - fila de la celda
     * @param {number} col - columna de la celda
     * @param {number|string} color 
     * @param {number} alpha 
     */
    coloreaCelda(fila, col, color, alpha = 0.45) {
        const capa = this.crearCapa(fila, col, color, alpha);
        capa.setDepth(9); // Solo aquí usamos setDepth
        this.casillasEventos.push({ capa, fila, col });
    }

    /**
     * Limpia los eventos gráficos asociados a las casillas.
     */
    limpiarEventos() {
        this.casillasEventos.forEach(obj => obj.capa.destroy());
        this.casillasEventos = [];
    }

    /**
     * Resetea el estado del tablero gráfico.
     * Desactiva movimientos y selecciones actuales.
     */
    restTablero() {
        this.moviendoPieza = false;
        this.movimientoIniciado = false;

        this.limpiarTablero();
        this.celdaSeleccionada = null;
    }

    /**
     * Desactiva la interactividad de todas las casillas del tablero.
     */
    desactivarTablero() {
        for (let fila = 0; fila < this.tablero.filas; fila++) {
            for (let col = 0; col < this.tablero.columnas; col++) {
                this.graficos[fila][col].disableInteractive();
            }
        }
    }
}

export default TableroGrafico;