import { Eventos } from "../Events.js";
import { EventBus } from "../EventBus.js";
import Equipo from "../Logica/Equipo.js";


export default class PanelColocarPiezas {
    constructor(escena, tablero, tableroGrafico, equipo1, equipo2) {
        this.escena = escena;
        this.tablero = tablero;
        this.tableroGrafico = tableroGrafico;
        this.equipo1 = equipo1;
        this.equipo2 = equipo2;

        this.piezaSeleccionada = null;

        this.equipoActual = equipo1;
        this.create();
    }

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
        this.Caballeria = this.createText(width - sideWidth + 100, 250, 'Caballeria', 300, ' ', '20px', 0.0);
        this.Artilleria = this.createText(width - sideWidth + 100, 300, 'Artilleria', 300, ' ', '20px', 0.0);
        this.Comandante = this.createText(width - sideWidth + 100, 350, 'Comandante', 300, ' ', '20px', 0.0);

        // IMAGENES
        this.soldadoImg = this.cargarImagen('peon', width - sideWidth + 50, 200, 0.07, 'Soldado', this.Soldados);
        this.caballeriaImg = this.cargarImagen('caballeria',width - sideWidth + 50, 250, 0.028, 'Caballeria', this.Caballeria);
        this.artilleriaImg = this.cargarImagen('artilleria', width - sideWidth + 50, 300, 0.105, 'Artilleria', this.Artilleria);
        this.comandanteImg = this.cargarImagen('comandante', width - sideWidth + 50, 350, 0.07, 'Comandante', this.Comandante);

        this.SoldadosNum = this.createText(width - sideWidth / 2 + 80, 200, '+' + this.equipoActual.getSoldados(), 300, ' ', '24px', 0.0);
        this.CaballeriaNum = this.createText(width - sideWidth / 2 + 80, 250, '+' + this.equipoActual.getCaballeria(), 300, ' ', '24px', 0.0);
        this.ArtilleriaNum = this.createText(width - sideWidth / 2 + 80, 300, '+' + this.equipoActual.getArtilleria(), 300, ' ', '24px', 0.0);
        this.ComandanteNum = this.createText(width - sideWidth / 2 + 80, 350, '+' + this.equipoActual.getComandante(), 300, ' ', '24px', 0.0);

        this.buttonTry = this.createText(width - sideWidth / 2, 500, 'Iniciar', 0, ' ', '32px', 0.5, '#ffffffff');
        this.buttonTry.setInteractive({ useHandCursor: true });

        this.buttonTry.on('pointerdown', () => {
            this.escena.cambiarEscena();
        });

        this.buttonChange = this.createText(width - sideWidth / 2, 450, 'Cambiar de equipo', 0, ' ', '24px', 0.5, '#ff0000ff');
        this.buttonChange.setInteractive({ useHandCursor: true });

        this.buttonChange.on('pointerdown', () => {
            this.cambiarEquipos();
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
            this.buttonCheat.setColor('#000000');
            this.escena.Cheat();
        });

        EventBus.on(Eventos.PIECE_POSITION, (pieza) => {
            this.piezaPosicionada(); // Emit en ElegirPieza Tablero
        });
        EventBus.on(Eventos.PIECE_DELETE, (pieza) => {
            this.piezaPosicionada(); // Emit en ElegirPieza Tablero
        });

    }

    createText(width, height, text, wordWrapWidth, fontStyle, px, origin, fill = '#ffffffff') { 
        return this.escena.add.text(width, height, text, { // Equipo que defiende
            fontSize: px,
            fontFamily: 'Arial',
            fontStyle: fontStyle,
            fill: fill,
            wordWrap: { width: wordWrapWidth, useAdvancedWrap: true } 
        }).setOrigin(origin, 0.5);
    }

    cargarImagen(sprite, x, y, size, tipo, texto){
        let img = this.escena.add.sprite(x, y, sprite);
        img.setScale(size);
        img.setOrigin(0.5, 0.5);
        img.setInteractive();

        img.on('pointerdown', () => {
            if(this.piezaSeleccionada)this.piezaSeleccionada.setColor('#ffffffff');
            this.piezaSeleccionada = texto;
            this.pintarCasillas();
            this.tablero.setTipo(tipo);
            texto.setColor('#000000ff');
        })

        return img;
    }

    pintarCasillas(){
        this.tableroGrafico.colorearRango();
    }
    piezaPosicionada(){
        this.SoldadosNum.setText(`+${this.equipoActual.getSoldados()}`);
        this.CaballeriaNum.setText(`+${this.equipoActual.getCaballeria()}`);
        this.ArtilleriaNum.setText(`+${this.equipoActual.getArtilleria()}`);
        this.ComandanteNum.setText(`+${this.equipoActual.getComandante()}`);
    }

    cambiarImagenes() {
         // IMAGENES
        if(this.equipoActual === this.equipo2){
        this.soldadoImg.setTexture('peon2');
        this.caballeriaImg.setTexture('caballeria2');
        this.artilleriaImg.setTexture('artilleria2');
        this.comandanteImg.setTexture('comandante2');}
        else {
        this.soldadoImg.setTexture('peon');
        this.caballeriaImg.setTexture('caballeria');
        this.artilleriaImg.setTexture('artilleria');
        this.comandanteImg.setTexture('comandante');
        }
    }

    // Cambia el equipo que está colocando sus piezas
    cambiarEquipos(){
        this.equipoActual = (this.equipoActual === this.equipo1) ? this.equipo2 : this.equipo1;
        this.titleEquipo.setText(this.equipoActual.getNombre());
        this.piezaPosicionada();
        this.cambiarImagenes();
        
        EventBus.emit(Eventos.CHANGE_TEAM_SET_PIECES, this.equipoActual); // On ElegirPiezaEscena - Inicio

    }

}