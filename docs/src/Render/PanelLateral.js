import { Eventos } from "../Events.js";
import { EventBus } from "../EventBus.js";

export default class PanelLateral {
    constructor(escena, panelInfo, tablero) {
        this.escena = escena;
        this.panelInfo = panelInfo;
        this.tablero = tablero;
        let atacante = null;
        let defensa = null;
        this.create();
    }

    create() {
        const width = this.escena.scale.width;
        const height = this.escena.scale.height;

        const sideWidth = 355; // Tamaño del panel
        this.escena.add.rectangle(width - (sideWidth / 2), height / 2, sideWidth, height, 0xd4b37c);

        // Elementos del Panel
        this.titleText = this.createText(width - sideWidth + 20, 20, 'COMBATE', 300, 'bold', '32px', 0.0);

        this.infoText = this.createText(width - sideWidth + 20, 100, 'Esperando acción...', 300, ' ', '18px', 0.0);

        this.infoTextAttacker = this.createText(width - sideWidth / 2, 200, 'Ataca', 300, ' ', '24px', 0.5);

        this.infoTextDefender = this.createText(width - sideWidth / 2, 300, 'Defiende', 300, ' ', '24px', 0.5);

        //Boton de abrir panel de informacion
        this.btInfo = this.createText(width - 100, 25, 'INFO', 0, 'bold', '22px', 0.0, '#000000ff');
        this.btInfo.setInteractive();


        this.btInfo.on('pointerdown', () => {
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

        this.buttonTry = this.createText(width - sideWidth / 2, 500, ' ', 0, ' ', '24px', 0.5, '#ff0000');
        this.buttonTry.disableInteractive();


        this.buttonTry.on('pointerdown', () => {
            // Se lanza el evento de ataque
            this.ataque = true;
            console.log(this.escena.anims.exists('roll'));
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
        this.buttonCheat = this.createText(width - sideWidth / 2, 540, 'CHEAT', 0, ' ', '16px', 0.5, '#523600');
        this.buttonCheat.setVisible(false);
        this.buttonCheat.disableInteractive();

        // Emitirá un ataque especial
        this.buttonCheat.on('pointerdown', () => {
            EventBus.emit(Eventos.ATTACK_CHEAT);
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

    // Informacion del Combate
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

    // Confirmar Ataque
    updateInfo(fichaDefiende, fichaAtaque, equipoAtaque, equipoDefensa, accion, casillaAtacante, casillaDefensa) {

        let bonusAtaca = casillaDefensa.getPieza().getBonusAtaque();
        bonusAtaca = this.bonus(bonusAtaca, casillaAtacante.getPieza(), casillaDefensa.getPieza());
        let bonusDefiende = casillaDefensa.getPieza().getBonusDefensa();

        // Actualiza el título del panel
        this.titleText.setText('CONFIRMA EL COMBATE');
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

    updateInfoEsperandoAccion() {
        this.titleText.setText('COMBATE');
        this.infoText.setText('Esperando acción...');
        this.infoTextAttacker.setText('Ataca');
        this.infoTextDefender.setText('Defiende');

        this.buttonTry.disableInteractive();
        this.buttonTry.setVisible(false);
    }

    bonus(bonusAtaca, atacaPieza, defiendePieza) {
        {
            if (atacaPieza.getTipo() == 'Soldado') {
                let filSoldado = atacaPieza.getPosicion().fila;
                let colSoldado = atacaPieza.getPosicion().col;

                if (filSoldado == defiendePieza.getPosicion().fila) {
                    let arriba = filSoldado - 1;
                    let abajo = filSoldado + 1;

                    if (arriba >= 0 && this.tablero.getCelda(arriba, colSoldado).getTipo() == 'Soldado') bonusAtaca++;
                    if (abajo < this.tablero.size().fila && this.tablero.getCelda(abajo, colSoldado).getTipo() == 'Soldado') bonusAtaca++;
                }
                else {
                    let izquierda = colSoldado - 1;
                    let derecha = colSoldado + 1;
                    if (izquierda >= 0 && this.tablero.getCelda(filSoldado, izquierda).getTipo() == 'Soldado') bonusAtaca++;
                    if (derecha < this.tablero.size().fila && this.tablero.getCelda(filSoldado, derecha).getTipo() == 'Soldado') bonusAtaca++;
                }

                console.log("El soldado tiene de bonus: ", bonusAtaca)
            }
        }

        return bonusAtaca;
    }

    createText(width, height, text, wordWrapWidth, fontStyle, px, origin, fill = '#ffffffff') {
        return this.escena.add.text(width, height, text, { // Equipo que defiende
            fontSize: px,
            fontFamily: 'Arial',
            fontStyle: fontStyle,
            fill: fill,
            wordWrap: { width: wordWrapWidth, useAdvancedWrap: true }
        }).setOrigin(origin);
    }

    desactivarBtnInfo() {
        if (this.btInfo) {
            this.btInfo.setVisible(false);
            // this.btInfo.removeAllListeners(); //el pointer lo mantiene vivo con el .on y sigue pudiendo activarse su funciones (por eso lo fuerzo en abrir panel)
            this.btInfo.disableInteractive();
        }
    }

}