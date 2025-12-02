import Pieza from '../Pieza.js';

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
        let modo = 0 // 0 = cerca; 1 = lejos
        let peso = this.pesoBase;
        let formacionAtacaCelda = null;
        const celdasVisitadas = new Set();

        // Obtener celdas vecinas directas (distancia 1)
        const celdasVecinas = this.GetVecinos(this.tablero.getCelda(this.fil, this.col), celdasVisitadas);

        // Analizar vecinos directos
        for (const vecino of celdasVecinas) {
            if (!celdasVisitadas.has(vecino)) {
                console.log(`celda a comprobar: ${vecino.getPosicion().fila}, ${vecino.getPosicion().columna}`)
                let data = this.checkFormacion(vecino, celdasVisitadas)
                peso += data.bonusPeso
                if (!data.formacion) {
                    peso += this.detectaTipo(vecino);
                    celdasVisitadas.add(vecino);
                }
            }
            // Analizar vecinos de segundo nivel (distancia 2)
            const sigVecinos = this.GetVecinos(vecino, celdasVisitadas);
            for (const sigVecino of sigVecinos) {
                peso += this.detectaTipo(sigVecino);
                celdasVisitadas.add(sigVecino);
            }
        }
        if (peso === this.pesoBase)
            modo = 1;
        if (modo === 1) {

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

        // Izquierda
        if (col > 0 && !celdasVisitadas.has(this.tablero.getCelda(fila, col - 1))) {
            res.push(this.tablero.getCelda(fila, col - 1));
        }

        // Abajo
        if (fila < this.tablero.filas - 1 && !celdasVisitadas.has(this.tablero.getCelda(fila + 1, col))) {
            res.push(this.tablero.getCelda(fila + 1, col));
        }

        // Derecha
        if (col < this.tablero.columnas - 1 && !celdasVisitadas.has(this.tablero.getCelda(fila, col + 1))) {
            res.push(this.tablero.getCelda(fila, col + 1));
        }

        return res;
    }

    checkFormacion(celda, celdasVisitadas) {


        let filSoldado = this.getPosicion().fila;
        let colSoldado = this.getPosicion().col;

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
    }
}