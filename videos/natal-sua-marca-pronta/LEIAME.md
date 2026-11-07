# Reels "Ainda dá tempo: sua marca pronta antes do Natal" (18 s, 1080x1920, 60 fps)

Saída final: `videos/reels-natal-sua-marca-pronta.mp4`. O vídeo já sai com a marca d'água @ngraph.pe.

## Fotos da vitrine
- Ficam em `img/p1.jpg` … `img/p7.jpg`, em 918x1060, recortadas com foco no letreiro.
- 1 a 3 são as reais pedidas: D'Paleteiros, Espelho Meu e Fibernett.
- **4 a 7 são substitutas provisórias**, porque as fotos enviadas não chegaram:

| Vaga | Pedida | Substituta |
|---|---|---|
| 4 | Ana Silva | Studio Espelho Meu |
| 5 | Amor Saúde | Blaser |
| 6 | Ramyla Melo | Revitafio |
| 7 | Uninassau | Assembleia de Deus |

- Para trocar: salve a foto nova no lugar de `img/pN.jpg` (918x1060) e re-renderize só os subquadros da vitrine, de 3,4 a 10,1 s (j = 408 a 1212).

## Sincronia
- As fotos entram nas batidas da trilha (120 BPM, corte em 0,475 s): 4,0 · 5,25 · 6,5 · 7,5 · 8,25 · 9,0 · 9,5 s.
- A narração (voz do Guilherme) foi cortada por frase e encaixada nas cenas (`audio/seg.json` + `place.py`).
- Os tempos de cada palavra vêm do Scribe e ficam em `words.js`.
- A trilha baixa sozinha quando a voz entra (sidechain). Na vitrine, onde não há voz, ela fica mais alta.

## Render
- Sem desfoque de movimento: usa 1 de cada 2 subquadros, porque as trocas rápidas de card geravam imagem dupla.
```
python3 -m http.server 8774
node render.js 0 2159 sub
ffmpeg -framerate 120 -i sub/%05d.png -i audio/trilha_natal.wav -filter_complex "[0:v]select='eq(mod(n\,2)\,1)',setpts=N/60/TB,format=yuv420p[v]" -map "[v]" -map 1:a -r 60 -c:v libx264 -crf 17 -c:a aac out.mp4
```
