document.addEventListener('DOMContentLoaded', () => {
    const containers = document.querySelectorAll('.card-container');
    // Función para voltear cartas
    containers.forEach(container => {
        container.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            if (card) {
                card.classList.toggle('flipped');
            }
        });
    });

    // Botones, enlaces y logo
    const logoHeader = document.querySelector('.logo-header');
    const btnInicio = document.getElementById('btn-inicio');
    const btnReglas = document.getElementById('btn-reglas');
    const btnCreditos = document.getElementById('btn-creditos');
    const btnJuego = document.getElementById('btn-jugar');

    // Secciones (objeto)
    const secciones = {
        inicio: document.getElementById('inicio'),
        reglas: document.getElementById('reglas'),
        creditos: document.getElementById('creditos'),
        juego: document.getElementById('juego')
    };

    // Función para mostrar una sección y ocultar todas las demás
    function mostrarSeccion(seccionMostrar) {
        for (const key in secciones) {
            if (secciones[key]) {
                secciones[key].style.display = (secciones[key] === seccionMostrar) ? 'block' : 'none';
            }
        }
    }

    // Eventos
    btnInicio.addEventListener('click', e => {
        e.preventDefault();
        mostrarSeccion(secciones.inicio);
    });

    logoHeader.addEventListener('click', e => {
        e.preventDefault();
        mostrarSeccion(secciones.inicio);
    });

    btnReglas.addEventListener('click', e => {
        e.preventDefault();
        mostrarSeccion(secciones.reglas);
    });

    btnCreditos.addEventListener('click', e => {
        e.preventDefault();
        mostrarSeccion(secciones.creditos);
    });

    btnJuego.addEventListener('click', e=> {
        e.preventDefault();
        mostrarSeccion(secciones.juego);
    });
});
