import { PaginationResponse } from '@base/pagination.dto';
import { PAGE_SIZE } from '@configs/config';

/**
 * It takes an array of items, a total number of items, a page number, and a page size, and returns a
 * pagination response object
 * @param {any} items - The items to be paginated.
 * @param {number} total - The total number of items in the database.
 * @param [page=1] - The current page number
 * @param limit - The number of items per page.
 * @returns {PaginationResponse} A function that takes in 4 parameters and returns a PaginationResponse object.
 */
export function pagination<T>(items: T[], total: number, page = 1, limit = PAGE_SIZE): PaginationResponse<T> {
    const totalPage = Math.ceil(total / limit);
    if (total <= 0 || page > totalPage) {
        return new PaginationResponse([], {
            pagination: {
                currentPage: page,
                limit: limit,
                total: 0,
                totalPages: 0,
            },
        });
    }

    return new PaginationResponse(items, {
        pagination: {
            currentPage: Number(page),
            limit: limit,
            total: total,
            totalPages: totalPage,
        },
    });
}
