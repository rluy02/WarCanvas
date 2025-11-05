import Celda from "./Celda.js";
import { Eventos } from "./Events.js";
import { EventBus } from "./EventBus.js";

export default class Combates {
    constructor(tablero, tableroGrafico, panelLateral) {
        this.tablero = tablero;
        this.tableroGrafico = tableroGrafico;
        this.panelLateral = panelLateral;
        this.atacante = null;
        this.defensa = null;

        EventBus.on(Eventos.ENEMY_SELECTED, (atacante, defensa) => { this.enemigoSeleccionado(atacante, defensa) }); // Se lanza desde Tablero.js ataque - que viene de onClick  enemigo 
        EventBus.on(Eventos.ATACK, () => { this.ataque() }); // Se lanza desde PanelLateral.js - al pulsar el boton atacar
    }

    enemigoSeleccionado(atacante, defensa) {
        this.atacante = atacante;
        this.defensa = defensa;

        console.log('enemigo - Combate.js');
        console.log(atacante);
        console.log(defensa);
    }

    ataque() {

        // Dado s
        let dadosAtaque1 = Phaser.Math.Between(1, 6);
        let dadosAtaque2 = Phaser.Math.Between(1, 6);
        let dadosDefensa1 = Phaser.Math.Between(1, 6);
        let dadosDefensa2 = Phaser.Math.Between(1, 6);

        // Se suman los bonus
        let ataca = this.atacante.getPieza().getTipo();
        let defiende = this.defensa.getPieza().getTipo();
        let bonusAtaca;
        let bonusDefiende;
        let ganador;

        if (ataca == 'Soldado') { bonusAtaca = 1; }
        else if (ataca == 'Caballeria') { bonusAtaca = 2; }
        else if (ataca == 'Artilleria') { bonusAtaca = 3; }
        else if (ataca == 'Comandante') { bonusAtaca = 4; }

        if (defiende == 'Soldado') { bonusDefiende = 1; }
        else if (defiende == 'Caballeria') { bonusDefiende = 0; }
        else if (defiende == 'Artilleria') { bonusDefiende = -1; }
        else if (defiende == 'Comandante') { bonusDefiende = 5; }

        let totalAtaque = dadosAtaque1 + dadosAtaque2 + bonusAtaca;
        let totalDefensa = dadosDefensa1 + dadosDefensa2 + bonusDefiende;

        ganador = (totalAtaque > totalDefensa);

        this.actualizarPanelAtaque(dadosAtaque1, dadosAtaque2, dadosDefensa1, dadosDefensa2, ganador, bonusAtaca, bonusDefiende);
        // Se elimina la pieza si el atacante gana en el evento que se emite en actualizarPanel (inicio)
        // Restablecer resaltados/selección
        this.tableroGrafico.restTablero();
    }

    actualizarPanelAtaque(dadosAtaque1, dadosAtaque2, dadosDefensa1, dadosDefensa2, ganador, bonusAtaca, bonusDefiende) {
        let ataca = this.atacante.getPieza();
        let defiende = this.defensa.getPieza();

        // let resultado;
        // if (ganador) {
        // resultado = `Gana: ${ataca.getJugador()}, Muere ${defiende.getTipo()} de ${defiende.getJugador()}`;}
        // else {
        // resultado = `Gana: ${defiende.getJugador()}, Pierde ${ataca.getTipo()} de ${ataca.getJugador()}`;}

        let resultado = ganador
            ? `Gana: ${ataca.getJugador()}, Muere ${defiende.getTipo()} de ${defiende.getJugador()}`
            : `Gana: ${defiende.getJugador()}, Pierde ${ataca.getTipo()} de ${ataca.getJugador()}`;

        let mensaje = `Ataca: ${ataca.getJugador()} Defiende: ${defiende.getJugador()}`;

        this.panelLateral.updateCombatInfo(mensaje, resultado, ataca.getJugador(), defiende.getJugador(), dadosAtaque1, dadosAtaque2, dadosDefensa1, dadosDefensa2, bonusAtaca, bonusDefiende);

        console.log('Panel ataque - Combate.js');

        if (ganador) 
            {
                EventBus.emit(Eventos.PIECE_ERASE, defiende, ataca); //Inicio (hace la parte grafica)
            } 
    }
}