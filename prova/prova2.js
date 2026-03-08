let indiceAtt = 0;

const cards = document.querySelectorAll('.card');

const freccia_sx = document.getElementById('frecciaSx');
const freccia_dx = document.getElementById('frecciaDx');

const binario = document.getElementById('binario');

function aggiornaSlider(){
    const larghezzaCard = cards[0].offsetWidth;
    const gap = 10;
    const spostamento = -(indiceAtt*(larghezzaCard+gap));

    binario.style.transform = `translateX(${spostamento}px)`;
}

freccia_dx.addEventListener('click', function() {
    indiceAtt = indiceAtt+1;
    
    if (indiceAtt >= cards.length) {
        indiceAtt = 0;
    }

    aggiornaSlider();
});

freccia_sx.addEventListener('click', function() {
    indiceAtt = indiceAtt-1;
    
    if (indiceAtt <0) {
        indiceAtt = cards.length -1;
    }

    aggiornaSlider();
});

