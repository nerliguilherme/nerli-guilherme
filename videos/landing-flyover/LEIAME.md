# Voo 3D sobre a landing page (14,5 s, 1440x1152, 60 fps)

Saída final: `videos/ngraph-landing-flyover.mp4`. O motion blur usa 16 subquadros por quadro.

## Como refazer
1. **Captura** (só se o site mudar): `node capture.js . ngraph_sym.svg`
   - Gera `page_full.png`, `pieces/`, `layers.json` e `tile.png`.
   - O endereço fica escondido.
   - Depois, divida a página em `page_0.png` e `page_1.png` e crie `layers.js` com `window.LAYERS=` + o JSON.
2. **Servir a pasta**: `python3 -m http.server 8765`. O WebGL não aceita texturas abertas via `file://`.
3. **Prévia**: `node stills.js . 4 0,2,5,8,9.5,10.5,13 prev`
4. **Quadros finais**: `node frames.js 60 16 0 869 fin`
5. **Encode**:
   ```
   ffmpeg -framerate 60 -i fin/%05d.png -i trilha_lp.wav -vf format=yuv420p -c:v libx264 -crf 18 -preset slow -c:a aac -b:a 192k -shortest videos/ngraph-landing-flyover.mp4
   ```

## Determinismo
- Cada quadro é calculado só a partir do número dele: `renderFrame(f)`.
- Não usa relógio nem números aleatórios.

## Onde editar (`film.html`)
| O quê | Onde |
|---|---|
| Frase final | `LINE1` / `LINE2` |
| Câmera | `cam(t)` |
| Peças que levantam | `lift()` |
| Ladrilhos da logo | `tiles()` |
| Velocidade | `share(t)` |

## Trilha
- `track.py` escolhe o corte da trilha A (arquivo `cut.txt`).
- `sfxlp.py` gera os whooshes em 8,66 s e 9,80 s.

## Tempo de render
- Sem GPU (SwiftShader): cerca de 6 s por quadro, uns 80 min no total.
- Num PC com placa de vídeo leva poucos minutos.
