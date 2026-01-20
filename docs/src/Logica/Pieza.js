import Tablero from "./Tablero.js";

/**
 * Clase que representa una pieza en el tablero de juego.
 * @class Pieza
 * @memberof Logica
 */
class Pieza {

  /**
   * Constructor de Pieza.
   * @param {Tablero} tablero - tablero al que pertenece la pieza
   * @param {string} tipoPieza - tipo de pieza ('Soldado', 'Caballeria', 'Artilleria', 'Comandante')
   * @param {number} fil - fila inicial de la pieza
   * @param {number} col - columna inicial de la pieza
   * @param {string} jugador - jugador propietario ('J1' o 'J2')
   * @param {number} numMovimientos - número de movimientos permitidos
   * @param {number} bonusAtaque - bonificación de ataque
   * @param {number} bonusDefensa - bonificación de defensa
   * @constructor
   */
  constructor(tablero, tipoPieza, fil, col, jugador, numMovimientos, bonusAtaque, bonusDefensa) {
    this.tablero = tablero;
    this.tipoPieza = tipoPieza;
    this.fil = fil;
    this.col = col;
    this.jugador = jugador;
    this.numMovimientos = numMovimientos;
    this.movida = false;
    this.bonusAtaque = bonusAtaque;
    this.bonusDefensa = bonusDefensa;
  }

  /**
   * Calcula las casillas disponibles para mover o atacar cuando se selecciona una pieza.
   * Devuelve las casillas según el tipo de pieza y su alcance.
   * @param {number} fil - fila de la pieza seleccionada
   * @param {number} col - columna de la pieza seleccionada
   * @param {Tablero} tablero - el tablero del juego
   * @returns {Array<Object>} array de objetos con coordenadas y tipo de acción (vacia/enemigo)
   */
  piezaSeleccionada(fil, col, tablero) {
    let celdasSeleccionadas = [];
    let filas = tablero.size().fila;
    let columnas = tablero.size().col;

    // Definimos solo los 4 movimientos de la cruz: [cambioFila, cambioColumna]
    // Arriba, Abajo, Izquierda, Derecha
    const direcciones = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
    ];

    for (let k = 0; k < direcciones.length; k++) {
        let j = fil + direcciones[k][0];
        let i = col + direcciones[k][1];

        // Comprobamos si se sale del tablero
        if (j < 0 || i < 0 || j >= filas || i >= columnas) continue;

        const cel = tablero.tablero[j][i];

        if (cel.estaVacia()) {
            celdasSeleccionadas.push({ fil: j, col: i, tipo: "vacia" });
        } else {
            const esRival = cel.getPieza().getJugador() !== this.jugador;
            if (esRival) celdasSeleccionadas.push({ fil: j, col: i, tipo: "enemigo" });
        }
    }
    return celdasSeleccionadas;
}

  /**
   * Mueve la pieza a una nueva posición.
   * @param {number} fil - nueva fila
   * @param {number} col - nueva columna
   */
  moverse(fil, col) {
    this.fil = fil;
    this.col = col;
  }

  /**
   * Obtiene el número de movimientos permitidos de la pieza.
   * @returns {number} número de movimientos
   */
  getMovimientos() {
    return this.numMovimientos;
  }

  /**
   * Obtiene el jugador propietario de la pieza.
   * @returns {string} identificador del jugador ('J1' o 'J2')
   */
  getJugador() {
    return this.jugador;
  }

  /**
   * Obtiene el tipo de pieza.
   * @returns {string} tipo de pieza ('Soldado', 'Caballeria', 'Artilleria', 'Comandante')
   */
  getTipo() {
    return this.tipoPieza;
  }

  /**
   * Obtiene la posición actual de la pieza.
   * @returns {{fila: number, col: number}} objeto con propiedades fila y col
   */
  getPosicion() {
    return { fila: this.fil, col: this.col };
  }

  /**
   * Marca la pieza como movida en este turno.
   * Cambia la opacidad del sprite asociado para indicar visualmente el estado.
   */
  setMovida() {
    this.movida = true;
    if (!this.tablero) return;
    const escena = this.tablero.getEscena();
    if (!escena) return;
    const piezaGrafico = escena.getPiezaGrafico();
    if (!piezaGrafico) return;
    const mapSprites = piezaGrafico.getMapSprites();
    if (!mapSprites) return;
    const sprite = mapSprites.get(this);
    if (sprite) {
      sprite.setAlpha(0.5); // Hacer la pieza semi-transparente al moverse
    }
  }

  /**
   * Reinicia el estado de movimiento de la pieza para el próximo turno.
   * 
   */
  resetMovida() {
    this.movida = false;
    if (!this.tablero) return;
    const escena = this.tablero.getEscena();
    if (!escena) return;
    const piezaGrafico = escena.getPiezaGrafico();
    if (!piezaGrafico) return;
    const mapSprites = piezaGrafico.getMapSprites();
    if (!mapSprites) return;
    const sprite = mapSprites.get(this);
    if (sprite) {
      sprite.setAlpha(1); // Restaurar opacidad completa al resetear movimiento
    }
  }

  /**
   * Verifica si la pieza ya ha sido movida en este turno.
   * @returns {boolean} true si la pieza ya fue movida, false en caso contrario
   */
  getMovida() {
    return this.movida;
  }

  /**
   * Obtiene la bonificación de ataque de la pieza.
   * @returns {number} bonificación de ataque
   */
  getBonusAtaque() {
    return this.bonusAtaque;
  }

  /**
   * Obtiene la bonificación de defensa de la pieza.
   * @returns {number} bonificación de defensa
   */
  getBonusDefensa() {
    return this.bonusDefensa;
  }

  /**
   * Establece el tablero al que pertenece la pieza.
   * @param {Tablero} t - tablero del juego
   */
  setTablero(t) {
    this.tablero = t;
  }
}

export default Pieza;