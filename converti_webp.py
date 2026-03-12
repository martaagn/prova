"""
Converte tutte le immagini del sito in formato WebP e aggiorna i riferimenti
negli HTML e CSS. Le immagini originali vengono mantenute in backup.

Dipendenze: pip install Pillow
"""

import os
import sys
import shutil
import subprocess
from pathlib import Path

# ── Configurazione ────────────────────────────────────────────────────────────

CARTELLA_PROGETTO = Path(__file__).parent          # root del sito
CARTELLA_BACKUP   = CARTELLA_PROGETTO / "immagini_backup"

# Risoluzione massima (larghezza x altezza). Le immagini più grandi vengono
# ridimensionate mantenendo le proporzioni; le più piccole restano invariate.
MAX_LARGHEZZA  = 1920
MAX_ALTEZZA    = 1080

# Qualità WebP (0-100). 80 offre un buon compromesso qualità/peso.
QUALITA_WEBP = 80

# Formati sorgente da convertire
FORMATI_SORGENTE = {".jpg", ".jpeg", ".png", ".gif", ".avif", ".bmp", ".tiff"}

# File HTML/CSS da aggiornare
ESTENSIONI_TESTO = {".html", ".css", ".js"}

# ── Installazione automatica di Pillow ────────────────────────────────────────

def assicura_pillow():
    try:
        from PIL import Image  # noqa: F401
    except ImportError:
        print("Pillow non trovato. Installazione in corso...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
        print("Pillow installato correttamente.\n")

# ── Logica principale ─────────────────────────────────────────────────────────

def converti_immagini():
    from PIL import Image

    # Raccoglie tutte le immagini da convertire (escludi già .webp)
    immagini = [
        p for p in CARTELLA_PROGETTO.rglob("*")
        if p.suffix.lower() in FORMATI_SORGENTE
        and CARTELLA_BACKUP not in p.parents
        and p.name != Path(__file__).name
    ]

    if not immagini:
        print("Nessuna immagine da convertire trovata.")
        return

    # Crea cartella di backup
    CARTELLA_BACKUP.mkdir(exist_ok=True)
    print(f"Backup originali in: {CARTELLA_BACKUP}\n")

    conversioni: list[tuple[Path, Path]] = []  # (originale, nuovo_webp)

    for img_path in immagini:
        dest_backup = CARTELLA_BACKUP / img_path.relative_to(CARTELLA_PROGETTO)
        dest_backup.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(img_path, dest_backup)

        webp_path = img_path.with_suffix(".webp")

        try:
            with Image.open(img_path) as img:
                # Converti in RGBA o RGB (WebP supporta entrambi)
                if img.mode in ("P", "LA"):
                    img = img.convert("RGBA")
                elif img.mode not in ("RGB", "RGBA"):
                    img = img.convert("RGB")

                # Ridimensiona se supera il limite
                w, h = img.size
                if w > MAX_LARGHEZZA or h > MAX_ALTEZZA:
                    img.thumbnail((MAX_LARGHEZZA, MAX_ALTEZZA), Image.LANCZOS)
                    nuove_dim = img.size
                    print(f"  Ridimensionato: {w}x{h} → {nuove_dim[0]}x{nuove_dim[1]}")

                img.save(webp_path, "WEBP", quality=QUALITA_WEBP, method=6)

            dim_orig = os.path.getsize(img_path)
            dim_webp = os.path.getsize(webp_path)
            risparmio = (1 - dim_webp / dim_orig) * 100 if dim_orig else 0

            print(
                f"[OK] {img_path.name} → {webp_path.name}  "
                f"({dim_orig // 1024} KB → {dim_webp // 1024} KB, "
                f"-{risparmio:.0f}%)"
            )
            conversioni.append((img_path, webp_path))

            # Rimuovi il file originale (esiste il backup)
            img_path.unlink()

        except Exception as e:
            print(f"[ERRORE] {img_path.name}: {e}")

    print(f"\nConvertite {len(conversioni)} immagini su {len(immagini)} trovate.")
    return conversioni


def aggiorna_riferimenti(conversioni: list[tuple[Path, Path]]):
    """Sostituisce i vecchi nomi file nei sorgenti HTML/CSS/JS."""
    if not conversioni:
        return

    file_testo = [
        p for p in CARTELLA_PROGETTO.rglob("*")
        if p.suffix.lower() in ESTENSIONI_TESTO
        and CARTELLA_BACKUP not in p.parents
    ]

    sostituzioni_totali = 0

    for file in file_testo:
        try:
            contenuto = file.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue

        contenuto_mod = contenuto
        for orig, webp in conversioni:
            # Sostituisce nome con estensione originale col nuovo .webp
            contenuto_mod = contenuto_mod.replace(orig.name, webp.name)

        if contenuto_mod != contenuto:
            file.write_text(contenuto_mod, encoding="utf-8")
            n = sum(
                contenuto.count(o.name) for o, _ in conversioni
            )
            print(f"  Aggiornato: {file.relative_to(CARTELLA_PROGETTO)} ({n} riferimenti)")
            sostituzioni_totali += n

    if sostituzioni_totali:
        print(f"\nAggiornati {sostituzioni_totali} riferimenti nei sorgenti.")
    else:
        print("\nNessun riferimento da aggiornare nei sorgenti.")


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    assicura_pillow()

    print("=" * 60)
    print("  Conversione immagini → WebP")
    print(f"  Risoluzione massima: {MAX_LARGHEZZA}x{MAX_ALTEZZA}")
    print(f"  Qualità WebP: {QUALITA_WEBP}/100")
    print("=" * 60 + "\n")

    conversioni = converti_immagini()

    if conversioni:
        print("\nAggiornamento riferimenti nei sorgenti...")
        aggiorna_riferimenti(conversioni)

    print("\nFatto! Gli originali sono conservati nella cartella 'immagini_backup'.")
