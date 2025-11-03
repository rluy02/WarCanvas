//Imports
import Inicio from "./Inicio.js";
import Menu from "./Menu.js";
//Config
let config = {
  type: Phaser.CANVAS,
  canvas: document.getElementById('canvas-juego'),
  width: 1000,
  height: 600,
  scene: [Menu, Inicio],
};

// 2. Creación de la instancia del juego
let game = new Phaser.Game(config);
