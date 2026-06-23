# SuperAdmin Delivery - Frontend

Painel administrativo frontend para o backend multi-tenant de delivery, construído com React, TypeScript e Vite.

## Tecnologias Utilizadas

- **React 19 + TypeScript**: Para uma base de código robusta e moderna.
- **Vite**: Build tool super rápido.
- **Tailwind CSS**: Estilização utilitária e design system configurado para modo claro e escuro.
- **React Router DOM**: Roteamento SPA.
- **Zustand**: Gerenciamento de estado leve (utilizado para Auth).
- **React Hook Form + Zod**: Gerenciamento e validação de formulários.
- **TanStack Query (React Query)**: Fetching, caching e sincronização de dados.
- **Axios**: Cliente HTTP configurado com interceptors para tokens JWT.
- **Lucide React**: Ícones SVG elegantes.
- **Componentes Customizados**: Baseados na filosofia do Shadcn/ui.

## Estrutura de Diretórios

```
src/
├── app/          # Configurações gerais da aplicação (rotas, providers)
├── components/   # Componentes reutilizáveis
│   ├── layout/   # Estruturas de página (Sidebar, Header, Layout)
│   └── ui/       # Componentes visuais base (Button, Input, Table, etc.)
├── features/     # Serviços de API agrupados por domínio (auth, stores, etc.)
├── hooks/        # Hooks customizados (useAuth)
├── lib/          # Utilitários e configurações (axios, utils do tailwind, auth)
├── pages/        # Telas da aplicação
└── ...
```

## Como Rodar o Projeto

1. Instale as dependências:
```bash
npm install
```

2. Crie o arquivo `.env` a partir do exemplo:
```bash
copy .env.example .env
```

3. Configure a URL do backend no `.env`:
```env
VITE_API_URL=http://localhost:3010/api
```

`VITE_API_URL` é a única variável de ambiente usada por este projeto. Ela deve
conter a URL base da API, sempre com o sufixo `/api`. Para desenvolvimento local,
consulte a variável `PORT` do `.env` do projeto `backend-node-with-AI` (o padrão
atual é `3010`). Em produção, obtenha a URL pública do serviço do backend no
provedor de hospedagem e acrescente `/api` ao final. Não adicione segredos em
variáveis `VITE_`, pois elas são incorporadas ao código entregue ao navegador.

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

5. Para gerar a build de produção:
```bash
npm run build
```

## Funcionalidades Implementadas

- [x] Autenticação Completa (Login, Persistência de JWT, Logout, Interceptors).
- [x] Proteção de Rotas (Redirecionamento se não autenticado).
- [x] Layout Administrativo (Sidebar responsiva, Header, Breadcrumbs virtuais).
- [x] Dashboard (Cards de estatísticas com placeholders para gráficos).
- [x] Gerenciamento de Lojas (Listagem, Busca, Criação, Edição).
- [x] Validação de formulários avançada com Zod.

## Próximos Passos (Integrações Futuras)

Para que o painel fique 100% aderente a todas as entidades do banco, os seguintes endpoints (presentes na coleção Postman mas que precisam de telas próprias) devem ser expandidos seguindo o mesmo padrão da feature `stores`:

- **Usuários**: Listagem de administradores, operadores, entregadores, separadores e clientes. (`/users`)
- **Categorias e Produtos**: Gerenciar catálogo de lojas específicas (`/categorias`, `/produtos`).
- **Pedidos**: Visualizar fluxo e status dos pedidos (`/pedidos`).
- **Financeiro**: Acompanhar transações e repasses (`/pagamentos`).
- **Configurações**: Gerenciar taxas de entrega, horários de funcionamento, etc.

*Dica: Utilize os componentes de `Table`, `Card`, e `Form` já construídos em `src/components/ui/` para manter o padrão visual e a consistência arquitetural.*
