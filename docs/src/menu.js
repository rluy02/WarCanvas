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

        let botonInicio = this.add.image(this.scale.width/2, this.scale.height/2 -80, 'boton')
        .setOrigin(0.5)
        .setScale(0.25)
        .setInteractive({ useHandCursor: true }) // Se vuelve interactuable y muestra el cursor como una mano

        let botonCreditos = this.add.image(this.scale.width/2, this.scale.height/2 + 80, 'boton')
        .setOrigin(0.5)
        .setScale(0.25)
        .setInteractive({ useHandCursor: true }) // Se vuelve interactuable y muestra el cursor como una mano

        let buttonText = this.add.text(botonInicio.x, botonInicio.y, 'JUGAR', {
            fontSize: '30px',
            color: '#ffffff',
            stroke: '#7b0000ff',
            strokeThickness: 10,
            fontFamily: 'Arial',
        }).setOrigin(0.5);

        let creditosText = this.add.text(botonCreditos.x, botonCreditos.y, 'CRÉDITOS', {
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#7b0000ff',
            strokeThickness: 10,
            fontFamily: 'Arial',
        }).setOrigin(0.5);

        //BOTON JUGAR
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

        // BOTON CREDITOS
        botonCreditos.on('pointerdown', () => {
            document.getElementById('creditos').style.display = 'block';
            document.getElementById('juego').style.display = 'none';
        })

        botonCreditos.on('pointerover', () => {
            creditosText.setColor('#7b7b7bff');
            creditosText.setStroke('#4a0000ff');
        })

        botonCreditos.on('pointerout', () => {
            creditosText.setColor('#ffffff');
            creditosText.setStroke('#7b0000ff');
        })
     }
}