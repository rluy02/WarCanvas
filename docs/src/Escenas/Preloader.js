export default class Preloader extends Phaser.Scene {
    constructor() {
        super("Preloader");
    }

    preload() {
        this._t0 = performance.now(); //tiempo exacto en el que empezo el preload
        //(rectángulo + texto)
        const { width, height } = this.scale;

        this.add.rectangle(width / 2, height / 2, 420, 40).setStrokeStyle(2, 0xffffff);
        const barra = this.add.rectangle(width / 2 - 210, height / 2, 0, 30, 0xffffff).setOrigin(0, 0.5);
        const textoProgresoCarga = this.add.text(width / 2, height / 2 - 60, "Cargando todos los recursos... 0%", { fontSize: "24px", color: "#ffffff" }).setOrigin(0.5);



        this.load.on("progress", (p) => {
            barra.width = 420 * p; //p va de 0 a 1
            textoProgresoCarga.setText(`Cargando todos los recursos... ${Math.floor(p * 100)}%`);
        });

        // ====== CARGA GLOBAL ======

        // UI
        this.load.image('fondo', 'imgs/ui/fondo_menu.webp');
        this.load.image('boton', 'imgs/ui/boton.webp');
        this.load.font('Kotton', 'font/Kotton.ttf');
        this.load.audio('click', 'audio/clickSFX.wav');
        this.load.image('dialogo', './imgs/Tutorial/Dialogue.webp');

        // Tablero / mapa
        this.load.image('mapaTopo', './imgs/mapa/mapaTopo.webp');
        this.load.image('mapaSat', './imgs/mapa/mapaSat.webp');
        this.load.image('marcoConquista', './imgs/ui/marcoTerrenoConquistado.webp');

        // Piezas
        this.load.image('peon', './imgs/piezas/soldado-dibujado.webp');
        this.load.image('peon-blanco', './imgs/piezas/white-pawn.webp');
        this.load.image('peon-rojo', './imgs/piezas/red-pawn.webp');
        this.load.image('peon2', './imgs/piezas/soldado-realista.webp');
        this.load.image('caballeria', './imgs/piezas/caballeria-dibujada.webp');
        this.load.image('caballeria2', './imgs/piezas/caballeria-realista.webp');
        this.load.image('comandante', './imgs/piezas/Comandante.webp');
        this.load.image('comandante2', './imgs/piezas/comandante-realista.webp');
        this.load.image('artilleria', './imgs/piezas/artilleria-dibujada.webp');
        this.load.image('artilleria2', './imgs/piezas/artilleria-realista.webp');

        // Efectos
        this.load.spritesheet('explosion', 'imgs/efectos/explosion.png', { frameWidth: 144, frameHeight: 128 });

        // Dados
        for (let i = 0; i <= 6; i++) {
            this.load.image(`dice${i}`, `./imgs/dice/dice${i}.webp`);
        }

        // Minijuego
        this.load.image('granada', './imgs/minijuego/granada.webp');
        this.load.image('fondoMiniJuego', './imgs/minijuego/miniJuegoFondo.webp');



        this.load.once("complete", () => {
            this.load.removeAllListeners();

            const minMs = 500; //tiempo minimo que se muestra la pantalla de carga  
            const elapsed = performance.now() - this._t0; //cuanto tardo la carga
            const wait = Math.max(0, minMs - elapsed); //cuanto falta para llegar a ese tiempo minimo

            this.time.delayedCall(wait, () => {
                this.scene.start("Menu");
            });
        });
        //este ultimo calculo de tiempo es para que en cargas con velocidades super altas se visualice un poco mas la pantalla de carga
        //y no sea solamente un pantallazo negro
    }
}
