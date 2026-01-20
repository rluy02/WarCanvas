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
        this.load.image('fondo', 'imgs/ui/fondo_menu.webp')
        this.load.image('boton', 'imgs/ui/boton.webp')
        this.load.font('Kotton', 'font/Kotton.ttf')
        this.load.audio('click', 'audio/clickSFX.wav')
    }

    /**
     * Método create de la escena Menu.
     * Crea los elementos gráficos y lógicos necesarios para la escena.
     */
    create() {
        const clickSound = this.sound.add('click');

        this.add.image(400, 300, 'fondo').setOrigin(0.5).setScale(0.5);
        this.add.text(this.scale.width / 2, this.scale.height / 2 - 200, 'WAR CANVAS', {
            fontSize: '80px',
            color: '#305a23ff',
            stroke: '#021601ff',
            strokeThickness: 10,
            fontFamily: 'Kotton',
        }).setOrigin(0.5);

        let botonInicio = this.add.image(this.scale.width / 2, this.scale.height / 2 - 70, 'boton')
            .setOrigin(0.5)
            .setScale(0.4)
            .setInteractive({ useHandCursor: true }) // Se vuelve interactuable y muestra el cursor como una mano

        let botonCreditos = this.add.image(this.scale.width / 2, this.scale.height / 2 + 40, 'boton')
            .setOrigin(0.5)
            .setScale(0.4)
            .setInteractive({ useHandCursor: true }) // Se vuelve interactuable y muestra el cursor como una mano

        let buttonText = this.add.text(botonInicio.x, botonInicio.y, 'JUGAR', {
            fontSize: '36px',
            color: '#ffffff',
            stroke: '#021601ff',
            strokeThickness: 10,
            fontFamily: 'Kotton',
        }).setOrigin(0.5);

        let creditosText = this.add.text(botonCreditos.x, botonCreditos.y, 'CRÉDITOS', {
            fontSize: '36px',
            color: '#ffffff',
            stroke: '#021601ff',
            strokeThickness: 10,
            fontFamily: 'Kotton',
        }).setOrigin(0.5);

        //BOTON MINIJUEGO
        let botonMinijuego = this.add.image(this.scale.width / 2, this.scale.height / 2 + 150, 'boton')
            .setOrigin(0.5)
            .setScale(0.4)
            .setInteractive({ useHandCursor: true })

        let minijuegoText = this.add.text(botonMinijuego.x, botonMinijuego.y, 'Minijuego', {
            fontSize: '36px',
            color: '#ffffff',
            stroke: '#021601ff',
            strokeThickness: 10,
            fontFamily: 'Kotton',
        }).setOrigin(0.5);

        //BOTON JUGAR
        botonInicio.on('pointerdown', () => {
            clickSound.play();
            this.scene.launch('Tutorial'); //launch para evitar destruir la escena del menu

            //desactivamos los botones para evitar doble clicks mientras dormimos la escena
            botonInicio.disableInteractive();
            botonCreditos.disableInteractive();
            this.scene.sleep(); //ocultamos el menu
        });

        botonInicio.on('pointerover', () => {
            buttonText.setColor('#abffabff');
            buttonText.setStroke('#035c00ff',);
        })

        botonInicio.on('pointerout', () => {
            buttonText.setColor('#ffffff');
            buttonText.setStroke('#021601ff');
        })

        // BOTON CREDITOS
        botonCreditos.on('pointerdown', () => {
            document.getElementById('creditos').style.display = 'block';
            document.getElementById('juego').style.display = 'none';
        })

        botonCreditos.on('pointerover', () => {
            creditosText.setColor('#abffabff');
            creditosText.setStroke('#035c00ff');
        })

        botonCreditos.on('pointerout', () => {
            creditosText.setColor('#ffffff');
            creditosText.setStroke('#021601ff');
        })

        //Boton minijuego
        botonMinijuego.on('pointerdown', () => {
            this.scene.launch('Minijuego'); //launch para evitar destruir la escena del menu

            //desactivamos los botones para evitar doble clicks mientras dormimos la escena
            botonInicio.disableInteractive();
            botonCreditos.disableInteractive();
            this.scene.sleep(); //ocultamos el menu
        });

        botonMinijuego.on('pointerover', () => {
            minijuegoText.setColor('#abffabff');
            minijuegoText.setStroke('#035c00ff');
        })

        botonMinijuego.on('pointerout', () => {
            minijuegoText.setColor('#ffffff');
            minijuegoText.setStroke('#021601ff');
        })

        let defaultText = this.add.text(this.scale.width / 2, this.scale.height - 50, 'MODO  IA', {
            fontSize: '26px',
            color: '#ffffff',
            stroke: '#021601ff',
            strokeThickness: 10,
            fontFamily: 'Kotton',
        }).setOrigin(0.5).setInteractive();

        //BOTON DEFAULT
        defaultText.on('pointerdown', () => {
            this.scene.launch('Inicio', {
                ia: true
            }); //launch para evitar destruir la escena del menu

            //desactivamos los botones para evitar doble clicks mientras dormimos la escena
            botonInicio.disableInteractive();
            botonCreditos.disableInteractive();
            this.scene.sleep(); //ocultamos el menu
        });

        defaultText.on('pointerover', () => {
            defaultText.setColor('#abffabff');
            defaultText.setStroke('#035c00ff',);
        })

        defaultText.on('pointerout', () => {
            defaultText.setColor('#ffffff');
            defaultText.setStroke('#021601ff');
        })

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