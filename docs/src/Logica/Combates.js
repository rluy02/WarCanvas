import { Eventos } from "../Events.js";
import { EventBus } from "../EventBus.js";
import Tablero from "./Tablero.js";
import TableroGrafico from "../Render/TableroGrafico.js";
import PanelLateral from "../Render/PanelLateral.js";
import Pieza from "./Pieza.js";

/**
 * Clase que gestiona los combates entre piezas.
 * @class Combates
 * @memberof Logica
 */
class Combates {
    /**
     * Constructor de la clase Combates.
     * @param {Tablero} tablero - tablero lógico
     * @param {TableroGrafico} tableroGrafico - tablero gráfico
     * @param {PanelLateral} panelLateral - panel lateral gráfico
     */
    constructor(tablero, tableroGrafico, panelLateral) {
        this.tablero = tablero;
        this.tableroGrafico = tableroGrafico;
        this.panelLateral = panelLateral;
        this.atacante = null;
        this.defensa = null;

        EventBus.on(Eventos.ENEMY_SELECTED, (atacante, defensa) => { this.enemigoSeleccionado(atacante, defensa) }); // Se lanza desde Tablero.js ataque - que viene de onClick  enemigo 
        EventBus.on(Eventos.ATACK, () => { this.ataque() }); // Se lanza desde PanelLateral.js - al pulsar el boton atacar
        EventBus.on(Eventos.ATTACK_CHEAT, () => { this.ataqueCheat(); });
    }

    /**
     * Setea las piezas atacante y defensa.
     * @param {Pieza} atacante - pieza atacante
     * @param {Pieza} defensa - pieza defensa
     */
    enemigoSeleccionado(atacante, defensa) {
        this.atacante = atacante;
        this.defensa = defensa;
    }

    /**
     * Realiza el ataque entre las piezas atacante y defensa.
     */
    ataque() {

        // Dado s
        let dadosAtaque1 = Phaser.Math.Between(1, 6);
        let dadosAtaque2 = Phaser.Math.Between(1, 6);
        let dadosDefensa1 = Phaser.Math.Between(1, 6);
        let dadosDefensa2 = Phaser.Math.Between(1, 6);

        // Se suman los bonus
        let atacaPieza = this.atacante.getPieza();
        let defiendePieza = this.defensa.getPieza();

        let ataca = this.atacante.getPieza().getTipo();
        let defiende = this.defensa.getPieza().getTipo();
        let bonusAtaca;
        let bonusDefiende;
        let ganador;

        bonusAtaca = atacaPieza.getBonusAtaque();

        if (ataca == 'Soldado') {

            let fil = atacaPieza.getPosicion().fila;
            let col = atacaPieza.getPosicion().col;

            // ATAQUE HORIZONTAL
            if (fil == defiendePieza.getPosicion().fila) {

                // Arriba
                let arriba = fil - 1;
                if (arriba >= 0) {
                    let piezaArriba = this.tablero.getCelda(arriba, col).getPieza();
                    if (piezaArriba && piezaArriba.getTipo() === 'Soldado' &&
                        piezaArriba.getJugador() === atacaPieza.getJugador()) {
                        bonusAtaca++;
                    }
                }

                // Abajo
                let abajo = fil + 1;
                if (abajo < this.tablero.size().fila) {
                    let piezaAbajo = this.tablero.getCelda(abajo, col).getPieza();
                    if (piezaAbajo && piezaAbajo.getTipo() === 'Soldado' &&
                        piezaAbajo.getJugador() === atacaPieza.getJugador()) {
                        bonusAtaca++;
                    }
                }
            }

            // ATAQUE VERTICAL
            else {

                // Izquierda
                let izquierda = col - 1;
                if (izquierda >= 0) {
                    let piezaIzq = this.tablero.getCelda(fil, izquierda).getPieza();
                    if (piezaIzq && piezaIzq.getTipo() === 'Soldado' &&
                        piezaIzq.getJugador() === atacaPieza.getJugador()) {
                        bonusAtaca++;
                    }
                }

                // Derecha
                let derecha = col + 1;
                if (derecha < this.tablero.size().col) {
                    let piezaDer = this.tablero.getCelda(fil, derecha).getPieza();
                    if (piezaDer && piezaDer.getTipo() === 'Soldado' &&
                        piezaDer.getJugador() === atacaPieza.getJugador()) {
                        bonusAtaca++;
                    }
                }
            }

            console.log("El soldado tiene bonus:", bonusAtaca);
        }
        bonusDefiende = defiendePieza.getBonusDefensa();

        let totalAtaque = dadosAtaque1 + dadosAtaque2 + bonusAtaca;
        let totalDefensa = dadosDefensa1 + dadosDefensa2 + bonusDefiende;

        ganador = (totalAtaque > totalDefensa);

        this.actualizarPanelAtaque(dadosAtaque1, dadosAtaque2, dadosDefensa1, dadosDefensa2, ganador, bonusAtaca, bonusDefiende);
        
        // NUEVO: Marcar la pieza atacante como movida siempre (gane o pierda)
        // Esto asegura que se reste una acción del turno
        atacaPieza.setMovida(true);
        EventBus.emit(Eventos.PIECE_MOVED, atacaPieza, true)
        // Se elimina la pieza si el atacante gana en el evento que se emite en actualizarPanel (inicio)
        // Restablecer resaltados/selección
        this.tableroGrafico.restTablero();
    }

    /**
     * Realiza un ataque con trampa garantizando la victoria del atacante.
     */
    ataqueCheat() {
        // Dados normales
        let dadosAtaque1 = Phaser.Math.Between(1, 6);
        let dadosAtaque2 = Phaser.Math.Between(1, 6);
        let dadosDefensa1 = Phaser.Math.Between(1, 6);
        let dadosDefensa2 = Phaser.Math.Between(1, 6);

        // Bonus cheat
        let bonusAtaca = 100;
        let bonusDefiende = this.defensa.getPieza().getBonusDefensa();

         // Se suman los bonus
        let atacaPieza = this.atacante.getPieza();
        //let defiendePieza = this.defensa.getPieza();

        let ganador = true; // Siempre gana

        this.actualizarPanelAtaque(
            dadosAtaque1, dadosAtaque2,
            dadosDefensa1, dadosDefensa2,
            ganador,
            bonusAtaca, bonusDefiende
        );

        // NUEVO: Marcar la pieza atacante como movida siempre (gane o pierda)
        // Esto asegura que se reste una acción del turno
        atacaPieza.setMovida(true);
        EventBus.emit(Eventos.PIECE_MOVED, atacaPieza, true)
        // Se elimina la pieza si el atacante gana en el evento que se emite en actualizarPanel (inicio)
        // Restablecer resaltados/selección
        this.tableroGrafico.restTablero();
    }

    /**
     * Actualiza el panel lateral con la información del combate.
     * @param {*} dadosAtaque1 
     * @param {*} dadosAtaque2 
     * @param {*} dadosDefensa1 
     * @param {*} dadosDefensa2 
     * @param {*} ganador 
     * @param {*} bonusAtaca 
     * @param {*} bonusDefiende 
     */
    actualizarPanelAtaque(dadosAtaque1, dadosAtaque2, dadosDefensa1, dadosDefensa2, ganador, bonusAtaca, bonusDefiende) {
        let ataca = this.atacante.getPieza();
        let defiende = this.defensa.getPieza();

        let resultado = ganador
            ? `Gana ${ataca.getTipo()} de ${ataca.getJugador()}, Muere ${defiende.getTipo()} de ${defiende.getJugador()}`
            : `Gana ${defiende.getTipo()} de ${defiende.getJugador()}, Pierde ${ataca.getTipo()} de ${ataca.getJugador()}`;

        let mensaje = `Ataca: ${ataca.getJugador()} Defiende: ${defiende.getJugador()}`;

        this.panelLateral.updateCombatInfo(mensaje, resultado, ataca.getJugador(), defiende.getJugador(), dadosAtaque1, dadosAtaque2, dadosDefensa1, dadosDefensa2, bonusAtaca, bonusDefiende);

        ('Panel ataque - Combate.js');

        if (ganador) {
            EventBus.emit(Eventos.PIECE_ERASE, defiende, ataca); //Se captura en Inicio (hace la parte grafica)
            if (defiende.getTipo() === "Comandante") {
                EventBus.emit(Eventos.END_GAME, {
                    jugador: ataca.getJugador(),
                    tipo: "COMBATE"
                }); //Acabamos la partida capturandolo en Inicio
            }
        }
    }
}

export default Combates;