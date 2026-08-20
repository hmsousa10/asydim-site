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
