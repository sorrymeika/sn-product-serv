exports.queryParams = {
    name: { type: 'string', required: false },
    id: { type: 'number', required: false },
    sellerId: { type: 'number', required: false },
    status: { type: 'number', required: false },
    hasBrandAuth: { type: 'number', required: false },
    brandType: { type: 'number', required: false },
    pageIndex: { type: 'number', required: true },
    pageSize: { type: 'number', required: true },
};