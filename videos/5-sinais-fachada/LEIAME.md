# Reels "5 sinais de que sua fachada está afastando clientes" (51,5 s, 1080x1920, 60 fps)

Saída final: `videos/reels-5-sinais-fachada.mp4`. Faz parte da série explicativa, no mesmo visual do "O que trazer para pedir sua fachada", e já sai com a marca d'água.

## Narração
- Voz clonada do Guilherme, em `audio/narr.mp3`.
- A gravação entra **inteira, sem cortes e sem aceleração**, começando em 0,15 s.
- Cada palavra e cada cena estão presas ao tempo da palavra falada (Scribe → `words.js`).

## Estrutura (versão 2: problema → solução)
Em cada sinal, primeiro aparece uma **fachada feia fictícia** ("✗ Assim não"), depois um **trabalho real da Ngraph** ("✓ Feito pela Ngraph · cliente").

| Sinal | Problema (imagem gerada) | Solução (foto real) |
|---|---|---|
| 1 Apaga à noite | `img/p1_apagada.jpg`: "Bella Moda" no escuro | Weyne Modas |
| 2 Desbotada | `img/p2_desbotada.jpg`: "Sabor da Casa" | Pizzaria Cavalcanti's |
| 3 Não lê de longe | `img/p3_ilegivel.jpg`: ótica vista de longe | Frio Peças |
| 4 Informação demais | `img/p4_lotada.jpg`: "Mega Center" | Ridente |
| 5 Logo diferente | `img/p5_logo.jpg`: "Doce Mel" | O Rei da Pizza (arte = placa) |

- As imagens de problema foram geradas na ElevenLabs (Seedream 5 Pro). As lojas são fictícias.
- A narração recebeu uma pausa de 1,2 s depois de cada sinal, cortada no silêncio e **sem acelerar**, para a solução aparecer com calma.

## Refazer
```
python3 -m http.server 8775
node render.js 0 6179 sub
ffmpeg -framerate 120 -i sub/%05d.png -i audio/trilha_sinais.wav -i ../o-que-trazer-fachada/img/marca-dagua.png -filter_complex "[0:v]tmix=frames=2,select='eq(mod(n\,2)\,1)',setpts=N/60/TB[b];[2:v]format=rgba,colorchannelmixer=aa=0.72[w];[b][w]overlay=56:262,format=yuv420p[v]" -map "[v]" -map 1:a -r 60 -c:v libx264 -crf 17 -c:a aac out.mp4
```
