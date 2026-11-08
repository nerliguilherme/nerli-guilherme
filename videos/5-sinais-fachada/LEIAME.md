# Reels "5 sinais de que sua fachada está afastando clientes" (45,5 s, 1080x1920, 60 fps)

Saída final: `videos/reels-5-sinais-fachada.mp4`. Faz parte da série explicativa, no mesmo visual do "O que trazer para pedir sua fachada", e já sai com a marca d'água.

## Narração
- Voz clonada do Guilherme, em `audio/narr.mp3`.
- A gravação entra **inteira, sem cortes e sem aceleração**, começando em 0,15 s.
- Cada palavra e cada cena estão presas ao tempo da palavra falada (Scribe → `words.js`).

## Estrutura
| Parte | Problema (desenho de linha) | Solução (foto real) |
|---|---|---|
| Gancho | Fachada; boneco passa e não entra; "5" vira o contador | — |
| 1 | Letreiro apagado: o fundo escurece e a loja some | Weyne Modas |
| 2 | Cor desbotada e peça soltando | Pizzaria Cavalcanti's |
| 3 | "SUA LOJA" fino somindo de longe, depois versão legível | Frio Peças |
| 4 | Placa lotada, um carro passa e sobra só o nome | Ridente |
| 5 | Perfil do Instagram ≠ logo da fachada | O Rei da Pizza: arte = placa |
| CTA | Checklist → "Manda uma foto" (DM e Frio Peças instalando → prontas) → logo, @, botão | — |

Os problemas ficam só em desenho, para nenhum cliente aparecer como exemplo ruim.

## Refazer
```
python3 -m http.server 8775
node render.js 0 5459 sub
ffmpeg -framerate 120 -i sub/%05d.png -i audio/trilha_sinais.wav -i ../o-que-trazer-fachada/img/marca-dagua.png -filter_complex "[0:v]tmix=frames=2,select='eq(mod(n\,2)\,1)',setpts=N/60/TB[b];[2:v]format=rgba,colorchannelmixer=aa=0.72[w];[b][w]overlay=56:262,format=yuv420p[v]" -map "[v]" -map 1:a -r 60 -c:v libx264 -crf 17 -c:a aac out.mp4
```
