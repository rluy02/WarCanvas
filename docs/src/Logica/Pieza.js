export default class Pieza {

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

    moverse(fil, col) {
      this.fil = fil;
      this.col = col;
    }

    getMovimientos(){
      return this.numMovimientos;
    }

    getJugador(){
      return this.jugador;
    }

    getTipo(){
      return this.tipoPieza;
    }

    getPosicion(){
      return {fila: this.fil, col: this.col};
    }

    setMovida(){
      this.movida = true;
    }

    resetMovida(){
      this.movida = false;
    }

    getMovida(){
      return this.movida;
    }

    getBonusAtaque() {
      return this.bonusAtaque;
    }

    getBonusDefensa() {
      return this.bonusDefensa;
    }

    setTablero(t) {
      this.tablero = t;
    }
}