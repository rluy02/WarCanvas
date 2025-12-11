import Pieza from '../Pieza.js';

/**
 * Clase que representa la pieza de Comandante en el juego.
 * @class Comandante
 * @extends Pieza
 * @memberof Logica
 */
class Comandante extends Pieza {
    /**
     * Constructor de la pieza Comandante.
     * @param {Tablero} tablero - tablero al que pertenece la pieza
     * @param {number} fil - fila
     * @param {number} col - columna
     * @param {string} jugador - 'J1' o 'J2'
     */
    constructor(tablero, fil, col, jugador) {
        super(tablero, 'Comandante', fil, col, jugador, 4, 3, 5);
        
        /**
         * Peso base del comandante (sin considerar amenazas o aliados)
         * @type {number}
         */
        this.pesoBase = 4;
    }

    /**
     * Determina el modo táctico del comandante (ATAQUE o DEFENSA) según las amenazas cercanas.
     * Analiza un área de 2 celdas alrededor y evalúa:
     * - Cantidad y tipo de piezas enemigas
     * - Presencia de artillería enemiga en rango
     * - Presencia del comandante enemigo
     * 
     * @returns {string} 'DEFENSA' si hay amenazas significativas, 'ATAQUE' en caso contrario
     */
    calculaModo() {
        let modo;
        
        // Calcular límites del área de análisis (2 celdas alrededor)
        let topLimit = this.fil - 2 < 0 ? 0 : this.fil - 2;
        let bottomLimit = this.fil + 2 > this.tablero.filas - 1 ? this.tablero.filas - 1 : this.fil + 2;
        let leftLimit = this.col - 2 < 0 ? 0 : this.col - 2;
        let rightLimit = this.col + 2 > this.tablero.columnas - 1 ? this.tablero.columnas - 1 : this.col + 2;

        let soldados = [];
        let caballerias = [];
        let artilleria = 0;
        let comandante = 0;
        let piezasEnRango = 0;
        
        // Escanear área alrededor del comandante
        for (let i = topLimit; i <= bottomLimit; i++) {
            for (let j = leftLimit; j <= rightLimit; j++) {
                if (!this.tablero.getCelda(i, j).estaVacia() && this.tablero.getCelda(i, j).getPieza().getJugador() === 'J1') {
                    const pieza = this.tablero.getCelda(i, j).getPieza();
                    let res = this.detectaTipo(this.tablero.getCelda(i, j), 'J1');
                    
                    // Clasificar piezas enemigas encontradas
                    switch (res) {
                        case 1: 
                            soldados.push(pieza);
                            break;
                        case 2: 
                            caballerias.push(pieza);
                            break;
                        case 4: 
                            comandante = 1;
                            break;
                    }
                    piezasEnRango++;
                }
            }
        }
        
        // Verificar si hay artillería enemiga en rango de disparo
        let artilleriaJ1 = this.encuentraArtilleria();
        if (artilleriaJ1 && artilleriaJ1.puedeDisparar()) {
            if (artilleriaJ1.getPosicion().col < this.col && artilleriaJ1.getPosicion().col + 4 >= this.col)
                artilleria = 1;
        }
        
        // Determinar modo según amenazas detectadas
        if (soldados.length > 2 || caballerias.length > 2 || artilleria == 1 || comandante == 1 || piezasEnRango > 3)
            modo = 'DEFENSA';
        else 
            modo = 'ATAQUE';
            
        return modo;
    }

    /**
     * Calcula el peso táctico del comandante basándose en su modo actual.
     * En DEFENSA: Usa BFS hasta 4 pasos para encontrar la mejor posición defensiva cerca de aliados
     * En ATAQUE: Busca enemigos en un radio de 2 celdas y selecciona el de mayor valor
     * 
     * @returns {Object} Objeto con dos propiedades:
     *   - peso {number}: Peso total calculado
     *   - bestCelda {Celda|null}: Celda objetivo seleccionada
     */
    calculaPeso() {
        const modo = this.calculaModo();
        let bestCelda = null;
        let bestPeso = -Infinity;

        const celdaInicial = this.tablero.getCelda(this.fil, this.col);

        if (modo === 'DEFENSA') {
            // Modo defensivo: BFS para encontrar mejor posición cerca de aliados
            const maxPasos = 4;
            const visitadasClaves = new Set();
            const queue = [];

            const pos0 = celdaInicial.getPosicion();
            const clave0 = `${pos0.fila},${pos0.col}`;
            visitadasClaves.add(clave0);
            queue.push({ celda: celdaInicial, pasos: 0 });

            // Evaluar posición actual
            bestCelda = celdaInicial;
            bestPeso = this.evaluarDefensa(celdaInicial);

            // BFS: explorar posiciones alcanzables en 4 movimientos
            while (queue.length > 0) {
                const { celda, pasos } = queue.shift();

                if (pasos === maxPasos) continue;

                // Obtener vecinos vacíos (el comandante se puede mover en 8 direcciones)
                const vecinosMovimiento = this.getVecinos(celda)
                    .filter(v => v.estaVacia());

                for (const destino of vecinosMovimiento) {
                    const pos = destino.getPosicion();
                    const clave = `${pos.fila},${pos.col}`;

                    if (visitadasClaves.has(clave)) continue;
                    visitadasClaves.add(clave);

                    // Encolar para continuar expandiendo
                    queue.push({ celda: destino, pasos: pasos + 1 });

                    // Evaluar valor defensivo de esta posición
                    const pesoCelda = this.evaluarDefensa(destino);

                    console.log(`   Evaluando (${pos.fila}, ${pos.col}): peso = ${pesoCelda}`);

                    if (pesoCelda > bestPeso) {
                        bestPeso = pesoCelda;
                        bestCelda = destino;
                        console.log(`   ✅ NUEVA MEJOR: (${pos.fila}, ${pos.col}) con peso ${pesoCelda}`);
                    }
                }
            }

            const finalPos = bestCelda.getPosicion();
            console.log(`   🎯 MEJOR CELDA: (${finalPos.fila}, ${finalPos.col}) con peso ${bestPeso}`);
        }

        if (modo === 'ATAQUE') {
            // Modo ofensivo: buscar enemigo de mayor valor en radio de 2 celdas
            let celdasVecinas = this.getVecinos(celdaInicial);
            
            // Primera capa: vecinos directos
            for (const vecino of celdasVecinas) {
                if (!vecino.estaVacia() && vecino.getPieza().getJugador() === 'J1') {
                    let res = this.detectaTipo(vecino);
                    if (res > bestPeso) {
                        bestPeso = res;
                        bestCelda = vecino;
                    }
                }
                
                // Segunda capa: vecinos de los vecinos
                const segVecinos = this.getVecinos(vecino);
                for (const segVecino of segVecinos) {
                    if (!segVecino.estaVacia() && segVecino.getPieza().getJugador() === 'J1') {
                        let res = this.detectaTipo(segVecino);
                        if (res > bestPeso) {
                            bestPeso = res;
                            bestCelda = segVecino;
                        }
                    }
                }
            }
        }

        console.log(`Comandante (${this.fil}, ${this.col}) en modo ${modo} elige celda objetivo: ${bestCelda ? `(${bestCelda.getPosicion().fila}, ${bestCelda.getPosicion().col})` : 'Ninguna'} con peso ${bestPeso + this.pesoBase}`);
        return { peso: (bestPeso + this.pesoBase), bestCelda: bestCelda };
    }

    /**
     * Detecta el tipo de pieza en una celda y retorna su valor táctico.
     * Soldado=1, Caballería=2, Artillería=3, Comandante=4
     * 
     * @param {Celda} celda - Celda a analizar
     * @param {string} jugadorObjetivo - Jugador objetivo ('J1' o 'J2')
     * @returns {number} Valor táctico de la pieza (0 si está vacía o es del jugador contrario)
     */
    detectaTipo(celda, jugadorObjetivo = 'J1') {
        let peso = 0;

        if (!celda.estaVacia()) {
            const piezaJugador = celda.getPieza().getJugador();

            // Solo contar si es del jugador objetivo
            if (piezaJugador === jugadorObjetivo) {
                switch (celda.getPieza().getTipo()) {
                    case 'Soldado':
                        peso += 1;
                        break;
                    case 'Caballeria':
                        peso += 2;
                        break;
                    case 'Artilleria':
                        peso += 3;
                        break;
                    case 'Comandante':
                        if (jugadorObjetivo === 'J1')
                        peso += 4;
                        break;
                }
            }
        }
        return peso;
    }

    /**
     * Obtiene las 8 celdas vecinas de una celda dada (movimiento diagonal incluido).
     * El comandante puede moverse en todas las direcciones adyacentes.
     * 
     * @param {Celda} celda - Celda central
     * @returns {Array<Celda>} Array con las celdas vecinas válidas
     */
    getVecinos(celda) {
        const pos = celda.getPosicion();
        const fila = pos.fila;
        const col = pos.col;
        const res = [];

        // Iterar sobre las 8 direcciones (incluyendo diagonales)
        for (let df = -1; df <= 1; df++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (df === 0 && dc === 0) continue;

                const nf = fila + df;
                const nc = col + dc;

                // Verificar límites del tablero
                if (nf < 0 || nf >= this.tablero.filas) continue;
                if (nc < 0 || nc >= this.tablero.columnas) continue;

                res.push(this.tablero.getCelda(nf, nc));
            }
        }

        return res;
    }

    /**
     * Evalúa el valor defensivo de una celda sumando el valor de todas las piezas aliadas vecinas.
     * 
     * @param {Celda} celda - Celda a evaluar
     * @returns {number} Suma del valor de todas las piezas aliadas vecinas menos el valor de las enemigas
     */
    evaluarDefensa(celda) {
        let peso = 0;
        const vecinos = this.getVecinos(celda);

        for (const v of vecinos) {
            if (v.estaVacia()) continue;

            const jugador = v.getPieza().getJugador();
            if (jugador === 'J2') {
                peso += this.detectaTipo(v, 'J2'); // Aliados suman
            } else if (jugador === 'J1') {
                peso -= this.detectaTipo(v, 'J1'); // Enemigos restan
            }
        }

        return peso;
    }

    /**
     * Busca la pieza de artillería enemiga en las primeras 3 columnas del tablero.
     * 
     * @returns {Pieza|undefined} Pieza de artillería encontrada o undefined
     */
    encuentraArtilleria() {
        for (let i = 0; i < this.tablero.filas - 1; i++) {
            for (let j = 0; j < 3; j++) {
                if (!this.tablero.getCelda(i, j).estaVacia() && this.tablero.getCelda(i, j).getPieza().getTipo() === 'Artilleria') {
                    return this.tablero.getCelda(i, j).getPieza();
                }
            }
        }
    }
}

export default Comandante;