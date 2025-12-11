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
        if (!this.textures.exists('ComandanteEnemigo')) this.load.image('ComandanteEnemigo', './imgs/piezas/comandante-realista.webp');
        if (!this.textures.exists('Granada')) this.load.image('Granada', './imgs/minijuego/granada.webp');
        if (!this.textures.exists('explosion')) this.load.spritesheet('explosion', './imgs/efectos/explosion.png', { frameWidth: 144, frameHeight: 128 })
        if (!this.textures.exists('fondoMiniJuego')) this.load.image('fondoMiniJuego', './imgs/minijuego/miniJuegoFondo.webp');

    }

    /**
     * Crea los elementos de la escena.
     */
    create() {
        this.crearAnimaciones();
        this.panelEventos = new PanelEventos(this);
        this.add.image(500, 300, 'fondoMiniJuego').setOrigin(0.5).setScale(0.85).setAlpha(0.5);

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
        this.actualizarVidasComandante()// se llama por primera vez para crear el texto
        this.createComandanteEnemigo();

        //zona
        this.zona = this.add.zone(0, this.scale.height / 2, 10, this.scale.height);
        this.physics.add.existing(this.zona, false);
        this.zona.body.moves = false;


        this.tiempoInicial = 30; // Tiempo inicial en segundos
        //Texto del tiempo
        this.cuentaAtrasTexto = this.add.text(this.scale.width / 2, 20, 'Tiempo: ' + this.tiempoInicial, { fontSize: '32px', fill: '#FFF', fontFamily: 'Kotton' }).setOrigin(0.5);
        this.panelEventos.mostrar('Minijuego: Salta el comandante', 'Pulsa la barra espaciadora para que el comandante salte y esquive las granadas que se lanzan desde la derecha.', 'WarCanvas', 'ACEPTAR', () => {
            // Inicializar timer para crear granadas cada 3000ms
            this.timer = this.time.addEvent({
                delay: 3000, // ms
                callback: this.createGranada,
                callbackScope: this,
                loop: false,
                repeat: 9
            });

            this.cuentaAtrasTimer =this.time.addEvent({
                delay: 1000,
                callback: this.updateCuentaAtras,
                callbackScope: this,
                loop: true,

            });
        })
    }

    /**
     * Actualiza la la cuenta regresiva
     */
    updateCuentaAtras() {
        this.tiempoInicial--;
        this.cuentaAtrasTexto.setText("Tiempo: " + this.tiempoInicial);

        if (this.tiempoInicial <= 0) {
            this.panelEventos.mostrar(
                '¡Has ganado!',
                'El comandante ha logrado sobrevivir. Fin del minijuego.',
                'WarCanvas',
                'ACEPTAR',
                () => {
                    this.endMinijuego('J1');
                });
        }
        }
    /**
     * Finaliza el minijuego, recarga la escena load pasandole los parametros del miniJuego
     */
    endMinijuego(data) {

        if (this.scene.isSleeping('Inicio')) {
            this.scene.get('Inicio').dataWake = data;
            this.scene.wake('Inicio');
        } 
        else this.scene.launch('Inicio');
        console.log("Fin del minijuego");
        this.scene.stop();
    }

    /**
     * Animacion para reproducir la explosion de la granada sin repeticiones
     */
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
       this.comandante.body.setSize(this.comandante.width-200, this.comandante.height-200); 
        const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        spaceKey.on('down', () => {
            if (this.panelEventos.getInput()){
            this.comandante.body.setAcceleration(0, 100);
            this.comandante.body.setVelocity(0, -500);
            }

        });

        this.comandante.body.onCollide = true;

        //Vidas del comandante
        this.vidasComandante = 3;
    }

    /**
     * Actualiza las vidas del Drawful
     */
    actualizarVidasComandante() {
        // Borrar iconos anteriores
        if (this.iconosVida) {
            this.iconosVida.forEach(icon => icon.destroy());
            this.iconosVida = [];
        }
        // Dibujar texto actualizado
        if (this.textoVidasComandante) {
            this.textoVidasComandante.destroy();
        }

        this.textoVidasComandante = this.add.text(this.scale.width / 2 - 70, 70, 'Vidas: ', { fontSize: '32px', fill: '#FFF', fontFamily: 'Kotton' }).setOrigin(0.5);
        const startX = this.scale.width / 2;
        const y = 70;
        this.iconosVida = [];

        for (let i = 0; i < this.vidasComandante; i++) {
            let icon = undefined;
            icon = this.add.image(startX + i * 50, y, 'Comandante');
            icon.setDisplaySize(64, 64);
            this.iconosVida.push(icon);
        }
    }

    /**
     * Crea el comandante enemigo
     */
    createComandanteEnemigo() {
        //agregamos la fisica y el sprite
        this.comandanteEnemigo = this.add.sprite(this.scale.width - 100, this.scale.height / 2, 'ComandanteEnemigo').setScale(0.1);
    }

    /**
     * Crea una granada
     */
    createGranada() {
        //se crean varias granadas asi que mejor procesarlas como elementos temporales
        let granada = this.physics.add.sprite(this.scale.width - 100, this.scale.height / 2, 'Granada').setScale(0.035);
        //para que el comandante se choque con los limites (es el canvas)
        granada.setGravityY(-300);
        let randomY = Phaser.Math.Between(-500, 0);
        let randomX = Phaser.Math.Between(-700, -900);
        granada.setCollideWorldBounds(true);
        granada.body.setVelocity(randomX, randomY);
        granada.body.setBounce(0.3);
        granada.body.setSize(granada.width-500, granada.height-500);
        //Activa el metodo onCollide
        granada.body.onCollide = true;
        //Data para que no explote 2 veces
        granada.setDataEnabled();
        granada.setData('flag', false);

        //Choque de la granada con el comandante
        this.physics.add.collider(granada, this.comandante, () => {
            // Guardamos el timer en cada granada
            if (!granada.explosionTimer) {
                granada.explosionTimer = this.time.delayedCall(2000, () => {
                    this.explotaGranada(granada);
                });
            }
        }, null, this);

        //Entrada de la granada con la zona
        this.physics.add.overlap(
            this.zona,  //a
            granada,    //b
            this.perderVidaPorGranada, //(el metodo recibe(a,b))
            null,
            this
        );

    }
    /*
    * Consecuencia de no repeler correctamente la granada con el Comandante
    */
    perderVidaPorGranada(zona, granada) {
        // Cancelar cualquier timer pendiente de la granada (util cuando el jugador toca la granada pero aun asi se le pasa a la zona)
        if (granada.explosionTimer) {
            granada.explosionTimer.remove();
            granada.explosionTimer = null;
        }

        this.explotaGranada(granada);
        this.vidasComandante--;
        this.actualizarVidasComandante();
        if (this.vidasComandante <= 0) {
            //nos aseguramos de detener la cuenta atras y la creacion de granadas
            if (this.timer) this.timer.remove(false);
            if (this.cuentaAtrasTimer) this.cuentaAtrasTimer.remove(false);

            this.panelEventos.mostrar(
                '¡Has perdido!',
                'El comandante ha sido alcanzado. Fin del minijuego.',
                'WarCanvas',
                'ACEPTAR',
                () => {
                    this.endMinijuego('J2');
                });
        }
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


//se capturan TODAS las colisiones que suceden en la escena. Siempre que sea posible es mejor un .add.collider
// this.physics.world.on('collide', (go1, go2, b1, b2) => {
//     //esto es basicamente si el jugador ha logrado parar la granada con el comandante
//     if ((go1 == this.granada && go2 == this.comandante) || (go2 == this.granada && go1 == this.comandante)) {
//         this.time.delayedCall(2000, () => {
//             this.explotaGranada(go1);
//         });
//     }
// });