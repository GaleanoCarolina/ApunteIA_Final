import { describe, it, expect } from 'vitest';
import { escapeHtml } from '../src/lib/pdf';
describe('escapeHtml', () => { it('escapa HTML no confiable', () => { expect(escapeHtml('<script>"&')).toBe('&lt;script&gt;&quot;&amp;'); }); });
