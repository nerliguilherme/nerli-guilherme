# Reels D'Paleteiros: jornada do cliente em UI motion (18 s, 1080x1920, 60 fps)

Saída final: `videos/reels-dpaleteiros-ui.mp4`

## Fotos
- **`prep1.py`**:
  - Desfoca os rostos nas duas fotos.
  - Corta a foto de dia em y=1320, deixando a placa da moto de fora.
  - Alinha a foto de noite à de dia com uma homografia SIFT calculada na fachada.
- **`prep2.py`**:
  - Separa as linhas de LED verde e as letras do letreiro na foto de noite.
  - Gera a versão "apagada" (`*_off`), a acesa (`*_on`), o mapa de atraso de acendimento (`*_map`) e o bloom.
  - O navegador combina tudo por pixel: com o brilho em 100% o resultado é exatamente a foto de noite.

## Render
```
python3 -m http.server 8770     # dentro de web/ (canvas precisa de http)
node shots.js prev 0,1,2.05,...  # prévia
node render.js 0 4319 sub        # 4 subquadros por quadro (240/s)
ffmpeg -framerate 240 -i sub/%05d.png -i audio/trilha_dp.wav -filter_complex "[0:v]tmix=frames=4,select='eq(mod(n\,4)\,3)',setpts=N/60/TB,format=yuv420p[v]" -map "[v]" -map 1:a -r 60 -c:v libx264 -crf 17 -c:a aac -b:a 192k out.mp4
```

## Determinismo e movimento
- Tudo é calculado em `seek(t)`, sem transições CSS e sem timers.
- Movimento com molas em forma fechada.
- O toggle e o indicador do seletor têm as duas bordas em molas diferentes.
- O brilho é manipulação direta pelo dedo.

## Trilha
- Base: trilha ElevenLabs de 120 BPM, compassos 1 a 7 + compassos 5 a 7 de novo, com a emenda no tempo forte.
- O volume cai a partir de 15,5 s.
- Sons de UI sintetizados (`sfx_dp.py`), cada um posicionado pelo seu pico.
