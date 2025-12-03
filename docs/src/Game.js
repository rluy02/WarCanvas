//Imports
import Inicio from "./Escenas/Inicio.js";
import Menu from "./Escenas/Menu.js";
import EscenaColocarPiezas from "./Escenas/EscenaColocarPiezas.js";
import Minijuego from "./Escenas/Minijuego.js";
//Config
let config = {
  type: Phaser.CANVAS,
  canvas: document.getElementById('canvas-juego'),
  width: 1000,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      fps: 30,
      debug: true // true para ver info
    }
  },
  scene: [Menu, Inicio, EscenaColocarPiezas,Minijuego],
};

// 2. Creación de la instancia del juego
let game = new Phaser.Game(config);
