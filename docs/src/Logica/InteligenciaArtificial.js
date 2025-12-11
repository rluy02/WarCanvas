import { turnoJugador } from "./Turno.js";
import { EventBus } from "../EventBus.js";
import { Eventos } from "../Events.js";

/**
 * Clase que implementa la Inteligencia Artificial para el jugador J2.
 * Gestiona la toma de decisiones, cálculo de pesos tácticos y ejecución de movimientos.
 * @class InteligenciaArtificial
 * @memberof Logica
 */
export default class InteligenciaArtificial {
    /**
     * Constructor de la Inteligencia Artificial
     * @param {Tablero} tablero - Tablero de juego
     * @param {TableroGrafico} tableroGrafico - Representación gráfica del tablero
     * @param {Equipo} equipoIA - Equipo controlado por la IA (J2)
     * @param {Phaser.Scene} escena - Escena de Phaser
     * @param {number} acciones - Número de acciones por turno
     * @param {Turno} turno - Instancia del sistema de turnos
     */
    constructor(tablero, tableroGrafico, equipoIA, escena, acciones, turno) {
        this.tablero = tablero;
        this.tableroGrafico = tableroGrafico;
        this.equipoIA = equipoIA;
        this.escena = escena;
        
        /**
         * Número de acciones disponibles por turno
         * @type {number}
         */
        this.acciones = acciones;
        /**
         * Contador de turnos transcurridos (usado para priorizar artillería)
         * @type {number}
         */
        this.contadorArtilleria = 0;
        /**
         * Referencia al sistema de turnos
         * @type {Turno}
         */
        this.turno = turno;

        // Suscripción a eventos de cambio de turno
        EventBus.on(Eventos.CHANGE_TURN, () => {
            this.contadorArtilleria++;
            if (turnoJugador == 'J2') {
                // Añadir delay para permitir que restTablero() termine
                setTimeout(() => this.TurnoIA(), 100);
            }
        });
    }

    /**
     * Ejecuta el turno completo de la IA con delays entre acciones.
     * Proceso:
     * 1. Calcula pesos tácticos de todas las piezas disponibles
     * 2. Prioriza piezas con objetivos claros
     * 3. Ejecuta movimientos usando A* pathfinding
     * 4. Maneja combates cuando se encuentra un enemigo
     * 5. Si no hay objetivos, mueve piezas hacia adelante (columna izquierda)
     */
    async TurnoIA() {
        // Desactivar controles del jugador durante el turno de la IA
        this.tableroGrafico.desactivarInteraccion();
        this.turno.turnoGrafico.desactivarBotonFinalizar();

        // Ejecutar cada acción del turno
        for (let accion = 0; accion < this.acciones; accion++) {
            let bestPieza = null;
            let celdaObjetivo = null;
            let bestPeso = -Infinity;
            let pesos = new Map();
            let camino = [];

            // Calcular peso táctico de todas las piezas disponibles
            for (let pieza of this.equipoIA.piezas) {
                if (pieza.getTipo() === 'Artilleria') {
                    // Artillería solo actúa si puede disparar
                    if (pieza.puedeDisparar()) {
                        let pesoData = pieza.calculaPeso();
                        pesos.set(pieza, pesoData);
                    }
                }
                else if (!pieza.getMovida()) {
                    // Calcular peso de piezas no movidas
                    let pesoData = pieza.calculaPeso();
                    pesos.set(pieza, pesoData);
                }
            }

            // Si no hay piezas disponibles, terminar turno
            if (pesos.size === 0) {
                break;
            }

            // Clasificar piezas según tengan objetivo claro o no
            let piezasConObjetivo = [];
            let piezasSinObjetivo = [];

            for (let [pieza, data] of pesos) {
                if (data.bestCelda !== null) {
                    piezasConObjetivo.push({ pieza, data });
                } else {
                    piezasSinObjetivo.push({ pieza, data });
                }
            }

            // Priorizar piezas con objetivo claro
            if (piezasConObjetivo.length > 0) {
                for (let { pieza, data } of piezasConObjetivo) {
                    // Evitar usar artillería en los primeros 5 turnos
                    if (pieza.getTipo() === 'Artilleria' && this.contadorArtilleria < 5) continue;
                    // Evitar que el comandante se quede en su posición actual
                    if (pieza.getTipo() === 'Comandante' && data.bestCelda === this.tablero.getCelda(pieza.fil, pieza.col)) continue;
                    
                    // Seleccionar la pieza con mayor peso
                    if (data.peso > bestPeso) {
                        bestPeso = data.peso;
                        bestPieza = pieza;
                        celdaObjetivo = data.bestCelda;
                    }
                }
            }
            else {
                // No hay objetivos claros, se manejará posteriormente
                bestPieza = null;
                celdaObjetivo = null;
            }

            // Manejo especial para artillería
            if (bestPieza && bestPieza.getTipo() === 'Artilleria') {
                if (celdaObjetivo && bestPieza.puedeDisparar()) {
                    this.tablero.piezaActiva = bestPieza;
                    EventBus.emit(Eventos.PIECE_SELECTED, bestPieza);

                    let destino = celdaObjetivo.getPosicion();
                    bestPieza.lanzarProyectil(destino.fila, destino.col, this.escena, this.tablero);

                    EventBus.emit(Eventos.PIECE_MOVED, bestPieza, false);

                    await this.esperarDelay(800);
                    continue;
                } else {
                    continue;
                }
            }

            // Calcular camino usando A* para piezas con objetivo
            if (bestPieza && celdaObjetivo) {
                let origen = bestPieza.getPosicion();
                camino = this.aStarPathFinding(
                    bestPieza,
                    this.tablero.getCelda(origen.fila, origen.col),
                    celdaObjetivo
                );

                // Limitar camino a movimientos disponibles
                let movimientosDisponibles = bestPieza.getMovimientos();
                if (camino.length > movimientosDisponibles) {
                    camino = camino.slice(0, movimientosDisponibles);
                }
            }
            else {
                // Sin objetivo claro: mover soldados y caballería hacia la izquierda (hacia J1)
                camino = [];
                for (let [pieza, data] of pesos) {
                    let tipo = pieza.getTipo();

                    if (tipo === 'Soldado' || tipo === 'Caballeria') {
                        let pos = pieza.getPosicion();
                        let movimientosMax = pieza.getMovimientos();
                        let destinoCol = pos.col - movimientosMax;

                        if (destinoCol >= 0) {
                            let celdaDestino = this.tablero.getCelda(pos.fila, destinoCol);

                            if (celdaDestino.estaVacia()) {
                                camino = this.aStarPathFinding(
                                    pieza,
                                    this.tablero.getCelda(pos.fila, pos.col),
                                    celdaDestino
                                );

                                if (camino.length > 0 && camino.length <= movimientosMax) {
                                    bestPieza = pieza;
                                    break;
                                } else {
                                    camino = [];
                                }
                            }
                        }
                    }
                }
            }

            // Ejecutar movimiento por el camino calculado
            if (camino.length > 0 && bestPieza) {
                this.tablero.piezaActiva = bestPieza;
                EventBus.emit(Eventos.PIECE_SELECTED, bestPieza);

                let ultimaCelda = camino[camino.length - 1];
                let hayEnemigoAlFinal = !ultimaCelda.estaVacia() &&
                    ultimaCelda.getPieza().getJugador() !== bestPieza.getJugador();

                // Si hay enemigo al final, detenerse antes para atacar
                let pasosFinal = hayEnemigoAlFinal ? camino.length - 1 : camino.length;

                // Ejecutar movimiento paso a paso
                for (let paso = 0; paso < pasosFinal; paso++) {
                    let siguienteCelda = camino[paso];
                    let destino = siguienteCelda.getPosicion();
                    let origenActual = bestPieza.getPosicion();

                    // Dibujar conquista de territorio
                    this.tableroGrafico.dibujarFragmentoMapa(destino.fila, destino.col, bestPieza.getJugador());

                    // Limpiar celda de origen
                    this.tablero.getCelda(origenActual.fila, origenActual.col).limpiar();

                    // Mover pieza a destino
                    bestPieza.moverse(destino.fila, destino.col);
                    this.tablero.getCelda(destino.fila, destino.col).setContenido(bestPieza);

                    EventBus.emit(Eventos.PIECE_MOVED, bestPieza, false);

                    await this.esperarDelay(300);
                    
                    // Verificar si el comandante llegó a su objetivo defensivo
                    if (bestPieza.getTipo() === 'Comandante' && !hayEnemigoAlFinal) {
                        let posActual = bestPieza.getPosicion();
                        let posObjetivo = celdaObjetivo.getPosicion();
                        if (posActual.fila === posObjetivo.fila && posActual.col === posObjetivo.col) {
                            this.turno.acabarMovimientos();
                            break;
                        }
                    }
                }

                // Ejecutar ataque si hay enemigo al final del camino
                if (hayEnemigoAlFinal && pasosFinal === camino.length - 1) {
                    let celdaEnemiga = ultimaCelda.getPosicion();

                    // Validaciones de seguridad
                    if (!bestPieza || bestPieza.getPosicion() === undefined) {
                        continue;
                    }
                    
                    if (ultimaCelda.estaVacia()) {
                        continue;
                    }

                    // Iniciar combate
                    this.tablero.ataque(celdaEnemiga.fila, celdaEnemiga.col);

                    await this.esperarDelay(300);

                    EventBus.emit(Eventos.ATACK);
                    
                    await this.esperarDelay(1500);
                    
                    EventBus.emit(Eventos.PIECE_MOVED, bestPieza, true);
                }

            } else {
                // No hay movimientos posibles, finalizar turno
                this.turno.acabarMovimientos();
                continue;
            }

            await this.esperarDelay(400);
        }

        // Reactivar controles del jugador
        this.tableroGrafico.activarInteraccion();
        this.turno.turnoGrafico.activarBotonFinalizar();
    }
    

    /**
     * Implementación del algoritmo A* para encontrar el camino óptimo entre dos celdas.
     * Considera movimientos especiales según el tipo de pieza:
     * - Comandante: movimiento diagonal (heurística Chebyshev)
     * - Caballería: puede saltar piezas aliadas
     * - Otros: solo movimiento cardinal (heurística Manhattan)
     * 
     * @param {Pieza} pieza - Pieza que se moverá
     * @param {Celda} celdaInicio - Celda de origen
     * @param {Celda} celdaDestino - Celda de destino
     * @returns {Array<Celda>} Camino óptimo (array vacío si no hay ruta)
     */
    aStarPathFinding(pieza, celdaInicio, celdaDestino) {
        const MAX_PROFUNDIDAD = 20;
        const openSet = [];
        const closedSet = new Set();
        const cameFrom = new Map();
        const costoMovimiento = new Map();

        const gScore = new Map();
        const fScore = new Map();

        // Inicializar scores
        gScore.set(celdaInicio, 0);
        pieza.getTipo() == 'Comandante' ? fScore.set(celdaInicio, this.diagHeuristic(celdaInicio, celdaDestino))
            : fScore.set(celdaInicio, this.heuristic(celdaInicio, celdaDestino));
        openSet.push(celdaInicio);

        while (openSet.length > 0) {
            // Encontrar celda con menor fScore en openSet
            let currentIndex = 0;
            let current = openSet[0];

            for (let i = 1; i < openSet.length; i++) {
                const candidato = openSet[i];
                const fCurr = fScore.get(current) ?? Infinity;
                const fCand = fScore.get(candidato) ?? Infinity;
                if (fCand < fCurr) {
                    currentIndex = i;
                    current = candidato;
                }
            }

            // Si llegamos al destino, reconstruir camino
            if (current === celdaDestino) {
                return this.reconstruirCamino(cameFrom, current);
            }

            openSet.splice(currentIndex, 1);
            closedSet.add(current);

            const gActual = gScore.get(current) ?? Infinity;

            // Limitar profundidad de búsqueda
            if (gActual > MAX_PROFUNDIDAD) {
                continue;
            }

            // Obtener vecinos según tipo de pieza
            const vecinos = pieza.getTipo() === 'Caballeria'
                ? this.getVecinosConSalto(pieza, current, celdaInicio, gActual)
                : this.getVecinos(pieza, current);

            // Evaluar cada vecino
            for (const vecinoInfo of vecinos) {
                const vecino = vecinoInfo.celda || vecinoInfo;
                const costoExtra = vecinoInfo.costo || 1;

                if (closedSet.has(vecino)) continue;
                if (!this.transitable(vecino, celdaDestino)) continue;

                const expectedG = gActual + costoExtra;
                const gVecino = gScore.get(vecino);

                // Si encontramos un camino mejor, actualizarlo
                if (gVecino === undefined || expectedG < gVecino) {
                    cameFrom.set(vecino, current);
                    gScore.set(vecino, expectedG);
                    costoMovimiento.set(vecino, costoExtra);

                    const h = pieza.getTipo() == 'Comandante' ? this.diagHeuristic(vecino, celdaDestino) : this.heuristic(vecino, celdaDestino);
                    fScore.set(vecino, expectedG + h);

                    if (!openSet.includes(vecino))
                        openSet.push(vecino);
                }
            }
        }
        return [];
    }

    /**
     * Obtiene los vecinos de una celda considerando el salto de caballería.
     * La caballería puede saltar piezas aliadas en su primer movimiento.
     * 
     * @param {Pieza} pieza - Pieza de caballería
     * @param {Celda} celda - Celda actual
     * @param {Celda} celdaInicio - Celda de inicio del pathfinding
     * @param {number} gActual - Distancia desde el inicio
     * @returns {Array<Object>} Array de {celda, costo}
     */
    getVecinosConSalto(pieza, celda, celdaInicio, gActual) {
        const pos = celda.getPosicion();
        const fila = pos.fila;
        const col = pos.col;
        const res = [];

        // Direcciones cardinales
        const direcciones = [
            { df: -1, dc: 0 },  // arriba
            { df: 1, dc: 0 },   // abajo
            { df: 0, dc: -1 },  // izquierda
            { df: 0, dc: 1 }    // derecha
        ];

        for (const dir of direcciones) {
            const nf = fila + dir.df;
            const nc = col + dir.dc;

            // Verificar límites del tablero
            if (nf < 0 || nf >= this.tablero.filas || nc < 0 || nc >= this.tablero.columnas)
                continue;

            const vecinoCelda = this.tablero.getCelda(nf, nc);

            if (vecinoCelda.estaVacia()) {
                res.push({ celda: vecinoCelda, costo: 1 });
            }
            else if (!vecinoCelda.estaVacia() && vecinoCelda.getPieza().getJugador() !== pieza.getJugador()) {
                // Puede atacar enemigos
                res.push({ celda: vecinoCelda, costo: 1 });
            }
            else if (celda === celdaInicio && gActual === 0 && pieza.getSaltoCaballeria()) {
                // Desde posición inicial, puede saltar aliado
                const nf2 = nf + dir.df;
                const nc2 = nc + dir.dc;

                if (nf2 >= 0 && nf2 < this.tablero.filas && nc2 >= 0 && nc2 < this.tablero.columnas) {
                    const celdaSalto = this.tablero.getCelda(nf2, nc2);

                    if (celdaSalto.estaVacia() ||
                        (!celdaSalto.estaVacia() && celdaSalto.getPieza().getJugador() !== pieza.getJugador())) {
                        res.push({ celda: celdaSalto, costo: 2 });
                    }
                }
            }
        }

        return res;
    }

    /**
     * Heurística de Chebyshev (distancia diagonal).
     * Usada para el Comandante que puede moverse en diagonal.
     * 
     * @param {Celda} a - Celda origen
     * @param {Celda} b - Celda destino
     * @returns {number} Distancia estimada
     */
    diagHeuristic(a, b) {
        const pa = a.getPosicion();
        const pb = b.getPosicion();
        const dx = Math.abs(pa.fila - pb.fila);
        const dy = Math.abs(pa.col - pb.col);
        return Math.max(dx, dy);
    }

    /**
     * Heurística de Manhattan (distancia cardinal).
     * Usada para piezas que solo se mueven en direcciones cardinales.
     * 
     * @param {Celda} a - Celda origen
     * @param {Celda} b - Celda destino
     * @returns {number} Distancia estimada
     */
    heuristic(a, b) {
        const pa = a.getPosicion();
        const pb = b.getPosicion();
        return Math.abs(pa.fila - pb.fila) + Math.abs(pa.col - pb.col);
    }

    /**
     * Determina si una celda es transitable.
     * Una celda es transitable si está vacía, excepto si es el destino final.
     * 
     * @param {Celda} celda - Celda a evaluar
     * @param {Celda} celdaDestino - Destino final del camino
     * @returns {boolean} true si es transitable
     */
    transitable(celda, celdaDestino) {
        if (celda === celdaDestino) return true;
        return celda.estaVacia();
    }

    /**
     * Reconstruye el camino desde el origen hasta el destino.
     * Utiliza el mapa cameFrom generado por A*.
     * 
     * @param {Map} cameFrom - Mapa de predecesores
     * @param {Celda} actual - Celda de destino
     * @returns {Array<Celda>} Camino ordenado desde origen a destino
     */
    reconstruirCamino(cameFrom, actual) {
        const path = [];
        let current = actual;
        while (cameFrom.has(current)) {
            path.push(current);
            current = cameFrom.get(current);
        }
        path.reverse();
        return path;
    }

    /**
     * Obtiene las celdas vecinas válidas de una celda.
     * Para el Comandante incluye diagonales, para otras piezas solo cardinales.
     * 
     * @param {Pieza} pieza - Pieza que se está moviendo
     * @param {Celda} celda - Celda actual
     * @returns {Array<Celda>} Array de celdas vecinas
     */
    getVecinos(pieza, celda) {
        const pos = celda.getPosicion();
        const fila = pos.fila;
        const col = pos.col;
        const res = [];

        // Movimientos cardinales (arriba, abajo, izquierda, derecha)
        if (fila > 0) {
            res.push(this.tablero.getCelda(fila - 1, col));
        }
        if (fila < this.tablero.filas - 1) {
            res.push(this.tablero.getCelda(fila + 1, col));
        }
        if (col > 0) {
            res.push(this.tablero.getCelda(fila, col - 1));
        }
        if (col < this.tablero.columnas - 1) {
            res.push(this.tablero.getCelda(fila, col + 1));
        }
        
        // Movimientos diagonales para el Comandante
        if (pieza.getTipo() == 'Comandante') {
            if (fila > 0 && col > 0) {
                res.push(this.tablero.getCelda(fila - 1, col - 1));
            }
            if (fila > 0 && col < this.tablero.columnas - 1) {
                res.push(this.tablero.getCelda(fila - 1, col + 1));
            }
            if (fila < this.tablero.filas - 1 && col > 0) {
                res.push(this.tablero.getCelda(fila + 1, col - 1));
            }
            if (fila < this.tablero.filas - 1 && col < this.tablero.columnas - 1) {
                res.push(this.tablero.getCelda(fila + 1, col + 1));
            }
        }

        return res;
    }

    /**
     * Función auxiliar para esperar un tiempo determinado.
     * Usada para crear delays visuales entre acciones de la IA.
     * 
     * @param {number} ms - Milisegundos a esperar
     * @returns {Promise} Promesa que se resuelve después del delay
     */
    esperarDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}