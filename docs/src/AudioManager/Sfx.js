/**
 * Módulo de efectos de sonido (SFX) centralizado.
 * - Evita repetir this.sound.play(...) por todo el proyecto.
 * - Permite controlar cooldown anti-spam por key. (si se escala tambien el volumen o mute)
 *
 * Uso típico:
 *  1) En create() de cada escena: Sfx.bind(this)
 *  2) Para reproducir: Sfx.play('sfx_click') o Sfx.click()
 */
export const Sfx = (() => {
  /**
   * Escena de Phaser actualmente activa.
   * Se actualiza con bind(scene) en cada escena.
   * @type {Phaser.Scene|null}
   */
  let scene = null;

  /**
   * Volumen global para todos los efectos de sonido.
   * Rango [0..1]
   * @type {number}
   */
  let volume = 1;

  /**
   * Flag para mutear todos los efectos.
   * @type {boolean}
   */
  let muted = false;

  /**
   * Mapa de cooldowns por key (ms). Si una key tiene cooldown,
   * no se reproducirá más de una vez dentro de ese intervalo.
   * @type {Map<string, number>}
   */
  const cooldowns = new Map();

  /**
   * Guarda el último instante (performance.now()) en el que sonó cada key.
   * @type {Map<string, number>}
   */
  const lastPlay = new Map();

  /**
   * Vincula el módulo a una escena concreta.
   * Esto permite usar scene.sound.play(...) internamente.
   *
   * @param {Phaser.Scene} phaserScene - Escena activa.
   */
  const bind = (phaserScene) => {
    scene = phaserScene;
  };

  /**
   * Define un cooldown (anti-spam) para un sonido.
   * Ejemplo: clicks con 80ms para evitar doble click / spam.
   *
   * @param {string} key - Clave del audio cargado
   * @param {number} ms - Ms de cooldown.
   */
  const setCooldown = (key, ms) => {
    cooldowns.set(key, ms);
  };

  /**
   * Comprueba si se puede reproducir un sonido según su cooldown.
   * @param {string} key
   * @returns {boolean}
   */
  const canPlay = (key) => {
    const cd = cooldowns.get(key) ?? 0;
    if (cd <= 0) return true;

    const now = performance.now();
    const last = lastPlay.get(key) ?? -Infinity;

    if (now - last < cd) return false;

    lastPlay.set(key, now);
    return true;
  };

  /**
   * Reproduce un efecto de sonido por key usando el SoundManager de Phaser.
   *
   * @param {string} key - Clave del audio (debe estar cargado).
   * @param {Phaser.Types.Sound.SoundConfig} [config] - Config opcional (loop, rate, detune, volume...)
   */
  const play = (key, config = {}) => {
    if (!scene || muted) return;
    if (!canPlay(key)) return;

    // Phaser gestiona instancias internas; para SFX cortos, esto es suficiente.
    scene.sound.play(key, { volume, ...config });
  };

  /**
   * Helper para clicks de UI.
   * Mantiene tu código más legible.
   */
  const click = () => play('click');

  return { bind, setCooldown, play, click };
})();

//[Esquema básico pero escalable de lo que seria un modulo de AudioManager generado por Chatgpt]
//Motivos: Además de la centralización de la lógica, el codigo queda mas limpio en cada escena.
