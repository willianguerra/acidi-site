# Refinamento visual aprovado em 28/10/2026

## Objetivo e limites
Aplicar os quatro ajustes aprovados após a análise no navegador: alternância de fundos da home, equilíbrio entre notícias, menos adornos no celular e e-mail de contato unificado e clicável. Preservar marca, conteúdo, destinos, formulários demonstrativos e alterações anteriores. Sem dependências ou mudanças de arquitetura.

## Abordagem
Usar os tokens e seletores existentes em `public/assets/css/site.css`: institucional e notícias em branco, serviços e auditório em menta; notícias desktop em duas colunas iguais e imagem principal 16:10; preservar imagem 3:2 e empilhamento no celular. Ocultar o adorno dos cabeçalhos internos até 640 px. Em `app/(site)/contato/page.tsx`, manter um único e-mail com `mailto:` e tornar o telefone clicável.

Alternativa considerada: acrescentar conteúdo para preencher a coluna de notícias. Preferido ajustar proporções, pois atende à revisão sem alterar a seleção editorial.

## Execução e aceitação
1. Editar o CSS. Aceite: seções distintas, notícias equilibradas, sem adorno atrás do texto mobile nem rolagem horizontal. Verificar home em 360, 390, 768, 1024 e 1440 px e contato no celular.
2. Ajustar os canais. Aceite: um endereço de e-mail no bloco de contato, link mailto correto e telefone tel correto; formulário preservado.
3. Executar `npm test`, `npm run build`, revisar as mudanças e inspecionar capturas desktop/mobile. Não criar testes que apenas repitam regras de CSS. Registrar limitações reais.

## Convenções
CSS compacto com tokens existentes, por exemplo `.about.deco{background:var(--papel)}`. Manter JSX e classes locais. Não publicar, alterar banco ou incluir arquivos preexistentes em commits.
