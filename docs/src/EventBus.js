export const EventBus = new Phaser.Events.EventEmitter();

// Esto es para lanzar los eventos, como mover pieza, atacar, ganar... Es nativo de phaser, si eso no se lanza
// Si quieres lanzar o emitir eventos necesitas importarlo asi
// import { EventBus } from "./EventBus.js";

// ----------------------------  KEY  --------- VARIABLES A LANZAR -----
//para lanzar EventBus.emit(eventos.PIECE_MOVED, this.piezaActiva);