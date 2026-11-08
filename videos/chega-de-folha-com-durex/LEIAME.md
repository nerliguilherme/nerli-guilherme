# Anúncio "Chega de folha com durex" (15 s, 1080x1920, 60 fps)

Saída final: `videos/reels-chega-de-folha-com-durex.mp4`, com marca d'água. Serve para anúncio pago e para post.

| Tempo | Cena |
|---|---|
| 0–2,5 s | Parede com folha A4 com durex "BANHEIRO" — "Colando folha com durex?" |
| 2,5–6,5 s | Na batida, uma linha azul varre e a folha vira placa em PS: banheiro → horário → proibido fumar |
| 6,5–11,7 s | Trabalhos reais, um por batida: sinalização Flash EV, display Novo Mercatto, placa de estacionamento Grupo Mateus, letreiro 3D Flash EV, placa com QR Code Flash EV |
| 11,7–15 s | Logo, @ngraph.pe, "Chama no WhatsApp", "Placas em PS · Acrílico · Sinalização · Letreiros" |

- A parede, as folhas e as três placas em PS são desenhadas em código, em `film.html`, sem imagem gerada, porque os créditos da ElevenLabs acabaram.
- Narração do Guilherme, cortada nas pausas e sem aceleração.
- Trilha de 120 BPM: as trocas caem nas batidas.

## Refazer
```
python3 -m http.server 8778
node render.js 0 1799 sub
ffmpeg -framerate 120 -i sub/%05d.png -i audio/trilha.wav -i ../o-que-trazer-fachada/img/marca-dagua.png -filter_complex "[0:v]tmix=frames=2,select='eq(mod(n\,2)\,1)',setpts=N/60/TB[b];[2:v]format=rgba,colorchannelmixer=aa=0.72[w];[b][w]overlay=56:262,format=yuv420p[v]" -map "[v]" -map 1:a -r 60 -c:v libx264 -crf 17 -c:a aac out.mp4
```
