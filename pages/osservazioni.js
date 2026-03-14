// MAPPA ///////////////////

var map = L.map('map').setView([41.91422000958595, 12.512914236630948], 12);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, 
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

////////////////////////////



// DATI ////////////////////

function recuperaDati() {

    console.log("Contatto iNat");

    const rAPI = fetch("https://api.inaturalist.org/v1/observations?user_id=marta59293&iconic_taxa=Aves")
                    .then(response => {return response.json()});
    const rNote = fetch("note.json")
                    .then(response => response.json());

    Promise.all([rAPI, rNote])
        .then( async ([rAPI, rNote]) => {

            const datiSelezionati =  rAPI.results.map(oss => {
                const nome = oss.species_guess;
                return {
                    id: oss.id,

                    nomeScientifico: oss.taxon.name || "Specie sconosciuta",
                    nomeComune: nome || "Specie sconosciuta",
                    
                    cooLon: oss.geojson.coordinates[0],
                    cooLat: oss.geojson.coordinates[1],
                    
                    data: oss.observed_on,
                    luogo: oss.place_guess,
                    note: rNote[nome] || "//"
                };
            });

            const giaOss = new Set();
            
            const datiSelezionati_noRipe = datiSelezionati.filter(oss => {
                if (giaOss.has(oss.nomeComune)) return false;
                else {
                    giaOss.add(oss.nomeComune);
                    return true;
                }
            });

            for (const oss of datiSelezionati_noRipe) {
                const percorsoIcona = `../immagini/icone_marker_mappa/${oss.nomeComune.toLowerCase().replaceAll(" ", "_")}.webp`;
                let percorsoFinale;

                try{
                    const response = await fetch(percorsoIcona, { method: 'HEAD' });
                    percorsoFinale = response.ok ? percorsoIcona : "../immagini/icone_marker_mappa/default.svg";
                }
                catch (e) {
                    percorsoFinale = "../immagini/icone_marker_mappa/default.svg";
                }

                var birdIcon = L.icon({
                    iconUrl: percorsoFinale,

                    iconSize: [70,70],
                    iconAnchor: [35,35],
                    popupAnchor: [0, -35],
                    className: 'birdIcon'
                });

                L.marker([oss.cooLat, oss.cooLon], {icon : birdIcon})
                    .addTo(map)
                    .bindPopup(`<b>${oss.nomeComune}</b>`);
            };

        })
        .catch(errore => {
            console.error("Errore nel recupero dati: ", errore);
        });

}

recuperaDati()

////////////////////////////



// SLIDER //////////////////

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

////////////////////////////
