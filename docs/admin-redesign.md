# Redesign do admin: registro

Atualizado em 12/11/2026. Nada foi commitado nem publicado.

## Concluído

- **Base:** lateral de 224 px com a logo sobre o verde (`public/assets/img/logo-branca.png`, derivada da logo original), topo com migalhas, "Ver site" e menu da conta (única entrada da conta), conteúdo na largura toda, corpo em 14 px.
- **Login e troca de senha:** tela dividida com a foto da sede (`components/admin/TelaAcesso.tsx`), mostrar/ocultar senha.
- **Painel:** quatro indicadores reais (por permissão), mensagens recentes, revisão, próximos eventos, acesso rápido.
- **Notícias:** abas por situação com contagem, busca, ano e autor; "Editar" por extenso; apagar no menu "mais ações"; formulário com barra de ações, editor com menu "Inserir", negrito e link.
- **Páginas:** página inicial em faixa própria, busca e tipo, fixas separadas das criadas; formulário no molde aprovado, com seções recolhíveis que abrem quando o servidor acusa erro nelas.
- **Demais telas:** agenda e mensagens com abas, diretoria e ex-presidentes com cargo/gestão e "Editar", usuários, minha conta.

## Conferido

- `npx tsc --noEmit`, `npm test` (71 passam, 1 pulado) e `npm run build`.
- 44 verificações de fluxo no navegador (login, conta, filtros, paginação, editor, página do rascunho ao apagar, página fixa, agenda, mensagens, permissões do editor, celular).
- Capturas em 1920, 1366 e 390 px: `docs/capturas/admin-redesign/`.

## Pendente ou não conferido

- Upload, troca e remoção de imagem: o `.env` local usa `STORAGE=ftp` e o envio trava; `testes/admin.py` para nesse passo (como antes do redesign).
- Fluxo de revisão de notícia ponta a ponta (enviar, devolver, publicar, despublicar) depende do upload da foto obrigatória.
- Itálico no editor: o formato do site só entende negrito e link, então não foi criado.
- "Itens por página" do mockup não existe no projeto e não foi criado.
- Em desenvolvimento, o selo do Next no canto superior direito cobre o botão da conta; em produção ele não existe.
