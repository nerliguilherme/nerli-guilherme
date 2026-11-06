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

## Estilo neon (v3.html) — placa NFC com a voz clonada "Guilherme"
- Fundo escuro, cards com borda neon empilhados, etiqueta "Vantagem N", vinheta com logo vetorial e @ngraph.pe.
- `sync3.py` lê `w3.json` (tempos por palavra) e gera `v3_sync.js` (âncoras das cenas, legendas e gancho).
- Trilha: ElevenLabs Music (videos/trilhas/trilha-neon-A.mp3), voz ~19 dB acima da trilha.
- `render_range.js` re-renderiza só um trecho de quadros (útil para ajustes rápidos).

## v4.html — versão 3D (40s, vertical)
- Cada quadro é função pura do número dele: `renderFrame(f)`, com `t = f/30`. Nada de relógio nem de `Math.random`; partículas usam `hash(i)`. O mesmo quadro sempre sai idêntico (testado por md5).
- 3D em CSS: placa e celulares com espessura (6 faces), carrossel 3D de botões, cartão que gira, piso em perspectiva, partículas em profundidade.
- Câmera virtual: quadros-chave (`CK`) suavizados, com leve tremida calculada por seno do número do quadro.
- Contorno que se transforma: superelipse (`shape`) com parâmetros em quadros-chave (`MKEYS`): círculo → placa → anel → cartão → moldura → selo do @.
- Tipografia cinética: letras em cascata com giro em X; palavras-chave com "soco" de escala; números vazados gigantes por cena.
- Logo para fundo escuro (`assets/ngraph_white.svg`): letras brancas e azul do "N" clareado para não sumir no fundo.
