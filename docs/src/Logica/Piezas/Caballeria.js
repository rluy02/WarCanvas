import Pieza from '../Pieza.js';

/**
 * Clase que representa la pieza de Caballería en el juego.
 * @class Caballeria
 * @extends Pieza
 * @memberof Logica
 */
class Caballeria extends Pieza {
    /**
     * Constructor de la pieza Caballería.
     * @param {Tablero} tablero - tablero al que pertenece la pieza
     * @param {number} fil - fila
     * @param {number} col - columna
     * @param {string} jugador - 'J1' o 'J2'
     */
    constructor(tablero, fil, col, jugador) {
        super(tablero, 'Caballeria', fil, col, jugador, 3, 2, 0);
        this.saltoCaballeria = true;
        this.pesoBase = 2;
    }

    /**
     * Establece si la caballería puede saltar piezas.
     * @param {boolean} salto 
     */
    setSaltoCaballeria(salto) {
        this.saltoCaballeria = salto;
    }

    /**
     * Determina si la caballería puede saltar piezas.
     * @returns {boolean} - true si la caballería puede saltar piezas, false en caso contrario
     */
    getSaltoCaballeria() {
        return this.saltoCaballeria;
    }

    calculaPeso() {
        let celdaAtacada = null; // Guarda la celda que será atacada por formación
        let bestPeso = 0; // Mejor peso encontrado durante el análisis
        const celdasVisitadas = new Set(); // Evita procesar la misma celda múltiples veces
        celdasVisitadas.add(this.tablero.getCelda(this.fil, this.col));


        // Obtener celdas vecinas directas (distancia 1: arriba, abajo, izquierda, derecha)
        const celdasVecinas = this.getVecinos(this.tablero.getCelda(this.fil, this.col), celdasVisitadas, false);

        // Primera pasada: analizar vecinos directos en busca de enemigos y formaciones
        for (const vecino of celdasVecinas) {
            celdasVisitadas.add(vecino.celda);
            
            if (!vecino.celda.estaVacia() && vecino.celda.getPieza().getJugador() === 'J1' && !vecino.salto) {
                const result = this.detectaTipo(vecino.celda);
                if (result > bestPeso) {
                    bestPeso = result;
                    celdaAtacada = vecino.celda;
                }
            }
            
            if (vecino.celda.estaVacia()) {
                const segVecinos = this.getVecinos(vecino.celda, celdasVisitadas, true);
                
                for (const segVecino of segVecinos) {
                    celdasVisitadas.add(segVecino.celda);
                    
                    if (!segVecino.celda.estaVacia() && segVecino.celda.getPieza().getJugador() === 'J1') {
                        const segResult = this.detectaTipo(segVecino.celda);
                        if (segResult > bestPeso) {
                            bestPeso = segResult;
                            celdaAtacada = segVecino.celda;
                        }
                    }
                    
                    if (vecino.salto === false) {
                        if (segVecino.celda.estaVacia()) {
                            const terVecinos = this.getVecinos(segVecino.celda, celdasVisitadas, true);
                            
                            for (const terVecino of terVecinos) {
                                celdasVisitadas.add(terVecino.celda);
                                
                                const terResult = this.detectaTipo(terVecino.celda);
                                if (terResult > bestPeso) {
                                    bestPeso = terResult;
                                    celdaAtacada = terVecino.celda;
                                }
                            }
                        }
                    }
                }
            }
        }

        // DEBUG: Pintar celdas comprobadas

        // Logs de depuración
        console.log(`Peso calculado para Caballería en (${this.fil}, ${this.col}): ${bestPeso + this.pesoBase}`);
        if (celdaAtacada != null) {
            console.log(`Caballería ataca a: ${celdaAtacada.getPosicion().fila}, ${celdaAtacada.getPosicion().col}`);
        }

        return { peso: (bestPeso + this.pesoBase), formacionAtacaCelda: celdaAtacada};
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
                    peso = 1;
                    break;
                case 'Caballeria':
                    peso = 2;
                    break;
                case 'Artilleria':
                    peso = 3;
                    break;
                case 'Comandante':
                    peso = 4;
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
    getVecinos(celda, celdasVisitadas, salto) {
        const pos = celda.getPosicion();
        const fila = pos.fila;
        const col = pos.col;
        const res = [];
        let haSaltado = false;

        // Arriba
        if (fila > 0 && !celdasVisitadas.has(this.tablero.getCelda(fila - 1, col))) {
            let celdaArriba = this.tablero.getCelda(fila - 1, col);
            if (fila > 1 && !celdaArriba.estaVacia() && celdaArriba.getPieza().getJugador() === 'J2' && !salto) {
                const sigCelda = this.tablero.getCelda(fila - 2, col);
                if (sigCelda.estaVacia()) {
                    celdasVisitadas.add(celdaArriba);
                    celdaArriba = sigCelda;
                    haSaltado = true;
                }
            }
            res.push({ celda: celdaArriba, salto: haSaltado });
        }
        haSaltado = false;
        // Izquierda
        if (col > 0 && !celdasVisitadas.has(this.tablero.getCelda(fila, col - 1))) {
            let celdaIzquierda = this.tablero.getCelda(fila, col - 1);
            if (fila > 1 && !celdaIzquierda.estaVacia() && celdaIzquierda.getPieza().getJugador() === 'J2' && !salto) {
                const sigCelda = this.tablero.getCelda(fila, col - 2);
                if (sigCelda.estaVacia()) {
                    celdasVisitadas.add(celdaIzquierda);
                    celdaIzquierda = sigCelda;
                    haSaltado = true;
                }
            }
            res.push({ celda: celdaIzquierda, salto: haSaltado });
        }
        haSaltado = false;
        // Abajo
        if (fila < this.tablero.filas - 1 && !celdasVisitadas.has(this.tablero.getCelda(fila + 1, col))) {
            let celdaAbajo = this.tablero.getCelda(fila + 1, col);
            if (fila < this.tablero.filas - 2 && !celdaAbajo.estaVacia() && celdaAbajo.getPieza().getJugador() === 'J2' && !salto) {
                const sigCelda = this.tablero.getCelda(fila + 2, col);
                if (sigCelda.estaVacia()) {
                    celdasVisitadas.add(celdaAbajo);
                    celdaAbajo = sigCelda;
                    haSaltado = true;
                }
            }
            res.push({ celda: celdaAbajo, salto: haSaltado });
        }
        haSaltado = false;
        // Derecha
        if (col < this.tablero.columnas - 1 && !celdasVisitadas.has(this.tablero.getCelda(fila, col + 1))) {
            let celdaDerecha = this.tablero.getCelda(fila, col + 1);
            if (col < this.tablero.columnas - 2 && !celdaDerecha.estaVacia() && celdaDerecha.getPieza().getJugador() === 'J2' && !salto) {
                const sigCelda = this.tablero.getCelda(fila, col + 2);
                if (sigCelda.estaVacia()) {
                    celdasVisitadas.add(celdaDerecha);
                    celdaDerecha = sigCelda;
                    haSaltado = true;
                }
            }
            res.push({ celda: celdaDerecha, salto: haSaltado });
        }

        return res;
    }

}

export default Caballeria;