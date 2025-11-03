import Celda  from "./Celda.js";
import { Eventos } from "./Events.js";
import { EventBus } from "./EventBus.js";

export default class Combates{
    constructor(tablero, tableroGrafico, panelLateral){
        this.tablero = tablero;
        this.tableroGrafico = tableroGrafico;
        this.panelLateral = panelLateral;
        this.atacante = null;
        this.defensa = null;

        EventBus.on(eventos.ENEMY_SELECTED, (atacante, defensa) => { this.enemigoSeleccionado(atacante, defensa)});
        EventBus.on(eventos.ATACK, () => { this.ataque()});
    }

    enemigoSeleccionado(atacante, defensa){
        this.atacante = atacante;
        this.defensa = defensa;

        console.log('enemigo - Combate.js');
                console.log(atacante);
                console.log(defensa);
    }

        ataque(){

        // Dados
        let dadosAtaque1 = Math.floor(Math.random() * 6) + 1;
        let dadosAtaque2 = Math.floor(Math.random() * 6) + 1;
        let dadosDefensa1 = Math.floor(Math.random() * 6) + 1;
        let dadosDefensa2 = Math.floor(Math.random() * 6) + 1;

        // Se suman los bonus
        let ataca = this.atacante.getPieza().getTipo();
        let defiende = this.atacante.getPieza().getTipo();
        let bonusAtaca;
        let bonusDefiende;
        let ganador;

        if(ataca == "Soldado") { bonusAtaca = 1};
        if(defiende == "Soldado") { bonusDefiende = 1};
        if(ataca == "Caballeria") { bonusAtaca = 2};
        if(defiende == "Caballeria") { bonusDefiende = 0};
        if(ataca == "Artilleria") { bonusAtaca = 3};
        if(defiende == "Artilleria") { bonusDefiende = -1};
        if(ataca == "Comandante") { bonusAtaca = 4};
        if(defiende == "Comandante") { bonusDefiende = 5};

        let totalAtaque = dadosAtaque1 + dadosAtaque2 + bonusAtaca;
        let totalDefensa = dadosDefensa1 + dadosDefensa2 + bonusDefiende;

        ganador = (totalAtaque > totalDefensa);

        this.actualizarPanelAtaque(dadosAtaque1, dadosAtaque2, dadosDefensa1, dadosDefensa2, ganador, bonusAtaca, bonusDefiende);
        this.defensa.limpiar();
        this.tableroGrafico.limpiarTablero();
    }

    actualizarPanelAtaque(dadosAtaque1, dadosAtaque2, dadosDefensa1, dadosDefensa2, ganador, bonusAtaca, bonusDefiende){
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

        if (ganador) EventBus.emit(eventos.PIECE_ERRASE, defiende);
    }
}