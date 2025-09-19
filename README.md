# ImobiGest - Painel de Gestão Imobiliária

Este repositório contém o código-fonte do ImobiGest, um painel de gestão imobiliária desenvolvido com React e Vite.

## Funcionalidades Principais

- Dashboard principal com métricas e estatísticas
- Gestão de imóveis e propriedades
- Sistema de visitas e agendamentos
- Gestão de contratos de aluguel
- Relatórios e análises
- Portal público para sincronização
- Sistema de manutenções e vistorias
- Integração com IA para análises automatizadas

## Tecnologias Utilizadas

- **Frontend**: React 18 + Vite
- **UI Framework**: Tailwind CSS + Radix UI
- **Ícones**: Lucide React
- **Gráficos**: Recharts
- **Formulários**: React Hook Form + Zod
- **Roteamento**: React Router DOM


## Como Executar o Projeto

Para executar o projeto localmente, siga estas etapas:

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/dhsolucoesdigital001/imobigest.git
   cd imobigest
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

   A aplicação estará disponível em `http://localhost:5173` (ou outra porta, se a 5173 estiver em uso).




## Build para Produção

Para gerar os arquivos otimizados para produção, execute:

```bash
npm run build
```

Os arquivos de produção serão gerados na pasta `dist/`.

## Deploy em Servidor Web (Ex: Hostinger)

Para fazer o deploy em um servidor web como a Hostinger, siga estes passos:

1. **Gere o build de produção:**
   Execute `npm run build` para criar a pasta `dist/` com os arquivos otimizados.

2. **Acesse o Gerenciador de Arquivos:**
   Faça login no seu painel de controle da Hostinger (hPanel) e navegue até o "Gerenciador de Arquivos".

3. **Navegue até a pasta `public_html`:**
   Esta é a pasta raiz do seu domínio (ex: `imobiliariaa.techatende.com.br`).

4. **Faça o upload dos arquivos:**
   Copie todo o conteúdo da pasta `dist/` (incluindo `index.html`, `assets/` e o arquivo `.htaccess` que foi fornecido separadamente) para a pasta `public_html` do seu domínio.

5. **Verifique o `.htaccess`:**
   Certifique-se de que o arquivo `.htaccess` esteja presente na raiz da `public_html` e contenha as configurações para roteamento de SPA e cache. Se você não o tiver, pode criá-lo com o seguinte conteúdo:

   ```apache
   Options -MultiViews
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteRule ^ index.html [QSA,L]

   # Configurações de cache para assets
   <IfModule mod_expires.c>
       ExpiresActive on
       ExpiresByType text/css "access plus 1 year"
       ExpiresByType application/javascript "access plus 1 year"
       ExpiresByType image/png "access plus 1 year"
       ExpiresByType image/jpg "access plus 1 year"
       ExpiresByType image/jpeg "access plus 1 year"
       ExpiresByType image/gif "access plus 1 year"
       ExpiresByType image/svg+xml "access plus 1 year"
   </IfModule>

   # Compressão GZIP
   <IfModule mod_deflate.c>
       AddOutputFilterByType DEFLATE text/plain
       AddOutputFilterByType DEFLATE text/html
       AddOutputFilterByType DEFLATE text/xml
       AddOutputFilterByType DEFLATE text/css
       AddOutputFilterByType DEFLATE application/xml
       AddOutputFilterByType DEFLATE application/xhtml+xml
       AddOutputFilterByType DEFLATE application/rss+xml
       AddOutputFilterByType DEFLATE application/javascript
       AddOutputFilterByType DEFLATE application/x-javascript
   </IfModule>

   # Configurações de segurança
   <IfModule mod_headers.c>
       Header always set X-Content-Type-Options nosniff
       Header always set X-Frame-Options DENY
       Header always set X-XSS-Protection "1; mode=block"
   </IfModule>
   ```

6. **Acesse a aplicação:**
   Após o upload, acesse seu domínio (ex: `https://imobiliariaa.techatende.com.br`) para visualizar a aplicação.

## Variáveis de Ambiente

Este projeto pode utilizar variáveis de ambiente para configurações específicas (ex: chaves de API). Elas são geralmente definidas em um arquivo `.env` na raiz do projeto. Exemplo:

```
VITE_API_KEY=sua_chave_api_aqui
```

**Importante:** Nunca exponha chaves de API sensíveis diretamente no código-fonte ou em repositórios públicos. Utilize variáveis de ambiente e configure-as no seu ambiente de deploy.

## Contato

Para dúvidas ou suporte, entre em contato com o desenvolvedor.

