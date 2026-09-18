import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';
import { pool } from '../src/config/db.js';

let server, base;
const originalQuery = pool.query;
let queries;
before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
});
beforeEach(() => {
  queries = [];
  pool.query = async (sql, values) => {
    queries.push({ sql, values });
    return [{ affectedRows: 1, insertId: 9 }];
  };
});
after(async () => {
  pool.query = originalQuery;
  await new Promise(resolve => server.close(resolve));
  await pool.end();
});
const request = (url, method = 'GET', body) => fetch(base + url, {
  method, headers: { 'Content-Type': 'application/json' },
  body: body === undefined ? undefined : JSON.stringify(body)
});
const person = { nombre: 'Ana', apellido: 'Pérez', dni: '12345678' };
test('elimina talleristas y horarios por su identificador', async () => {
  for (const url of ['/talleristas/1', '/detalle-taller/2']) {
    assert.equal((await request(url, 'DELETE')).status, 200);
  }
  assert.equal(queries.length, 2);
  assert.deepEqual(queries.map(q => q.values), [['1'], ['2']]);
});
test('alta de taller utiliza parámetros SQL y devuelve identificador', async () => {
  pool.query = async (sql, values) => {
    queries.push({ sql, values });
    return sql.startsWith('SELECT') ? [[]] : [{ affectedRows: 1, insertId: 9 }];
  };
  const res = await request('/talleres', 'POST', { taller: 'Música' });
  assert.equal(res.status, 201);
  assert.deepEqual(await res.json(), { id_taller: 9, taller: 'Música' });
  assert.match(queries[1].sql, /VALUES \(\?\)/);
  assert.deepEqual(queries[1].values, ['Música']);
});
test('rechaza nombres de talleres duplicados al crear y editar', async () => {
  pool.query = async (sql, values) => {
    queries.push({ sql, values });
    return [[{ id_taller: 1 }]];
  };
  assert.equal((await request('/talleres', 'POST', { taller: 'Música' })).status, 409);
  assert.equal((await request('/talleres/2', 'PUT', { taller: 'MÚSICA' })).status, 409);
  assert.equal(queries.length, 2);
  assert.match(queries[0].sql, /LOWER\(taller\) = LOWER\(\?\)/);
});
test('consulta alumno por la columna correcta y conserva respuesta de lista', async () => {
  pool.query = async (sql, values) => { queries.push({ sql, values }); return [[{ id_alumno: 2 }]]; };
  const res = await request('/alumnos/2');
  assert.deepEqual(await res.json(), [{ id_alumno: 2 }]);
  assert.match(queries[0].sql, /WHERE id_alumno = \?/);
});
test('altas devuelven identificadores que necesita el frontend', async () => {
  for (const [url, key] of [['/alumnos', 'id_alumno'], ['/talleristas', 'id_tallerista']]) {
    const res = await request(url, 'POST', person);
    assert.equal(res.status, 201);
    assert.equal((await res.json())[key], 9);
  }
});
test('rechaza identificadores y formularios inválidos sin consultar DB', async () => {
  for (const url of ['/alumnos/abc', '/talleres/0', '/detalle-talleres/dia/8']) assert.equal((await request(url)).status, 400);
  for (const body of [{}, { ...person, nombre: ' ' }, { ...person, email: 'invalido' }, { ...person, dni: 'abc' }, { ...person, dni: ['12345678'] }]) {
    assert.equal((await request('/alumnos', 'POST', body)).status, 400);
  }
  const horario = { id_taller: 1, id_tallerista: 1, id_dia: 1, hora_inicio: '18:00', hora_fin: '17:00' };
  assert.equal((await request('/detalle-taller', 'POST', horario)).status, 400);
  assert.equal(queries.length, 0);
});
test('conserva DNI opcional y rechaza referencias que no sean escalares', async () => {
  assert.equal((await request('/alumnos', 'POST', { ...person, dni: '' })).status, 201);
  const horario = { id_taller: [1], id_tallerista: 1, id_dia: 1, hora_inicio: '09:00', hora_fin: '10:00' };
  assert.equal((await request('/detalle-taller', 'POST', horario)).status, 400);
});
test('errores DB siempre responden y no exponen SQL ni datos sensibles', async () => {
  pool.query = async () => { throw Object.assign(new Error('SECRET SQL'), { code: 'ECONNREFUSED' }); };
  for (const [url, method, body] of [['/alumnos', 'GET'], ['/talleres', 'GET'], ['/talleristas/1', 'PUT', person]]) {
    const res = await request(url, method, body);
    assert.equal(res.status, 500);
    assert.doesNotMatch(await res.text(), /SECRET|SQL|ECONNREFUSED/);
  }
});
test('conflictos de unicidad y relaciones devuelven 409', async () => {
  for (const code of ['ER_DUP_ENTRY', 'ER_ROW_IS_REFERENCED_2', 'ER_NO_REFERENCED_ROW_2']) {
    pool.query = async () => { throw Object.assign(new Error(), { code }); };
    assert.equal((await request('/alumnos/1', 'DELETE')).status, 409);
  }
});
test('registros inexistentes devuelven 404', async () => {
  pool.query = async () => [{ affectedRows: 0 }];
  for (const url of ['/alumnos/1', '/talleres/1', '/talleristas/1', '/detalle-taller/1']) {
    assert.equal((await request(url, 'DELETE')).status, 404);
  }
});
test('JSON inválido devuelve 400 y rutas desconocidas 404', async () => {
  const res = await fetch(base + '/alumnos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(res.status, 400);
  assert.equal((await request('/inexistente')).status, 404);
});
test('CORS no autoriza orígenes externos arbitrarios', async () => {
  const res = await fetch(base + '/inexistente', { headers: { Origin: 'https://externo.example' } });
  assert.equal(res.headers.get('access-control-allow-origin'), null);
});
