const themeBtn = document.getElementById("theme-btn");
const body = document.body;

let statoSalvato = localStorage.getItem("tema");

if (statoSalvato === "dark") {
    body.classList.add("dark-mode");
}

themeBtn.addEventListener('click', ()=>{
    body.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode")) {
        localStorage.setItem("tema", "dark");
    }
    else{
        localStorage.setItem("tema", "light");
    }

    cambiaSaluto();
});

const salutiLight = [ { verso: "cip cip", saluto: "(bye bye)"}, 
                      { verso: "quaa quaa", saluto: "(ciao ciao)"}, 
                      { verso: "cui cui", saluto: "(au revoir)"}, 
                      { verso: "quack quack", saluto: "(hi there!)"}, 
                      { verso: "chicchirichii", saluto: "(buon dì)"} ];
const salutiDark = [ { verso: "cuucucuu", saluto: "(adieu)"},
                     { verso: "chiuuu", saluto: "(sogni d'oro)"}, 
                     { verso: "pio pio", saluto: "(¡adios!)"}, 
                     { verso: "hoot hoot", saluto: "(see you soon)"} ];

function cambiaSaluto(){
    const paragrafi = document.querySelectorAll("footer h6");
    if (paragrafi.length === 0) return;

    const lista = ((document.body.classList.contains("dark-mode")) ? salutiDark : salutiLight);

    const indice = Math.floor(Math.random() * lista.length);
    const scelta = lista[indice];

    paragrafi[0].innerHTML = `${scelta.verso}<br>${scelta.saluto}`;
}

cambiaSaluto();