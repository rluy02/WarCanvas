/**
 * Clase que representa una pieza en el tablero de juego.
 * @class Pieza
 * @memberof Logica
 */
class Pieza {

    /**
     * Constructor de Pieza.
     * @param {string} tipoPieza - tipo de pieza ('Soldado', 'Caballeria', 'Artilleria', 'Comandante')
     * @param {number} fil - fila inicial de la pieza
     * @param {number} col - columna inicial de la pieza
     * @param {string} jugador - jugador propietario ('J1' o 'J2')
     * @param {number} numMovimientos - número de movimientos permitidos
     * @param {number} bonusAtaque - bonificación de ataque
     * @param {number} bonusDefensa - bonificación de defensa
     * @constructor
     */
    constructor(tipoPieza, fil, col, jugador, numMovimientos, bonusAtaque, bonusDefensa) {
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
    getMovimientos(){
      return this.numMovimientos;
    }

    /**
     * Obtiene el jugador propietario de la pieza.
     * @returns {string} identificador del jugador ('J1' o 'J2')
     */
    getJugador(){
      return this.jugador;
    }

    /**
     * Obtiene el tipo de pieza.
     * @returns {string} tipo de pieza ('Soldado', 'Caballeria', 'Artilleria', 'Comandante')
     */
    getTipo(){
      return this.tipoPieza;
    }

    /**
     * Obtiene la posición actual de la pieza.
     * @returns {{fila: number, col: number}} objeto con propiedades fila y col
     */
    getPosicion(){
      return {fila: this.fil, col: this.col};
    }

    /**
     * Marca la pieza como movida en este turno.
     */
    setMovida(){
      this.movida = true;
    }

    /**
     * Reinicia el estado de movimiento de la pieza para el próximo turno.
     */
    resetMovida(){
      this.movida = false;
    }

    /**
     * Verifica si la pieza ya ha sido movida en este turno.
     * @returns {boolean} true si la pieza ya fue movida, false en caso contrario
     */
    getMovida(){
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