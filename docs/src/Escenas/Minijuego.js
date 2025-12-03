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
    }

}
export default Minijuego;