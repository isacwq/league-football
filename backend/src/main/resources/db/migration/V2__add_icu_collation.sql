CREATE COLLATION IF NOT EXISTS pt_br_ci_as (
    provider = 'icu',
    locale = 'pt-BR-u-ks-level2',
    deterministic = false
);

CREATE COLLATION IF NOT EXISTS pt_br_ci_ai (
    provider = 'icu',
    locale = 'pt-BR-u-ks-level1',
    deterministic = false
);

ALTER TABLE clubes
    ALTER COLUMN nome TYPE VARCHAR(60) COLLATE pt_br_ci_as;

ALTER TABLE jogadores
    ALTER COLUMN nome TYPE VARCHAR(100) COLLATE pt_br_ci_ai;

CREATE INDEX idx_clubes_nome_icu ON clubes (nome ASC, id ASC);
CREATE INDEX idx_jogadores_nome_icu ON jogadores (nome ASC, id ASC);
