import Soldado from "./Piezas/Soldado.js";
import Caballeria from "./Piezas/Caballeria.js";
import Comandante from "./Piezas/Comandante.js";
import Artilleria from "./Piezas/Artilleria.js";
import Tablero from "./Tablero.js";
import Pieza from "./Pieza.js";

/**
 * Clase que representa un equipo en el juego.
 * @class Equipo
 * @memberof Logica
 */
class Equipo {
    /**
     * Constructor del equipo.
     * @param {string} equipo - nombre del equipo ('J1' o 'J2')
     * @param {Tablero} tablero - tablero de juego
     * @param {boolean} generate - indica si se deben generar las piezas automáticamente
     * @constructor
     */
    constructor(equipo, tablero, generate = false) {
        this.equipo = equipo;
        this.tablero = tablero;
        this.piezas = [];  // Aquí guardamos las piezas del equipo

        // El máximo de piezas de cada tipo 
        this.Soldados = 16;
        this.Caballeria = 6;
        this.Artilleria = 1;
        this.Comandante = 1;

        // Solamente se genera desde la lista si no se han colocado las piezas
        if (generate) {
            if (this.equipo === "J1") {
                this.crearPiezasJ1();
            } else this.crearPiezasJ2();
        }

    }

    /**
     * Crea las piezas para el equipo J1 y las coloca en el tablero.
     */
    crearPiezasJ1() {
        const posicionesSoldadosJ1 = [
            // Columna 0 (primera)
            { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 2 },
            { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 },
            // Columna 1 (segunda)
            { x: 0, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 5, y: 1 },
            { x: 6, y: 1 }, { x: 7, y: 1 },
            // Columna 2 (tercera)
            { x: 1, y: 2 }, { x: 6, y: 2 }
        ];

        const posicionesCaballeriasJ1 = [
            { x: 1, y: 1 }, { x: 4, y: 2 }, // Caballería reemplaza donde estaba comandante
            { x: 0, y: 2 }, { x: 2, y: 2 }, { x: 5, y: 2 }, { x: 7, y: 2 } // Columna 2
        ];
        
        const posicionComandanteJ1 = { x: 3, y: 0 }; // Columna 2 (más atrás) - reemplaza artillería
        const posicionArtilleria = { x: 4, y: 1 }; // Columna 1 (medio) - reemplaza caballería

        // Generamos las piezas para el equipo "J1" 
        for (let pos of posicionesSoldadosJ1) {
            let soldado = new Soldado(this.tablero, pos.x, pos.y, "J1");
            this.tablero.getCelda(pos.x, pos.y).setContenido(soldado);
            this.piezas.push(soldado);
        }

        for (let pos of posicionesCaballeriasJ1) {
            let caballeria = new Caballeria(this.tablero, pos.x, pos.y, "J1");
            this.tablero.getCelda(pos.x, pos.y).setContenido(caballeria)
            this.piezas.push(caballeria);
        }

        // Crear comandante
        let comandante = new Comandante(this.tablero, posicionComandanteJ1.x, posicionComandanteJ1.y, "J1");
        this.tablero.getCelda(posicionComandanteJ1.x, posicionComandanteJ1.y).setContenido(comandante);
        this.piezas.push(comandante);

        // Crear artilleria
        let artilleria = new Artilleria(this.tablero, posicionArtilleria.x, posicionArtilleria.y, "J1");
        this.tablero.getCelda(posicionArtilleria.x, posicionArtilleria.y).setContenido(artilleria);
        this.piezas.push(artilleria);
    }

    /**
     * Crea las piezas para el equipo J2 y las coloca en el tablero.
     */
    crearPiezasJ2() {
        const posicionesSoldadosJ2 = [
            // Columna 9 (última)
            { x: 0, y: 9 }, { x: 1, y: 9 }, { x: 2, y: 9 }, { x: 3, y: 7 },
            { x: 4, y: 9 }, { x: 5, y: 9 }, { x: 6, y: 9 }, { x: 7, y: 9 },
            // Columna 8 (antepenúltima)
            { x: 0, y: 8 }, { x: 2, y: 8 }, { x: 3, y: 8 }, { x: 5, y: 8 },
            { x: 6, y: 8 }, { x: 7, y: 8 },
            // Columna 7 (penúltima)
            { x: 1, y: 7 }, { x: 6, y: 7 }
        ];

        const posicionesCaballeriasJ2 = [
            { x: 1, y: 8 }, { x: 4, y: 7 }, // Caballería reemplaza donde estaba comandante
            { x: 0, y: 7 }, { x: 2, y: 7 }, { x: 5, y: 7 }, { x: 7, y: 7 } // Columna 7
        ];

        const posicionComandanteJ2 = { x: 3, y: 9 }; // Columna 7 (más atrás) - reemplaza artillería
        const posicionArtilleria = { x: 4, y: 8 }; // Columna 8 (medio) - reemplaza caballería

        // Generamos las piezas para el equipo "J2" 
        for (let pos of posicionesSoldadosJ2) {
            let soldado = new Soldado(this.tablero, pos.x, pos.y, "J2");
            this.tablero.getCelda(pos.x, pos.y).setContenido(soldado);
            this.piezas.push(soldado);
        }

        for (let pos of posicionesCaballeriasJ2) {
            let caballeria = new Caballeria(this.tablero, pos.x, pos.y, "J2");
            this.tablero.getCelda(pos.x, pos.y).setContenido(caballeria)
            this.piezas.push(caballeria);
        }

        // Crear comandante
        let comandante = new Comandante(this.tablero, posicionComandanteJ2.x, posicionComandanteJ2.y, "J2");
        this.tablero.getCelda(posicionComandanteJ2.x, posicionComandanteJ2.y).setContenido(comandante);
        this.piezas.push(comandante);

        // Crear artilleria
        let artilleria = new Artilleria(this.tablero, posicionArtilleria.x, posicionArtilleria.y, "J2");
        this.tablero.getCelda(posicionArtilleria.x, posicionArtilleria.y).setContenido(artilleria);
        this.piezas.push(artilleria);
    }

    /**
     * Elimina una pieza del equipo.
     * @param {Pieza} p - pieza a eliminar
     */
    eliminarPieza(p) {
        for (let i = 0; i < this.piezas.length; i++) {
            if (this.piezas[i] === p) {
                this.setPiezas(p.getTipo());
                this.piezas.splice(i, 1);  // elimina 1 elemento en la posición i
            }
        }
    }

    /**
     * Settea el tablero del equipo.
     * @param {Tablero} tab - tablero a settear
     */
    setTablero(tab) {
        this.tablero = tab;
    }

    /**
     * Aumenta el contador de piezas del tipo especificado.
     * @param {string} tipo - tipo de pieza ('Soldado', 'Caballeria', 'Artilleria', 'Comandante')
     */
    setPiezas(tipo) {
        if (tipo == 'Soldado') ++this.Soldados;
        if (tipo == 'Caballeria') ++this.Caballeria;
        if (tipo == 'Artilleria') ++this.Artilleria;
        if (tipo == 'Comandante') ++this.Comandante;
    }

    /**
     * Devuelve el nombre del equipo.
     * @returns {string} - nombre del equipo
     */
    getNombre() {
        return this.equipo;
    }

    // GET Y SET - del numero de piezas maximo de cada tipo
    /**
     * Devuelve el número de soldados restantes.
     * @returns {number} - número de soldados restantes
     */
    /**
     * Devuelve el número de soldados restantes disponibles.
     * @returns {number} - número de soldados restantes
     */
    getSoldados() {
        return this.Soldados;
    }
    
    /**
     * Agrega un soldado al equipo y decrementa el contador de soldados disponibles.
     * @param {Soldado} pieza - soldado a agregar al equipo
     */
    setSoldado(pieza) {
        --this.Soldados;
        this.piezas.push(pieza);
    }
    /**
     * Devuelve el número de caballerías restantes disponibles.
     * @returns {number} - número de caballerías restantes
     */
    getCaballeria() {
        return this.Caballeria;
    }
    
    /**
     * Agrega una caballería al equipo y decrementa el contador de caballerías disponibles.
     * @param {Caballeria} pieza - caballería a agregar al equipo
     */
    setCaballeria(pieza) {
        --this.Caballeria;
        this.piezas.push(pieza);
    }
    /**
     * Devuelve el número de piezas de artillería restantes disponibles.
     * @returns {number} - número de artillerías restantes
     */
    getArtilleria() {
        return this.Artilleria;
    }
    
    /**
     * Agrega una artillería al equipo y decrementa el contador de artillerías disponibles.
     * @param {Artilleria} pieza - artillería a agregar al equipo
     */
    setArtilleria(pieza) {
        --this.Artilleria;
        this.piezas.push(pieza);
    }
    /**
     * Devuelve el número de comandantes restantes disponibles.
     * @returns {number} - número de comandantes restantes
     */
    getComandante() {
        return this.Comandante;
    }
    
    /**
     * Agrega un comandante al equipo y decrementa el contador de comandantes disponibles.
     * @param {Comandante} pieza - comandante a agregar al equipo
     */
    setComandante(pieza) {
        --this.Comandante;
        this.piezas.push(pieza);
    }
}

export default Equipo;
