# Reels "Placa NFC: uma placa, tudo que seu cliente precisa" (27 s, 1080x1920, 60 fps)

Saída final: `videos/reels-placa-nfc-faz-tudo.mp4`, com marca d'água.

## Mecânica
A placa fica fixa e o celular encosta nela a cada fala. Cada toque abre uma tela e o cenário muda junto:

| Fala | Tela | Cenário |
|---|---|---|
| "abriu o cardápio" | cardápio | Restaurante |
| "o seu Pix" | chave Pix + "Copiar chave" | Caixa |
| "avaliação no Google" | estrelas | Balcão |
| "Wi-Fi, WhatsApp, site" | três telas | Recepção |
| "tudo numa placa só" | página com todos os botões | — |
| "Sem NFC? QR Code" | câmera lendo o QR | — |

Depois as placas personalizadas (catálogo, "Aproxime seu celular" e avaliação) abrem em leque, e o vídeo fecha com logo, @ e WhatsApp.

## O que o vídeo evita prometer
- **Pix:** a placa abre a chave para copiar, não paga sozinha.
- **Wi-Fi:** mostra a rede e a senha para copiar, sem dizer "conecta sozinho".

## Arquivos
- `img/placa_tudo.png`: arte nova "Aproxime seu celular", feita a partir da arte "Avalie nossa gráfica".
- Narração do Guilherme sem cortes; trilha de 120 BPM (ElevenLabs).

## Refazer
```
python3 -m http.server 8777
node render.js 0 3239 sub
ffmpeg -framerate 120 -i sub/%05d.png -i audio/trilha_tudo.wav -i ../o-que-trazer-fachada/img/marca-dagua.png -filter_complex "[0:v]tmix=frames=2,select='eq(mod(n\,2)\,1)',setpts=N/60/TB[b];[2:v]format=rgba,colorchannelmixer=aa=0.72[w];[b][w]overlay=56:262,format=yuv420p[v]" -map "[v]" -map 1:a -r 60 -c:v libx264 -crf 17 -c:a aac out.mp4
```

## Modelos de placa (v2)
A placa troca para o modelo de cada função (`img/m_*.jpg`, produtos da Ngraph):
- Pix → `m_pix_verde`
- Avaliação → `m_google_display`
- Wi-Fi → `m_wifi`
- WhatsApp → `m_whatsapp`
- Site / "tudo numa placa só" → `placa_tudo`

No leque final aparecem Avalie-nos, Instagram branca, "Aproxime seu celular", Pix e Instagram preta.
