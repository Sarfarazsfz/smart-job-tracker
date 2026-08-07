import test from 'node:test';
import assert from 'node:assert';
import { paginate } from '../src/utils/pagination.js';

test('Pagination Utility', async (t) => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    await t.test('returns all items if no page or limit provided', () => {
        const result = paginate(items);
        assert.deepStrictEqual(result.paginatedItems, items);
        assert.strictEqual(result.metadata, null);
    });

    await t.test('paginates correctly', () => {
        const result = paginate(items, 2, 3);
        assert.deepStrictEqual(result.paginatedItems, [4, 5, 6]);
        assert.deepStrictEqual(result.metadata, {
            page: 2,
            limit: 3,
            total: 10,
            totalPages: 4,
            hasMore: true
        });
    });

    await t.test('handles last page correctly', () => {
        const result = paginate(items, 4, 3);
        assert.deepStrictEqual(result.paginatedItems, [10]);
        assert.deepStrictEqual(result.metadata, {
            page: 4,
            limit: 3,
            total: 10,
            totalPages: 4,
            hasMore: false
        });
    });
});
