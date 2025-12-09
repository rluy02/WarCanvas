import PanelEventos from "../Render/PanelEventos.js";

/**
 * Escena del minijuego donde el comandante puede saltar al presionar la barra espaciadora.
 * @class Minijuego
 * @extends Phaser.Scene
 * @memberof Escenas
 */
class Minijuego extends Phaser.Scene {
    /**
     * Constructor de la escena Minijuego.
     * @constructor
     */
    constructor() {
        super('Minijuego');

    }

    /**
     * Carga los recursos necesarios para la escena.
     */
    preload() {
        //cuando esta escena venga de INICIO, que no recargue las imagenes
         if (!this.textures.exists('Comandante')) this.load.image('Comandante', './imgs/piezas/Comandante.webp');
         if (!this.textures.exists('ComandanteEnemigo')) this.load.image('ComandanteEnemigo', './imgs/piezas/Comandante2.webp');
         if (!this.textures.exists('Granada')) this.load.image('Granada', './imgs/minijuego/granada.webp');
         if (!this.textures.exists('explosion'))this.load.spritesheet('explosion', './imgs/efectos/explosion.png', { frameWidth: 144, frameHeight: 128 })
    }

    /**
     * Crea los elementos de la escena.
     */
    create() {
        this.crearAnimaciones();

        // Se crea el sprite de explosion
        this.explosion = this.add.sprite(0, 0, 'explosion');
        this.explosion.visible = false;
        this.explosion.on('animationcomplete', () => {
            this.explosion.visible = false;
        });
        this.explosion.setDepth(999);

        //establecemos el limite del mundo del tamaño del canvas
        this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);

        this.createDrawFull();
        this.createComandanteEnemigo();

        //zona
        this.zona = this.add.zone(0, this.scale.height / 2, 10, this.scale.height);
        this.physics.add.existing(this.zona, false);
        this.zona.body.moves = false;


        this.tiempoInicial = 30; // Tiempo inicial en segundos

        this.cuentaAtrasTexto = this.add.text(this.scale.width / 2, 20, 'Tiempo: ' + this.tiempoInicial, { fontSize: '32px', fill: '#FFF' }).setOrigin(0.5);

        this.physics.world.on('collide', (go1, go2, b1, b2) => {

            if((go1==this.granada && go2== this.comandante)||(go2==this.granada && go1== this.comandante) ){

            }
            this.time.delayedCall(2000, () => {
                this.explotaGranada(go1);
            });
        });

        this.panelEventos = new PanelEventos(this);
        this.panelEventos.mostrar('Minijuego: Salta el comandante', 'Pulsa la barra espaciadora para que el comandante salte y esquive las granadas que se lanzan desde la derecha.', 'WarCanvas', 'Aceptar', () => {
            // Inicializar timer para crear granadas cada 3000ms
            this.timer = this.time.addEvent({
                delay: 3000, // ms
                callback: this.createGranada,
                callbackScope: this,
                loop: false,
                repeat: 9
            });

            this.time.addEvent({
                delay: 1000,
                callback: this.updateCuentaAtras,
                callbackScope: this,
                loop: true,

            });
        })
    }

    updateCuentaAtras() {
        this.tiempoInicial--;
        this.cuentaAtrasTexto.setText("Tiempo: " + this.tiempoInicial);

        if (this.tiempoInicial <= 0) {
            this.endMinijuego();
        }
    }

    endMinijuego() {
        this.scene.stop();
        this.scene.launch('Inicio');
        console.log("Fin del minijuego");
    }

    explotaGranada(granada) {
        if (this.explosion && !granada.getData('flag')) {
            this.explosion.visible = true;
            this.explosion.setPosition(granada.x, granada.y);
            this.explosion.play('explotar');

            granada.setData('flag', true);
        }

        granada.destroy();
    }

    /**
     * Crea al personaje que controla el jugador
     */
    createDrawFull() {
        //agregamos la fisica y el sprite
        this.comandante = this.physics.add.sprite(100, this.scale.height - 100, 'Comandante');
        //reducimos el tamaño
        this.comandante.setScale(0.1);
        //para que el comandante se choque con los limites (es el canvas)
        this.comandante.setCollideWorldBounds(true);
        this.comandante.body.setImmovable(true);
        const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        spaceKey.on('down', () => {
            console.log("salta");
            this.comandante.body.setAcceleration(0, -100);
            this.comandante.body.setVelocity(0, -400);
        });

        this.comandante.body.onCollide = true;

        //vidas del comandante
        this.vidasComandante = 3;
    }
    /**
     * Crea el comandante enemigo
     */
    createComandanteEnemigo() {
        //agregamos la fisica y el sprite
        this.comandanteEnemigo = this.add.sprite(this.scale.width - 100, this.scale.height / 2, 'ComandanteEnemigo').setScale(0.1);
        //reducimos el tamaño
        //this.comandanteEnemigo.setScale(0.1);
    }

    /**
     * Crea una granada
     */
    createGranada() {
        this.granada = this.physics.add.sprite(this.scale.width - 100, this.scale.height / 2, 'Granada').setScale(0.02);
        //para que el comandante se choque con los limites (es el canvas)
        this.granada.setGravityY(-300);
        let randomY = Phaser.Math.Between(-500, 0);
        let randomX = Phaser.Math.Between(-700, -900);
        this.granada.setCollideWorldBounds(true);
        this.granada.body.setVelocity(randomX, randomY);
        this.granada.body.setBounce(0.3);
        this.physics.add.collider(this.granada, this.comandante, null, null, this);

        //Activa el metodo onCollide
        this.granada.body.onCollide = true;
        //Data para que no explote 2 veces
        this.granada.setDataEnabled();
        this.granada.setData('flag', false);

        this.physics.add.overlap(this.zona, this.granada, (zone, block) => {
            this.explotaGranada(this.granada);
            this.vidasComandante--;
            console.log(this.vidasComandante);
        });
    }

    /**
     * Crea las animaciones
     */
    crearAnimaciones() {
        if (!this.anims.exists('explotar')) {
            this.anims.create({
                key: 'explotar',
                frames: this.anims.generateFrameNumbers('explosion', { frames: [0, 1, 2, 3, 4, 5, 6, 7] }),
                frameRate: 10,
                repeat: 0
            });
        }
    }
}

export default Minijuego; 