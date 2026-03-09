import '../styles/BCIT_map.css';

function checkZoom() {
    const zoomLevel = window.devicePixelRatio;
    const infoCards = document.querySelectorAll('.info-card');

    // Using 1.1 or 1.2 is safer as some screens start slightly above 1.0
    if (zoomLevel >= 1.1) { 
        infoCards.forEach(card => {
            card.classList.remove('d-none');
            // Adding your fade animation here too!
            card.style.animation = "fadeIn 0.3s forwards"; 
        });
    } else {
        infoCards.forEach(card => {
            card.classList.add('d-none');
        });
    }
}

// This is the "secret sauce" - it watches specifically for zoom changes
const zoomMQ = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
zoomMQ.addEventListener('change', checkZoom);

// Keep the resize for safety
window.addEventListener('resize', checkZoom);

// Initial check
checkZoom();