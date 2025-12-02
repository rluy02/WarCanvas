import PanelColocarPiezas from "../Render/PanelColocarPiezas.js";
import ColocarPiezas from "../Logica/ColocarPiezas.js";
import TableroGraficoColocarPiezas from "../Render/TableroGaficoColocarPiezas.js";
import PiezaGrafico from "../Render/PiezaGrafico.js";
import PanelEventos from "../Render/PanelEventos.js";
import Equipo from "../Logica/Equipo.js";
import { Eventos } from "../Events.js";
import { EventBus } from "../EventBus.js";

export default class EscenaColocarPiezas extends Phaser.Scene {
    constructor() {
        super("ElegirPiezas")
    }

    init() {
    }

    preload() {
       this.crearImagenes();
    }

    create() {
       // this.crearAnimaciones();
       this.todasLasPiezas = true;

        this.equipoJ1 = new Equipo("J1");
        this.equipoJ2 = new Equipo("J2");

        //Creamos la instancia y la guardamos en tab
        this.tab = new ColocarPiezas(this.equipoJ1, this.equipoJ2);

        this.piezas = [];
        this.piezaGrafico = new PiezaGrafico(this, this.tab);

        //Dibujamos el tablero
        this.tabGrafico = new TableroGraficoColocarPiezas(this.equipoJ1, this.equipoJ2, this, this.tab);

        this.panelElegirPiezas = new PanelColocarPiezas(this, this.tab, this.tabGrafico, this.equipoJ1, this.equipoJ2);
        this.PanelEventos = new PanelEventos(this);
        this.PanelEventos.mostrar('Colocar el tablero', 'Para posicionar las piezas en el tablero, pulsa las casillas disponibles. Para modificar una pieza, pulsa sobre ella y selecciona su nueva posición.', 'WarCanvas');

         EventBus.on(Eventos.PIECE_POSITION, (pieza) => {
            this.piezaPosicionada(pieza); // Emit en ElegirPieza Tablero
            this.tabGrafico.colorearRango();
        });
        EventBus.on(Eventos.PIECE_DELETE, (pieza)=> {
            this.piezaEliminada(pieza); // Emit en ElegirPieza Tablero
            this.tabGrafico.colorearRango();
        });
    }

    crearImagenes(){
        this.load.image('peon', './imgs/piezas/peon.webp');
        this.load.image('peon2', './imgs/piezas/peon2.webp');
        this.load.image('caballeria', './imgs/piezas/caballeria-dibujada.webp');
        this.load.image('caballeria2', './imgs/piezas/Caballeria2.webp');
        this.load.image('comandante', './imgs/piezas/Comandante.webp');
        this.load.image('comandante2', './imgs/piezas/Comandante2.webp');
        this.load.image('artilleria', './imgs/piezas/artilleriaJ1.webp');
        this.load.image('artilleria2', './imgs/piezas/artilleriaJ1.webp');
    }

    piezaPosicionada(pieza) {
        this.piezaGrafico.dibujarPieza(pieza);
    }
    piezaEliminada(pieza) {
        this.piezaGrafico.eliminarPieza(pieza)
    }

    cambiarEscena() {
        let e1 = this.equipoJ1.getSoldados() + this.equipoJ1.getCaballeria() + this.equipoJ1.getArtilleria() + this.equipoJ1.getComandante();
        let e2 = this.equipoJ2.getSoldados() + this.equipoJ2.getCaballeria() + this.equipoJ2.getArtilleria() + this.equipoJ2.getComandante();
        if(this.todasLasPiezas && (e1 > 0 || e2 > 0)) this.PanelEventos.mostrar('Colocar el tablero', 'Para continuar todas las piezas deben estar posicionadas.', 'Coloca todas las piezas');
        else {
        EventBus.removeAllListeners();
        this.scene.start('Inicio', {
                equipo1: this.equipoJ1,
                equipo2: this.equipoJ2
        });
        this.equipoJ1 = undefined;
        this.equipoJ2 = undefined;}
    }

    Cheat() {
        this.todasLasPiezas = !this.todasLasPiezas;
    }

}