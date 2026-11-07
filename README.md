# Asydim - Digital Ecosystem

Bem-vindo ao repositório oficial do website corporativo da **Asydim**. Este projeto consiste numa plataforma web moderna, desenvolvida para apresentar as diversas áreas de negócio, serviços especializados e soluções (legacy) da empresa, com um forte foco numa experiência de utilizador (UX) *premium*, B2B e *mobile-friendly*.

## 🚀 Sobre o Projeto

O website da Asydim foi desenhado com uma estética "Tech/Command Center", utilizando componentes modernos como *bento-grids*, *mesh gradients*, gráficos dinâmicos e micro-interações de ponta. O objetivo é transmitir profissionalismo, inovação e confiança nos setores onde a empresa atua (Engenharia, Energia, Procurement, Sustentabilidade, Domótica e Soluções Tecnológicas como VetIA e MedReminder).

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica e boas práticas de SEO.
- **CSS3 (Vanilla)**: Variáveis globais para gestão de temas, *Flexbox*, *CSS Grid* e animações responsivas (*hover effects*, *glassmorphism*).
- **JavaScript (Vanilla)**: Lógica de interface, manipulação de DOM e interações avançadas e fluidas.
- **EmailJS**: Integração simples e direta para o envio automático de formulários de contacto (sem necessidade de backend próprio).

## 📁 Estrutura de Ficheiros

- `index.html` - Página principal (Homepage com Hero Section e resumo de secções).
- `styles.css` - Estilos globais e componentes UI de todo o projeto.
- `script.js` - Scripts de interatividade e lógica do formulário via EmailJS.
- **Páginas de Serviços**:
  - `servico-engenharia.html`
  - `servico-energia.html`
  - `servico-domotica.html`
  - `servico-especialidade.html`
- **Páginas de Soluções (Produtos)**:
  - `produto-vetia.html`
  - `produto-medreminder.html`
- **Páginas "Raízes"**:
  - `raiz-procurement.html`
  - `raiz-sustentabilidade.html`
  - `raiz-decisao.html`
- `images/` - Diretório que contém todas as imagens, ícones e *assets* visuais.

## 🔧 Como Executar Localmente

1. Clona este repositório para a tua máquina local:
   ```bash
   git clone <URL-DO-TEU-REPOSITORIO>.git
   ```
2. Navega até à pasta do projeto:
   ```bash
   cd asydim-site
   ```
3. Abre o ficheiro `index.html` diretamente num navegador ou utiliza um servidor de desenvolvimento local (por exemplo, a extensão **Live Server** no VS Code) para garantir o carregamento correto de todas as dependências relativas.

## 📬 Contactos e Integração
A área de submissão do formulário de contacto utiliza a API do [EmailJS](https://www.emailjs.com/). As credenciais de inicialização (Public Key, Service ID, Template ID) encontram-se documentadas e configuradas no ficheiro `script.js`.

---
*Desenvolvido para **Asydim**.*

## Atualização B2B, SEO e contactos (outubro de 2026)

- `enhancements.js` contém as traduções partilhadas, metadados PT/EN, o simulador de procurement, as descrições da galeria e os formulários contextuais. É carregado antes de `script.js`.
- Cada página tem título, descrição, Open Graph e canonical próprios. `sitemap.xml` usa os URLs `.html` realmente existentes e `robots.txt` aponta para o sitemap. Se o alojamento servir URLs sem extensão, definir primeiro os redirecionamentos e atualizar em conjunto canonicals e sitemap.
- O formulário apresenta os quatro pilares da empresa. Os CTAs das páginas de serviço continuam a enviar o assunto específico, como `procurement`, `esg`, `telecom` ou `vetia`. O simulador usa `index.html?assunto=procurement&fatura=5000#contacto` e aceita valores de fatura entre 500 e 50 000 EUR, em passos de 500. Não colocar dados pessoais nos URLs.
- O simulador aplica um cenário ilustrativo de 32%; não recebe cotações OMIE/MIBEL. O simulador fica numa secção própria, depois da abordagem de procurement. A galeria usa descrições curtas integradas na legenda de cada imagem, sem métricas não documentadas.

### Envio do formulário e anexos

O envio sem anexos mantém o EmailJS existente. O parâmetro `servico` da configuração anterior é mantido num campo oculto; o seletor principal usa `assunto`. O consentimento é obrigatório e a mensagem de sucesso só aparece após confirmação do serviço. Confirmar no painel EmailJS que o destinatário do template é `info@asydim.com`: o endereço do destinatário é configurado nesse serviço e não neste repositório.

O formulário está preparado para Netlify Forms, com `name="contacto"`, `netlify`, `data-netlify="true"`, honeypot e `enctype="multipart/form-data"`. Para receber ficheiros:

1. Publicar num projeto Netlify e ativar **Forms → Enable form detection**; voltar a publicar para detetar o formulário.
2. Configurar notificações e o tratamento seguro de ficheiros de faturas no painel Netlify; validar acessos, retenção e dados pessoais antes de aceitar anexos.
3. O site reconhece Netlify pelo cabeçalho `x-nf-request-id` e ativa automaticamente o envio multipart e o anexo opcional de procurement. Em proxies que ocultem o cabeçalho, preservar esse cabeçalho: é também usado para confirmar a entrega. Não marcar `data-backend="netlify"` num servidor estático comum.
4. Testar um envio com uma fatura fictícia. São aceites apenas PDF até 5 MB, com verificação de extensão, MIME e assinatura inicial. Fora de Netlify, o campo de anexo fica desativado e apresenta o email como alternativa; o pedido sem anexo continua a usar EmailJS.

Referência: https://docs.netlify.com/manage/forms/setup/

### Informação legal a validar antes de publicação

As páginas de privacidade e termos incluem a denominação e o contacto fornecidos, os tratamentos existentes no código, direitos dos titulares, armazenamento do idioma e as limitações dos simuladores. São textos base, que exigem validação pela empresa quanto a NIF/NIPC, sede e registo comercial, prestadores efetivamente contratados, transferências internacionais, prazos de conservação, regras de acesso a faturas e demais informação legal aplicável à atividade. Estes dados não foram inventados. A referência a normas/ferramentas não declara certificações ou parcerias.

Referência de direitos: https://www.cnpd.pt/cidadaos/direitos/

### Verificações locais

Executar `python tests/check_site.py` para verificar metadados, sitemap, links legais e contrato dos formulários/simulador. A atualização também foi exercitada num navegador Chromium com 13 páginas em PT/EN e larguras de 320, 375, 430, 768, 820, 1024 e 1440 px; o envio de EmailJS e Netlify foi validado com respostas simuladas, sem mensagens reais nem faturas de clientes.

## Hardening e publicação segura

A pasta de publicação é **`dist/`**. Nunca publicar a raiz do repositório: contém fontes de desenvolvimento, configuração, testes e dependências. O build deriva a lista explícita de páginas públicas de `sitemap.xml`, copia apenas recursos públicos permitidos e não gera source maps. Diretórios ocultos nas imagens, configurações, testes, pacotes e código das Edge Functions ficam fora de `dist`.

```powershell
npm ci
npm run build
python tests/check_site.py
npm run test:security
npm run preview
```

O preview em `http://127.0.0.1:4174/` aplica os headers e a seleção de ficheiros da produção para testes locais. Não representa um teste de TLS/HTTPS, de infraestrutura real ou da integração Netlify em produção. O envio real dos formulários requer o serviço configurado; os testes não enviam emails nem faturas reais.

### Ficheiros e fluxo

- `scripts/harden-source.mjs` remove comentários HTML/JS, metadados generator e chamadas de diagnóstico; move estilos inline para CSS, converte eventos inline em CSS/event listeners e atualiza os links com `noopener noreferrer`. Executar `npm run harden` depois de introduzir novo código inline. A transformação é idempotente e falha se encontrar handlers que não sabe migrar.
- `page-styles/`, `presentation.css` e `image-fallback.js` preservam os estilos e fallbacks existentes sem `unsafe-inline` ou `unsafe-eval`.
- As bibliotecas de EmailJS e dos efeitos gráficos ficam em `vendor/`, com versões fixadas por `package-lock.json`. Os avisos de licença obrigatórios são preservados em `vendor/LICENSES.txt`. Não são segredos nem notas internas.
- `scripts/build.mjs` gera `_headers` e `netlify.toml`. Alterar a configuração neste script, depois executar o build para manter os ficheiros sincronizados. O hash CSP autoriza apenas o JSON-LD estático da organização; JavaScript executável vem do próprio domínio. As exceções de rede são Google Fonts e a API de entrega EmailJS.
- `netlify.toml` define o build, publicação em `dist` e respostas 404 forçadas para caminhos sensíveis. Não há fallback de SPA: um source map inexistente devolve 404.
- `netlify/edge-functions/contact-guard.js` valida POSTs antes de os encaminhar para Netlify Forms: honeypot, origem quando fornecida, consentimento, campos permitidos sem duplicados, normalização de texto, limites de tamanho, assunto, fatura simulada e PDF até 5 MB com assinatura `%PDF-`. O corpo total tem um limite adicional. A Edge Function é executada no Netlify, nunca enviada ao browser. Os testes locais exercitam a função com um contexto simulado; a integração final deve ser validada num deploy Netlify com Forms ativado.
- A validação do navegador melhora a experiência, mas pode ser contornada. A proteção do lado do servidor exige a Edge Function no Netlify. A assinatura PDF não substitui um antivírus ou uma análise de conteúdo do documento.
- `robots.txt` não é um controlo de acesso. Mantém as páginas e recursos necessários à renderização indexáveis, desencorajando a visita a pastas internas. São o build e as regras HTTP que impedem a publicação desses ficheiros.
- `.well-known/security.txt` contém apenas `mailto:info@asydim.pt` e a expiração em 1 de outubro de 2027, conforme o pedido. Os contactos comerciais mantêm `info@asydim.com`. Renovar o ficheiro antes da expiração e garantir a receção de ambos os endereços.

### Limites do controlo no repositório

Os headers ficam ativos após publicar a configuração no Netlify. `HSTS` inclui subdomínios e o token `preload`: todos os subdomínios precisam de HTTPS válido antes da ativação; o token não inscreve automaticamente o domínio na lista de preload.

DNS, certificados públicos, IPs do CDN, o fornecedor de alojamento e o código enviado ao navegador continuam observáveis. Netlify não permite eliminar o seu header `Server` através de `_headers`. Minificação e remoção de comentários reduzem a informação desnecessária, mas não tornam JavaScript público num segredo.

As chaves públicas/identificadores EmailJS continuam necessários ao serviço. No painel EmailJS, limitar os domínios de origem autorizados e configurar as opções antiabuso disponíveis. Honeypots não substituem limites de pedidos e proteção anti-bot no alojamento; a inspeção e sanitização dos anexos precisam de serviços próprios quando exigidas.

Referências: [Headers Netlify](https://docs.netlify.com/manage/routing/headers/), [API de Edge Functions](https://docs.netlify.com/build/edge-functions/api/), [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP), [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116.html).

## Publicação em produção — 22 de outubro de 2026

- Site público: https://asydim.pt/ (projeto Netlify `asydim-pt`).
- Deploy publicado: `6ada4a1bc1f2cd295d97e1a3`.
- Detalhes: https://app.netlify.com/projects/asydim-pt/deploys/6ada4a1bc1f2cd295d97e1a3
- Deteção de Forms ativada; formulário `contacto` reconhecido. Notificações configuradas para `info@asydim.com`. Não foi enviado um pedido de teste válido nem verificada a entrega na caixa de correio.
- Verificados no domínio público: 13 páginas, CSP, HSTS `max-age=63072000; includeSubDomains; preload`, bloqueios 404 e rejeição de pedidos inválidos pela Edge Function. Troca PT/EN verificada em ecrã móvel.
- O diretório local está ligado ao projeto através de `.netlify/state.json`, excluído do Git e da pasta de publicação. As credenciais CLI ficam no armazenamento de autenticação do utilizador, fora do projeto.
