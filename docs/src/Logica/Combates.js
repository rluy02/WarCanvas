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

            let filSoldado = atacaPieza.getPosicion().fila;
            let colSoldado = atacaPieza.getPosicion().col;

            if (filSoldado == defiendePieza.getPosicion().fila) {
                let arriba = filSoldado - 1;
                let abajo = filSoldado + 1;

                if (arriba >= 0 && this.tablero.getCelda(arriba, colSoldado).getTipo() == 'Soldado') bonusAtaca++;
                if (abajo < this.tablero.size().fila && this.tablero.getCelda(abajo, colSoldado).getTipo() == 'Soldado') bonusAtaca++;
            }
            else {
                let izquierda = colSoldado - 1;
                let derecha = colSoldado + 1;
                if (izquierda >= 0 && this.tablero.getCelda(filSoldado, izquierda).getTipo() == 'Soldado') bonusAtaca++;
                if (derecha < this.tablero.size().fila && this.tablero.getCelda(filSoldado, derecha).getTipo() == 'Soldado') bonusAtaca++;
            }

            console.log("El soldado tiene de bonus: ", bonusAtaca)
        }
        bonusDefiende = defiendePieza.getBonusDefensa();

        let totalAtaque = dadosAtaque1 + dadosAtaque2 + bonusAtaca;
        let totalDefensa = dadosDefensa1 + dadosDefensa2 + bonusDefiende;

        ganador = (totalAtaque > totalDefensa);

        this.actualizarPanelAtaque(dadosAtaque1, dadosAtaque2, dadosDefensa1, dadosDefensa2, ganador, bonusAtaca, bonusDefiende);
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

        let totalAtaque = dadosAtaque1 + dadosAtaque2 + bonusAtaca;
        let totalDefensa = dadosDefensa1 + dadosDefensa2 + bonusDefiende;

        let ganador = true; // Siempre gana

        this.actualizarPanelAtaque(
            dadosAtaque1, dadosAtaque2,
            dadosDefensa1, dadosDefensa2,
            ganador,
            bonusAtaca, bonusDefiende
        );

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