import { EventBus } from "../EventBus.js";
import { Eventos } from "../Events.js";

export default class PanelEventoAleatorio {
    constructor(escena) {
        this.escena = escena;
        this.contenedor = null;
        this.isVisible = false;
        // ← YA NO escucha eventos
    }

    mostrar(nombre, descripcion) {
        if (this.isVisible) return;

        this.isVisible = true;
        const centerX = this.escena.cameras.main.width / 2;
        const centerY = this.escena.cameras.main.height / 2;

        // Fondo oscuro
        const overlay = this.escena.add.rectangle(
            0, 0,
            this.escena.cameras.main.width,
            this.escena.cameras.main.height,
            0x000000
        ).setOrigin(0).setDepth(100).setAlpha(0);

        // Panel principal
        const panel = this.escena.add.rectangle(
            centerX, centerY,
            400, 250,
            0x2c3e50
        ).setDepth(101).setStrokeStyle(3, 0xe74c3c).setAlpha(0).setScale(0.8);

        // Título "EVENTO ALEATORIO"
        const titulo = this.escena.add.text(
            centerX, centerY - 80,
            'EVENTO ALEATORIO',
            {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: '#e74c3c',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5).setDepth(102).setAlpha(0);

        // Nombre del evento
        const textoNombre = this.escena.add.text(
            centerX, centerY - 40,
            nombre,
            {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#ecf0f1',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5).setDepth(102).setAlpha(0);

        // Descripción
        const textoDescripcion = this.escena.add.text(
            centerX, centerY + 10,
            descripcion,
            {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: '#bdc3c7',
                align: 'center',
                wordWrap: { width: 350 }
            }
        ).setOrigin(0.5).setDepth(102).setAlpha(0);

        // Botón Aceptar
        const botonRect = this.escena.add.rectangle(
            centerX, centerY + 90,
            120, 40,
            0x27ae60
        ).setDepth(102).setInteractive({ useHandCursor: true }).setAlpha(0);

        const botonTexto = this.escena.add.text(
            centerX, centerY + 90,
            'ACEPTAR',
            {
                fontSize: '16px',
                fontFamily: 'Arial',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5).setDepth(103).setAlpha(0);

        // Animación fade in
        this.escena.tweens.add({
            targets: overlay,
            alpha: 0.7,
            duration: 300,
            ease: 'Power2'
        });

        this.escena.tweens.add({
            targets: panel,
            alpha: 1,
            scale: 1,
            duration: 400,
            ease: 'Back.easeOut',
            delay: 100
        });

        this.escena.tweens.add({
            targets: [titulo, textoNombre, textoDescripcion, botonRect, botonTexto],
            alpha: 1,
            duration: 400,
            ease: 'Power2',
            delay: 300
        });

        // Hover effect
        botonRect.on('pointerover', () => {
            botonRect.setFillStyle(0x2ecc71);
        });

        botonRect.on('pointerout', () => {
            botonRect.setFillStyle(0x27ae60);
        });

        botonRect.on('pointerdown', () => {
            this.ocultar();
        });

        // Guardar referencias para destruir después
        this.contenedor = {
            overlay,
            panel,
            titulo,
            textoNombre,
            textoDescripcion,
            botonRect,
            botonTexto
        };
    }

    ocultar() {
        if (!this.isVisible || !this.contenedor) return;

        // Guardar referencia local antes de que se vuelva null
        const elementos = this.contenedor;
        
        // Marcar como no visible inmediatamente para prevenir llamadas duplicadas
        this.isVisible = false;
        this.contenedor = null;

        // Animación fade out antes de destruir
        this.escena.tweens.add({
            targets: [
                elementos.titulo,
                elementos.textoNombre,
                elementos.textoDescripcion,
                elementos.botonRect,
                elementos.botonTexto
            ],
            alpha: 0,
            duration: 200,
            ease: 'Power2'
        });

        this.escena.tweens.add({
            targets: elementos.panel,
            alpha: 0,
            scale: 0.8,
            duration: 250,
            ease: 'Back.easeIn',
            delay: 100
        });

        this.escena.tweens.add({
            targets: elementos.overlay,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            delay: 150,
            onComplete: () => {
                // Usar la referencia local guardada
                Object.values(elementos).forEach(obj => {
                    if (obj && obj.destroy) obj.destroy();
                });
            }
        });
    }

    destruir() {
        if (this.contenedor) {
            this.ocultar();
        }
    }
}