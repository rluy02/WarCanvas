//Imports
import Inicio from "./Inicio.js";
import Menu from "./menu.js";
import SidePanel from "./SidePanel.js";
//Config
let config = {
  type: Phaser.CANVAS,
  canvas: document.getElementById('canvas-juego'),
  width: 1000,
  height: 600,
  scene: [Menu, Inicio, SidePanel],
};

// 2. Creación de la instancia del juego
let game = new Phaser.Game(config);