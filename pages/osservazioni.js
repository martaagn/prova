// MAPPA ///////////////////
var map = L.map('map').setView([41.91422000958595, 12.512914236630948], 12);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, 
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

////////////////////////////



// DATI ////////////////////
let tutteOss = [];

function recuperaDati() {

    console.log("Contatto iNat, leggo note");

    const rAPI = fetch("https://api.inaturalist.org/v1/observations?user_id=marta59293&iconic_taxa=Aves")
                    .then(response =>  response.json());
    const rNote = fetch("note.json")
                    .then(response => response.json());

    Promise.all([rAPI, rNote])
        .then( async ([datiAPI, datiNote]) => {
            
            const giaOss = new Set();

            datiAPI.results.forEach(oss => {
                const nomeComune = oss.species_guess || "Sconosciuto";

                if (!giaOss.has(nomeComune)){
                    giaOss.add(nomeComune);

                    const infoExtra = datiNote[nomeComune] || {};

                    tutteOss.push({
                        nomeScientifico: oss.taxon.name || "Specie sconosciuta",
                        nomeComune: nomeComune || "Specie sconosciuta",
                        
                        cooLon: oss.geojson.coordinates[0],
                        cooLat: oss.geojson.coordinates[1],
                        
                        data: oss.observed_on,
                        luogo: oss.place_guess || "Luogo sconosciuto",
                        foto: oss.observation_photos[0]?.photo.url.replace("square", "medium") || "../immagini/icone_marker_mappa/default.svg",
                        
                        note: infoExtra.note || "//",
                        habitat: infoExtra.habitat || "Altro",
                        alimentazione: infoExtra.alimentazione || "Altro",
                        ordine: infoExtra.ordine || "Altro"
                    });
                }
            });

            disegnaSezioni("ordine");

            aggiungiMarkerMappa();

        })
        .catch(errore => {
            console.error("Errore nel recupero dati: ", errore);
        });

}

function disegnaSezioni(criterio){
    const contenitoreCard = document.getElementById("wrapper-dinamico");
    if (!contenitoreCard) return;

    contenitoreCard.innerHTML = "";

    const gruppi = {};

    tutteOss.forEach(oss => {
        const valoreDelGruppo = oss[criterio];

        if (!gruppi[valoreDelGruppo]) {
            gruppi[valoreDelGruppo] = [];
        }

        gruppi[valoreDelGruppo].push(oss);
    });

    Object.keys(gruppi).forEach(nomeSezione => {

        let htmlSezione = `
            <div class="sezione-dinamica">
                <h3>${nomeSezione}</h3>
                <div class="contenitore-griglia">

        `;

        gruppi[nomeSezione].forEach(oss => {
            htmlSezione += creaCard(oss);
        });

        htmlSezione += `

                </div>
            </div>
        `;

        contenitoreCard.innerHTML += htmlSezione;
    });

    // attivaSlider();
}



// Creazione CARD //////////
function creaCard(oss) {

    /* return `
        <div class="card">
            <img src="${oss.foto}" title="${oss.nomeComune}" alt="${oss.nomeComune}" width="800" height="800">
            <div class="container-dati">
                <div class="container-nomi">
                    <h3>${oss.nomeScientifico}</h3>
                    <h5>${oss.nomeComune}</h5>
                </div>

                <div class="container-data-luogo">
                    <p class="data">${oss.data}</p>
                    <p class="luogo">${oss.luogo}</p>
                </div>
                
                <p class="note"><u style="font-family: sans-serif;">Note:</u> ${oss.note}</p>
            </div>
        </div>
    `; */

    return `
        <div class="card" onclick="toggleCard(this)">
        <img class="img-scheda" src="${oss.foto}" title="${oss.nomeComune}" alt="${oss.nomeComune}" width="192px" height="207px">
        <div class="container-dati">
            <div class="container-nomi">
                <h3>${oss.nomeScientifico}</h3>
                <h4>${oss.nomeComune}</h4>
            </div>
            <div class="info-extra">
                <div class="container-data-luogo">
                        <p class="data">${oss.data}</p>
                        <p class="luogo">${oss.luogo}</p>
                </div>
                <p class="note"><u style="font-family: sans-serif;">Note:</u> ${oss.note}</p>
            </div>
        </div>
    </div>
    `;
}

////////////////////////////

// TOGGLE CARD /////////////

function toggleCard(card){
    card.classList.toggle('aperta');
}

////////////////////////////

// Listener TAB/////////////
const bottoniTabs = document.querySelectorAll('.tab-btn');

bottoniTabs.forEach(btn => {
    btn.addEventListener('click', function() {
        bottoniTabs.forEach(b => b.classList.remove('active'));

        this.classList.add('active');

        const nuovoCriterio = this.getAttribute('data-criterio');

        disegnaSezioni(nuovoCriterio);
    });
});
////////////////////////////



// MAPPA ///////////////////
async function aggiungiMarkerMappa() {
    for (const oss of tutteOss) {
        const percorsoIcona = `../immagini/icone_marker_mappa/${oss.nomeComune.toLowerCase().replaceAll(" ", "_")}.webp`;
        let percorsoFinale;

        try {
            const response = await fetch(percorsoIcona, { method: 'HEAD' });
            percorsoFinale = response.ok ? percorsoIcona : "../immagini/icone_marker_mappa/default.svg";
        } catch (e) {
            percorsoFinale = "../immagini/icone_marker_mappa/default.svg";
        }

        var birdIcon = L.icon({
            iconUrl: percorsoFinale,
            iconSize: [70, 70],
            iconAnchor: [35, 35],
            popupAnchor: [0, -35],
            className: 'birdIcon'
        });

        L.marker([oss.cooLat, oss.cooLon], { icon: birdIcon })
            .addTo(map)
            .bindPopup(`<b>${oss.nomeComune}</b>`);
    }
}
////////////////////////////



// SLIDER //////////////////
function attivaSlider(){
    const sliders = document.querySelectorAll('.contenitore-slider');

    sliders.forEach(slider => {
        let indiceAtt = 0;

        const cards = slider.querySelectorAll('.card');
        const freccia_sx = slider.querySelector('.freccia-sx');
        const freccia_dx = slider.querySelector('.freccia-dx');
        const binario = slider.querySelector('.card-wrapper');

        if(cards.length <= 1) {
            if(freccia_sx) freccia_sx.style.display = 'none';
            if(freccia_dx) freccia_dx.style.display = 'none';
        }

        function aggiornaSlider(){
            if (cards.length === 0) return;

            const larghezzaCard = cards[0].offsetWidth;
            const gap = 10;
            const spostamento = -(indiceAtt * (larghezzaCard + gap));

            binario.style.transform = `translateX(${spostamento}px)`;

        }

        if (freccia_dx) {
            freccia_dx.addEventListener('click', function() {
                indiceAtt = indiceAtt + 1;
                
                if (indiceAtt >= cards.length) {
                    indiceAtt = 0;
                }
            
                aggiornaSlider();
            });
        }

        if (freccia_sx) {
            freccia_sx.addEventListener('click', function() {
                indiceAtt = indiceAtt-1;
                
                if (indiceAtt <0) {
                    indiceAtt = cards.length -1;
                }
            
                aggiornaSlider();
            });
        }

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

            binario.style.transition = 'none';
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

        binario.addEventListener('touchstart', inizioTrascina, {passive: true});
        binario.addEventListener('touchmove', duranteTrascina, {passive: true});
        binario.addEventListener('touchend', fineTrascina);
    });
}
////////////////////////////

recuperaDati();
