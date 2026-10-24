# VI Studio

Aplicativo de lettering estilo GTA VI, com prévia em tempo real, fundos e exportação PNG.

## Abrir pela internet

https://felipefonseca25.github.io/vi-studio/

O aplicativo funciona diretamente no navegador, sem instalação ou mensalidade.

## Abrir no Windows

1. Baixe e extraia todos os arquivos.
2. Dê dois cliques em **Abrir VI Studio.vbs** para abrir em uma janela do Edge/Chrome.
3. Se scripts VBS estiverem desativados, use **Abrir VI Studio.cmd** e mantenha o terminal aberto.

Requer Node.js 20 ou superior e um navegador moderno. Não é necessário instalar dependências npm. A execução local funciona sem internet. Alternativa no terminal: `npm start`.

## Recursos

- Estilos Colorful, Mono, Overlay e 3D.
- Ajustes de composição, entrelaçamento e elementos de texto.
- 22 imagens de fundo e exportação com transparência.
- Download do resultado como PNG.
- Interface sem botão de feedback ou cartão de perfil.

## Estrutura e publicação

- `public/`: interface, renderizador, fontes e imagens.
- `server.mjs`: servidor local sem dependências, disponível somente em `127.0.0.1`.
- `scripts/build-pages.mjs`: gera a versão estática em `docs/`. Execute `npm run build:pages` depois de editar a interface.
- GitHub Pages publica a pasta `/docs` da branch `main`. A validação de texto funciona no navegador, sem backend.

Na execução local, o servidor encerra após aproximadamente 3 minutos sem receber sinal da página. A telemetria está desativada.

## Materiais e marcas

Fontes, imagens, marcas e artes permanecem com os respectivos titulares. Nenhuma licença geral é atribuída aos materiais de terceiros. Projeto de fã sem vínculo com Rockstar Games ou Take-Two Interactive.

