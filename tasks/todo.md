# Refinamento visual

- [x] Alternar superfícies e equilibrar notícias em desktop, mantendo empilhamento mobile.
- [x] Simplificar adornos mobile e unificar canais de contato clicáveis.
- [x] Verificar testes, build e navegador; salvar capturas e registrar resultados.

Verificação: `npm test` passou (39/39); `npm run build` passou, incluindo TypeScript. Sem script de lint no projeto. Node emitiu avisos de MODULE_TYPELESS_PACKAGE_JSON nos testes, sem falhas. Home sem transbordamento horizontal em 360, 390, 768, 1024 e 1440 px. Superfícies alternadas confirmadas; contato mobile sem adorno, um link mailto e telefone tel corretos. Logs de navegador consultados sem erros/avisos. Capturas inspecionadas em `docs/comparativo/refinamento/`. Servidor `next start` reiniciado em localhost:3000 para servir a página atualizada. Revisão limitada ao refinamento aprovado; não é uma nova auditoria completa de todas as rotas.
