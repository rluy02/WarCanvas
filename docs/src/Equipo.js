import Soldado from "./Soldado.js";
import Caballeria from "./Caballeria.js";

export default class Equipo {
    constructor(equipo, tablero) {
        this.equipo = equipo;
        this.tablero = tablero;
        this.piezas = [];  // Aquí guardamos las piezas del equipo

        if (this.equipo === "J1") {
            this.crearPiezasJ1();
        } else this.crearPiezasJ2();

    }


    crearPiezasJ1() {
        const posicionesSoldadosJ1 = [
            { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 6, y: 3 },
            { x: 1, y: 2 }, { x: 2, y: 0 }, { x: 2, y: 5 },
            { x: 5, y: 0 }, { x: 4, y: 7 }
        ];

        const posicionesCaballeriasJ1 = [
            { x: 7, y: 5 }, { x: 4, y: 1 }
        ];

        // Generamos las piezas para el equipo "J1" 
        for (let pos of posicionesSoldadosJ1) {
            let soldado = new Soldado(pos.x, pos.y, "J1");  // Crear soldado
            this.tablero.getCelda(pos.x, pos.y).setContenido(soldado);
            //console.log(this.tablero.getCelda(pos.x, pos.y));
            this.piezas.push(soldado);
        }

        for (let pos of posicionesCaballeriasJ1) {
            let caballeria = new Caballeria(pos.x, pos.y, "J1");  // Crear caballería
            this.tablero.getCelda(pos.x, pos.y).setContenido(caballeria)
            this.piezas.push(caballeria);
        }
    }

    crearPiezasJ2() {
        const posicionesSoldadosJ2 = [
            { x: 0, y: 0 }, { x: 0, y: 1 }
        ];

        const posicionesCaballeriasJ2 = [
            { x: 7, y: 7 }
        ];


        // Generamos las piezas para el equipo "J2" 
        for (let pos of posicionesSoldadosJ2) {
            let soldado = new Soldado(pos.x, pos.y, "J2");  // Crear soldado
            this.tablero.getCelda(pos.x, pos.y).setContenido(soldado);
            this.piezas.push(soldado);
        }

        for (let pos of posicionesCaballeriasJ2) {
            let caballeria = new Caballeria(pos.x, pos.y, "J2");  // Crear caballería
            this.tablero.getCelda(pos.x, pos.y).setContenido(caballeria)
            this.piezas.push(caballeria);
        }

    }
}
