export function paginate(items, page, limit) {
    if (!page || !limit) {
        return {
            paginatedItems: items,
            metadata: null
        };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
        return {
            paginatedItems: items,
            metadata: null
        };
    }

    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const total = items.length;
    const totalPages = Math.ceil(total / limitNum);

    const paginatedItems = items.slice(startIndex, endIndex);

    return {
        paginatedItems,
        metadata: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages,
            hasMore: pageNum < totalPages
        }
    };
}
