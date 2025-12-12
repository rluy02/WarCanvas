# WAR CANVAS

<img width="559" height="556" alt="image" src="https://github.com/user-attachments/assets/90e52e44-664e-4b1b-82bc-37e1e41b9c08" />


---

**Equipo de desarrollo:**
- Ricardo Sebastian Luy Carapaica
- Samuel Manzaneque Rodríguez
- Diego Jimenez García
- Julia Vera Ruiz

***12/12/2025 - Hito 2***

## 1 Resumen

### 1.1 Objetivo

El objetivo del juego es obtener la victoria conquistando al menos el 80% del tablero o eliminando al comandante enemigo. Para lograrlo, deberás usar estratégicamente tus piezas, cada una con habilidades y movimientos únicos.

### 1.2 Resumen

En este juego te conviertes en el búho de drawful, liderando un ejército en una batalla táctica contra un comandante rival. A medida que avanzas por el tablero, conquistarás territorio, desplegarás unidades y tomarás decisiones clave para superar a tu enemigo y hacerte con la frontera.

---

## 2 Mecánicas

### 2.1 Tablero

El tablero de juego tiene un tamaño de 8x10 casillas. Al comenzar el juego el tablero se divide en tres, terreno del equipo A, terreno del equipo B y terreno neutro.

<img width="309" height="378" alt="Tablero" src="https://github.com/user-attachments/assets/217fea9c-d54c-4dad-947d-f45953e022bd" />


### 2.2 Piezas

Cada jugador cuenta con 24 piezas:

- 1 Comandante
- 1 Artillerías
- 6 Caballerías
- 16 Soldados

### 2.3 Moverse por el tablero:

Cada pieza puede moverse de manera diferente.

**Comandante:**

<img width="155" height="191" alt="Comandante" src="https://github.com/user-attachments/assets/478516f9-c2ce-49a0-82d8-ded300f96d3b" />

Puede moverse en cualquier dirección, tanto en horizontal y vertical como en diagonal.

**Artillería:**

<img width="153" height="191" alt="Artillería" src="https://github.com/user-attachments/assets/109c4e79-d633-4122-bf81-255855a0461c" />


La artillería no puede moverse desde que se coloca en el tablero, sin embargo puede atacar a cualquier casilla en un rango de alcance de 4 columnas. Solamente se puede posicionar en la zona inicial, su alcance máximo nunca sobrepasa de la zona neutra.

**Caballería:**

<img width="154" height="189" alt="Caballería" src="https://github.com/user-attachments/assets/dd2fcc4d-dc95-4307-87e6-0938279da282" />

Puede moverse en horizontal o vertical, no en diagonal. Es la única pieza que puede saltar por encima de otras piezas.

Soldados:

<img width="153" height="192" alt="Soldado" src="https://github.com/user-attachments/assets/78b192b7-715d-4791-a6b0-ed8c5b914df4" />


Puede moverse en horizontal o en vertical.

**Contador de Acciones**
Cada pieza tiene un número de acciones máximas que puede hacer en su turno. Ya sea moverse y atacar o solo moverse. (No se puede atacar varias veces con una misma pieza).

| Fichas | Contador de Acciones |
| --- | --- |
| Comandante | 4 |
| Artillería | 1 |
| Caballería | 3 |
| Soldado | 2 |

**Comandante**: Puede moverse hasta tres casillas y atacar / Moverse cuatro posiciones
**Artillería**: La artillería no puede moverse, por lo que solo puede atacar
**Caballería**: Puede moverse dos casillas y atacar / Moverse tres posiciones
**Soldado**: Puede moverse una casilla y atacar / Moverse dos posiciones

## 2.4 Conquistar casillas:

Una casilla vacía: Automáticamente la conquistas al posicionarse sobre ella
Una casilla con pieza: Los jugadores tendrán que usar el ataque (mecánica de dados)

### 2.5 Ataque

Para atacar el jugador tira dos dados, a los puntos del dado se le suma los puntos de cada pieza dependiendo si es ataque o defensa.
Cada pieza tiene un ataque y una defensa distinta. Solo se puede atacar a casillas adyacentes, excepto la artillería.

Si el jugador que ataca pierde, no pasa nada, en cambio si gana, muere la pieza del defensor. En caso de empate la defensa siempre gana.

| Fichas | Ataque | Defensa |
| --- | --- | --- |
| Comandante | +4 | +5 |
| Artillería | NO | -1 |
| Caballería | +2 | 0 |
| Soldado | +1 | +1 |

## Ataque de la Artillería

La artillería tiene un ataque distinto a las demás piezas, ya que no se realiza un combate por dados. Para atacar, se selecciona la casilla objetivo y, al hacer clic, el proyectil puede impactar en dicha casilla o en una de las casillas adyacentes en forma de cruz. Cada casilla tiene un 20% de probabilidad de recibir el impacto.

Si en la casilla donde cae el proyectil hay una pieza, esta muere de manera inmediata, sin importar si es aliada o enemiga.

Después de realizar un ataque, deben transcurrir 4 turnos propios antes de que la artillería pueda volver a utilizarse.

## Combinar ataques

Los soldados al ser la pieza más débil tendrán la oportunidad de agruparse hasta con dos soldados aliados que estén justo a su lado, formando una línea recta horizontal o vertical.
Se puede sumar como máximo 1 soldado por cada lado del atacante (izquierda y derecha, o arriba y abajo). Cada soldado extra sumará +1 a la tirada de ataque. Siendo 3 la puntuación máxima. 

En este ejemplo los soldados se podrían combinar para atacar a la caballería enemiga.

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  | **SOLDADO** | **SOLDADO** | **SOLDADO** |  |
|  |  | **CABALLO** |  |  |
|  |  |  |  |  |

## 3 Dinámicas

### 3.1 Inicio del Juego (Colocar las Piezas):

Al comenzar el juego cada jugador coloca las piezas de forma estratégica en su terreno inicial, que son las primeras 3 filas de su lado.

### 3.2 Transcurso de la partida

En tu turno puedes mover hasta 3 piezas, primero siempre gastando todas las acciones de una pieza o descartando las acciones innecesarias antes de pasar a la siguiente.

### 3.3 Eventos Aleatorios

Durante la partida se incluirán eventos aleatorios que afecten a las diferentes piezas del juego. Algunos de estos eventos son:  tormentas, inundaciones y un minijuego. Cada uno de los eventos estará relacionado con formas de afectar el tablero y tendrán diferentes efectos a la partida.

<u> Eventos Aleatorios: </u>
- Terremoto: Un terremoto arrasa el terreno de juego, y se bloquean las piezas que están sobre las zonas afectadas durante un turno.
    - Casillas afectadas: las casillas afectadas son aleatorias, cada casilla tiene un 25% de probabilidad de ser afectada. Y aproximadamente 8 casillas son afectadas por cada terremoto (varía en cada terremoto).
  
- Lluvia: La lluvia afecta a un porcentaje de las casillas conquistadas y las convierte en zona neutra.
    -Casillas afectadas: La lluvia afecta a las casillas conquistadas y sin pieza, las casillas que cumplen estas condiciones tienen un 15% de probabilidad de ser afectadas por la lluvia. Es decir un 15% del tablero conquistado vuelve a su estado neutral si ocurre este evento.
  
- Minijuego (con físicas): El jugador se convierte en Drawfull y ha de defender su retaguardia bloqueando la máxima cantidad de granadas posibles durante 20 segundos. Si Drawfull pierde 3 vidas o consigue mantenerse en pie durante el tiempo restante acaba el minijuego.
    - En caso de victoria: El evento de terremoto o lluvia solo le afecta al equipo realista y zonas neutras.
    - En caso de derrota: El evento de terremoto o lluvia solo le afecta al equipo dibujado y zonas neutras. 

Probabilidades de cada evento: 
En cada turno hay un 20% de probabilidad de que ocurra el minijuego para decidir el evento aleatorio. Cuando hay un evento:
- Probabilidad de que sea lluvia = 10%.
- Probabilidad de que sea terremoto = 25%.


### 3.4 Fin del Juego

El juego finaliza cuando un jugador conquista el 80% del tablero o si alguno de los 2 comandantes cae en batalla.

## 4 Estética

<img width="575" height="395" alt="MapaBocetos" src="https://github.com/user-attachments/assets/54e04e47-298a-44f9-91e7-354b41555b5b" />


<img width="575" height="575" alt="equipo dibujado" src="https://github.com/user-attachments/assets/7d9575dd-83dc-490a-8257-52e4641749aa" />

<img width="575" height="575" alt="equipo realista" src="https://github.com/user-attachments/assets/a0b2a356-affc-4bca-b071-030e4c96a325" />



- Respecto a la estética del juego se representa el mapa de un conflicto bélico. Un lado del territorio se representa como un mapa realista, mientras que el otro lado se representa como un mapa dibujado en un papel. Cada lado corresponde a un equipo. El bando dibujo tiene como comandante al búho del Drawful, mientras que el bando realista juega con piezas basadas en imágenes auténticas.
- La interfaz web fue diseñada y maquetada a partir de bocetos iniciales que guiaron la estructura visual del sitio (ver sección: Maquetación web). La paleta de colores seleccionada —verde, amarillo, beige y marrón— busca transmitir una estética bélica y militar, manteniendo coherencia con la temática del juego.

## 5 Implementación

### 5.1 Flujos de Input

Cuando el jugador seleccione una pieza con el click, la casilla contenedora se resalta en amarillo y se previsualiza la siguiente acción. Entre ellas: movimiento, finalizar turno y si se pudiese, ataque.
Tipo de previsualización.

- En el movimiento, se verán resaltadas las casillas adyacentes disponibles en verde transparente.
- En el ataque, se verán resaltadas las casillas en rojo.
- En finalizar movimiento, se dispone de un botón en la esquina inferior derecha del juego durante el turno del jugador.

### 5.2 Interfaz

#### Escena Principal

La interfaz de la pantalla principal se compone del tablero, el panel lateral, el panel de información, el panel de turnos y los avisos.

- *Panel Lateral:* Controla los enfrentamientos. Se utiliza para confirmar los ataques y mostrar los resultados de los combates.
- *Panel de Información:* Un panel que se despliega, sirve de acceso rápido a los bonus de cada pieza (botón situado en el panel lateral).
- *Panel de turnos:* Controla los turnos y el terreno conquistado. Se muestra el turno actual y el porcentaje de terreno conquistado por cada equipo.
- *Panel de avisos:* Un panel (tipo Pop-up) que se muestra cuando ocurre un evento aleatorio, se accede al tutorial o se finaliza partida y su respectiva descripción.

## 6 Referencias

### 6.1 Stratego

Stratego® Online

### 6.2 Ajedrez

[Chess.com](http://chess.com/)

### 6.3 Risk

Risk: Global Domination

### 6.4 Drawful

Drawful | Jackbox Games

El diseño de WarCanvas ha sido influenciado por los títulos previamente mencionados en aspectos generales como la dinámica, el balance y las mecánicas con componente estratégico.

Profundizando a más detalle con ejemplos concretos:

- Respecto al Stratego y al Ajedrez, el diseño del tablero, piezas con diferentes movimientos y diferentes rangos.
- Respecto al Risk, la mecánica de ataque con dados.
- Respecto al Drawful, inspiración para la estética de las piezas del equipo dibujo

