/**
 * Clase que gestiona la representación gráfica de las piezas en el tablero.
 * @class PiezaGrafico
 * @memberof Render
 */
class PiezaGrafico {

  /**
   * Constructor de PiezaGrafico.
   * @param {Phaser.Scene} escena - la escena de Phaser donde se crearán los sprites
   * @param {Tablero} tablero - referencia a la lógica del tablero
   * @param {number} [tamCasilla=64] - tamaño en píxeles de cada casilla
   */
  constructor(escena, tablero, tamCasilla = 64) {
    this.escena = escena;
    this.tablero = tablero;
    this.tamCasilla = tamCasilla;
    this.sprites = new Map(); // estructura tipo array (parecida a un diccionario)
  }

  /**
   * Dibuja un sprite para la pieza especificada y lo asocia en el mapa interno.
   * @param {Pieza} pieza - instancia de la pieza a dibujar
   */
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
    else if (pieza.getTipo() == 'Artilleria'){
        if (pieza.getJugador() == "J1") sprite = this.escena.add.image(x, y, 'artilleria');
        else sprite = this.escena.add.image(x, y, 'artilleria2');
    }
    sprite.setDisplaySize(this.tamCasilla, this.tamCasilla);
    this.sprites.set(pieza, sprite);
  }

  /**
   * Elimina el sprite asociado a la pieza y limpia la referencia interna.
   * @param {Pieza} pieza - pieza cuyo sprite se desea eliminar
   */
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

export default PiezaGrafico;