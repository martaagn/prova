const sliders = document.querySelectorAll('.contenitore-slider');

sliders.forEach(slider => {
    let indiceAtt = 0;

    const cards = slider.querySelectorAll('.card');
    const freccia_sx = slider.querySelector('.freccia-sx');
    const freccia_dx = slider.querySelector('.freccia-dx');
    const binario = slider.querySelector('.card-wrapper');

    function aggiornaSlider(){
        if (cards.length === 0) return;

        const larghezzaCard = cards[0].offsetWidth;
        const gap = 10;
        const spostamento = -(indiceAtt * (larghezzaCard + gap));

        binario.style.transform = `translateX(${spostamento}px)`;

    }

    freccia_dx.addEventListener('click', function() {
        indiceAtt = indiceAtt + 1;
        
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

});

