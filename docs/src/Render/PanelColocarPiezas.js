import { Eventos } from "../Events.js";
import { EventBus } from "../EventBus.js";
import Equipo from "../Logica/Equipo.js";
import { Sfx } from "../AudioManager/Sfx.js";

/**
 * Panel para colocar piezas antes de iniciar la partida.
 * Muestra contadores, botones y controla la interacción para posicionar piezas.
 * @class PanelColocarPiezas
 * @memberof Render
 */
class PanelColocarPiezas {
    /**
     * Constructor del panel de colocación de piezas.
     * @param {Phaser.Scene} escena - escena de Phaser donde se renderiza el panel
     * @param {Tablero} tablero - lógica del tablero
     * @param {TableroGrafico} tableroGrafico - representación gráfica del tablero
     * @param {Equipo} equipo1 - primer equipo (J1)
     * @param {Equipo} equipo2 - segundo equipo (J2)
     * @constructor
     */
    constructor(escena, tablero, tableroGrafico, equipo1, equipo2, panelEventos) {
        this.escena = escena;
        this.tablero = tablero;
        this.tableroGrafico = tableroGrafico;
        this.equipo1 = equipo1;
        this.equipo2 = equipo2;

        this.piezaSeleccionada = null;

        this.panelEventos = panelEventos;

        this.equipoActual = equipo1;
        this.create();
    }

    /**
     * Crea y posiciona los elementos visuales del panel (textos, imágenes y botones).
     */
    create() {
        const width = this.escena.scale.width;
        const height = this.escena.scale.height;

        const sideWidth = 355; // Tamaño del panel
        this.escena.add.rectangle(width - (sideWidth / 2), height / 2, sideWidth, height, 0xd4b37c);

        // Elementos del Panel
        this.titleText = this.createText(width - sideWidth + 20, 40, 'INICIO', 300, 'bold', '32px', 0.0);
        this.titleEquipo = this.createText(width - sideWidth + 20, 80, 'J1', 300, 'bold', '24px', 0.0);
        this.infoText = this.createText(width - sideWidth + 20, 120, 'Pulsa sobre las piezas para posicionarlas', 300, ' ', '18px', 0.0);

        this.Soldados = this.createText(width - sideWidth + 100, 200, 'Soldados', 300, ' ', '20px', 0.0,);
        this.Caballeria = this.createText(width - sideWidth + 100, 275, 'Caballeria', 300, ' ', '20px', 0.0);
        this.Artilleria = this.createText(width - sideWidth + 100, 350, 'Artilleria', 300, ' ', '20px', 0.0);
        this.Comandante = this.createText(width - sideWidth + 100, 425, 'Comandante', 300, ' ', '20px', 0.0);

        // IMAGENES
        this.soldadoImg = this.cargarImagen('peon', width - sideWidth + 50, 200, 50, 'Soldado', this.Soldados);
        this.caballeriaImg = this.cargarImagen('caballeria', width - sideWidth + 50, 275, 200, 'Caballeria', this.Caballeria);
        if (this.equipoActual === this.equipo2) {
            this.caballeriaImg.setDisplaySize(200, 200); // tamaño más grande solo para este caso
        } else {
            this.caballeriaImg.setDisplaySize(50, 50); // tamaño normal
        }
        this.artilleriaImg = this.cargarImagen('artilleria', width - sideWidth + 50, 350, 50, 'Artilleria', this.Artilleria);
        this.comandanteImg = this.cargarImagen('comandante', width - sideWidth + 50, 425, 50, 'Comandante', this.Comandante);

        this.SoldadosNum = this.createText(width - sideWidth / 2 + 80, 200, '+' + this.equipoActual.getNumSoldados(), 300, ' ', '24px', 0.0);
        this.CaballeriaNum = this.createText(width - sideWidth / 2 + 80, 275, '+' + this.equipoActual.getNumCaballerias(), 300, ' ', '24px', 0.0);
        this.ArtilleriaNum = this.createText(width - sideWidth / 2 + 80, 350, '+' + this.equipoActual.getNumArtillerias(), 300, ' ', '24px', 0.0);
        this.ComandanteNum = this.createText(width - sideWidth / 2 + 80, 425, '+' + this.equipoActual.getNumComandantes(), 300, ' ', '24px', 0.0);

        this.buttonTry = this.createText(width - sideWidth / 2, 520, 'Iniciar', 0, ' ', '32px', 0.5, '#ffffffff');
        this.buttonTry.setInteractive({ useHandCursor: true });

        this.buttonTry.on('pointerdown', () => {
            Sfx.click();
            if (this.panelEventos.getInput()) {
                this.escena.cambiarEscena();
            }
        });
        this.buttonTry.on('pointerover', () => {
            this.buttonTry.setColor('rgb(0, 0, 0)');
        });

        this.buttonTry.on('pointerout', () => {
            this.buttonTry.setColor('#ffffffff');
        });

        this.buttonChange = this.createText(width - sideWidth / 2, 490, 'Cambiar de equipo', 0, ' ', '24px', 0.5, '#ff0000ff');
        this.buttonChange.setInteractive({ useHandCursor: true });

        this.buttonChange.on('pointerdown', () => {
            Sfx.play('interactuar', { volume: 0.3 });//
            if (this.panelEventos.getInput()) this.cambiarEquipos();
        });
        this.buttonChange.on('pointerover', () => {
            this.buttonChange.setColor('rgb(168, 23, 23)');
        });

        this.buttonChange.on('pointerout', () => {
            this.buttonChange.setColor('#ff0000ff');
        });


        this.buttonCheat = this.createText(width - sideWidth / 2, 550, '(Pulsar para no poner todas las piezas)', 0, ' ', '16px', 0.5, '#ffffffff');
        this.buttonCheat.setInteractive({ useHandCursor: true });

        this.buttonCheat.on('pointerover', () => {
            this.buttonCheat.setColor('#7b7b7bff');
        });

        this.buttonCheat.on('pointerout', () => {
            this.buttonCheat.setColor('#ffffff');
        });

        this.buttonCheat.on('pointerdown', () => {
            //No hace falta sonido porque siempre come (ademas que se solapa)
            if (this.panelEventos.getInput()) {
                this.buttonCheat.setColor('#000000');
                this.escena.Cheat();
            }
        });

        EventBus.on(Eventos.PIECE_POSITION, (pieza) => {
            this.piezaPosicionada(); // Emit en ElegirPieza Tablero
        });
        EventBus.on(Eventos.PIECE_DELETE, (pieza) => {
            this.piezaPosicionada(); // Emit en ElegirPieza Tablero
        });

    }

    /**
     * Crea un objeto de texto en la escena con las propiedades especificadas.
     * @param {number} width - posición X del texto
     * @param {number} height - posición Y del texto
     * @param {string} text - contenido del texto
     * @param {number} wordWrapWidth - ancho para ajuste de líneas
     * @param {string} fontStyle - estilo de fuente
     * @param {string|number} px - tamaño de fuente (píxeles)
     * @param {number} origin - origen horizontal (0-1)
     * @param {string} [fill='#ffffffff'] - color de relleno en formato RGBA
     * @returns {Phaser.GameObjects.Text} objeto de texto creado
     */
    createText(width, height, text, wordWrapWidth, fontStyle, px, origin, fill = '#ffffffff') {
        return this.escena.add.text(width, height, text, { // Equipo que defiende
            fontSize: px,
            fontFamily: 'Kotton',
            fontStyle: fontStyle,
            fill: fill,
            wordWrap: { width: wordWrapWidth, useAdvancedWrap: true }
        }).setOrigin(origin, 0.5);
    }

    /**
     * Carga y configura un sprite como botón interactivo para seleccionar tipo de pieza.
     * @param {string} sprite - clave del sprite cargado en la escena
     * @param {number} x - posición X del sprite
     * @param {number} y - posición Y del sprite
     * @param {number} size - escala del sprite
     * @param {string} tipo - tipo de pieza asociado (p.ej. 'Soldado')
     * @param {Phaser.GameObjects.Text} texto - texto que muestra el contador asociado
     * @returns {Phaser.GameObjects.Sprite} sprite interactivo creado
     */
    cargarImagen(sprite, x, y, size, tipo, texto) {
        let img = this.escena.add.sprite(x, y, sprite);
        // const factor = Math.min(size / img.width, size / img.height, 1);
        // img.setScale(factor);
        img.setDisplaySize(size, size);
        img.setOrigin(0.5, 0.5);
        img.setInteractive();
        console.log(img)

        img.on('pointerdown', () => {
            if (this.panelEventos.getInput()) {
                if (this.piezaSeleccionada) this.piezaSeleccionada.setColor('#ffffffff');
                this.piezaSeleccionada = texto;
                this.pintarCasillas();
                this.tablero.setTipo(tipo);
                texto.setColor('#000000ff');
            }
        })

        return img;
    }

    /**
     * Solicita al tablero gráfico que coloree las casillas según el tipo seleccionado.
     */
    pintarCasillas() {
        this.tableroGrafico.colorearRango();
    }

    /**
     * Actualiza los contadores numéricos en el panel cuando una pieza es posicionada o eliminada.
     */
    piezaPosicionada() {
        this.SoldadosNum.setText(`+${this.equipoActual.getNumSoldados()}`);
        this.CaballeriaNum.setText(`+${this.equipoActual.getNumCaballerias()}`);
        this.ArtilleriaNum.setText(`+${this.equipoActual.getNumArtillerias()}`);
        this.ComandanteNum.setText(`+${this.equipoActual.getNumComandantes()}`);
    }

    /**
     * Actualiza las texturas de los sprites del panel según el equipo activo.
     */
    cambiarImagenes() {
        // IMAGENES
        if (this.equipoActual === this.equipo2) {
            this.soldadoImg.setTexture('peon2');
            this.caballeriaImg.setTexture('caballeria2');
            this.caballeriaImg.setDisplaySize(100, 100); //por alguna razon a pesar de que todas las img son 800x800 he de forzar su tamaño
            this.artilleriaImg.setTexture('artilleria2');
            this.comandanteImg.setTexture('comandante2');
        }
        else {
            this.soldadoImg.setTexture('peon');
            this.caballeriaImg.setTexture('caballeria');
            this.caballeriaImg.setDisplaySize(50, 50);
            this.artilleriaImg.setTexture('artilleria');
            this.comandanteImg.setTexture('comandante');
        }
    }

    /**
     * Cambia el equipo actual que está posicionando piezas y actualiza la UI.
     */
    cambiarEquipos() {
        this.equipoActual = (this.equipoActual === this.equipo1) ? this.equipo2 : this.equipo1;
        this.titleEquipo.setText(this.equipoActual.getNombre());
        this.piezaPosicionada();
        this.cambiarImagenes();

        EventBus.emit(Eventos.CHANGE_TEAM_SET_PIECES, this.equipoActual); // On ElegirPiezaEscena - Inicio

    }
}

export default PanelColocarPiezas;