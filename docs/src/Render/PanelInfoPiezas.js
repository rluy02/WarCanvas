export default class PanelInfoPiezas {
    constructor(escena) {
        this.escena = escena;
        this.elementos = [];
    }

    crearPanel() {
        const width = this.escena.scale.width;
        const height = this.escena.scale.height;

        const margen = 0.9;
        this.esquinaPanel = { x: width * (1 - margen), y: height * (1 - margen) };
        let panelFondo = this.escena.add.rectangle(width / 2, height / 2, width * margen, height * margen, 0x222222, 0.95);
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
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fill: '#ff0000ff'
        }).setInteractive({ useHandCursor: true })

        cerrarBoton.on('pointerdown', () => {
            this.cerrarPanel();
        })

        cerrarBoton.on('pointerover', () => {
            cerrarBoton.setColor('#ffffffff');
        })

        cerrarBoton.on('pointerout', () => {
            cerrarBoton.setColor('#ff0000ff');
        })

        this.elementos.push(cerrarBoton);

        // IMAGENES
        this.cargarImagen('peon', {x: 710, y: 140}, 0.12);
        this.cargarImagen('caballeria', {x: 710, y: 240}, 0.04);
        this.cargarImagen('comandante', {x: 710, y: 340}, 0.1);
        this.cargarImagen('artilleria', {x: 710, y: 440}, 0.15);

        this.cerrarPanel();
    }

    crearTexto(texto, size, color, style, pos) {
        let text = this.escena.add.text(this.esquinaPanel.x + pos.x, this.esquinaPanel.y + pos.y, texto, {
            fontSize: size,
            fontFamily: 'Arial',
            fontStyle: style,
            fill: color,
        });

        this.elementos.push(text);
    }

    cargarImagen(sprite, pos, size){
        let img = this.escena.add.sprite(this.esquinaPanel.x + pos.x, this.esquinaPanel.y + pos.y, sprite);
        img.setScale(size);
        this.elementos.push(img);
    }

    cerrarPanel(){
        for (let obj of this.elementos){
            obj.setActive(false);
            obj.setVisible(false);
        }
    }

    abrirPanel(){
        for (let obj of this.elementos){
            obj.setActive(true);
            obj.setVisible(true);
        }
    }
}