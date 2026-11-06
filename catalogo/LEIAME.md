# Catálogo Ngraph (página + PDF)

- **`index.html`:** a página do catálogo, no mesmo visual da landing (Tailwind, Inter, cores da marca).
  - Funciona no celular.
  - Tem filtro por categoria e galeria de fotos.
  - Cada item tem um botão "Pedir orçamento" que abre o WhatsApp com a mensagem pronta.
- **`catalogo-ngraph.pdf`:** a mesma página em A4 (capa com QR Code + 2 páginas), para mandar no WhatsApp.
- **`img/`:** fotos reais dos trabalhos (tiradas do site), otimizadas.

## Publicar no site (Netlify)
1. Copie a pasta `catalogo/` inteira para a raiz do projeto do site (ao lado do `index.html` da landing).
2. Publique. O endereço fica **https://ngraph.com.br/catalogo/**, que é o link para gravar na placa NFC e no QR Code.
3. Sugestão: adicione um link "Catálogo" no menu da landing.

## Editar
- Produtos, textos e fotos ficam nas listas de `gerar.py`.
- Para regerar a página, rode `python3 gerar.py`.
- Para regerar o PDF:
  1. `python3 -m http.server 8790` (dentro desta pasta)
  2. `node pdf.js`
- Os itens de **Gráfica** ainda usam ícones. Quando tiver fotos, coloque em `img/` e troque o ícone por foto em `gerar.py`.
