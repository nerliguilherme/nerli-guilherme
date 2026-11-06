# Flyover da landing page para Reels (15 s, 1080x1920, 60 fps)

Saída final: `videos/ngraph-flyover-reels.mp4`

## O que mudou em relação ao vídeo anterior
- **Formato:** vertical 1080x1920 ocupando a tela inteira, sem faixas pretas, com fundo cinza-claro.
- **Nitidez:**
  - Zero desfoque de profundidade (DOF).
  - Motion blur leve: 2 subquadros dentro de meio quadro.
  - Profundidade só com perspectiva, sombra suave e fade nas bordas.
- **Render:** 3D em CSS (perspective + rotateX), não mais WebGL. Texto e fotos ficam nítidos.
- **Transição (9,5–11 s):** um zoom-pan contínuo (van Wijk) do contato até o hero de frente.
  - Inclinação de 50° → 0°.
  - Easing cubic-bezier(.65,0,.35,1).
  - Sem corte e sem quadro vazio.
- **Tela final:** título palavra a palavra, wipe dia→noite na foto do hero, CTA com pulso. A câmera faz um avanço lento e nunca para.

## Refazer
```
python3 -m http.server 8771
node shots.js prev 0,1.5,4,8,9.5,10.3,11,13,14.5
node render.js 0 1799 sub
ffmpeg -framerate 120 -i sub/%05d.png -i audio/trilha_fly.wav -filter_complex "[0:v]tmix=frames=2,select='eq(mod(n\,2)\,1)',setpts=N/60/TB,format=yuv420p[v]" -map "[v]" -map 1:a -r 60 -c:v libx264 -crf 17 -c:a aac -b:a 192k out.mp4
```

## Onde editar (`film.html`)
| O quê | Onde |
|---|---|
| Ritmo do voo | `FY` (posição da página por tempo) |
| Enquadramento | `FX` e `FS` |
| Transição | `wijk(..., rho=.85)`: rho menor = recua menos |
