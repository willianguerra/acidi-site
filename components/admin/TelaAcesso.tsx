import { ArrowUpRight, Lock } from 'lucide-react';

// Tela de entrada e de troca da senha provisória: a sede da ACIDI à esquerda, o formulário à direita.
// No celular a foto vira uma faixa curta e o formulário vem logo abaixo.
export function TelaAcesso({ titulo, descricao, children }: { titulo: string; descricao: React.ReactNode; children: React.ReactNode }) {
  return (
    <main className="grid min-h-svh bg-card lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <section aria-label="ACIDI" className="relative isolate overflow-hidden bg-mata text-white lg:[clip-path:polygon(0_0,100%_0,calc(100%-7vw)_100%,0_100%)]">
        <img src="/assets/img/sede.jpg" alt="" className="absolute inset-0 -z-20 size-full object-cover object-[55%_60%]" />
        {/* véu verde: dá contraste ao texto e traz a foto para a cor da marca */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(11_61_36/.94)_8%,rgb(11_61_36/.5)_55%,rgb(11_61_36/.72))]" />
        <div className="flex h-full flex-col justify-between gap-6 px-5 py-5 sm:px-10 lg:py-12 lg:pr-[11vw] lg:pl-14">
          <img src="/assets/img/logo-branca.png" width="189" height="50" alt="ACIDI, Associação Empresarial de Indaial" className="h-9 w-auto self-start lg:h-[50px]" />
          <div className="max-lg:hidden">
            <p className="max-w-[21ch] font-display text-[clamp(2.1rem,3vw,3.25rem)] leading-[1.04] font-extrabold tracking-[-0.02em] font-stretch-[112%]">Conectando empresas, pessoas e oportunidades <span className="text-amarelo">desde 1989.</span></p>
            <p className="mt-8 flex items-center gap-4 text-[0.72rem] font-bold tracking-[0.2em] uppercase"><span className="h-[3px] w-12 rounded-full bg-amarelo" aria-hidden="true" />Associação Empresarial de Indaial</p>
          </div>
        </div>
      </section>
      <section className="flex flex-col px-5 py-6 sm:px-10 lg:px-14 lg:py-10">
        <p className="text-right max-lg:hidden"><a className="inline-flex items-center gap-1 font-semibold text-accent-foreground hover:underline" href="/">Voltar ao site<ArrowUpRight aria-hidden="true" className="size-4" /></a></p>
        <div className="mx-auto my-auto grid w-full max-w-[400px] gap-6 py-6">
          <div>
            <p className="mb-2 text-[0.72rem] font-bold tracking-[0.2em] text-primary uppercase">Painel administrativo</p>
            <h1 className="text-[2rem]!">{titulo}</h1>
            <p className="mt-2 text-[0.95rem] text-muted-foreground">{descricao}</p>
          </div>
          {children}
          <p className="flex items-center justify-center gap-2 text-[0.8rem] text-muted-foreground"><Lock aria-hidden="true" className="size-4" />Acesso exclusivo à equipe da ACIDI.</p>
        </div>
        <p className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground"><a className="font-semibold hover:text-primary lg:hidden" href="/">Voltar ao site</a><span className="lg:ml-auto">© {new Date().getFullYear()} ACIDI</span></p>
      </section>
    </main>
  );
}
