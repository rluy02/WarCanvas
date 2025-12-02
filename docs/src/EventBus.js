export const EventBus = new MyEventBus();

/**
 * Extiende Phaser.Events.EventEmitter para crear un bus de eventos global.
 * Permite emitir y escuchar eventos en toda la aplicación.
 */
class MyEventBus extends Phaser.Events.EventEmitter {
     constructor() {
        super();
    }

    /**
     * Lanza un evento con los argumentos proporcionados.
     * @param {*} event 
     * @param  {...any} args 
     * @returns 
     */
    emit(event, ...args) {
        console.log(`[EMIT] Evento: ${event}`, args);
        return super.emit(event, ...args);
    }

    on(event, listener, context) {
        console.log(`[ON] Event: ${event}`);
        return super.on(event, listener, context);
    }
}
// Esto es para lanzar los eventos, como mover pieza, atacar, ganar... Es nativo de phaser, si eso no se lanza
// Si quieres lanzar o emitir eventos necesitas importarlo asi
// import { EventBus } from "./EventBus.js";

// ----------------------------  KEY  --------- VARIABLES A LANZAR -----
//para lanzar EventBus.emit(eventos.PIECE_MOVED, this.piezaActiva);