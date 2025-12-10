import { turnoJugador } from "./Turno.js";
import { EventBus } from "../EventBus.js";
import { Eventos } from "../Events.js";

export default class InteligenciaArtificial {
    constructor(tablero, tableroGrafico, equipoIA, escena, acciones) {
        this.tablero = tablero;
        this.tableroGrafico = tableroGrafico;
        this.equipoIA = equipoIA;
        this.escena = escena;
        this.acciones = acciones
        this.closestEnemy = null;

        this.pathGraphics = this.escena.add.graphics();
        this.pathGraphics.setDepth(9999);

        EventBus.on(Eventos.CHANGE_TURN, () => {
            this.ClearPathHighlight()
            if (turnoJugador == 'J2')
                this.TurnoIA();
        })
    }
    TurnoIA() {
        for (let i = 0; i < 1; i++) {
            let selected = false;
            let pieza = null;
            while (!selected) {
                let indicePieza = Phaser.Math.Between(0, this.equipoIA.piezas.length - 1)
                pieza = this.equipoIA.piezas[indicePieza];
                if (!pieza.getMovida()) {
                    selected = true;
                    if (pieza.getTipo() == 'Artilleria' && !pieza.puedeDisparar())
                        selected = false
                }
            }
            this.FindClosestEnemy(pieza)
            console.log(`Pieza IA: ${pieza.getTipo()}`)
            console.log(pieza.getPosicion())


            console.log(`Enemigo más cercana: ${this.closestEnemy.getTipo()}`)
            console.log(this.closestEnemy.getPosicion())
            if (pieza.getTipo() === 'Soldado' || pieza.getTipo() === 'Caballeria' || pieza.getTipo() === 'Comandante') {
                pieza.calculaPeso();
            }
            if (pieza.getTipo() == 'Artilleria') {
                let celdaDestino = this.algoritmoArtilleria(pieza);
                if (celdaDestino) {
                    console.log(`Celda destino artillería: ${celdaDestino.getPosicion().fila}, ${celdaDestino.getPosicion().col}`);
                } else {
                    console.log('No se encontró celda destino para artillería');
                }
            }
            else {
                let inicio = this.tablero.getCelda(pieza.getPosicion().fila, pieza.getPosicion().col)
                let destino = this.tablero.getCelda(this.closestEnemy.getPosicion().fila, this.closestEnemy.getPosicion().col)
                const camino = this.AStarPathFinding(pieza, inicio, destino)
                for (let i = 0; i < camino.length; i++) {
                    console.log(camino[i].getPosicion());
                }
                this.DrawPathHighlight(camino);
            }
        }
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

    AStarPathFinding(pieza, celdaInicio, celdaDestino) {
        const MAX_PROFUNDIDAD = 20;
        const openSet = [];
        const closedSet = new Set();
        const cameFrom = new Map();

        const gScore = new Map();
        const fScore = new Map();

        gScore.set(celdaInicio, 0);
        pieza.getTipo() == 'Comandante' ? fScore.set(celdaInicio, this.DiagHeuristic(celdaInicio, celdaDestino))
            : fScore.set(celdaInicio, this.Heuristic(celdaInicio, celdaDestino));
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
                return this.ReconstruirCamino(cameFrom, current);
            }

            openSet.splice(currentIndex, 1);
            closedSet.add(current);

            const gActual = gScore.get(current) ?? Infinity;

            if (gActual > MAX_PROFUNDIDAD) {
                continue;
            }

            for (const vecino of this.GetVecinos(pieza, current)) {
                if (closedSet.has(vecino)) continue;
                if (!this.Transitable(vecino, celdaDestino)) continue;

                const expectedG = gActual + 1;
                const gVecino = gScore.get(vecino)

                if (gVecino === undefined || expectedG < gVecino) {
                    cameFrom.set(vecino, current);
                    gScore.set(vecino, expectedG);

                    const h = pieza.getTipo() == 'Comandante' ? this.DiagHeuristic(vecino, celdaDestino) : this.Heuristic(vecino, celdaDestino)
                    fScore.set(vecino, expectedG + h);

                    if (!openSet.includes(vecino))
                        openSet.push(vecino)
                }
            }
        }
        return [];
    }

    DiagHeuristic(a, b) {
        const pa = a.getPosicion();
        const pb = b.getPosicion();
        const dx = Math.abs(pa.fila - pb.fila);
        const dy = Math.abs(pa.col - pb.col);
        return Math.max(dx, dy);
    }

    Heuristic(a, b) {
        const pa = a.getPosicion();
        const pb = b.getPosicion();
        return Math.abs(pa.fila - pb.fila) + Math.abs(pa.col - pb.col);
    }

    Transitable(celda, celdaDestino) {
        if (celda === celdaDestino) return true;
        return celda.estaVacia();
    }

    ReconstruirCamino(cameFrom, actual) {
        const path = [];
        let current = actual;
        while (cameFrom.has(current)) {
            path.push(current);
            current = cameFrom.get(current);
        }
        path.reverse();
        return path;
    }

    GetVecinos(pieza, celda) {
        const pos = celda.getPosicion();
        const fila = pos.fila;
        const col = pos.col;
        const res = [];

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
        if (pieza.getTipo() == 'Comandante') {
            if (fila > 0 && col > 0) {
                res.push(this.tablero.getCelda(fila - 1, col - 1));
            }
            if (fila < 0 && col < this.tablero.columnas - 1) {
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

    algoritmoArtilleria(pieza) {
        let piezasEnRango = new Map();
        for (let f = 0; f < this.tablero.filas - 1; f++) {
            for (let c = pieza.getPosicion().col - 4; c < this.tablero.columnas - 1; c++) {
                let piezasEnemigas = 0;
                let celda = this.tablero.getCelda(f, c);
                if (!celda.estaVacia() && celda.getPieza().getJugador() === 'J1')
                    piezasEnemigas++;
                let vecinos = this.GetVecinos(pieza, celda);
                for (const vecino of vecinos) {
                    if (!vecino.estaVacia() && vecino.getPieza().getJugador() === 'J1')
                        piezasEnemigas++;
                }
                piezasEnRango.set(celda, piezasEnemigas);
                console.log(`Celda analizada Artilleria: ${celda.getPosicion().fila}, ${celda.getPosicion().col} - Piezas enemigas: ${piezasEnemigas}`);
            }
        }
        let maxKey = null;
        let maxValue = -Infinity;
        let celdasEmpatadas = [];

        for (const [key, value] of piezasEnRango) {
            if (value > maxValue) {
                maxValue = value;
                maxKey = key;
                celdasEmpatadas.length = 0;
                celdasEmpatadas.push(key);
            }
            else if (value === maxValue) {
                celdasEmpatadas.push(key);
            }
        }
        let randomIndex = Phaser.Math.Between(0, celdasEmpatadas.length - 1);
        return celdasEmpatadas.length > 0 ? celdasEmpatadas[randomIndex] : maxKey;
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
}
