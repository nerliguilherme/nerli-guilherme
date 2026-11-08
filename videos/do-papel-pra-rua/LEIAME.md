# Reels "Do papel pra rua": O Rei da Pizza (20 s, 1080x1920, 60 fps)

Saída final: `videos/reels-do-papel-pra-rua.mp4`, com marca d'água.

## Ideia
A arte nasce num papel (traço a lápis → cor), sai do papel, voa e pousa **exatamente** sobre a placa instalada na foto real. Ali ela se dissolve, revelando a placa de verdade.

## Como o pouso é exato
- `H_logo.npy` é a homografia arte → foto, medida com SIFT na logo "oRei da Pizza".
- A cada quadro, `film.html` calcula a transformação 3D (matrix3d) que leva a arte dos cantos do papel até os cantos da placa na foto.
- Na arte, os contatos ficam à esquerda e a pizza à direita; na placa instalada é o inverso. Durante o voo os dois blocos trocam de lado (`img/tile_*.png`), e a arte chega com o layout da fachada.

## Narração
- Voz do Guilherme, sem aceleração.
- Cortada só nas pausas entre frases, para dar tempo ao voo e ao pouso.

## Refazer
```
python3 -m http.server 8776
node render.js 0 2399 sub
ffmpeg -framerate 120 -i sub/%05d.png -i audio/trilha_papel.wav -i ../o-que-trazer-fachada/img/marca-dagua.png -filter_complex "[0:v]tmix=frames=2,select='eq(mod(n\,2)\,1)',setpts=N/60/TB[b];[2:v]format=rgba,colorchannelmixer=aa=0.72[w];[b][w]overlay=56:262,format=yuv420p[v]" -map "[v]" -map 1:a -r 60 -c:v libx264 -crf 17 -c:a aac out.mp4
```
Para usar com outro cliente: troque `img/arte.jpg` e `img/real.jpg`, recalcule a homografia na logo e atualize `HL` e `PC` em `film.html`.
