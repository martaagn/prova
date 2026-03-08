let indiceAtt = 0;

const cards = document.querySelectorAll('.card');
const freccia_sx = document.getElementById('frecciaSx');
const freccia_dx = document.getElementById('frecciaDx');

function mostraCard(indice){
    cards.forEach(card => card.classList.remove('attiva'));

    cards[indice].classList.add('attiva');
}

freccia_dx.addEventListener('click', function() {
    indiceAtt = indiceAtt+1;
    
    if (indiceAtt >= cards.length) {
        indiceAtt = 0;
    }

    mostraCard(indiceAtt);
});

freccia_sx.addEventListener('click', function() {
    indiceAtt = indiceAtt-1;
    
    if (indiceAtt <0) {
        indiceAtt = cards.length -1;
    }

    mostraCard(indiceAtt);
});

