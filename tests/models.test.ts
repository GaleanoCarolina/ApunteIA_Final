import {describe,it,expect} from 'vitest';
describe('identificadores',()=>{it('UUID moderno tiene estructura válida',()=>{expect(crypto.randomUUID()).toMatch(/^[0-9a-f-]{36}$/)})})