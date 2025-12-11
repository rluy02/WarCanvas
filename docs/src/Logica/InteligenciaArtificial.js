import { turnoJugador } from "./Turno.js";
import { EventBus } from "../EventBus.js";
import { Eventos } from "../Events.js";

export default class InteligenciaArtificial {
    /**
     * Constructor de la Inteligencia Artificial
     * @param {Tablero} tablero - Tablero de juego
     * @param {TableroGrafico} tableroGrafico - Representación gráfica del tablero
     * @param {Equipo} equipoIA - Equipo controlado por la IA
     * @param {Phaser.Scene} escena - Escena de Phaser
     * @param {number} acciones - Número de acciones por turno
     * @param {Turno} turno - Instancia del sistema de turnos
     */
    constructor(tablero, tableroGrafico, equipoIA, escena, acciones, turno) {
        this.tablero = tablero;
        this.tableroGrafico = tableroGrafico;
        this.equipoIA = equipoIA;
        this.escena = escena;
        this.acciones = acciones
        this.contadorArtilleria = 0;

        /**
         * Referencia al sistema de turnos
         * @type {Turno}
         */
        this.turno = turno;

        this.closestEnemy = null;

        this.pathGraphics = this.escena.add.graphics();
        this.pathGraphics.setDepth(9999);

        EventBus.on(Eventos.CHANGE_TURN, () => {
            this.ClearPathHighlight()
            this.contadorArtilleria++;
            if (turnoJugador == 'J2')
                this.TurnoIA();
        })
    }

    /**
     * Ejecuta el turno de la IA con delays entre acciones
     */
    async TurnoIA() {
        console.log('========================================');
        console.log('🤖 TURNO DE LA IA COMIENZA');
        console.log('========================================');

        this.tableroGrafico.desactivarInteraccion();

        // Usar un contador local en vez de while con accionesTurno
        for (let accion = 0; accion < this.acciones; accion++) {
            console.log(`\n--- ACCIÓN ${accion + 1}/${this.acciones} ---`);

            let bestPieza = null;
            let celdaObjetivo = null;
            let bestPeso = -Infinity
            let pesos = new Map()
            let camino = [];

            console.log('📊 Calculando pesos de todas las piezas...');

            // Calcula pesos de todas las piezas QUE PUEDAN ACTUAR
            for (let pieza of this.equipoIA.piezas) {
                // Artillería: solo si puede disparar
                if (pieza.getTipo() === 'Artilleria') {
                    if (pieza.puedeDisparar()) {
                        let pesoData = pieza.calculaPeso();
                        pesos.set(pieza, pesoData);
                        console.log(`  🎯 Artillería en (${pieza.fil}, ${pieza.col}) - Peso: ${pesoData.peso}, Puede disparar: SÍ`);
                    } else {
                        console.log(`  ❌ Artillería en (${pieza.fil}, ${pieza.col}) - NO puede disparar`);
                    }
                }
                // Otras piezas: solo si no se han movido
                else if (!pieza.getMovida()) {
                    let pesoData = pieza.calculaPeso();
                    pesos.set(pieza, pesoData);
                    console.log(`  ⚔️ ${pieza.getTipo()} en (${pieza.fil}, ${pieza.col}) - Peso: ${pesoData.peso}, BestCelda: ${pesoData.bestCelda ? `(${pesoData.bestCelda.getPosicion().fila}, ${pesoData.bestCelda.getPosicion().col})` : 'null'}`);
                } else {
                    console.log(`  ⏸️ ${pieza.getTipo()} en (${pieza.fil}, ${pieza.col}) - Ya se movió`);
                }
            }

            // Si no hay piezas disponibles, terminar turno
            if (pesos.size === 0) {
                console.log('⚠️ No hay piezas disponibles, terminando turno de IA');
                break;
            }

            console.log(`\n🔍 Eligiendo mejor pieza de ${pesos.size} candidatos...`);

            // NUEVA LÓGICA: Priorizar piezas con objetivo sobre peso
            // 1. Buscar piezas con objetivo (bestCelda !== null)
            let piezasConObjetivo = [];
            let piezasSinObjetivo = [];

            for (let [pieza, data] of pesos) {
                if (data.bestCelda !== null) {
                    piezasConObjetivo.push({ pieza, data });
                    console.log(`  ✅ ${pieza.getTipo()} en (${pieza.fil}, ${pieza.col}) TIENE OBJETIVO - Peso: ${data.peso}`);
                } else {
                    piezasSinObjetivo.push({ pieza, data });
                    console.log(`  ⚪ ${pieza.getTipo()} en (${pieza.fil}, ${pieza.col}) SIN OBJETIVO - Peso: ${data.peso}`);
                }
            }

            // 2. Si hay piezas con objetivo, elegir la de mayor peso entre ellas
            if (piezasConObjetivo.length > 0) {
                console.log(`\n  📍 ${piezasConObjetivo.length} piezas con objetivo encontradas, eligiendo la mejor...`);
                for (let { pieza, data } of piezasConObjetivo) {
                    if (pieza.getTipo() === 'Artilleria' && this.contadorArtilleria < 5) continue
                    if (data.peso > bestPeso) {
                        bestPeso = data.peso;
                        bestPieza = pieza;
                        celdaObjetivo = data.bestCelda;
                        console.log(`    ✅ NUEVA MEJOR: ${pieza.getTipo()} - Peso: ${data.peso}`);
                    }
                }
            }
            // 3. Si no hay ninguna con objetivo, usar fase de apertura
            else {
                console.log(`\n  🚶 No hay piezas con objetivo, activando fase de apertura...`);
                bestPieza = null;
                celdaObjetivo = null;
            }

            console.log(`\n🏆 PIEZA ELEGIDA: ${bestPieza ? `${bestPieza.getTipo()} en (${bestPieza.fil}, ${bestPieza.col}) con peso ${bestPeso}` : 'NINGUNA (fase apertura)'}`);
            console.log(`   Objetivo: ${celdaObjetivo ? `(${celdaObjetivo.getPosicion().fila}, ${celdaObjetivo.getPosicion().col})` : 'NINGUNO'}`);

            // Caso especial: Artillería dispara directamente
            if (bestPieza && bestPieza.getTipo() === 'Artilleria') {
                if (celdaObjetivo && bestPieza.puedeDisparar()) {
                    console.log('💥 Artillería va a disparar');
                    this.tablero.piezaActiva = bestPieza;
                    EventBus.emit(Eventos.PIECE_SELECTED, bestPieza);

                    let destino = celdaObjetivo.getPosicion();
                    console.log(`   Disparando a (${destino.fila}, ${destino.col})`);
                    bestPieza.lanzarProyectil(destino.fila, destino.col, this.escena, this.tablero);

                    EventBus.emit(Eventos.PIECE_MOVED, bestPieza, false);

                    // Delay después de disparar para ver la explosión
                    await this.esperarDelay(800);
                    console.log('   ✅ Disparo completado');
                    continue; // Siguiente acción
                } else {
                    console.log('⚠️ Artillería no puede disparar, saltando...');
                    continue;
                }
            }

            // Si encontró objetivo con enemigos, calcula el camino
            if (bestPieza && celdaObjetivo) {
                console.log('🎯 Objetivo enemigo detectado, calculando pathfinding...');
                let origen = bestPieza.getPosicion();
                camino = this.aStarPathFinding(
                    bestPieza,
                    this.tablero.getCelda(origen.fila, origen.col),
                    celdaObjetivo
                );
                console.log(`   Camino calculado: ${camino.length} pasos`);

                // LIMITAR EL CAMINO A LOS MOVIMIENTOS DISPONIBLES DE LA PIEZA
                let movimientosDisponibles = bestPieza.getMovimientos();
                if (camino.length > movimientosDisponibles) {
                    console.log(`   ⚠️ Camino recortado de ${camino.length} a ${movimientosDisponibles} pasos (límite de movimiento)`);
                    camino = camino.slice(0, movimientosDisponibles);
                }
            }
            // Si NO hay objetivo (fase inicial), mover soldados/caballería hacia adelante
            else {
                console.log('🚶 Fase de apertura: buscando soldados/caballería para avanzar...');
                camino = []; // ✅ Resetear camino al inicio
                // Buscar soldados y caballería que puedan avanzar
                for (let [pieza, data] of pesos) {
                    let tipo = pieza.getTipo();

                    if (tipo === 'Soldado' || tipo === 'Caballeria') {
                        let pos = pieza.getPosicion();
                        let movimientosMax = pieza.getMovimientos();
                        let destinoCol = pos.col - movimientosMax;

                        console.log(`   Evaluando ${tipo} en (${pos.fila}, ${pos.col}) -> destino col ${destinoCol} (${movimientosMax} movimientos)`);

                        if (destinoCol >= 0) {
                            let celdaDestino = this.tablero.getCelda(pos.fila, destinoCol);

                            // Verificar que la celda destino esté vacía
                            if (celdaDestino.estaVacia()) {
                                camino = this.aStarPathFinding(
                                    pieza,
                                    this.tablero.getCelda(pos.fila, pos.col),
                                    celdaDestino
                                );

                                if (camino.length > 0 && camino.length <= movimientosMax) {  // ✅ Cambiar < por <=
                                    bestPieza = pieza;
                                    console.log(`   ✅ ${tipo} puede avanzar - Camino: ${camino.length} pasos`);
                                    break;
                                } else {
                                    console.log(`   ❌ ${tipo} no encontró camino válido`);
                                    camino = []; // ✅ Resetear si no es válido
                                }
                            } else {
                                console.log(`   ❌ Celda destino ocupada`);
                            }
                        } else {
                            console.log(`   ❌ Destino fuera del tablero`);
                        }
                    }
                }
            }

            // Si hay camino válido Y pieza válida, mueve la pieza
            if (camino.length > 0 && bestPieza) {  // ✅ Verificar ambos
                console.log(`\n🚀 EJECUTANDO MOVIMIENTO de ${bestPieza.getTipo()}`);

                // Seleccionar la pieza (emite PIECE_SELECTED)
                this.tablero.piezaActiva = bestPieza;
                EventBus.emit(Eventos.PIECE_SELECTED, bestPieza);

                // Detectar si el objetivo final tiene un enemigo
                let ultimaCelda = camino[camino.length - 1];
                let hayEnemigoAlFinal = !ultimaCelda.estaVacia() &&
                    ultimaCelda.getPieza().getJugador() !== bestPieza.getJugador();

                console.log(`   Enemigo al final: ${hayEnemigoAlFinal ? 'SÍ' : 'NO'}`);

                // Determinar hasta dónde moverse
                let pasosFinal = hayEnemigoAlFinal ? camino.length - 1 : camino.length;
                console.log(`   Moviendo ${pasosFinal} pasos de ${camino.length} totales`);

                // Mueve la pieza paso a paso con delay entre cada movimiento
                for (let paso = 0; paso < pasosFinal; paso++) {
                    let siguienteCelda = camino[paso];
                    let destino = siguienteCelda.getPosicion();
                    let origenActual = bestPieza.getPosicion();

                    console.log(`     Paso ${paso + 1}: (${origenActual.fila}, ${origenActual.col}) -> (${destino.fila}, ${destino.col})`);

                    // Limpia origen
                    this.tablero.getCelda(origenActual.fila, origenActual.col).limpiar();

                    // Mueve pieza UNA casilla
                    bestPieza.moverse(destino.fila, destino.col);
                    this.tablero.getCelda(destino.fila, destino.col).setContenido(bestPieza);

                    // Emitir PIECE_MOVED para que restarAccion() maneje la reducción de movimientos
                    EventBus.emit(Eventos.PIECE_MOVED, bestPieza, false);

                    // Delay entre cada paso para ver el movimiento
                    await this.esperarDelay(300);
                    
                    // Excepción para el Comandante: si llega a su celda objetivo (vacía), detener movimiento
                    if (bestPieza.getTipo() === 'Comandante' && !hayEnemigoAlFinal) {
                        let posActual = bestPieza.getPosicion();
                        let posObjetivo = celdaObjetivo.getPosicion();
                        if (posActual.fila === posObjetivo.fila && posActual.col === posObjetivo.col) {
                            console.log(`   🛡️ Comandante llegó a su posición objetivo, finalizando movimiento`);
                            this.turno.acabarMovimientos();
                            break;
                        }
                    }
                }

                // Si hay enemigo al final y llegamos a la penúltima casilla, atacar
                if (hayEnemigoAlFinal && pasosFinal === camino.length - 1) {
                    let celdaEnemiga = ultimaCelda.getPosicion();
                    let enemigoTipo = ultimaCelda.getPieza() ? ultimaCelda.getPieza().getTipo() : 'DESCONOCIDO';

                    // Verificar que la pieza atacante todavía existe
                    if (!bestPieza || bestPieza.getPosicion() === undefined) {
                        console.log('⚠️ La pieza atacante ya no existe, saltando combate');
                        continue;
                    }
                    
                    // Verificar que el enemigo todavía existe
                    if (ultimaCelda.estaVacia()) {
                        console.log('⚠️ El enemigo ya no existe en la celda destino, saltando combate');
                        continue;
                    }

                    console.log(`\n⚔️ INICIANDO COMBATE contra ${enemigoTipo} en (${celdaEnemiga.fila}, ${celdaEnemiga.col})`);

                    // Iniciar el combate (emite ENEMY_SELECTED)
                    this.tablero.ataque(celdaEnemiga.fila, celdaEnemiga.col);

                    // Esperar un poco para que se registre el combate
                    await this.esperarDelay(300);

                    // Ejecutar el ataque directamente (sin esperar botón del jugador)
                    EventBus.emit(Eventos.ATACK);
                    console.log('   🎲 Dados lanzados, resolviendo combate...');
                    
                    // Esperar a que termine el combate
                    await this.esperarDelay(1500);
                    
                    // Emitir PIECE_MOVED con ataque=true para que se reste la acción del turno
                    EventBus.emit(Eventos.PIECE_MOVED, bestPieza, true);
                    console.log('   ✅ Combate completado - Acción de turno consumida');
                }

                console.log('   ✅ Movimiento completado');

            } else {
                console.log('⚠️ No hay camino válido, continuando con siguiente acción');
                this.turno.acabarMovimientos()
                continue;
            }

            // Pequeño delay entre acciones (piezas diferentes)
            await this.esperarDelay(400);
        }

        console.log('\n========================================');
        console.log('🏁 TURNO DE LA IA TERMINADO');
        console.log('========================================\n');
        this.tableroGrafico.activarInteraccion();
    }

    FindClosestEnemy(piezaIA) {
        let minDistance = Infinity;
        for (let f = 0; f < this.tablero.filas; f++) {
            for (let c = 0; c < this.tablero.columnas; c++) {
                let celda = this.tablero.getCelda(f, c);
                let pieza = celda.getPieza();
                if (pieza && pieza.jugador == 'J1') {
                    let distance = Math.sqrt(Math.pow(piezaIA.getPosicion().col - pieza.getPosicion().col, 2) + Math.pow(piezaIA.getPosicion().fila - pieza.getPosicion().fila, 2));
                    if (minDistance > distance) {
                        minDistance = distance
                        this.closestEnemy = pieza
                    }
                }
            }
        }
    }

    aStarPathFinding(pieza, celdaInicio, celdaDestino) {
        const MAX_PROFUNDIDAD = 20;
        const openSet = [];
        const closedSet = new Set();
        const cameFrom = new Map();
        const costoMovimiento = new Map(); // Nuevo: guarda el costo de cada movimiento

        const gScore = new Map();
        const fScore = new Map();

        gScore.set(celdaInicio, 0);
        pieza.getTipo() == 'Comandante' ? fScore.set(celdaInicio, this.diagHeuristic(celdaInicio, celdaDestino))
            : fScore.set(celdaInicio, this.heuristic(celdaInicio, celdaDestino));
        openSet.push(celdaInicio);

        while (openSet.length > 0) {
            let currentIndex = 0;
            let current = openSet[0];

            for (let i = 1; i < openSet.length; i++) {
                const candidato = openSet[i];
                const fCurr = fScore.get(current) ?? Infinity;
                const fCand = fScore.get(candidato) ?? Infinity;
                if (fCand < fCurr) {
                    currentIndex = i
                    current = candidato;
                }
            }

            if (current === celdaDestino) {
                return this.reconstruirCamino(cameFrom, current);
            }

            openSet.splice(currentIndex, 1);
            closedSet.add(current);

            const gActual = gScore.get(current) ?? Infinity;

            if (gActual > MAX_PROFUNDIDAD) {
                continue;
            }

            // Obtener vecinos: usa método especial solo para Caballería
            const vecinos = pieza.getTipo() === 'Caballeria'
                ? this.getVecinosConSalto(pieza, current, celdaInicio, gActual)
                : this.getVecinos(pieza, current);

            for (const vecinoInfo of vecinos) {
                // Ahora vecinos puede devolver objetos {celda, costo} para Caballería
                const vecino = vecinoInfo.celda || vecinoInfo;
                const costoExtra = vecinoInfo.costo || 1;

                if (closedSet.has(vecino)) continue;
                if (!this.transitable(vecino, celdaDestino)) continue;

                const expectedG = gActual + costoExtra;
                const gVecino = gScore.get(vecino)

                if (gVecino === undefined || expectedG < gVecino) {
                    cameFrom.set(vecino, current);
                    gScore.set(vecino, expectedG);
                    costoMovimiento.set(vecino, costoExtra);

                    const h = pieza.getTipo() == 'Comandante' ? this.diagHeuristic(vecino, celdaDestino) : this.heuristic(vecino, celdaDestino)
                    fScore.set(vecino, expectedG + h);

                    if (!openSet.includes(vecino))
                        openSet.push(vecino)
                }
            }
        }
        return [];
    }

    /**
     * Obtiene los vecinos de una celda considerando el salto de caballería.
     * Si es Caballería y es el primer movimiento, puede saltar una pieza (costo: 2 movimientos).
     * 
     * @param {Pieza} pieza - La pieza que se está moviendo
     * @param {Celda} celda - Celda actual
     * @param {Celda} celdaInicio - Celda de inicio del pathfinding
     * @param {number} gActual - Distancia desde el inicio
     * @returns {Array<Object|Celda>} Array de celdas vecinas o {celda, costo}
     */
    getVecinosConSalto(pieza, celda, celdaInicio, gActual) {
        const pos = celda.getPosicion();
        const fila = pos.fila;
        const col = pos.col;
        const res = [];

        console.log(`🐴 getVecinosConSalto: Caballeria en (${fila}, ${col}), gActual: ${gActual}, esInicio: ${celda === celdaInicio}`);

        // Movimientos básicos (4 direcciones cardinales)
        const direcciones = [
            { df: -1, dc: 0 },  // arriba
            { df: 1, dc: 0 },   // abajo
            { df: 0, dc: -1 },  // izquierda
            { df: 0, dc: 1 }    // derecha
        ];

        for (const dir of direcciones) {
            const nf = fila + dir.df;
            const nc = col + dir.dc;

            // Verificar límites
            if (nf < 0 || nf >= this.tablero.filas || nc < 0 || nc >= this.tablero.columnas)
                continue;

            const vecinoCelda = this.tablero.getCelda(nf, nc);

            // Si la celda está vacía, siempre es accesible (costo normal: 1)
            if (vecinoCelda.estaVacia()) {
                console.log(`   ✅ Celda vacía en (${nf}, ${nc}) - costo 1`);
                res.push({ celda: vecinoCelda, costo: 1 });
            }
            // Si la celda tiene una pieza enemiga, es un objetivo válido (costo: 1)
            else if (!vecinoCelda.estaVacia() && vecinoCelda.getPieza().getJugador() !== pieza.getJugador()) {
                console.log(`   ⚔️ Enemigo en (${nf}, ${nc}) - costo 1`);
                res.push({ celda: vecinoCelda, costo: 1 });
            }
            // Si es Caballería en su posición inicial (primer movimiento), puede saltar piezas aliadas
            else if (celda === celdaInicio && gActual === 0 && pieza.getSaltoCaballeria()) {
                console.log(`   🦘 Intentando salto desde (${fila}, ${col}) hacia (${nf}, ${nc})`);

                // La celda vecina tiene una pieza aliada, intentar saltar
                const nf2 = nf + dir.df;
                const nc2 = nc + dir.dc;

                // Verificar límites de la celda de aterrizaje
                if (nf2 >= 0 && nf2 < this.tablero.filas && nc2 >= 0 && nc2 < this.tablero.columnas) {
                    const celdaSalto = this.tablero.getCelda(nf2, nc2);

                    // Solo puede saltar si la celda de aterrizaje está vacía o tiene un enemigo
                    if (celdaSalto.estaVacia() ||
                        (!celdaSalto.estaVacia() && celdaSalto.getPieza().getJugador() !== pieza.getJugador())) {
                        console.log(`   ✅ Salto válido a (${nf2}, ${nc2}) - costo 2`);
                        // El salto cuesta 2 movimientos
                        res.push({ celda: celdaSalto, costo: 2 });
                    } else {
                        console.log(`   ❌ Salto bloqueado: celda (${nf2}, ${nc2}) ocupada por aliado`);
                    }
                } else {
                    console.log(`   ❌ Salto fuera de límites: (${nf2}, ${nc2})`);
                }
            } else {
                console.log(`   ⛔ Celda (${nf}, ${nc}) ocupada por aliado y no puede saltar`);
            }
        }

        console.log(`   📋 Total vecinos encontrados: ${res.length}`);
        return res;
    }

    diagHeuristic(a, b) {
        const pa = a.getPosicion();
        const pb = b.getPosicion();
        const dx = Math.abs(pa.fila - pb.fila);
        const dy = Math.abs(pa.col - pb.col);
        return Math.max(dx, dy);
    }

    heuristic(a, b) {
        const pa = a.getPosicion();
        const pb = b.getPosicion();
        return Math.abs(pa.fila - pb.fila) + Math.abs(pa.col - pb.col);
    }

    transitable(celda, celdaDestino) {
        if (celda === celdaDestino) return true;
        return celda.estaVacia();
    }

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
                res.push(this.tablero.getCelda(fila - 1, col - 1)); // ↖ arriba-izquierda
            }
            if (fila > 0 && col < this.tablero.columnas - 1) {  // ✅ CORREGIDO: fila > 0
                res.push(this.tablero.getCelda(fila - 1, col + 1)); // ↗ arriba-derecha
            }
            if (fila < this.tablero.filas - 1 && col > 0) {
                res.push(this.tablero.getCelda(fila + 1, col - 1)); // ↙ abajo-izquierda
            }
            if (fila < this.tablero.filas - 1 && col < this.tablero.columnas - 1) {
                res.push(this.tablero.getCelda(fila + 1, col + 1)); // ↘ abajo-derecha
            }
        }

        return res;
    }

    DrawPathHighlight(camino, color = 0x22ff66) {
        this.pathGraphics.clear();
        if (!camino || camino.length === 0) return;

        for (const celda of camino) {
            const r = this.RectDeCelda(celda);
            if (!r) continue;
            this.pathGraphics.fillStyle(color, 0.30);
            this.pathGraphics.fillRect(r.x, r.y, r.w, r.h);
            this.pathGraphics.lineStyle(2, color, 0.85);
            this.pathGraphics.strokeRect(r.x, r.y, r.w, r.h);
        }
    }

    ClearPathHighlight() {
        if (this.pathGraphics) this.pathGraphics.clear();
    }

    RectDeCelda(celda) {
        const fila = celda.getPosicion().fila;
        const col = celda.getPosicion().col;

        const sprite = this.tableroGrafico?.getCeldaSprite?.(fila, col) || celda.getSprite?.();
        if (sprite && sprite.getBounds) {
            const b = sprite.getBounds();
            return { x: b.x, y: b.y, w: b.width, h: b.height };
        }

        const cellW = this.tableroGrafico?.tamCelda || this.tableroGrafico?.cellSize || 64;
        const cellH = this.tableroGrafico?.tamCelda || this.tableroGrafico?.cellSize || 64;
        const originX = this.tableroGrafico?.origenX || this.tableroGrafico?.offsetX || 0;
        const originY = this.tableroGrafico?.origenY || this.tableroGrafico?.offsetY || 0;

        return {
            x: originX + col * cellW,
            y: originY + fila * cellH,
            w: cellW,
            h: cellH
        };
    }

    /**
     * Función auxiliar para esperar un tiempo determinado
     * @param {number} ms - Milisegundos a esperar
     * @returns {Promise}
     */
    esperarDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
