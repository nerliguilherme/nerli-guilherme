# Reels UI motion: uma forma só (14 s, 1080x1920, 60 fps, loop)

Saída final: `videos/reels-ui-motion.mp4`. São 120 BPM, 7 compassos e 28 tempos, e acontece algo em cada tempo.

A forma passa por estes estados, sem cortes:
botão "Solicitar orçamento" → loader → check → dynamic island "Novo pedido" → pedido → player da fachada (play/pause, scrub dia→noite) → slider "Brilho do letreiro" (estica ao passar do máximo) → toggle "Modo noite" → abas Fachada/Placa NFC/Site → gráfico "Acessos ao site" → ⌘K digitando "placa" → toast "Orçamento enviado" → botão.

## Como funciona
- Todo o visual é calculado por `seek(t)` em `ui.html`. Não há transições CSS, timers nem estado guardado entre quadros.
- Molas:
  - Cada mola é a resposta ao degrau em forma fechada.
  - Um valor que muda de alvo várias vezes é a soma de uma mola por mudança (classe `Ch`).
  - O arraste (`drag`) usa a posição do cursor enquanto o botão está pressionado. Ao soltar, a mola parte do ponto onde o valor parou.
- O indicador das abas e a bolinha do toggle têm duas bordas, cada uma na sua mola. A borda da frente é mais rápida que a de trás, e por isso o elemento estica.
- O cursor segue um Hermite periódico com 14 s de período. O último quadro emenda no primeiro com a mesma posição e a mesma velocidade.

## Refazer
1. Prévia, um quadro por tempo:
   ```
   node shots.js beats 0.4,0.9,...
   ```
2. Subquadros a 240 fps (uns 6 min):
   ```
   node render.js 0 3359 sub
   ```
3. Sons de UI, sintetizados e posicionados pelo pico de cada som:
   ```
   python3 sfx.py
   ```
   - Mix da trilha: corte em `audio/start.txt` (tempo forte medido com `beat.py`).
   - Trilha a -19 LUFS e mix final a -14 LUFS.
4. Encode com motion blur (4 subquadros por quadro):
   ```
   ffmpeg -framerate 240 -i sub/%05d.png -i audio/trilha_ui.wav -filter_complex "[0:v]tmix=frames=4,select='eq(mod(n\,4)\,3)',setpts=N/60/TB,format=yuv420p[v]" -map "[v]" -map 1:a -r 60 -c:v libx264 -crf 17 -c:a aac -b:a 192k out.mp4
   ```

## Trilha
Gerada no ElevenLabs (eleven_music_v2_5), instrumental, 120,02 BPM medidos.
