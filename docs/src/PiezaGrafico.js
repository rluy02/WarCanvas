export default class PiezaGrafico {

  constructor(escena, tablero, tamCasilla = 64) {
    this.escena = escena;
    this.tablero = tablero;
    this.tamCasilla = tamCasilla;
    this.sprites = new Map(); // estructura tipo array (parecida a un diccionario)
  }

  preload() {
    this.escena.load.image('peon', 'imgs/peon.webp');
  }

  dibujarPieza(pieza) {
    const x = pieza.col * this.tamCasilla + this.tamCasilla / 2;
    const y = pieza.fil * this.tamCasilla + this.tamCasilla / 2;

    const sprite = this.escena.add.image(x, y, 'peon');
    sprite.setDisplaySize(this.tamCasilla, this.tamCasilla);
    this.sprites.set(pieza, sprite);
  }

  eliminarPieza(pieza) {
    // Buscar el sprite asociado
    const sprite = this.sprites.get(pieza);

    // Si existe, eliminarlo del juego y del mapa
    if (sprite) {
      sprite.destroy(); // Esto elimina el sprite de la escena de Phaser
      this.sprites.delete(pieza); // Y lo quitamos del Map
    } else {
      console.warn("Intento de eliminar pieza que no tiene sprite asociado:", pieza);
    }
  }
}