# Reels "5 sinais de que sua fachada está afastando clientes" (v3, 34,5 s, 1080x1920, 60 fps)

Saída final: `videos/reels-5-sinais-fachada.mp4`, com marca d'água.

## Regra de ouro
Nenhuma crítica aparece em cima de foto de cliente.

- **Problema:** foto **fictícia** gerada na ElevenLabs, com "✗ Assim não · exemplo fictício" e a legenda negativa.
- **Solução:** foto real do trabalho com um selo positivo. A legenda negativa sai antes.
- O desenho "SUA LOJA" aparece só na abertura.

| Sinal | Problema (fictício) | Selo da solução |
|---|---|---|
| 1 | `p1_apagada.jpg`: "Bella Moda" no escuro | ✓ Letreiro iluminado · Espelho Meu |
| 2 | `p2_desbotada.jpg`: "Sabor da Casa" | ✓ Cores vivas · D'Paleteiros |
| 3 | `p3_ilegivel.jpg`: ótica vista de longe | ✓ Leitura de longe · Grupo Fibernett |
| 4 | `p4_lotada.jpg`: "Mega Center" | ✓ Só o essencial · Blaser |
| 5 | `p5_logo.jpg`: "Doce Mel" Instagram ≠ fachada, com o "≠" vermelho | ✓ Mesma identidade · O Rei da Pizza |

## Ritmo
- Narração curta (voz do Guilherme), sem acelerar.
- Pausa de 0,9 s depois de cada sinal, cortada no silêncio. A solução fica na tela durante essa pausa e durante o número do sinal seguinte ("Dois:", "Três:"), que é neutro.
- O CTA começa em ~25 s.

## Sem tela vazia
- Todos os elementos entram enquanto o anterior sai (janelas de 0,35 s cruzadas).
- Checagem automática no render: nenhum quadro com o centro da tela vazio.

## Refazer
```
python3 -m http.server 8775
node render.js 0 4139 sub
ffmpeg -framerate 120 -i sub/%05d.png -i audio/trilha_sinais.wav -i ../o-que-trazer-fachada/img/marca-dagua.png -filter_complex "[0:v]tmix=frames=2,select='eq(mod(n\,2)\,1)',setpts=N/60/TB[b];[2:v]format=rgba,colorchannelmixer=aa=0.72[w];[b][w]overlay=56:262,format=yuv420p[v]" -map "[v]" -map 1:a -r 60 -c:v libx264 -crf 17 -c:a aac out.mp4
```
