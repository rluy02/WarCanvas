import Pieza from '../Pieza.js';

/**
 * Clase Soldado - Pieza básica del juego
 * Hereda de Pieza y calcula un peso dinámico basado en piezas enemigas cercanas
 */
export default class Soldado extends Pieza {
    /**
     * Constructor del Soldado
     * @param {Tablero} tablero - Referencia al tablero de juego
     * @param {number} fil - Fila inicial del soldado
     * @param {number} col - Columna inicial del soldado
     * @param {string} jugador - Identificador del jugador ('J1' o 'J2')
     */
    constructor(tablero, fil, col, jugador) {
        // Llama al constructor padre con: tipo='Soldado', movimiento=2, ataque=1, defensa=1
        super(tablero, 'Soldado', fil, col, jugador, 2, 1, 1);

        /**
         * Peso base del soldado (sin considerar enemigos cercanos)
         * @type {number}
         */
        this.pesoBase = 1;
    }

    /**
     * Calcula el peso táctico del soldado basándose en piezas enemigas cercanas
     * Explora vecinos directos (distancia 1) y sus vecinos (distancia 2)
     * A mayor cantidad y calidad de enemigos cercanos, mayor peso
     * @returns {number} Peso total calculado (pesoBase + bonus por enemigos cercanos)
     * @param {number} peso - Peso comienza siendo el peso base de la pieza y el cáclculo del peso final varía según el tipo de pieza
     */
    calculaPeso() {
        let modo = { cerca: true, lejos: !cerca }
        let peso = this.pesoBase;
        const celdasVisitadas = new Set();

        // Obtener celdas vecinas directas (distancia 1)
        const celdasVecinas = this.GetVecinos(this.tablero.getCelda(this.fil, this.col), celdasVisitadas);

        // Analizar vecinos directos
        for (const vecino of celdasVecinas) {
            peso += this.detectaTipo(vecino);
            celdasVisitadas.add(vecino);

            // Analizar vecinos de segundo nivel (distancia 2)
            const sigVecinos = this.GetVecinos(vecino, celdasVisitadas);
            for (const sigVecino of sigVecinos) {
                peso += this.detectaTipo(sigVecino);
                celdasVisitadas.add(sigVecino);
            }
        }
        if (peso === this.pesoBase)
            modo.cerca = false;
        if (modo.lejos) {

        }

        return peso;
    }

    /**
     * Detecta el tipo de pieza en una celda y devuelve su valor táctico
     * Solo cuenta piezas del jugador 'J1' (enemigo)
     * @param {Celda} celda - Celda a analizar
     * @returns {number} Peso según tipo de pieza enemiga (0 si vacía o aliada)
     */
    detectaTipo(celda) {
        let peso = 0;

        // Solo contabiliza piezas enemigas del jugador J1
        if (!celda.estaVacia() && celda.getPieza().getJugador() === 'J1') {
            switch (celda.getPieza().getTipo()) {
                case 'Soldado':
                    peso += 1;
                    break;
                case 'Caballeria':
                    peso += 2;
                    break;
                case 'Comandante':
                    peso += 3;
                    break;
                case 'Artilleria':
                    peso += 4;
                    break;
            }
        }
        return peso;
    }

    /**
     * Obtiene las celdas vecinas válidas (arriba, abajo, izquierda, derecha)
     * Excluye vecinos fuera del tablero o ya visitados
     * @param {Celda} celda - Celda central desde la que buscar vecinos
     * @param {Set<Celda>} celdasVisitadas - Set de celdas ya procesadas (evita repeticiones)
     * @returns {Array<Celda>} Array de celdas vecinas válidas
     */
    GetVecinos(celda, celdasVisitadas) {
        const pos = celda.getPosicion();
        const fila = pos.fila;
        const col = pos.col;
        const res = [];

        // Arriba
        if (fila > 0 && !celdasVisitadas.has(this.tablero.getCelda(fila - 1, col))) {
            res.push(this.tablero.getCelda(fila - 1, col));
        }

        // Abajo
        if (fila < this.tablero.filas - 1 && !celdasVisitadas.has(this.tablero.getCelda(fila + 1, col))) {
            res.push(this.tablero.getCelda(fila + 1, col));
        }

        // Izquierda
        if (col > 0 && !celdasVisitadas.has(this.tablero.getCelda(fila, col - 1))) {
            res.push(this.tablero.getCelda(fila, col - 1));
        }

        // Derecha
        if (col < this.tablero.columnas - 1 && !celdasVisitadas.has(this.tablero.getCelda(fila, col + 1))) {
            res.push(this.tablero.getCelda(fila, col + 1));
        }

        return res;
    }

    checkFormacion(celda, celdaCentro) {
        let cFil = celda.getPosicion().fila; cCol = celda.getPosicion().columna
        let pFil = celdaCentro.getPosicion().fil; pCol = celdaCentro.getPosicion().col;

        let maxBonus = 0;
        let formacion = false;
        if (cFil - pFil != 0) {
            if (!celda.estaVacia() && celda.getPieza().getJugador() === 'J2' && celda.getPieza().getTipo() === 'Soldado') {
                const terceraCelda = ((cFil - pFil < 0 && pFil + 1 < this.tablero.filas) || (cFil - pFil > 0 && pFil - 1 >= 0)) ? this.tablero.getCelda(cFil + 2, cCol) : this.tablero.getCelda(cFil - 2, cCol)
                if (!terceraCelda.estaVacia() && terceraCelda.getPieza().getJugador() === 'J2' && terceraCelda.getPieza().getTipo() === 'Soldado') {
                    formacion = true;
                    const celdaIzq = pCol - 1 >= 0 ? this.tablero.getCelda(pFil, pCol - 1) : null;
                    const celdaDcha = pCol + 1 < this.tablero.columnas ? this.tablero.getCelda(pFil, pCol + 1) : null;
                    if (celdaIzq && !celdaIzq.estaVacia() && celdaIzq.getPieza().getJugador() === 'J1') {
                        switch (celdaIzq.getPieza().getTipo()) {
                            case 'Soldado':
                                maxBonus = (1 > maxBonus) ? 1 : maxBonus;
                                break;
                            case 'Caballeria':
                                maxBonus = (2 > maxBonus) ? 2 : maxBonus;
                                break;
                            case 'Artilleria':
                                maxBonus = (3 > maxBonus) ? 3 : maxBonus;
                                break;
                            case 'Comandante':
                                maxBonus = (4 > maxBonus) ? 4 : maxBonus;
                                break;
                        }
                    }
                    if (celdaDcha && !celdaDcha.estaVacia() && celdaDcha.getPieza().getJugador() === 'J1') {
                        switch (celdaDcha.getPieza().getTipo()) {
                            case 'Soldado':
                                maxBonus = (1 > maxBonus) ? 1 : maxBonus;
                                break;
                            case 'Caballeria':
                                maxBonus = (2 > maxBonus) ? 2 : maxBonus;
                                break;
                            case 'Artilleria':
                                maxBonus = (3 > maxBonus) ? 3 : maxBonus;
                                break;
                            case 'Comandante':
                                maxBonus = (4 > maxBonus) ? 4 : maxBonus;
                                break;
                        }
                    }
                }
            }
        }
        else if (cCol - pCol != 0){
            if (!celda.estaVacia() && celda.getPieza().getJugador() === 'J2' && celda.getPieza().getTipo() === 'Soldado') {
                const terceraCelda = ((cCol - pCol < 0 && pCol + 1 < this.tablero.columnas) || (cCol - pCol > 0 && pCol - 1 >= 0)) ? this.tablero.getCelda(cFil, cCol + 2) : this.tablero.getCelda(cFil, cCol - 2)
                if (!terceraCelda.estaVacia() && terceraCelda.getPieza().getJugador() === 'J2' && terceraCelda.getPieza().getTipo() === 'Soldado') {
                    formacion = true;
                    const celdaArriba = pFil - 1 >= 0 ? this.tablero.getCelda(pFil - 1, pCol) : null;
                    const celdaAbajo = pFil + 1 < this.tablero.filas ? this.tablero.getCelda(pFil + 1, pCol) : null;
                    if (celdaAbajo && !celdaAbajo.estaVacia() && celdaAbajoc.getPieza().getJugador() === 'J1') {
                        switch (celdaAbajo.getPieza().getTipo()) {
                            case 'Soldado':
                                maxBonus = (1 > maxBonus) ? 1 : maxBonus;
                                break;
                            case 'Caballeria':
                                maxBonus = (2 > maxBonus) ? 2 : maxBonus;
                                break;
                            case 'Artilleria':
                                maxBonus = (3 > maxBonus) ? 3 : maxBonus;
                                break;
                            case 'Comandante':
                                maxBonus = (4 > maxBonus) ? 4 : maxBonus;
                                break;
                        }
                    }
                    if (celdaArriba && !celdaArriba.estaVacia() && celdaArriba.getPieza().getJugador() === 'J1') {
                        switch (celdaArriba.getPieza().getTipo()) {
                            case 'Soldado':
                                maxBonus = (1 > maxBonus) ? 1 : maxBonus;
                                break;
                            case 'Caballeria':
                                maxBonus = (2 > maxBonus) ? 2 : maxBonus;
                                break;
                            case 'Artilleria':
                                maxBonus = (3 > maxBonus) ? 3 : maxBonus;
                                break;
                            case 'Comandante':
                                maxBonus = (4 > maxBonus) ? 4 : maxBonus;
                                break;
                        }
                    }
                }
            }
        }
        return {formacion: formacion, bonusPeso: maxBonus}
    }
}