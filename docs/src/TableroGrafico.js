export default class TableroGrafico {
    constructor(escena, tablero, tamCasilla = 64) {
        this.escena = escena;
        this.tablero = tablero;
        this.tamCasilla = tamCasilla;
        this.graficos = this.dibujarTablero(); //Este tablero visual esta lleno de "rects" //Phaser.GameObjects.Rectangle
        
    }

    dibujarTablero() {
        let graficos = [];

        for (let fila = 0; fila < this.tablero.filas; fila++) {
            graficos[fila] = [];
            for (let col = 0; col < this.tablero.columnas; col++) {
                const color = (fila + col) % 2 === 0 ? 0xffffff : 0xcccccc;
                 //los rectangulos se empiezan a dibujar desde el centro (por eso, +tamCasillas/2)
                const x = col * this.tamCasilla + this.tamCasilla / 2;
                const y = fila * this.tamCasilla + this.tamCasilla / 2;

                // new Rectangle(scene, x, y, [width], [height], [fillColor], [fillAlpha])
                const rect = this.escena.add.rectangle(
                    x, y, this.tamCasilla, this.tamCasilla, color
                ).setStrokeStyle(1, 0x000000)
                 .setInteractive();

                // Detectar click
                rect.on('pointerdown', () => {
                    console.log(`Click en fila ${fila}, columna ${col}`);
                    this.onCeldaClick(fila, col);
                });

                graficos[fila][col] = rect;
            }
        }

        return graficos;
    }

    onCeldaClick(fila, col) {
        // Pregunta que celda se esta clickando
        let celda = this.tablero.getCelda(fila, col);
        console.log(celda);

        //Muestra rapida de seleccion de casilla
        this.graficos[fila][col].setStrokeStyle(3, 0xffff00);
    }
}