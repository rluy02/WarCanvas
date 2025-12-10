/**
 * Se encarga de mostrar graficamente el porcentaje conquistado por cada jugador.
 * @class BarraTerritorio
 * @memberof Render
 */
class BarraTerritorio {
    constructor(escena) {
        this.colorJ1 = 0x18700B;
        this.colorJ2 = 0xDE1616;
        this.colorNeutral = 0x9C9C9C;

        this.porcentajeJ1;
        this.porcentajeJ2;
        this.maxCarga = 230;

        this.marco = escena.add.sprite(escena.scale.width - 180, escena.scale.height - 44, 'marcoConquista').setOrigin(0.5).setScale(0.23).setDepth(100);
        this.barraFondo = escena.add.rectangle(escena.scale.width-180, escena.scale.height - 44, 230, 50, this.colorNeutral).setOrigin(0.5);
        this.barraJ1 = escena.add.rectangle(escena.scale.width - 295, escena.scale.height - 70, this.calcularAncho(30), 50, this.colorJ1).setOrigin(0, 0);
        this.barraJ2 = escena.add.rectangle(escena.scale.width - 65, escena.scale.height - 70, this.calcularAncho(30), 50, this.colorJ2).setOrigin(1, 0);
    }

    establecerPorcentaje(j1, j2){
        
    }

    calcularAncho(porcentaje){
        return porcentaje * this.maxCarga / 100;
    }
}

export default BarraTerritorio;