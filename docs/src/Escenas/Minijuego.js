class Minijuego extends Phaser.Scene {

    constructor() {
        super('Minijuego');

    }

    preload() {
        this.load.image('Comandante', './imgs/piezas/Comandante.webp');
    }

    create() {
        //agregamos la fisica y el sprite
        this.comandante = this.physics.add.sprite(this.scale.width / 2, this.scale.height / 2, 'Comandante');
        //reducimos el tamaño
        this.comandante.setScale(0.2);

        //establecemos el limite del mundo del tamaño del canvas
        this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
        //para que el comandante se choque con los limites (es el canvas)
        this.comandante.setCollideWorldBounds(true);

        const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        spaceKey.on('down',()=>{
            console.log("salta");
            this.comandante.body.setAcceleration(0,-100);
            this.comandante.body.setVelocity(0,-500);
        });

    }


}
export default Minijuego;