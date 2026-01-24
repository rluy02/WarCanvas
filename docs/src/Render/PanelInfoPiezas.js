import { Sfx } from "../AudioManager/Sfx.js";

/**
 * Gestiona el panel lateral de información.
 * @class
 * @memberof Render
 */
class PanelInfoPiezas {
    /**
     * Constructor del panel de información de piezas
     * @param {Phaser.Scene} escena - Escena de Phaser donde se mostrará el panel
     * @example
     * // Crear un nuevo panel de información de piezas
     * const panelInfo = new PanelInfoPiezas(escena);
     */
    constructor(escena) {
        this.escena = escena;
        this.elementos = [];
        this.forceClose = false;
    }

    /**
     * Crear el panel de información de piezas
     */
    crearPanel() {
        const width = this.escena.scale.width;
        const height = this.escena.scale.height;

        // Fondo oscuro
        const overlay = this.escena.add.rectangle(
            0, 0,
            this.escena.cameras.main.width,
            this.escena.cameras.main.height,
            0x000000
        ).setOrigin(0).setDepth(100).setAlpha(0.5);
        this.elementos.push(overlay);

        const margen = 0.9;
        this.esquinaPanel = { x: width * (1 - margen), y: height * (1 - margen) };
        let panelFondo = this.escena.add.rectangle(width / 2, height / 2, width * margen, height * margen, 0x2c3e50, 1).setStrokeStyle(3, 0xe74c3c);
        panelFondo.setDepth(1000);
        this.elementos.push(panelFondo);

        // TEXTOS
        this.crearTexto("PIEZAS", 42, '#FFFFFF', 'bold', { x: 5, y: 5 });
        this.crearTexto("Soldado", 30, '#FFFFFF', 'bold', { x: 10, y: 130 });
        this.crearTexto("Caballeria", 30, '#FFFFFF', 'bold', { x: 10, y: 230 });
        this.crearTexto("Comandante", 30, '#FFFFFF', 'bold', { x: 10, y: 330 });
        this.crearTexto("Artilleria", 30, '#FFFFFF', 'bold', { x: 10, y: 430 });

        this.crearTexto("Bonus Ataque", 30, '#d03232ff', 'bold', { x: 160, y: 60 });
        this.crearTexto("Bonus Defensa", 30, '#44d032ff', 'bold', { x: 440, y: 60 });

        this.crearTexto("+1", 30, '#ff0000ff', 'bold', { x: 240, y: 130 });
        this.crearTexto("+1", 30, '#00ff26ff', 'bold', { x: 510, y: 130 });

        this.crearTexto("+2", 30, '#ff0000ff', 'bold', { x: 240, y: 230 });
        this.crearTexto("+0", 30, '#00ff26ff', 'bold', { x: 510, y: 230 });

        this.crearTexto("+3", 30, '#ff0000ff', 'bold', { x: 240, y: 330 });
        this.crearTexto("+5", 30, '#00ff26ff', 'bold', { x: 510, y: 330 });

        this.crearTexto("NO", 30, '#ff0000ff', 'bold', { x: 240, y: 430 });
        this.crearTexto("+0", 30, '#00ff26ff', 'bold', { x: 510, y: 430 });

        let cerrarBoton = this.escena.add.text(width - this.esquinaPanel.x + 5, this.esquinaPanel.y - 10, 'X', { // Título
            fontSize: '32px',
            fontFamily: 'Kotton',
            fontStyle: 'bold',
            fill: '#ff0000ff'
        }).setInteractive({ useHandCursor: true })

        cerrarBoton.on('pointerdown', () => {
            Sfx.click();
            this.cerrarPanel();
        })

        cerrarBoton.on('pointerover', () => {
            cerrarBoton.setColor('#ffffffff');
        })

        cerrarBoton.on('pointerout', () => {
            cerrarBoton.setColor('#ff0000ff');
        })

        cerrarBoton.setDepth(1000);

        this.elementos.push(cerrarBoton);

        // IMAGENES
        this.cargarImagen('peon', { x: 710, y: 140 }, 0.12);
        this.cargarImagen('caballeria', { x: 710, y: 240 }, 0.04);
        this.cargarImagen('comandante', { x: 710, y: 340 }, 0.1);
        this.cargarImagen('artilleria', { x: 710, y: 440 }, 0.15);

        this.cerrarPanel();
    }

    /**
     * Crear un texto en el panel
     * @param {string} texto - El texto a mostrar
     * @param {number} size - Tamaño del texto
     * @param {string|number} color - Color del texto
     * @param {string} style - Estilo del texto (normal, bold, etc.)
     * @param {{x:number, y:number}} pos - Posición relativa dentro del panel
     * @example
     * // Crear un texto en el panel
     * crearTexto("Hola Mundo", 24, '#FFFFFF', 'bold', {x: 10, y: 10});
     */
    crearTexto(texto, size, color, style, pos) {
        let text = this.escena.add.text(this.esquinaPanel.x + pos.x, this.esquinaPanel.y + pos.y, texto, {
            fontSize: size,
            fontFamily: 'Kotton',
            fontStyle: style,
            fill: color,
        });

        text.setDepth(1000);
        this.elementos.push(text);
    }

    /**
     * Cargar una imagen en el panel
     * @param {string} sprite - Nombre del sprite a cargar
     * @param {{x:number, y:number}} pos - Posición relativa dentro del panel
     * @param {number} size - Escala de la imagen
     * @example
     * // Cargar una imagen en el panel
     * cargarImagen('miSprite', {x: 50, y: 50}, 0.5);
     */
    cargarImagen(sprite, pos, size) {
        let img = this.escena.add.sprite(this.esquinaPanel.x + pos.x, this.esquinaPanel.y + pos.y, sprite);
        img.setScale(size);
        img.setDepth(1000);
        this.elementos.push(img);
    }

    /**
     * Cerrar el panel de información de piezas
     */
    cerrarPanel() {
        for (let obj of this.elementos) {
            if (obj.active) {
                obj.setActive(false);
                obj.setVisible(false);
            }
        }

    }

    /**
     * Abrir el panel de información de piezas
     */
    abrirPanel() {
        if (!this.forceClose) { //para evitar que se pueda abrir tras terminar la partida
            for (let obj of this.elementos) {
                obj.setActive(true);
                obj.setVisible(true);
            }
        }
    }

    /**
     * Cerrar y bloquear el panel de información de piezas
     */
    cerrarYbloquearPanel() {
        // Cerrar panel si estaba abierto
        this.cerrarPanel();
        this.forceClose = true;
    }
}

export default PanelInfoPiezas;