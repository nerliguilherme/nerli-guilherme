# Reels "O que trazer para pedir sua fachada" (40 s, 1080x1920, 60 fps)

Saída final: `videos/reels-o-que-trazer-fachada.mp4`

## Narração
- Voz clonada do Guilherme (ElevenLabs eleven_v4), em `audio/narr.mp3`.
- No vídeo, a narração está acelerada 6% e começa em 0,15 s.

## Sincronia
- O Scribe gerou o tempo de cada palavra (`audio/words.json` → `words.js`).
- Legendas, ícones e transições são posicionados a partir desses tempos, no objeto `M` de `film.html`.
- Se trocar a narração, basta gerar o `words.js` novo que tudo se ajusta sozinho.

## Visual
- A mesma moldura se transforma em sequência: relógio → fachada → câmera → foto → (logo) → mood board → fachada de novo.
- Easing cubic-bezier(.65,0,.35,1) em tudo.
- Contador de 1/5 a 5/5.
- Modo noite no item 5. É o único momento em que o fundo escurece, como pedido no roteiro.

## Áudio
- Trilha de piano (ElevenLabs) a -27 LUFS, que baixa sozinha quando a voz entra.
- Sons de UI sintetizados nos eventos da página (`ev.js` → `audio/ev.json` → `sfx_fach.py`).
- Mix final a -14 LUFS.

## Refazer
```
python3 -m http.server 8773
node render.js 0 4799 sub
ffmpeg -framerate 120 -i sub/%05d.png -i audio/trilha_fach.wav -filter_complex "[0:v]tmix=frames=2,select='eq(mod(n\,2)\,1)',setpts=N/60/TB,format=yuv420p[v]" -map "[v]" -map 1:a -r 60 -c:v libx264 -crf 17 -c:a aac out.mp4
```
