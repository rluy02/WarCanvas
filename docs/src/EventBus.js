export const EventBus = new Phaser.Events.EventEmitter();

// Guardamos el método emit y on original
const oldEmit = EventBus.emit;
const oldOn = EventBus.on;

/**
 * Emitir un evento con logging para depuración
 * @param {*} event 
 * @param  {...any} args 
 * @returns 
 */
EventBus.emit = function(event, ...args) {
    const stack = new Error().stack.split("\n").slice(2); // stack real del llamador
    
    console.log(`\n=== EVENTO EMITIDO: ${event} ===\nArgs: ${JSON.stringify(args)}\n\nLlamado desde: ${stack[0]}\n=================================`);

    return oldEmit.call(this, event, ...args);
};

EventBus.on = function(event, listener, context) {
    const stack = new Error().stack.split("\n").slice(2);
    const m = stack[0].trim().match(/\/([^\/]+):(\d+):/);

    const location = m ? `${m[1]}:${m[2]}` : "ubicación desconocida";

    console.log(`LISTENER registrado → ${event} @ ${location}`);

    return oldOn.call(this, event, listener, context);
};


// Esto es para lanzar los eventos, como mover pieza, atacar, ganar... Es nativo de phaser, si eso no se lanza
// Si quieres lanzar o emitir eventos necesitas importarlo asi
// import { EventBus } from "./EventBus.js";

// ----------------------------  KEY  --------- VARIABLES A LANZAR -----
//para lanzar EventBus.emit(eventos.PIECE_MOVED, this.piezaActiva);