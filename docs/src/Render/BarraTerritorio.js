/**
 * Se encarga de mostrar graficamente el porcentaje conquistado por cada jugador.
 * @class BarraTerritorio
 * @memberof Render
 */
class BarraTerritorio {
    constructor(escena) {
        this.colorJ1 = '#0077ffff';
        this.colorJ2 = '#e6270eff';
        this.colorNeutral = '#b9b9b9ff';

        this.porcentajeJ1;
        this.porcentajeJ2;

        this.marco = escena.add.sprite(escena.scale.width - 180, escena.scale.height - 44, 'marcoConquista').setOrigin(0.5).setScale(0.23);
    }
}

export default BarraTerritorio;