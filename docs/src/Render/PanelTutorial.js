import { Eventos } from "../Events.js";
import { EventBus } from "../EventBus.js";
import Equipo from "../Logica/Equipo.js";

/**
 * Panel para el tutorial. Explicar el movimiento y ataque de las piezas
 * Muestra contadores, botones y controla la interacción para posicionar piezas.
 * @class PanelColocarPiezas
 * @memberof Render
 */
class PanelTutorial {
    /**
     * Constructor del panel del tutorial.
     * @param {Phaser.Scene} escena - escena de Phaser donde se renderiza el panel
     * @param {Tablero} tablero - lógica del tablero
     * @param {TableroGrafico} tableroGrafico - representación gráfica del tablero
     * @constructor
     */
    constructor(escena, tablero, tableroGrafico) {
        this.escena = escena;
        this.tablero = tablero;
        this.tableroGrafico = tableroGrafico;
        this.piezaSeleccionada; // Pieza actualmente seleccionada
        this.piezaTutorial; // Pieza sobre la que se realiza el tutorial
        this.fase; // Fase del tutorial
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
        this.titleText = this.createText(width - sideWidth + 20, 40, 'TUTORIAL', 300, 'bold', '32px', 0.0);
        this.infoText = this.createText(width - sideWidth + 20, 80, 'Pulsa sobre las piezas para aprender como moverlas', 300, ' ', '18px', 0.0);

        this.Soldados = this.createText(width - sideWidth + 100, 150, 'Soldados', 300, ' ', '20px', 0.0,);
        this.Caballeria = this.createText(width - sideWidth + 100, 200, 'Caballeria', 300, ' ', '20px', 0.0);
        this.Artilleria = this.createText(width - sideWidth + 100, 250, 'Artilleria', 300, ' ', '20px', 0.0);
        this.Comandante = this.createText(width - sideWidth + 100, 300, 'Comandante', 300, ' ', '20px', 0.0);

        // IMAGENES
        this.soldadoImg = this.cargarImagen('peon', width - sideWidth + 50, 150, 0.06, 'Soldado', this.Soldados);
        this.caballeriaImg = this.cargarImagen('caballeria',width - sideWidth + 50, 200, 0.028, 'Caballeria', this.Caballeria);
        this.artilleriaImg = this.cargarImagen('artilleria', width - sideWidth + 50, 250, 0.06, 'Artilleria', this.Artilleria);
        this.comandanteImg = this.cargarImagen('comandante', width - sideWidth + 50, 300, 0.06, 'Comandante', this.Comandante);


        this.dialogo = this.cargarImagen('dialogo', width - sideWidth/2, height- 150, 0.9, 'nofunc', null);
        this.dialogoPersonaje = this.cargarImagen('comandante', width - sideWidth + 50, height- 70, 0.2, 'nofunc', this.Comandante);
        this.dialogoText = this.createText(width - sideWidth/2, height- 150, 'Soldados', 180, ' ', '20px', 0.5, '#000000ff');
        this.dialogo.visible = false;
        this.dialogoPersonaje.visible = false;
        this.dialogoText.visible = false;

        this.dialogoNext = this.createText(width - sideWidth/2, height - 70, 'Siguiente >', 300, ' ', '14px', 0.5, '#000000ff');
        this.dialogoNext.setInteractive({ useHandCursor: true });
        this.dialogoNext.on('pointerdown', () => {
            this.tutorial(this.piezaSeleccionada);
        });
        this.dialogoNext.visible = false;
        

        this.buttonTry = this.createText(width - sideWidth - 180, height-50, 'Saltar Tutorial', 0, ' ', '24px', 0, '#ffffffff');
        this.buttonTry.setInteractive({ useHandCursor: true });

        this.buttonTry.on('pointerdown', () => {
            this.escena.cambiarEscena();
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
    cargarImagen(sprite, x, y, size, tipo, texto){
        let img = this.escena.add.sprite(x, y, sprite);
        img.setScale(size);
        img.setOrigin(0.5, 0.5);
        img.setInteractive();

        img.on('pointerdown', () => {
            if(!(tipo == 'nofunc')){
            if(this.piezaSeleccionada)this.piezaSeleccionada.setColor('#ffffffff');
            this.piezaSeleccionada = texto;
            this.mostrarDialogo(tipo);
            this.tablero.setTipo(tipo);
            texto.setColor('#000000ff');
            this.tablero.eliminarTodasLasPiezas();
            this.tableroGrafico.limpiarTablero();
             this.tableroGrafico.limpiarMapas();
        }
        })

        return img;
    }

    /**
     * @param {string} tipo - clave de la pieza que ha sido seleccionada 
     * Actualiza el dialogo en funcion de la pieza seleccionada
     */
    mostrarDialogo(tipo){
        this.dialogoText.setText('Empieza el tutorial de: ' + tipo);
        this.dialogo.visible = true;
        this.dialogoPersonaje.visible = true;
        this.dialogoText.visible = true;
        this.dialogoNext.visible = true;
        this.fase = 0;
    }
    /**
     * @param {string} sprite - clave de la pieza que ha sido seleccionada 
     * Actualiza el dialogo en funcion de la pieza seleccionada
     */
    tutorial(tipo){
        if(this.fase === 0){
        this.tableroGrafico.limpiarTablero();
        this.piezaTutorial = this.tablero.generarPieza(2, 2);
        this.fase++;
    }

        if (tipo === this.Soldados) this.tutorialSoldado();
        if (tipo == this.Artilleria) this.tutorialArtilleria();
        if (tipo == this.Comandante) this.tutorialComandante();
        if (tipo == this.Caballeria) this.tutorialCaballo();
    }

    /**
     * Tutorial especifico del soldado
     */
    tutorialSoldado(){
        this.dialogo.visible = true;
        this.dialogoPersonaje.visible = true;
        this.dialogoText.visible = true;
        if(this.fase === 1) {this.dialogoText.setText('Los soldados se mueven en cruz. Pulsa el soldado para ver las posibilidades de movimiento');}
        if(this.fase === 2) {this.dialogoText.setText('Pulsa una casilla de movimiento para mover la pieza');}
        if(this.fase === 3) {this.dialogoText.setText('Cuando te muevas a una casilla vacia, ¡enhorabuena!, acabas de conquistar parte del terreno de juego');}
        if(this.fase === 4) {this.dialogoText.setText('Las casillas conquistadas se pintarán con el mapa de tu equipo');}
        if(this.fase === 6) {this.dialogoText.setText('Si conquistas un 80% del terreno de juego, ganarás la partida');}
        if(this.fase === 7) {this.dialogoText.setText('En su turno, el soldado tiene 2 acciones posibles, ¡combinalas bien!');}
        if(this.fase === 8) 
        {this.dialogoText.setText('Cuando tengas una pieza enemiga para atacar a tu alcance, se marcará en rojo');
            this.tablero.generarPiezaEnemiga(this.piezaTutorial.fil, this.piezaTutorial.col, 'Soldado');
        }
        if(this.fase === 9) {this.dialogoText.setText('Al pulsar sobre la pieza enemiga, podrás decidir si quieres realizar el combate');};
        if(this.fase === 10) {this.dialogoText.setText('En el panel lateral, se mostrará la información del combate');};
        if(this.fase === 11) {this.dialogoText.setText('Recuerda, para ganar un combate, necesitarás que los dados esten de tu parte.');};
        if(this.fase === 12) {this.dialogoText.setText('Si ganas el combate, además de eliminar la pieza enemiga, conquistarás su casilla');}
        if(this.fase === 13) {this.dialogoText.setText('Tu tirada, más el bonus de tu pieza deben sumar más que tu ememigo');};
        if(this.fase === 14) {this.dialogoText.setText('El bonus del soldado es +1 en el ataque y +1 en la defensa');};
        if(this.fase === 15) {this.dialogoText.setText('Ya sabes como atacar con los soldados, ¡no te olvides del resto de piezas!');};
        if(this.fase === 16){
            this.dialogoText.setText('Pulsa otra pieza para realizar el tutorial');
            this.dialogoNext.visible = false;
        }

        //this.tablero.generarPieza(2, 2);
        this.fase++;
    }

    /**
     * Tutorial específico del caballo
     */
    tutorialCaballo(){
        this.dialogo.visible = true;
        this.dialogoPersonaje.visible = true;
        this.dialogoText.visible = true;
        if(this.fase === 1) {this.dialogoText.setText('Los caballos se mueven en cruz, ¡y pueden saltar piezas!');}
        if(this.fase === 2) {this.dialogoText.setText('Pulsa el caballo para ver las posibilidades de movimiento');}
        if(this.fase === 3) {this.dialogoText.setText('Pulsa una casilla de movimiento para mover la pieza');}
        if(this.fase === 4) {this.dialogoText.setText('En su turno, el caballo tiene 3 acciones posibles, ¡combinalas bien!');}
        if(this.fase === 5) 
        {this.dialogoText.setText('Cuando tengas una pieza cerca, podrás saltarla');
            this.tablero.generarPiezaEnemiga(this.piezaTutorial.fil, this.piezaTutorial.col, 'Caballeria');
        }
        if(this.fase === 6) {this.dialogoText.setText('Al pulsar sobre la pieza enemiga, podrás decidir si quieres realizar el combate');};
        if(this.fase === 7) {this.dialogoText.setText('En el panel lateral, se mostrará la información del combate');};
        if(this.fase === 8) {this.dialogoText.setText('Recuerda, para ganar un combate, necesitarás que los dados esten de tu parte.');};
        if(this.fase === 9) {this.dialogoText.setText('Tu tirada, más el bonus de tu pieza deben sumar más que tu ememigo');};
        if(this.fase === 10) {this.dialogoText.setText('El bonus del caballo es +2 en el ataque y +0 en la defensa');};
        if(this.fase === 11) {this.dialogoText.setText('Ya sabes como atacar con los caballos, ¡no te olvides del resto de piezas!');};
        if(this.fase === 12){
            this.dialogoText.setText('Pulsa otra pieza para realizar el tutorial');
            this.dialogoNext.visible = false;
        }

        //this.tablero.generarPieza(2, 2);
        this.fase++;
    }

    /**
     * Tutorial específico de la artillería
     */
    tutorialArtilleria(){
        this.dialogo.visible = true;
        this.dialogoPersonaje.visible = true;
        this.dialogoText.visible = true;
        if(this.fase === 1) {this.dialogoText.setText('La artillería es una de las piezas más potentes');}
        if(this.fase === 2) {this.dialogoText.setText('Aunque no puede moverse, puede atacar a un amplio rango del tablero');}
        if(this.fase === 3) {this.dialogoText.setText('Puede atacar todas las casillas en un rango de 4 columnas. Pulsa sobre ella para ver su rango de ataque');};
        if(this.fase === 4) {this.dialogoText.setText('La artilleria puede atacar cualquier casilla dentro de su rango, pero no es muy precisa');};
        if(this.fase === 5) {this.dialogoText.setText('Atacará la casilla seleccionada o alguna de las adyacentes');};
        if(this.fase === 6) {this.dialogoText.setText('Al usar la artillería, no habrá un combate por dados');};
        if(this.fase === 7) 
        {this.dialogoText.setText('Ten cuidado porque podrías atacar alguna de tus piezas');
            this.tablero.generarPiezaEnemigaArtilleria(this.piezaTutorial.fil, this.piezaTutorial.col+2, 'Soldado');
        }
        
        if(this.fase === 8) {this.dialogoText.setText('Una vez que has atacado con la artillería, tendrás que esperar 4 turnos para volver a usarla');};
        if(this.fase === 9) {this.dialogoText.setText('Es importante que protejas la artillería, porque tiene bonus de -1 al defenderse');};
        if(this.fase === 10) {this.dialogoText.setText('Ya sabes como atacar con la artillería, ¡no te olvides del resto de piezas!');};
        if(this.fase === 11){
            this.dialogoText.setText('Pulsa otra pieza para realizar el tutorial');
            this.dialogoNext.visible = false;
        }

        //this.tablero.generarPieza(2, 2);
        this.fase++;
    }

    /**
     * Tutorial específico del comandante
     */
    tutorialComandante(){
        this.dialogo.visible = true;
        this.dialogoPersonaje.visible = true;
        this.dialogoText.visible = true;
        if(this.fase === 1) {this.dialogoText.setText('El comandante es la pieza más importante, debes protegerla porque si se elimina, perderás la partida');}
        if(this.fase === 2) {this.dialogoText.setText('Puede moverse también en diagonal. Pulsa para ver su rango de movimiento');}
        if(this.fase === 3) {this.dialogoText.setText('Pulsa una casilla de movimiento para mover la pieza');}
        if(this.fase === 7) {this.dialogoText.setText('En su turno, el comandante tiene 4 acciones posibles, ¡combinalas bien!');}
        if(this.fase === 8) 
        {this.dialogoText.setText('Cuando tengas una pieza enemiga para atacar a tu alcance, se marcará en rojo');
            this.tablero.generarPiezaEnemiga(this.piezaTutorial.fil, this.piezaTutorial.col, 'Soldado');
        }
        if(this.fase === 9) {this.dialogoText.setText('Al pulsar sobre la pieza enemiga, podrás decidir si quieres realizar el combate');};
        if(this.fase === 10) {this.dialogoText.setText('En el panel lateral, se mostrará la información del combate');};
        if(this.fase === 11) {this.dialogoText.setText('Recuerda, para ganar un combate, necesitarás que los dados esten de tu parte.');};
        if(this.fase === 12) {this.dialogoText.setText('Tu tirada, más el bonus de tu pieza deben sumar más que tu ememigo');};
        if(this.fase === 13) {this.dialogoText.setText('El bonus del comandante es +4 en el ataque y +5 en la defensa');};
        if(this.fase === 14) {this.dialogoText.setText('Ya sabes como atacar con el comandante, ¡utiliza sus habilidades, pero no te olvides de defenderlo!');};
        if(this.fase === 15){
            this.dialogoText.setText('Pulsa otra pieza para realizar el tutorial');
            this.dialogoNext.visible = false;
        }

        //this.tablero.generarPieza(2, 2);
        this.fase++;
    }
}

export default PanelTutorial;