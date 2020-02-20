exports.sku = {
    spuId: { type: 'number', required: true },
    price: { type: 'number', required: true },
    kgWeight: { type: 'number', required: true },
    picture: { type: 'string', required: true },
    stockType: { type: 'number', required: true },
    skuPropVal0: { type: 'string', required: false },
    skuPropVal1: { type: 'string', required: false },
    skuPropVal2: { type: 'string', required: false },
    skuPropVal3: { type: 'string', required: false },
    skuPropVal4: { type: 'string', required: false }
};

exports.skuAll = {
    ...exports.sku,
    id: { type: 'number', required: true },
};