export default class Menu extends Phaser.Scene{
    constructor(){
        super("Menu");
    }

     preload(){
        this.load.image('fondo', 'imgs/FondoMenu.webp')
        this.load.image('boton', 'imgs/boton.webp')
     }

     create(){
        this.add.image(400, 300, 'fondo').setOrigin(0.5)
        this.add.text(this.scale.width/2, this.scale.height/2 - 200, 'WAR CANVAS', {
            fontSize: '60px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 10,
            fontFamily: 'Arial',
        }).setOrigin(0.5);

        let botonInicio = this.add.image(this.scale.width/2, this.scale.height/2, 'boton')
        .setOrigin(0.5)
        .setScale(0.5)
        .setInteractive({ useHandCursor: true }) // Se vuelve interactuable y muestra el cursor como una mano

        let buttonText = this.add.text(this.scale.width/2, this.scale.height/2, 'JUGAR', {
            fontSize: '40px',
            color: '#ffffff',
            stroke: '#7b0000ff',
            strokeThickness: 10,
            fontFamily: 'Arial',
        }).setOrigin(0.5);

        botonInicio.on('pointerdown', () => {
            this.scene.start('Inicio');
        });

        botonInicio.on('pointerover', () => {
            buttonText.setColor('#7b7b7bff');
            buttonText.setStroke('#4a0000ff');
        })

        botonInicio.on('pointerout', () => {
            buttonText.setColor('#ffffff');
            buttonText.setStroke('#7b0000ff');
        })
     }
}