# Template Reels NGraph

- `engine.js`: motor do template (gancho no topo, legenda dinâmica com destaque azul, vinheta final da logo).
- `v1.html`: Reels da placa NFC. `v2.html`: Reels do site.
- Gancho e legendas ficam nas constantes `HOOKS` e `CAPS` de cada vídeo. Palavra entre `*asteriscos*` sai em azul.

## Gerar
```
node render.js "$PWD" v1.html frames1
python3 audio.py a1.wav 18.5 108 ev1.json
ffmpeg -framerate 30 -i frames1/%05d.png -i a1.wav -vf "vignette=PI/6,format=yuv420p" -c:v libx264 -crf 20 -c:a aac -shortest saida.mp4
```

## Narração (ElevenLabs, voz "Renan Matheus")
- `audio/narracao-*.mp3`: narrações. No fim de cada HTML, `CAPS_V` tem as legendas no tempo exato da fala e `MAP` liga o tempo do áudio ao da animação.
- Trilha: `MUSIC_GAIN=0.45 python3 audio.py b1.wav 22.5 108 v1_ev.json`, depois mixar com a voz (ffmpeg, sidechaincompress abaixa a trilha quando a voz entra).

## Pronúncia e mixagem
- No roteiro enviado à ElevenLabs, escreva **"Ngráfi"** para a voz pronunciar NGraph certo (a legenda continua "NGRAPH").
- `sync.py` gera legendas e sincronia a partir de `w1.json`/`w2.json` (tempos por palavra da transcrição).
- Mixagem: voz normalizada em -16 LUFS; trilha em -26 LUFS antes do ducking (fica ~20 dB abaixo da voz); saída final ~-14 LUFS.
