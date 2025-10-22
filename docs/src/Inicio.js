import Tablero from "./Tablero.js";
export default class Inicio extends Phaser.Scene {
    constructor(){
        super("Inicio")
    }

    init() {
        console.log("prueba");
    }

    preload() { }

    create() {
        //Creamos la instancia y la guardamos en tab
        this.tab = new Tablero();

        // console.log(this.tab.grid);
        //Dibujamos el tablero
        this.tabDibujado = this.dibujarTablero(this.tab, 64);
    }

    //Metodo que se encarga de renderizar el tablero
    dibujarTablero(tablero, tamCasillas) {
        let tabDibujado = [];

        for (let fila = 0; fila < tablero.filas; fila++) {
            tabDibujado[fila] = [];
            for (let col = 0; col < tablero.columnas; col++) {
                const color = (fila + col) % 2 === 0 ? 0xffffff : 0xcccccc;

                //los rectangulos se empiezan a dibujar desde el centro (por eso, +tamCasillas/2)
                const rect = this.add.rectangle(
                    col * tamCasillas + tamCasillas / 2,
                    fila * tamCasillas + tamCasillas / 2,
                    tamCasillas,
                    tamCasillas,
                    color
                ).setStrokeStyle(1, 0x000000);

                tabDibujado[fila][col] = rect;
            }
        }

        return tabDibujado;
    }

    update() { }
}

