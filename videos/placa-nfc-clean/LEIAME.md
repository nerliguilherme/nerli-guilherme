# Reels Placa NFC (clean, tipografia cinética): duas versões, 22 s, 1080x1920, 60 fps

| Versão | Vídeo | Página |
|---|---|---|
| Avaliação no Google | `videos/reels-placa-nfc-google.mp4` | `film_google.html` |
| Catálogo | `videos/reels-placa-nfc-catalogo.mp4` | `film_catalogo.html` |

- `film.html` é o motor comum. `build.py` gera as duas versões trocando só o conteúdo: frases, telas do celular, placa, texto da pílula e o texto digitado no gancho.
- Placas:
  - `img/placa_google.png` é a arte enviada, recortada.
  - `img/placa_catalogo.png` é a mesma arte com o texto trocado para "Conheça nosso catálogo". Substitua pela arte oficial quando tiver.
- QR Code: aponta para https://ngraph.com.br. Para apontar para o link real de avaliação ou do catálogo, troque o texto em `qr_site.js`.
- Tudo é calculado em `seek(t)`. O easing é cubic-bezier(.65,0,.35,1) em tudo.
- Áudio: trilha de piano (ElevenLabs) + sons nos eventos que a página exporta (`ev.js` → `audio/ev_*.json` → `sfx_nfc.py`).

## Refazer
```
python3 build.py
python3 -m http.server 8772
FILM=film_google.html node render.js 0 2639 sub_google
ffmpeg -framerate 120 -i sub_google/%05d.png -i audio/trilha_google.wav -filter_complex "[0:v]tmix=frames=2,select='eq(mod(n\,2)\,1)',setpts=N/60/TB,format=yuv420p[v]" -map "[v]" -map 1:a -r 60 -c:v libx264 -crf 17 -c:a aac out.mp4
```

## Narração (voz clonada do Guilherme, ElevenLabs eleven_v4)
- `audio/narracao/g2.mp3` e `c2.mp3` são as gravações completas.
- `place.py` corta cada gravação por frase, usando as pausas medidas, e coloca cada frase no início da sua cena.
- Saídas: `voz_google.wav` e `voz_catalogo.wav`.
- Mix: voz a -16 LUFS. A trilha fica a -25 LUFS e baixa automaticamente quando a voz entra (sidechain). Os sons de UI ficam por baixo. Mix final a -14 LUFS.
