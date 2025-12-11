// Para Acceder a los eventos sin usar strings
export const Eventos =  {
    PIECE_MOVED: "piece_moved",
    PIECE_SELECTED: "piece_selected",
    ENEMY_SELECTED: "enemy_selected",
    ATACK: "atack",
    PIECE_DEAD: "piece_dead",
    PIECE_ERASE: "piece_erase",
    PIECE_END_ACTIONS: "piece_end_actions", // Se llama cuando las accines de una pieza se han acabado, o se acaban manualmente
    START_NEW_MOVEMENT: "start_new_movement", // Se llama al empezar un nuevo movimiento con una 
    CHANGE_TURN: "change_turn",
    END_GAME: "end_game",
    CONQUER_CELL: "conquer_cell", // Se lanza cuando se conquista una celda y se captura en barraTerritorio para mostrar el porcentaje
    UPDATE_PERCENTAGES: "update_percentages", // Se lanza para actualizar los porcentajes de conquista en el panel lateral
    RANDOM_EVENT: "random_event", // Se lanza cuando se produce un evento aleatorio
    PIECE_POSITION: "piece_position",
    PIECE_DELETE: "piece_delete",
    CHANGE_TEAM_SET_PIECES: "change_team_set_pieces",
    ATTACK_CHEAT: 'attack_cheat',
    CLEAN_SIDE_PANEL: 'clean_side_panel'
}
