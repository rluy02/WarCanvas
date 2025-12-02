import Soldado from "./Piezas/Soldado.js";
import Caballeria from "./Piezas/Caballeria.js";
import Comandante from "./Piezas/Comandante.js";
import Artilleria from "./Piezas/Artilleria.js";

export default class Equipo {
    constructor(equipo, tablero, generate=false) {
        this.equipo = equipo;
        this.tablero = tablero;
        this.piezas = [];  // Aquí guardamos las piezas del equipo

        // El máximo de piezas de cada tipo 
        this.Soldados = 16;
        this.Caballeria = 6;
        this.Artilleria = 1;
        this.Comandante = 1;
        
        // Solamente se genera desde la lista si no se han colocado las piezas
        if(generate) {
        if (this.equipo === "J1") {
            this.crearPiezasJ1();
        } else this.crearPiezasJ2();}

    }

    crearPiezasJ1() {
        const posicionesSoldadosJ1 = [
            { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 },
            { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 },
            { x: 6, y: 2 }, { x: 7, y: 2 }
        ];

        const posicionesCaballeriasJ1 = [
            { x: 5, y: 1 }, { x: 1, y: 1 }
        ];
        const posicionComandanteJ1 = { x: 4, y: 0 };

        const posicionArtilleria = {x:3, y:0};

        // Generamos las piezas para el equipo "J1" 
        for (let pos of posicionesSoldadosJ1) {
            let soldado = new Soldado(this.tablero, pos.x, pos.y, "J1");  // Crear soldado
            this.tablero.getCelda(pos.x, pos.y).setContenido(soldado);
            this.piezas.push(soldado);
        }

        for (let pos of posicionesCaballeriasJ1) {
            let caballeria = new Caballeria(this.tablero, pos.x, pos.y, "J1");  // Crear caballería
            this.tablero.getCelda(pos.x, pos.y).setContenido(caballeria)
            this.piezas.push(caballeria);
        }

        // Crear comandante
        let comandante = new Comandante(this.tablero, posicionComandanteJ1.x, posicionComandanteJ1.y, "J1");
        this.tablero.getCelda(posicionComandanteJ1.x, posicionComandanteJ1.y).setContenido(comandante);
        this.piezas.push(comandante);

        //Crear artilleria
        let artilleria = new Artilleria(this.tablero, posicionArtilleria.x, posicionArtilleria.y, "J1");
        this.tablero.getCelda(posicionArtilleria.x, posicionArtilleria.y).setContenido(artilleria);
        this.piezas.push(artilleria);
    }

    crearPiezasJ2() {
        const posicionesSoldadosJ2 = [
            { x: 3, y: 7 }, { x: 4, y: 7 }
        ];

        const posicionesCaballeriasJ2 = [
            { x: 7, y: 7 }
        ];

        const posicionComandanteJ2 = { x: 4, y: 8 };

        const posicionArtilleria = {x:2, y:7};

        // Generamos las piezas para el equipo "J2" 
        for (let pos of posicionesSoldadosJ2) {
            let soldado = new Soldado(this.tablero, pos.x, pos.y, "J2");  // Crear soldado
            this.tablero.getCelda(pos.x, pos.y).setContenido(soldado);
            this.piezas.push(soldado);
        }

        for (let pos of posicionesCaballeriasJ2) {
            let caballeria = new Caballeria(this.tablero, pos.x, pos.y, "J2");  // Crear caballería
            this.tablero.getCelda(pos.x, pos.y).setContenido(caballeria)
            this.piezas.push(caballeria);
        }

        // Crear comandante
        let comandante = new Comandante(this.tablero, posicionComandanteJ2.x, posicionComandanteJ2.y, "J2");
        this.tablero.getCelda(posicionComandanteJ2.x, posicionComandanteJ2.y).setContenido(comandante);
        this.piezas.push(comandante);

        //Crear artilleria
        let artilleria = new Artilleria(this.tablero, posicionArtilleria.x, posicionArtilleria.y, "J2");
        this.tablero.getCelda(posicionArtilleria.x, posicionArtilleria.y).setContenido(artilleria);
        this.piezas.push(artilleria);

    }
    eliminarPieza(p){
        for (let i = 0; i < this.piezas.length; i++) {
        if (this.piezas[i] === p) {
            this.setPiezas(p.getTipo());
            this.piezas.splice(i, 1);  // elimina 1 elemento en la posición i
        }
    }
    }

    setTablero(tab) {
        this.tablero = tab;
    }

    setPiezas(tipo){
        if(tipo == 'Soldado') ++this.Soldados;
        if(tipo == 'Caballeria') ++this.Caballeria;
        if(tipo == 'Artilleria') ++this.Artilleria;
        if(tipo == 'Comandante') ++this.Comandante;
    }

    getNombre() {
        return this.equipo;
    }


    // GET Y SET - del numero de piezas maximo de cada tipo

    getSoldados() {
        return this.Soldados;
    }
    setSoldado(pieza) {
        --this.Soldados;
        this.piezas.push(pieza);
    }
    getCaballeria() {
        return this.Caballeria;
    }
    setCaballeria(pieza) {
        --this.Caballeria;
        this.piezas.push(pieza);
    }
    getArtilleria() {
        return this.Artilleria;
    }
    setArtilleria(pieza) {
        --this.Artilleria;
        this.piezas.push(pieza);
    }
    getComandante() {
        return this.Comandante;
    }
    setComandante(pieza) {
        --this.Comandante;
        this.piezas.push(pieza);
    }
}
