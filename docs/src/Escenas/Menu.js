/**
 * Escena del menú principal del juego.
 * @class Menu
 * @extends Phaser.Scene
 * @memberof Escenas
 */
class Menu extends Phaser.Scene {
    /**
     * Constructor de la escena Menu.
     * @constructor
     */
    constructor() {
        super("Menu");
    }

    /**
     * Método preload de la escena Menu.
     * Carga las imágenes necesarias para la escena.
     */
    preload() {
        this.load.image('fondo', 'imgs/menuJuego/FondoMenu.webp')
        this.load.image('boton', 'imgs/menuJuego/boton.webp')
    }

    /**
     * Método create de la escena Menu.
     * Crea los elementos gráficos y lógicos necesarios para la escena.
     */
    create() {
        this.add.image(400, 300, 'fondo').setOrigin(0.5)
        this.add.text(this.scale.width / 2, this.scale.height / 2 - 200, 'WAR CANVAS', {
            fontSize: '60px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 10,
            fontFamily: 'Arial',
        }).setOrigin(0.5);

        let botonInicio = this.add.image(this.scale.width / 2, this.scale.height / 2 - 80, 'boton')
            .setOrigin(0.5)
            .setScale(0.25)
            .setInteractive({ useHandCursor: true }) // Se vuelve interactuable y muestra el cursor como una mano

        let botonCreditos = this.add.image(this.scale.width / 2, this.scale.height / 2 + 80, 'boton')
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
            this.scene.launch('ElegirPiezas'); //launch para evitar destruir la escena del menu

            //desactivamos los botones para evitar doble clicks mientras dormimos la escena
            botonInicio.disableInteractive();
            botonCreditos.disableInteractive();
            this.scene.sleep(); //ocultamos el menu
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

        let defaultText = this.add.text(this.scale.width / 2, this.scale.height - 50, 'DEFAULT', {
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#7b0000ff',
            strokeThickness: 10,
            fontFamily: 'Arial',
        }).setOrigin(0.5).setInteractive();

        //BOTON DEFAULT
        defaultText.on('pointerdown', () => {
            this.scene.launch('Inicio', {}); //launch para evitar destruir la escena del menu

            //desactivamos los botones para evitar doble clicks mientras dormimos la escena
            botonInicio.disableInteractive();
            botonCreditos.disableInteractive();
            this.scene.sleep(); //ocultamos el menu
        });

        //Listener para cuando se vuelva al menu
        this.events.on('wake', () => {
            //Recuperamos las acciones
            botonInicio.setInteractive({ useHandCursor: true });
            botonCreditos.setInteractive({ useHandCursor: true });

            //Por si el efecto del pointerDown se guardo al dormir la escena. Se redibuja al estado inicial
            buttonText.setColor('#ffffff');
            buttonText.setStroke('#7b0000ff');
        });
    }
}

export default Menu;