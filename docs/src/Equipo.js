import Soldado from "./Soldado.js";
import Caballeria from "./Caballeria.js";
import Comandante from "./Comandante.js";
import Artilleria from "./Artilleria.js";

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

        // Crear comandante
        let comandante = new Comandante(posicionComandanteJ1.x, posicionComandanteJ1.y, "J1");
        this.tablero.getCelda(posicionComandanteJ1.x, posicionComandanteJ1.y).setContenido(comandante);
        this.piezas.push(comandante);

        //Crear artilleria
        let artilleria = new Artilleria(posicionArtilleria.x, posicionArtilleria.y, "J1");
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
            let soldado = new Soldado(pos.x, pos.y, "J2");  // Crear soldado
            this.tablero.getCelda(pos.x, pos.y).setContenido(soldado);
            this.piezas.push(soldado);
        }

        for (let pos of posicionesCaballeriasJ2) {
            let caballeria = new Caballeria(pos.x, pos.y, "J2");  // Crear caballería
            this.tablero.getCelda(pos.x, pos.y).setContenido(caballeria)
            this.piezas.push(caballeria);
        }

        // Crear comandante
        let comandante = new Comandante(posicionComandanteJ2.x, posicionComandanteJ2.y, "J2");
        this.tablero.getCelda(posicionComandanteJ2.x, posicionComandanteJ2.y).setContenido(comandante);
        this.piezas.push(comandante);

        //Crear artilleria
        let artilleria = new Artilleria(posicionArtilleria.x, posicionArtilleria.y, "J2");
        this.tablero.getCelda(posicionArtilleria.x, posicionArtilleria.y).setContenido(artilleria);
        this.piezas.push(artilleria);

    }
}
