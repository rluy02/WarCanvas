import { Eventos } from "../Events.js";
import { EventBus } from "../EventBus.js";
import { Sfx } from "../AudioManager/Sfx.js";

/**
 * Panel lateral que muestra información y controles relacionados con el combate.
 * @class PanelLateral
 * @memberof Render
 */
class PanelLateral {
    /**
     * Constructor del panel lateral.
     * @param {Phaser.Scene} escena - escena donde se renderiza el panel
     * @param {PanelInfo} panelInfo - panel informativo a abrir desde el lateral
     * @param {Tablero} tablero - lógica del tablero (para cálculos de bonificación)
     */
    constructor(escena, panelInfo, tablero) {
        this.escena = escena;
        this.panelInfo = panelInfo;
        this.tablero = tablero;
        let atacante = null;
        let defensa = null;
        this.create();
    }

    /**
     * Crea los elementos visuales del panel lateral (textos, botones y dados).
     */
    create() {
        const width = this.escena.scale.width;
        const height = this.escena.scale.height - 88;

        const sideWidth = 355; // Tamaño del panel
        this.escena.add.rectangle(width - (sideWidth / 2), height / 2, sideWidth, height, 0xd4b37c);

        // Elementos del Panel
        this.titleText = this.createText(width - sideWidth + 20, 20, 'COMBATE', 300, 'bold', '32px', 0.0);

        this.infoText = this.createText(width - sideWidth + 20, 100, 'Esperando acción...', 300, ' ', '18px', 0.0);

        this.infoTextAttacker = this.createText(width - sideWidth / 2, 200, 'Ataca', 300, ' ', '24px', 0.5);

        this.infoTextDefender = this.createText(width - sideWidth / 2, 300, 'Defiende', 300, ' ', '24px', 0.5);

        //Boton de abrir panel de informacion
        this.btInfo = this.createText(width - 70, 25, 'INFO', 0, 'bold', '22px', 0.0, '#000000ff');
        this.btInfo.setInteractive();


        this.btInfo.on('pointerdown', () => {
            Sfx.click();
            this.panelInfo.abrirPanel();
        })

        this.btInfo.on('pointerover', () => {
            this.btInfo.setColor('#ffffffff');
        })

        this.btInfo.on('pointerout', () => {
            this.btInfo.setColor('#000000ff');
        })

        if (!this.escena.anims.exists('roll')) {
            const frames = [
                { key: 'dice1' },
                { key: 'dice2' },
                { key: 'dice3' },
                { key: 'dice4' },
                { key: 'dice5' },
                { key: 'dice6' }
            ];

            this.escena.anims.create({
                key: 'roll',
                frames: frames,
                frameRate: 10,
                repeat: 3
            });
        }
        this.diceImages = { // Los dos dados de cada equipo
            attacker: [
                this.escena.add.sprite(width - sideWidth / 2 - 40, 250, 'dice0'),
                this.escena.add.sprite(width - sideWidth / 2 + 40, 250, 'dice0')
            ],
            defender: [
                this.escena.add.sprite(width - sideWidth / 2 - 40, 350, 'dice0'),
                this.escena.add.sprite(width - sideWidth / 2 + 40, 350, 'dice0')
            ]
        };

        // Boton de Ataque / defensa

        this.buttonTry = this.createText(width - sideWidth / 2, 430, ' ', 0, ' ', '24px', 0.5, '#ff0000');
        this.buttonTry.disableInteractive();


        this.buttonTry.on('pointerdown', () => {
            // Se lanza el evento de ataque
            this.ataque = true;
            this.diceImages.attacker[0].setTexture(`dice1`);
            this.diceImages.attacker[1].setTexture(`dice2`);
            this.diceImages.defender[0].setTexture(`dice3`);
            this.diceImages.defender[1].setTexture(`dice4`);
            this.diceImages.attacker[0].play('roll');
            this.diceImages.attacker[1].play('roll');
            this.diceImages.defender[0].play('roll');
            this.diceImages.defender[1].play('roll');
        });

        this.buttonTry.on('pointerover', () => {
            this.buttonTry.setColor('#8f0000');
        });
        this.buttonTry.on('pointerout', () => {
            this.buttonTry.setColor('#ff0000');
        });

        // Botón Cheat (+100 bonus)
        this.buttonCheat = this.createText(width - sideWidth / 2, 470, 'CHEAT', 0, ' ', '16px', 0.5, '#523600');
        this.buttonCheat.setVisible(false);
        this.buttonCheat.disableInteractive();

        // Emitirá un ataque especial
        this.buttonCheat.on('pointerdown', () => {
            EventBus.emit(Eventos.ATTACK_CHEAT);
            // Sfx.click(); No hace falta, solapa sonidos
        });

        this.buttonCheat.on('pointerover', () => {
            this.buttonCheat.setColor('#ffffff');
        });
        this.buttonCheat.on('pointerout', () => {
            this.buttonCheat.setColor('#523600');
        });


        this.diceImages.attacker[0].on('animationcomplete', (anim) => {
            if (anim.key === 'roll') {
                if (this.ataque == true)
                    EventBus.emit(Eventos.ATACK); // Se recibe en combate
                this.ataque = false;
            }
        });

        EventBus.on(Eventos.CLEAN_SIDE_PANEL, () => {
            if (this.CombatInfo === false) this.updateInfoEsperandoAccion();
        });
    }

    /**
     * Actualiza el panel con la información resultante del combate.
     * @param {string} mensaje - mensaje descriptivo del combate
     * @param {string} resultado - resultado textual del combate
     * @param {string} atacante - nombre o identificador del atacante
     * @param {string} defensa - nombre o identificador del defensor
     * @param {number} atacanteTirada1 - tirada 1 del atacante
     * @param {number} atacanteTirada2 - tirada 2 del atacante
     * @param {number} defensaTirada1 - tirada 1 del defensor
     * @param {number} defensaTirada2 - tirada 2 del defensor
     * @param {number} bonusAtaca - bonus total del atacante
     * @param {number} bonusDefiende - bonus total del defensor
     */
    updateCombatInfo(mensaje, resultado, atacante, defensa, atacanteTirada1, atacanteTirada2, defensaTirada1, defensaTirada2, bonusAtaca, bonusDefiende) {
        // Actualiza la información del panel
        this.titleText.setText('COMBATE');
        this.infoText.setText(`${mensaje}\n${resultado}`);
        this.infoTextAttacker.setText(`Ataca: ${atacante} = ${atacanteTirada1 + atacanteTirada2 + bonusAtaca} Bonus (${bonusAtaca})`);
        this.infoTextDefender.setText(`Defiende: ${defensa} = ${defensaTirada1 + defensaTirada2 + bonusDefiende} Bonus (${bonusDefiende})`);

        this.diceImages.attacker[0].setTexture(`dice${atacanteTirada1}`);
        this.diceImages.attacker[1].setTexture(`dice${atacanteTirada2}`);
        this.diceImages.defender[0].setTexture(`dice${defensaTirada1}`);
        this.diceImages.defender[1].setTexture(`dice${defensaTirada2}`);

        this.buttonTry.disableInteractive();
        this.buttonTry.setVisible(false);

        this.buttonCheat.disableInteractive();
        this.buttonCheat.setVisible(false);
        this.CombatInfo = true;
    }

    /**
     * Prepara y muestra la información para confirmar un ataque inminente.
     * @param {string} fichaDefiende - tipo de pieza que defiende
     * @param {string} fichaAtaque - tipo de pieza que ataca
     * @param {string} equipoAtaque - identificador del equipo atacante
     * @param {string} equipoDefensa - identificador del equipo defensor
     * @param {string} accion - texto a mostrar en el botón de acción
     * @param {Celda} casillaAtacante - celda de origen del ataque
     * @param {Celda} casillaDefensa - celda objetivo del ataque
     */
    updateInfo(fichaDefiende, fichaAtaque, equipoAtaque, equipoDefensa, accion, casillaAtacante, casillaDefensa) {

        let bonusAtaca = casillaAtacante.getPieza().getBonusAtaque();
        bonusAtaca = this.bonus(bonusAtaca, casillaAtacante.getPieza(), casillaDefensa.getPieza());
        let bonusDefiende = casillaDefensa.getPieza().getBonusDefensa();

        // Actualiza el título del panel
        this.titleText.setText('CONFIRMA COMBATE');
        // Actualiza la información del panel
        this.infoText.setText(fichaAtaque + ' de ' + equipoAtaque + ' ataca a ' + fichaDefiende + ' de ' + equipoDefensa);
        this.infoTextAttacker.setText(`Ataca: ${equipoAtaque} Bonus (${bonusAtaca})`);
        this.infoTextDefender.setText(`Defiende: ${equipoDefensa} Bonus (${bonusDefiende})`);

        this.diceImages.attacker[0].setTexture(`dice${0}`);
        this.diceImages.attacker[1].setTexture(`dice${0}`);
        this.diceImages.defender[0].setTexture(`dice${0}`);
        this.diceImages.defender[1].setTexture(`dice${0}`);

        this.buttonTry.setInteractive({ useHandCursor: true });
        this.buttonTry.setText(accion);
        this.buttonTry.setVisible(true);

        this.buttonCheat.setVisible(true);
        this.buttonCheat.setInteractive({ useHandCursor: true });

        this.CombatInfo = false;

    }

    /**
     * Restaura el panel a su estado por defecto cuando no hay acción en curso.
     */
    updateInfoEsperandoAccion() {
        this.titleText.setText('COMBATE');
        this.infoText.setText('Esperando acción...');
        this.infoTextAttacker.setText('Ataca');
        this.infoTextDefender.setText('Defiende');

        this.buttonTry.disableInteractive();
        this.buttonTry.setVisible(false);
        this.buttonCheat.disableInteractive();
        this.buttonCheat.setVisible(false);
    }

    /**
     * Calcula bonificaciones adicionales para un atacante en función de piezas adyacentes.
     * @param {number} bonusAtaca - bonificación base recibida
     * @param {Pieza} atacaPieza - pieza atacante
     * @param {Pieza} defiendePieza - pieza defensora
     * @returns {number} bonificación resultante
     */
    bonus(bonusAtaca, atacaPieza, defiendePieza) {
        {

    let fil = atacaPieza.getPosicion().fila;
    let col = atacaPieza.getPosicion().col;

    // ATAQUE HORIZONTAL
    if (fil == defiendePieza.getPosicion().fila) {

        // Arriba
        let arriba = fil - 1;
        if (arriba >= 0) {
            let piezaArriba = this.tablero.getCelda(arriba, col).getPieza();
            if (piezaArriba && piezaArriba.getTipo() === 'Soldado' &&
                piezaArriba.getJugador() === atacaPieza.getJugador()) {
                bonusAtaca++;
            }
        }

        // Abajo
        let abajo = fil + 1;
        if (abajo < this.tablero.size().fila) {
            let piezaAbajo = this.tablero.getCelda(abajo, col).getPieza();
            if (piezaAbajo && piezaAbajo.getTipo() === 'Soldado' &&
                piezaAbajo.getJugador() === atacaPieza.getJugador()) {
                bonusAtaca++;
            }
        }
    }

    // ATAQUE VERTICAL
    else {

        // Izquierda
        let izquierda = col - 1;
        if (izquierda >= 0) {
            let piezaIzq = this.tablero.getCelda(fil, izquierda).getPieza();
            if (piezaIzq && piezaIzq.getTipo() === 'Soldado' &&
                piezaIzq.getJugador() === atacaPieza.getJugador()) {
                bonusAtaca++;
            }
        }

        // Derecha
        let derecha = col + 1;
        if (derecha < this.tablero.size().col) {
            let piezaDer = this.tablero.getCelda(fil, derecha).getPieza();
            if (piezaDer && piezaDer.getTipo() === 'Soldado' &&
                piezaDer.getJugador() === atacaPieza.getJugador()) {
                bonusAtaca++;
            }
        }
    } }
         return bonusAtaca;
    }

    /**
     * Helper para crear objetos de texto en la escena con formato consistente.
     * @param {number} width - posición X
     * @param {number} height - posición Y
     * @param {string} text - contenido del texto
     * @param {number} wordWrapWidth - ancho de ajuste de líneas
     * @param {string} fontStyle - estilo de fuente
     * @param {string|number} px - tamaño de fuente
     * @param {number} origin - origen horizontal
     * @param {string} [fill='#ffffffff'] - color de relleno
     * @returns {Phaser.GameObjects.Text} texto creado
     */
    createText(width, height, text, wordWrapWidth, fontStyle, px, origin, fill = '#ffffffff') {
        return this.escena.add.text(width, height, text, { // Equipo que defiende
            fontSize: px,
            fontFamily: 'Kotton',
            fontStyle: fontStyle,
            fill: fill,
            wordWrap: { width: wordWrapWidth, useAdvancedWrap: true }
        }).setOrigin(origin);
    }

    /**
     * Desactiva el botón de información (oculta y deshabilita interacción).
     */
    desactivarBtnInfo() {
        if (this.btInfo) {
            this.btInfo.setVisible(false);
            // this.btInfo.removeAllListeners(); //el pointer lo mantiene vivo con el .on y sigue pudiendo activarse su funciones (por eso lo fuerzo en abrir panel)
            this.btInfo.disableInteractive();
        }
    }

}

export default PanelLateral;