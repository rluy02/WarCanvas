export default class PiezaGrafico {

  constructor(escena, tablero, tamCasilla = 64) {
    this.escena = escena;
    this.tablero = tablero;
    this.tamCasilla = tamCasilla;
    this.sprites = new Map(); // estructura tipo array (parecida a un diccionario)
  }

  preload() {
    this.escena.load.image('peon', './imgs/peon.webp');
    this.escena.load.image('peon2', './imgs/peon2.webp');
    this.escena.load.image('caballeria', './imgs/Caballeria.webp');
    this.escena.load.image('caballeria2', './imgs/Caballeria2.webp');
    this.escena.load.image('comandante', './imgs/Comandante.webp');
    this.escena.load.image('comandante2', './imgs/Comandante2.webp');
  }

  dibujarPieza(pieza) {
    const x = pieza.col * this.tamCasilla + this.tamCasilla / 2;
    const y = pieza.fil * this.tamCasilla + this.tamCasilla / 2;

    let sprite = null;
    if(pieza.getTipo() == 'Soldado'){
      if (pieza.getJugador() == "J1") sprite = this.escena.add.image(x, y, 'peon');
      else sprite = this.escena.add.image(x, y, 'peon2');
    }
    else if (pieza.getTipo() == 'Caballeria'){
        if (pieza.getJugador() == "J1") sprite = this.escena.add.image(x, y, 'caballeria');
        else sprite = this.escena.add.image(x, y, 'caballeria2');
    }
    else if (pieza.getTipo() == 'Comandante'){
        if (pieza.getJugador() == "J1") sprite = this.escena.add.image(x, y, 'comandante');
        else sprite = this.escena.add.image(x, y, 'comandante2');
    }
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