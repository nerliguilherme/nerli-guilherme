# Reels "Ainda dá tempo: sua marca pronta antes do Natal" (25,5 s, 1080x1920, 60 fps)

Saída final: `videos/reels-natal-sua-marca-pronta.mp4`. Já sai com a marca d'água @ngraph.pe.

## Roteiro (versão 2)
| Tempo | Cena |
|---|---|
| 0–2,6 s | Gancho: "Sua loja vai entrar em **dezembro** do mesmo jeito?" |
| 2,7–4 s | "Olha o que a gente fez:" |
| 4–8,5 s | Vitrine de 9 fotos, uma por batida e acelerando, com o serviço embaixo de cada uma |
| 8,5–14,1 s | Personalizados de **Natal**: enfeite de linha dourado + "Letreiros personalizados", "Peças em acrílico", "E muito mais" |
| 14,25–16,7 s | "Dezembro é o mês que mais **vende**." / "Sua marca precisa ser **vista**." |
| 16,75–20,5 s | Calendário de novembro com o dia 20 circulado: "Promoção até **20 de novembro**" / "Aproveita antes do **Natal**." |
| 20,6–25,5 s | Laço dourado, logo, @ngraph.pe, botão "Chama no WhatsApp" com pulso |

## Fotos da vitrine
`img/q1.jpg` … `img/q9.jpg` (918x940), em ordem: D'Paleteiros, Espelho Meu, Ana Silva, Fibernett, Amor Saúde, Ramyla Melo, Conecta Service Solar, Uninassau (placa), Uninassau (luminoso).

## Sincronia
- As fotos entram nas batidas (120 BPM): 4,0 · 4,75 · 5,5 · 6,0 · 6,5 · 7,0 · 7,5 · 8,0 · 8,25 s.
- A trilha foi estendida para 26 s repetindo os compassos 5 a 9, com a emenda no tempo forte.
- A narração (voz do Guilherme) foi cortada por frase **no meio dos silêncios medidos**, sem acelerar e sem cortar pausas. As frases ficam em sequência, sem buracos (`audio/seg3.json`).
- Os tempos de cada palavra vêm do Scribe e ficam em `words.js`.
- A legenda da vitrine fica em y=362, abaixo da marca d'água (y 262–314).

## Render
```
python3 -m http.server 8774
node render.js 0 3059 sub
ffmpeg -framerate 120 -i sub/%05d.png -i audio/trilha_natal3.wav -i ../o-que-trazer-fachada/img/marca-dagua.png -filter_complex "[0:v]select='eq(mod(n\,2)\,1)',setpts=N/60/TB[b];[2:v]format=rgba,colorchannelmixer=aa=0.72[w];[b][w]overlay=56:262,format=yuv420p[v]" -map "[v]" -map 1:a -r 60 -c:v libx264 -crf 17 -c:a aac out.mp4
```
