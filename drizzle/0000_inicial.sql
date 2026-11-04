-- InnoDB e utf8mb4 explícitos: no cPanel o padrão pode ser MyISAM (sem chave estrangeira nem transação) ou latin1.
CREATE TABLE `contatos` (
	`id` varchar(36) NOT NULL,
	`formulario` varchar(30) NOT NULL,
	`nome` text NOT NULL,
	`email` text NOT NULL,
	`campos` longtext NOT NULL,
	`lida` boolean NOT NULL DEFAULT false,
	`criada_em` datetime(3) NOT NULL,
	CONSTRAINT `contatos_id` PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
--> statement-breakpoint
CREATE TABLE `diretoria` (
	`id` varchar(36) NOT NULL,
	`grupo` varchar(30) NOT NULL,
	`rotulo` text,
	`nome` text NOT NULL,
	`suplente` boolean NOT NULL DEFAULT false,
	`ordem` int NOT NULL,
	CONSTRAINT `diretoria_id` PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
--> statement-breakpoint
CREATE TABLE `eventos` (
	`id` varchar(36) NOT NULL,
	`data` date NOT NULL,
	`titulo` text NOT NULL,
	`horario` text,
	`local` text NOT NULL,
	`descricao` text NOT NULL,
	`atualizado_em` datetime(3) NOT NULL,
	`atualizado_por_id` varchar(64),
	CONSTRAINT `eventos_id` PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
--> statement-breakpoint
CREATE TABLE `ex_presidentes` (
	`id` varchar(36) NOT NULL,
	`foto` text,
	`nome` text NOT NULL,
	`gestao` text,
	`ordem` int NOT NULL,
	CONSTRAINT `ex_presidentes_id` PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
--> statement-breakpoint
CREATE TABLE `noticias` (
	`id` varchar(36) NOT NULL,
	`slug` varchar(191) NOT NULL,
	`data` date NOT NULL,
	`titulo` text NOT NULL,
	`imagem` text NOT NULL,
	`alt` text NOT NULL,
	`resumo` text NOT NULL,
	`corpo` longtext NOT NULL,
	`situacao` varchar(30) NOT NULL DEFAULT 'rascunho',
	`comentario_revisao` text,
	`autor_id` varchar(64),
	`publicada_por_id` varchar(64),
	`publicada_em` datetime(3),
	`atualizada_por_id` varchar(64),
	`criada_em` datetime(3) NOT NULL,
	`atualizada_em` datetime(3) NOT NULL,
	CONSTRAINT `noticias_id` PRIMARY KEY(`id`),
	CONSTRAINT `noticias_slug_unique` UNIQUE(`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
--> statement-breakpoint
CREATE TABLE `account` (
	`id` varchar(64) NOT NULL,
	`account_id` varchar(255) NOT NULL,
	`provider_id` varchar(64) NOT NULL,
	`user_id` varchar(64) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` datetime(3),
	`refresh_token_expires_at` datetime(3),
	`scope` text,
	`password` text,
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(64) NOT NULL,
	`expires_at` datetime(3) NOT NULL,
	`token` varchar(191) NOT NULL,
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` varchar(64) NOT NULL,
	`impersonated_by` varchar(64),
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(64) NOT NULL,
	`name` text NOT NULL,
	`email` varchar(191) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`image` text,
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	`role` varchar(30),
	`banned` boolean DEFAULT false,
	`ban_reason` text,
	`ban_expires` datetime(3),
	`trocar_senha` boolean NOT NULL DEFAULT true,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(64) NOT NULL,
	`identifier` varchar(191) NOT NULL,
	`value` text NOT NULL,
	`expires_at` datetime(3) NOT NULL,
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
--> statement-breakpoint
ALTER TABLE `eventos` ADD CONSTRAINT `eventos_atualizado_por_id_user_id_fk` FOREIGN KEY (`atualizado_por_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `noticias` ADD CONSTRAINT `noticias_autor_id_user_id_fk` FOREIGN KEY (`autor_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `noticias` ADD CONSTRAINT `noticias_publicada_por_id_user_id_fk` FOREIGN KEY (`publicada_por_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `noticias` ADD CONSTRAINT `noticias_atualizada_por_id_user_id_fk` FOREIGN KEY (`atualizada_por_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;