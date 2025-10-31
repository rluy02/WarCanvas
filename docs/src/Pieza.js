export default class Pieza {

    constructor(tipoPieza, fil, col, jugador, numMovimientos) {
        this.tipoPieza = tipoPieza;
        this.fil = fil;
        this.col = col;
        this.jugador = jugador;
        this.numMovimientos = numMovimientos;
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
}