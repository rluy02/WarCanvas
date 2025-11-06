# WAR CANVAS

<img width="559" height="556" alt="image" src="https://github.com/user-attachments/assets/90e52e44-664e-4b1b-82bc-37e1e41b9c08" />


---

**Equipo de desarrollo:**
- Ricardo Sebastian Luy Carapaica
- Samuel Manzaneque Rodríguez
- Diego Jimenez García
- Julia Vera Ruiz

***01/10/2025***

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


### 2.2 Personajes

Cada jugador cuenta con 24 personajes:

- 1 Comandante
- 3 Artillerías
- 6 Caballerías
- 14 Soldados

### 2.3 Moverse por el tablero:

Cada personaje puede moverse de manera diferente.

**Comandante:**

<img width="155" height="191" alt="Comandante" src="https://github.com/user-attachments/assets/478516f9-c2ce-49a0-82d8-ded300f96d3b" />

Puede moverse en cualquier dirección, tanto en horizontal y vertical como en diagonal.

**Artillería:**

<img width="153" height="191" alt="Artillería" src="https://github.com/user-attachments/assets/109c4e79-d633-4122-bf81-255855a0461c" />


La artillería no puede moverse desde que se coloca en el tablero, sin embargo puede atacar a cualquier casilla de la zona neutra y de la zona de su propio equipo, el ataque caerá aleatoriamente en una de las 5 casillas seleccionadas.

**Caballería:**

<img width="154" height="189" alt="Caballería" src="https://github.com/user-attachments/assets/dd2fcc4d-dc95-4307-87e6-0938279da282" />

Puede moverse en horizontal o vertical, no en diagonal. Es el único personaje que puede saltar por encima de otros personajes.

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
Una casilla con personaje: Los jugadores tendrán que usar el ataque (mecánica de dados)

### 2.5 Ataque

Para atacar el jugador tira dos dados, a los puntos del dado se le suma los puntos de cada pieza dependiendo si es ataque o defensa.
Cada personaje tiene un ataque y una defensa distinta. Solo se puede atacar a casillas adyacentes, excepto la artillería.

Si el jugador que ataca pierde, no pasa nada, en cambio si gana, muere la pieza del defensor. En caso de empate la defensa siempre gana.

| Fichas | Ataque | Defensa |
| --- | --- | --- |
| Comandante | +4 | +5 |
| Artillería | +3 | -1 |
| Caballería | +2 | 0 |
| Soldado | +1 | +1 |

## Combinar ataques

Los soldados al ser la pieza más débil tendrán la oportunidad de agruparse hasta con dos soldados más que se encuentren a la derecha e izquierda del soldado atacante, cada soldado extra sumará +1 a la tirada de ataque.

En este ejemplo los soldados se podrían combinar para atacar a la caballería enemiga.

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
|  | **SOLDADO** | **SOLDADO** | **SOLDADO** |  |
|  |  | **CABALLO** |  |  |
|  |  |  |  |  |

## 3 Dinámicas

### 3.1 Inicio del Juego (Colocar los Personajes):

Al comenzar el juego cada jugador coloca los personajes de forma estratégica en su terreno inicial, que son las primeras 3 filas de su lado.

### 3.2 Transcurso de la partida

En tu turno puedes mover hasta 3 piezas, primero siempre gastando todas las acciones de una pieza o descartando las acciones innecesarias antes de pasar a la siguiente.

### 3.3 Eventos Especiales

Durante la partida se incluirán eventos especiales que afecten a las diferentes piezas del juego. Estos eventos especiales tendrán minijuegos con físicas. Por ejemplo fenómenos meteorológicos como tormentas, inundaciones o niebla. Cada uno de los minijuegos estará relacionado con uno de los eventos y tendrán mecánicas y temáticas diferentes.

### 3.4 Fin del Juego

El juego finaliza cuando un jugador conquista el 80% del tablero o si se derrota al comandante del otro equipo.

## 4 Estética

<img width="575" height="395" alt="MapaBocetos" src="https://github.com/user-attachments/assets/54e04e47-298a-44f9-91e7-354b41555b5b" />


<img width="792" height="393" alt="PersonajesBocetos" src="https://github.com/user-attachments/assets/296d90f5-e117-4c72-b19b-abf4c03376df" />



- Respecto a la estética del juego se representa el mapa de un conflicto bélico. Un lado del territorio se representa como un mapa realista, mientras que el otro lado se representa como un mapa dibujado en un papel. Cada lado corresponde a un equipo. El bando dibujo tiene como comandante al búho del Drawful, mientras que el bando realista juega con piezas basadas en imágenes auténticas.
- La interfaz web fue diseñada y maquetada a partir de bocetos iniciales que guiaron la estructura visual del sitio (ver sección: Maquetación web). La paleta de colores seleccionada —verde, amarillo, beige y marrón— busca transmitir una estética bélica y militar, manteniendo coherencia con la temática del juego.

## 5 Implementación

### 5.1 Flujos de Input

![Uploading image.png…]()


Cuando el jugador seleccione una pieza con el click, la casilla contenedora se resalta en amarillo y se previsualiza la siguiente acción. Entre ellas: movimiento, finalizar turno y si se pudiese, ataque.
Tipo de previsualización.

- En el movimiento, se verán resaltadas las casillas adyacentes disponibles en verde transparente.
- En el ataque, se verán resaltadas las casillas en rojo.
- En finalizar movimiento, se dispone de un botón en la esquina inferior derecha del juego durante el turno del jugador.

### 5.2 Interfaz

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
- Respecto al Drawful, inspira la estética de los personajes del bando dibujo
