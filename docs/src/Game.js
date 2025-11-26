//Imports
import Inicio from "./Escenas/Inicio.js";
import Menu from "./Escenas/Menu.js";
import EscenaColocarPiezas from "./Escenas/EscenaColocarPiezas.js";
//Config
let config = {
  type: Phaser.CANVAS,
  canvas: document.getElementById('canvas-juego'),
  width: 1000,
  height: 600,
  scene: [Menu, Inicio, EscenaColocarPiezas],
};

// 2. Creación de la instancia del juego
let game = new Phaser.Game(config);
