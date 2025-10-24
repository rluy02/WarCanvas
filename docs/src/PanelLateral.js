export default class PanelLateral {
    constructor(escena) {
        this.escena = escena;
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

        this.infoText = this.escena.add.text(width - sideWidth + 20, 80, 'Esperando acción...', { // Texto del combate (ej: Soldado vs Caballería)
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

        let buttonTry = this.escena.add.text(width - sideWidth / 2, 500, 'JUGAR', { // Botón Provisional para ver si funcionan los dados
            fontSize: '30px',
            color: '#ffffff',
            fontFamily: 'Arial',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        buttonTry.on('pointerdown', () => {

            this.updateCombatInfo('Partida de Prueba', 'NADIE', 'Dibujo', 'Real', Math.floor(Math.random() * (6 - 1) ) + 1, Math.floor(Math.random() * (6 - 1) ) + 1, Math.floor(Math.random() * (6 - 1) ) + 1, Math.floor(Math.random() * (6 - 1) ) + 1);

        });
    }

    updateCombatInfo(message, result, attackerTeam, defenderTeam, attackerRoll1, attackerRoll2, defenderRoll1, defenderRoll2) {
        // Actualiza la información del panel
        this.infoText.setText(`${message}\n${'Resultado: ' + result}`);
        this.infoTextAttacker.setText('Ataca: ' + attackerTeam);
        this.infoTextDefender.setText('Defiende: ' + defenderTeam);

        this.diceImages.attacker[0].setTexture(`dice${attackerRoll1}`);
                this.diceImages.attacker[1].setTexture(`dice${attackerRoll2}`);
        this.diceImages.defender[0].setTexture(`dice${defenderRoll1}`);
                this.diceImages.defender[1].setTexture(`dice${defenderRoll2}`);
    }

}