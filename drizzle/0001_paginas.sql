CREATE TABLE `paginas` (
	`id` varchar(36) NOT NULL,
	`fixa` varchar(30),
	`slug` varchar(191) NOT NULL,
	`nome` text NOT NULL,
	`situacao` varchar(30) NOT NULL DEFAULT 'rascunho',
	`descricao` text NOT NULL,
	`menu` varchar(30),
	`menu_texto` text,
	`ordem` int NOT NULL DEFAULT 0,
	`conteudo` longtext NOT NULL,
	`atualizada_em` datetime(3) NOT NULL,
	`atualizada_por_id` varchar(64),
	CONSTRAINT `paginas_id` PRIMARY KEY(`id`),
	CONSTRAINT `paginas_fixa_unique` UNIQUE(`fixa`),
	CONSTRAINT `paginas_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `paginas` ADD CONSTRAINT `paginas_atualizada_por_id_user_id_fk` FOREIGN KEY (`atualizada_por_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;