import Celda from "./Celda.js";
import { Eventos } from "./Events.js";
import { EventBus } from "./EventBus.js";

export default class PanelLateral {
    constructor(escena) {
        this.escena = escena;
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
        this.titleText = this.escena.add.text(width - sideWidth + 20, 20, 'COMBATE', { // Título
            fontSize: '32px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fill: '#ffffff'
        });

        this.infoText = this.escena.add.text(width - sideWidth + 20, 100, 'Esperando acción...', { // Texto del combate (ej: Soldado vs Caballería)
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#ffffffff',
        });

        this.infoTextAttacker = this.escena.add.text(width - sideWidth / 2, 200, 'Ataca', { // Equipo que ataca
            fontSize: '24px',
            fontFamily: 'Arial',

            fill: '#ffffffff',
        }).setOrigin(0.5);

        this.infoTextDefender = this.escena.add.text(width - sideWidth / 2, 300, 'Defiende', { // Equipo que defiende
            fontSize: '24px',
            fontFamily: 'Arial',

            fill: '#ffffffff',
        }).setOrigin(0.5);

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

        this.buttonTry = this.escena.add.text(width - sideWidth / 2, 500, ' ', {
            color: '#ff0000',
            fontFamily: 'Arial',
            fontSize: '24px'
        }).setOrigin(0.5).disableInteractive();

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

        this.diceImages.attacker[0].on('animationcomplete', (anim) => {
            if (anim.key === 'roll') {
                if (this.ataque == true)
                    EventBus.emit(Eventos.ATACK); // Se recibe en combate
                    this.ataque = false;
            }
        });
    }

    updateCombatInfo(mensaje, resultado, atacante, defensa, atacanteTirada1, atacanteTirada2, defensaTirada1, defensaTirada2, bonusAtaca, bonusDefiende) {
        // Actualiza la información del panel
        this.titleText.setText('COMBATE');
        this.infoText.setText(`${mensaje}\n${resultado}`);
        this.infoTextAttacker.setText(`Ataca ${atacante} = ${atacanteTirada1 + atacanteTirada2 + bonusAtaca} Bonus(${bonusAtaca})`);
        this.infoTextDefender.setText(`Defiende ${defensa} = ${defensaTirada1 + defensaTirada2 + bonusDefiende} Bonus(${bonusDefiende})`);

        this.diceImages.attacker[0].setTexture(`dice${atacanteTirada1}`);
        this.diceImages.attacker[1].setTexture(`dice${atacanteTirada2}`);
        this.diceImages.defender[0].setTexture(`dice${defensaTirada1}`);
        this.diceImages.defender[1].setTexture(`dice${defensaTirada2}`);

        this.buttonTry.disableInteractive();
        this.buttonTry.setText(' ');
    }

    updateInfo(fichaDefiende, fichaAtaque, equipoAtaque, equipoDefensa, accion) {

        // Actualiza el título del panel
        this.titleText.setText('CONFIRMA \nEL COMBATE');
        // Actualiza la información del panel
        this.infoText.setText(fichaAtaque + ' de ' + equipoAtaque + ' ataca a ' + fichaDefiende + ' de ' + equipoDefensa);
        this.infoTextAttacker.setText('Ataca: ' + equipoAtaque);
        this.infoTextDefender.setText('Defiende: ' + equipoDefensa);

        this.diceImages.attacker[0].setTexture(`dice${0}`);
        this.diceImages.attacker[1].setTexture(`dice${0}`);
        this.diceImages.defender[0].setTexture(`dice${0}`);
        this.diceImages.defender[1].setTexture(`dice${0}`);

        this.buttonTry.setInteractive({ useHandCursor: true });
        this.buttonTry.setText(accion);
    }

}