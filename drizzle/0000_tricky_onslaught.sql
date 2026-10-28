CREATE TABLE "diretoria" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"grupo" text NOT NULL,
	"rotulo" text,
	"nome" text NOT NULL,
	"suplente" boolean DEFAULT false NOT NULL,
	"ordem" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eventos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"data" date NOT NULL,
	"titulo" text NOT NULL,
	"horario" text,
	"local" text NOT NULL,
	"descricao" text NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ex_presidentes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"foto" text,
	"nome" text NOT NULL,
	"gestao" text,
	"ordem" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "noticias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"data" date NOT NULL,
	"titulo" text NOT NULL,
	"imagem" text NOT NULL,
	"alt" text NOT NULL,
	"resumo" text NOT NULL,
	"corpo" jsonb NOT NULL,
	"situacao" text DEFAULT 'rascunho' NOT NULL,
	"comentario_revisao" text,
	"autor_id" text,
	"publicada_por_id" text,
	"publicada_em" timestamp with time zone,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizada_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "noticias_slug_unique" UNIQUE("slug")
);
