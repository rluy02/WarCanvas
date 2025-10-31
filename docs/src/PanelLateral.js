import Celda from "./Celda.js";
import { eventos } from "./events.js";
import { EventBus } from "./EventBus.js";

export default class PanelLateral {
    constructor(escena) {
        this.escena = escena;
        let atacante = null;
        let defensa = null;
    }

    preload() { // Se cargan las imagenes de los dados
        for (let i = 0; i <= 6; i++) {
            this.escena.load.image(`dice${i}`, `imgs/dice/dice${i}.png`);
        }
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
            fill: '#ffffff'
        });

        this.infoText = this.escena.add.text(width - sideWidth + 20, 100, 'Esperando acción...', { // Texto del combate (ej: Soldado vs Caballería)
            fontSize: '16px',
            fontFamily: 'Arial',
            fill: '#ffffffff', });

        this.infoTextAttacker = this.escena.add.text(width - sideWidth / 2, 150, 'Ataca', { // Equipo que ataca
            fontSize: '16px',
            fontFamily: 'Arial',
            fill: '#ffffffff', }).setOrigin(0.5);;

        this.infoTextDefender = this.escena.add.text(width - sideWidth / 2, 250, 'Defiende', { // Equipo que defiende
            fontSize: '16px',
            fontFamily: 'Arial',
            fill: '#ffffffff',
        }).setOrigin(0.5);;

        // Dados
        this.diceImages = { // Los dos dados de cada equipo
            attacker: [
                this.escena.add.image(width - sideWidth / 2 - 40, 200, 'dice0'),
                this.escena.add.image(width - sideWidth / 2 + 40, 200, 'dice0')
            ],
            defender: [
                this.escena.add.image(width - sideWidth / 2 - 40, 300, 'dice0'),
                this.escena.add.image(width - sideWidth / 2 + 40, 300, 'dice0')
            ]
        };

        // AUXILIAR - Para comprobar que se actualizan los dados

        this.buttonTry = this.escena.add.text(width - sideWidth / 2, 500, ' ', { // Botón Provisional para ver si funcionan los dados
            fontSize: '30px',
            color: '#ffffff',
            fontFamily: 'Arial',
        }).setOrigin(0.5).disableInteractive();

        this.buttonTry.on('pointerdown', () => {
            // Se lanza el evento de ataque
            EventBus.emit(eventos.ATACK);
        });
    }

    updateCombatInfo(mensaje, resultado, atacante, defensa, atacanteTirada1, atacanteTirada2, defensaTirada1, defensaTirada2, bonusAtaca, bonusDefiende) {
        // Actualiza la información del panel
        this.titleText.setText('COMBATE');
        this.infoText.setText(`${mensaje}\n${resultado}`);
        this.infoTextAttacker.setText(`Ataca ${atacante} = ${atacanteTirada1 + atacanteTirada2 + bonusAtaca} Bonus(${bonusAtaca})`);
        this.infoTextDefender.setText(`Ataca ${defensa} = ${defensaTirada1 + defensaTirada2 + bonusDefiende} Bonus(${bonusDefiende})`);

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