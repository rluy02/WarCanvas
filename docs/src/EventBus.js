export const EventBus = new Phaser.Events.EventEmitter();

// Guardamos el método emit original
const oldEmit = EventBus.emit;

/**
 * Emitir un evento con logging para depuración
 * @param {*} event 
 * @param  {...any} args 
 * @returns 
 */
EventBus.emit = function(event, ...args) {
    const stack = new Error().stack.split("\n").slice(2); // stack real del llamador
    
    console.log(`\n=== EVENTO EMITIDO: ${event} ===`);
    console.log("Args: ", args);
    console.log("Llamado desde: ", stack[0]);
    console.log("================================\n");

    return oldEmit.call(this, event, ...args);
};


// Esto es para lanzar los eventos, como mover pieza, atacar, ganar... Es nativo de phaser, si eso no se lanza
// Si quieres lanzar o emitir eventos necesitas importarlo asi
// import { EventBus } from "./EventBus.js";

// ----------------------------  KEY  --------- VARIABLES A LANZAR -----
//para lanzar EventBus.emit(eventos.PIECE_MOVED, this.piezaActiva);