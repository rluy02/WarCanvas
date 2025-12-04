import Pieza from '../Pieza.js';

class Soldado extends Pieza {
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
     * Calcula el peso táctico del soldado basándose en piezas enemigas cercanas.
     * El cálculo considera:
     * 1. Vecinos directos (distancia 1): enemigos adyacentes
     * 2. Formaciones: bonus cuando hay soldados aliados formando línea
     * 3. Vecinos de segundo nivel (distancia 2): amenazas cercanas
     * 
     * @returns {Object} Objeto con dos propiedades:
     *   - peso {number}: Peso total calculado (pesoBase + bonus por enemigos/formaciones)
     *   - formacionAtacaCelda {Celda|null}: Celda enemiga atacada por formación (si existe)
     */
    calculaPeso() {
        let celdaAtacada = null; // Guarda la celda que será atacada por formación
        let bestPeso = 0; // Mejor peso encontrado durante el análisis
        const celdasVisitadas = new Set(); // Evita procesar la misma celda múltiples veces
        celdasVisitadas.add(this.tablero.getCelda(this.fil, this.col));

        // Obtener celdas vecinas directas (distancia 1: arriba, abajo, izquierda, derecha)
        const celdasVecinas = this.getVecinos(this.tablero.getCelda(this.fil, this.col), celdasVisitadas);

        // Primera pasada: analizar vecinos directos en busca de enemigos y formaciones
        for (const vecino of celdasVecinas) {
            // Si el vecino es un enemigo (J1)
            if (!vecino.estaVacia() && vecino.getPieza().getJugador() === 'J1') {
                // Verificar si existe formación de soldados aliados que ataque a este enemigo
                const resultado = this.checkFormacion(vecino, celdasVisitadas);
                if (resultado > bestPeso) {
                    bestPeso = resultado;
                    celdaAtacada = vecino; // Marcar esta celda como objetivo de formación
                    celdasVisitadas.add(vecino);
                }
                else {
                    // Si no hay formación, calcular peso base según tipo de enemigo
                    if (bestPeso < this.detectaTipo(vecino)) {
                        bestPeso = this.detectaTipo(vecino);
                        celdasVisitadas.add(vecino);
                        celdaAtacada = vecino;
                    }
                }
            }
            // Marcar soldados aliados como visitados para evitar recalcularlos
            if (!vecino.estaVacia() && vecino.getPieza().getJugador() === 'J2') {
                celdasVisitadas.add(vecino);
            }
        }

        // Segunda pasada: analizar vecinos de segundo nivel (distancia 2)
        // Esto permite detectar amenazas que están a 2 movimientos de distancia
        for (const vecino of celdasVecinas) {
            if (!celdasVisitadas.has(vecino)) {
                const sigVecinos = this.getVecinos(vecino, celdasVisitadas);
                for (const sigVecino of sigVecinos) {
                    // Actualizar el mejor peso si encontramos un enemigo más valioso
                    if (bestPeso < this.detectaTipo(sigVecino)) {
                        bestPeso = this.detectaTipo(sigVecino);
                        celdaAtacada = sigVecino;
                    }
                    celdasVisitadas.add(sigVecino);
                }
            }
        }

        // Logs de depuración
        console.log(`Peso calculado para Soldado en (${this.fil}, ${this.col}): ${bestPeso + this.pesoBase}`);
        if (celdaAtacada != null) {
            console.log(`Formación ataca a: ${celdaAtacada.getPosicion().fila}, ${celdaAtacada.getPosicion().col}`)
        }

        return { peso: (bestPeso + this.pesoBase), formacionAtacaCelda: celdaAtacada };
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
    getVecinos(celda, celdasVisitadas) {
        const pos = celda.getPosicion();
        const fila = pos.fila;
        const col = pos.col;
        const res = [];

        // Arriba
        if (fila > 0 && !celdasVisitadas.has(this.tablero.getCelda(fila - 1, col))) {
            let celdaArriba = this.tablero.getCelda(fila - 1, col);
            res.push(celdaArriba);
        }

        // Izquierda
        if (col > 0 && !celdasVisitadas.has(this.tablero.getCelda(fila, col - 1))) {
            let celdaIzquierda = this.tablero.getCelda(fila, col - 1);
            res.push(celdaIzquierda);
        }

        // Abajo
        if (fila < this.tablero.filas - 1 && !celdasVisitadas.has(this.tablero.getCelda(fila + 1, col))) {
            let celdaAbajo = this.tablero.getCelda(fila + 1, col);
            res.push(celdaAbajo);
        }

        // Derecha
        if (col < this.tablero.columnas - 1 && !celdasVisitadas.has(this.tablero.getCelda(fila, col + 1))) {
            let celdaDerecha = this.tablero.getCelda(fila, col + 1);
            res.push(celdaDerecha);
        }

        return res;
    }

    /**
     * Verifica si el soldado forma parte de una formación que ataca a la celda objetivo.
     * Una formación se considera válida cuando hay soldados aliados (J2) alineados
     * vertical u horizontalmente con este soldado.
     * 
     * Casos de formación:
     * - Horizontal: soldados a la izquierda/derecha atacando enemigo arriba/abajo
     * - Vertical: soldados arriba/abajo atacando enemigo a los lados
     * 
     * @param {Celda} celda - Celda enemiga que potencialmente será atacada
     * @param {Set<Celda>} celdasVisitadas - Set para marcar celdas procesadas
     * @returns {number} Peso bonus por formación (0 si no hay formación, multiplicado x2 si existe)
     */
    checkFormacion(celda, celdasVisitadas) {
        let filSoldado = this.getPosicion().fila;
        let colSoldado = this.getPosicion().col;
        let bonusPeso = 0; // Acumulador del bonus de formación
        let formacion = false; // Flag para detectar si existe formación válida

        // CASO 1: Enemigo en la misma fila (ataque vertical)
        // Buscar soldados aliados arriba/abajo
        if (filSoldado == celda.getPosicion().fila) {
            let arriba = filSoldado - 1;
            let abajo = filSoldado + 1;

            // Verificar soldado aliado arriba
            if (arriba >= 0 && this.tablero.getCelda(arriba, colSoldado).getTipo() == 'Soldado' && this.tablero.getCelda(arriba, colSoldado).getPieza().getJugador() == 'J2') {
                bonusPeso++;
                celdasVisitadas.add(this.tablero.getCelda(arriba, colSoldado));
                formacion = true;
            }

            // Verificar soldado aliado abajo
            if (abajo < this.tablero.filas && this.tablero.getCelda(abajo, colSoldado).getTipo() == 'Soldado' && this.tablero.getCelda(abajo, colSoldado).getPieza().getJugador() == 'J2') {
                bonusPeso++;
                celdasVisitadas.add(this.tablero.getCelda(abajo, colSoldado));
                formacion = true;
            }
        }
        // CASO 2: Enemigo en la misma columna (ataque horizontal)
        // Buscar soldados aliados a los lados
        else {
            let izquierda = colSoldado - 1;
            let derecha = colSoldado + 1;

            // Verificar soldado aliado a la izquierda
            if (izquierda >= 0 && this.tablero.getCelda(filSoldado, izquierda).getTipo() == 'Soldado' && this.tablero.getCelda(filSoldado, izquierda).getPieza().getJugador() == 'J2') {
                bonusPeso++;
                celdasVisitadas.add(this.tablero.getCelda(filSoldado, izquierda));
                formacion = true;
            }

            // Verificar soldado aliado a la derecha
            if (derecha < this.tablero.columnas && this.tablero.getCelda(filSoldado, derecha).getTipo() == 'Soldado' && this.tablero.getCelda(filSoldado, derecha).getPieza().getJugador() == 'J2') {
                bonusPeso++;
                celdasVisitadas.add(this.tablero.getCelda(filSoldado, derecha));
                formacion = true;
            }
        }

        // Si hay formación, añadir peso según el tipo de enemigo atacado
        if (formacion) {
            switch (celda.getTipo()) {
                case 'Soldado':
                    bonusPeso += 1;
                    break;
                case 'Caballeria':
                    bonusPeso += 2;
                    break;
                case 'Artilleria':
                    bonusPeso += 3;
                    break;
                case 'Comandante':
                    bonusPeso += 4;
                    break;
            }
        }

        // Multiplicar por 2 el bonus si existe formación (incentiva fuertemente las formaciones)
        return bonusPeso * 2;
    }
}

export default Soldado;