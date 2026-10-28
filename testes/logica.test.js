// Executar na pasta do site:  node testes/logica.test.js
const assert = require('assert');
const { validate, splitEvents } = require('../public/assets/js/site.js');
const hoje = '2026-10-26';

assert.strictEqual(validate('required', '  ', hoje, 'Nome'), 'Preencha o campo Nome.');
assert.strictEqual(validate('required', 'Ana', hoje, 'Nome'), '');
assert.strictEqual(validate('email', '', hoje, 'E-mail'), '', 'campo opcional vazio é válido');
assert.ok(validate('required email', 'ana@', hoje, 'E-mail'));
assert.strictEqual(validate('required email', 'ana@empresa.com.br', hoje, 'E-mail'), '');
assert.ok(validate('phone', '3333-8786', hoje, 'Telefone'), 'sem DDD é inválido');
assert.strictEqual(validate('phone', '(47) 3333-8786', hoje, 'Telefone'), '');
assert.strictEqual(validate('phone', '+55 47 99999-0000', hoje, 'Telefone'), '');
assert.strictEqual(validate('required date-future', '2026-10-25', hoje, 'Data'), 'Escolha uma data a partir de hoje.');
assert.strictEqual(validate('required date-future', '2026-10-26', hoje, 'Data'), '', 'hoje é aceito');
assert.ok(validate('required date-future', '26/10/2026', hoje, 'Data'));
assert.ok(validate('required min10', 'curto', hoje, 'Mensagem'));
assert.strictEqual(validate('required min10', 'mensagem com tamanho', hoje, 'Mensagem'), '');

const ev = [{ date: '2022-05-18' }, { date: '2026-02-25' }, { date: '2026-10-26' }, { date: '2027-01-10' }, { date: '2022-05-31' }];
const s = splitEvents(ev, hoje);
assert.deepStrictEqual(s.upcoming.map(e => e.date), ['2026-10-26', '2027-01-10'], 'próximos em ordem crescente, incluindo hoje');
assert.deepStrictEqual(s.past.map(e => e.date), ['2026-02-25', '2022-05-31', '2022-05-18'], 'arquivo em ordem decrescente');
// eventos publicados hoje no site oficial: todos no arquivo
const oficiais = ['2026-02-25', '2022-05-31', '2022-05-18', '2022-05-18', '2022-05-18', '2022-05-18'].map(date => ({ date }));
assert.strictEqual(splitEvents(oficiais, hoje).upcoming.length, 0);

console.log('logica.test.js: todos os testes passaram');
