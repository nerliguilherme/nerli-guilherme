# Reels Placa NFC (clean, tipografia cinética) — 22 s, 1080x1920, 60 fps

Saída: `videos/reels-placa-nfc-clean.mp4`

- Tudo é calculado em `seek(t)`, sem timers. O easing é cubic-bezier(.65,0,.35,1) em tudo.
- Palavras entram uma a uma, com 80 ms de intervalo, fade e 20 px de subida.
- Uma única moldura (`#frame`) se transforma em sequência: círculo NFC → celular → pílula da promoção → placa → câmera → QR.
- O QR Code aponta para instagram.com/ngraph.pe. Os quadradinhos se convergem para formar o logo.
- `img/placa.png` é a placa recortada da foto enviada, com fundo transparente.
- Áudio:
  - Trilha de piano (ElevenLabs).
  - Sons sintetizados nos eventos que a própria página exporta (`ev.js` → `audio/ev.json` → `sfx_nfc.py`).

## Refazer
```
python3 -m http.server 8772
node render.js 0 2639 sub
ffmpeg -framerate 120 -i sub/%05d.png -i audio/trilha_nfc.wav -filter_complex "[0:v]tmix=frames=2,select='eq(mod(n\,2)\,1)',setpts=N/60/TB,format=yuv420p[v]" -map "[v]" -map 1:a -r 60 -c:v libx264 -crf 17 -c:a aac out.mp4
```
