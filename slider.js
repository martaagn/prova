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

    let inizioX = 0;
    let trascinamentoAttivo = false;

    function prendiPosizioneX(event){
        if (event.type.includes('mouse')) {
            return event.pageX;
        }
        else {
            return event.touches.length > 0? event.touches[0].clientX : event.changedTouches[0].clientX
        }
    }

    function inizioTrascina(event){
        trascinamentoAttivo = true;
        inizioX = prendiPosizioneX(event);

        binario.style.trasition = 'none';
    }

    function duranteTrascina(event) {
        if (!trascinamentoAttivo) return;

        const posizioneAttuale = prendiPosizioneX(event);
        const differenza = posizioneAttuale - inizioX;

        const larghezzaCard = cards[0].offsetWidth;
        const spostamentoBase = -(indiceAtt * (larghezzaCard +10));

        const spostamentoCorrente = spostamentoBase + differenza;

        binario.style.transform = `translateX(${spostamentoCorrente}px)`;
    }

    function fineTrascina(event) {
        if (!trascinamentoAttivo) return;
        trascinamentoAttivo = false;

        binario.style.transition = "";

        const posizioneFinale = prendiPosizioneX(event);
        const spinta = posizioneFinale - inizioX;

        if (spinta < -50) {
            indiceAtt += 1;
            if (indiceAtt >= cards.length) indiceAtt = 0;
        }
        else if (spinta > 50) {
            indiceAtt -= 1;
            if (indiceAtt < 0) indiceAtt = cards.length -1;
        }

        aggiornaSlider();
    }

    binario.addEventListener('mousedown', inizioTrascina);
    binario.addEventListener('mousemove', duranteTrascina);
    binario.addEventListener('mouseup', fineTrascina);
    binario.addEventListener('mouseleave', fineTrascina);

    binario.addEventListener('touchstart', inizioTrascina);
    binario.addEventListener('touchmove', duranteTrascina);
    binario.addEventListener('touchend', fineTrascina);


});

