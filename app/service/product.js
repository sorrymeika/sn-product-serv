const { Service } = require('sonorpc');

class ProductService extends Service {
    async getSpuTypes() {
        const rows = await this.app.dao.spu.getSpuTypes();
        return { success: true, data: rows };
    }

    async getSpusByIds(spuIds) {
        this.app.validate({
            spuIds: { type: 'array', itemType: 'number', min: 1 }
        }, { spuIds });
        const rows = await this.app.dao.spu.getSpusByIds(spuIds);
        return { success: true, data: rows };
    }

    async querySpus(params) {
        const [data, total] = await this.app.dao.spu.query(params);
        return { success: true, data, total };
    }

    async getSpuById(id) {
        const data = await this.app.dao.spu.getSpuById(id);
        return { success: true, data };
    }

    async getBasicInfoById(id) {
        const data = await this.app.dao.spu.getBasicInfoById(id);
        return { success: true, data };
    }

    async getDetailById(spuId) {
        const data = await this.app.dao.spu.getDetailById(spuId);
        return { success: true, data };
    }

    addSpu(spu) {
        return this.app.transaction(async () => {
            const res = await this.app.dao.spu.addSpu(spu);
            return { success: true, id: res.id };
        });
    }

    /**
     * 修改商品信息
     * @param {Object} spu 商品信息
     */
    async updateSpu(spu) {
        const res = await this.app.dao.spu.updateSpu(spu);
        return { success: true, data: res };
    }

    /**
     * SPU商品上架
     * @param {number} spuId 商品ID
     */
    async shelveSpu(spuId) {
        const res = await this.app.dao.spu.shelveSpu(spuId);
        return { success: true, data: res };
    }

    /**
     * SPU商品下架
     * @param {*} spuId 商品ID
     */
    async pullSpuFromShelves(spuId) {
        const res = await this.app.dao.spu.pullSpuFromShelves(spuId);
        return { success: true, data: res };
    }

    async getSkusBySpuId(spuId) {
        const rows = await this.app.dao.sku.getSkusBySpuId(spuId);
        return { success: true, data: rows };
    }

    async getSkusByIds(skuIds) {
        const rows = await this.app.dao.sku.getSkusByIds(skuIds);
        return { success: true, data: rows };
    }

    async getSkuStatusByIds(skuIds) {
        const rows = await this.app.dao.sku.getSkuStatusByIds(skuIds);
        return { success: true, data: rows };
    }

    /**
     * 添加SKU
     * @param {*} sku SKU信息
     */
    async addSku({ spuId, price, kgWeight, picture, stockType, skuPropVal0, skuPropVal1, skuPropVal2, skuPropVal3, skuPropVal4 }) {
        const stockRes = await this.app.stockRPC.invoke('stock.getMaxStockDetailId');
        if (!stockRes.success) {
            return stockRes;
        }
        const res = await this.app.dao.sku.addSku({
            spuId,
            status: 2,
            price,
            kgWeight,
            picture,
            stockType,
            syncStockDetailId: stockRes.maxId,
            skuPropVal0,
            skuPropVal1,
            skuPropVal2,
            skuPropVal3,
            skuPropVal4
        });
        return { success: true, id: res.insertId };
    }

    async updateSku(sku) {
        await this.app.dao.sku.updateSku(sku);
        return { success: true };
    }

    /**
     * SKU商品上架
     * @param {number} skuId 商品ID
     */
    async shelveSku(skuId) {
        const { app } = this;
        const sku = await app.dao.sku.getSkuStatusById(skuId);
        if (!sku) {
            return { success: false, code: -1000, message: 'SKU不存在!' };
        } else if (sku.status == 0) {
            return { success: false, code: -1000, message: 'SKU已删除!' };
        }
        await app.dao.sku.updateStatus(skuId, 1);
        return { success: true, code: 0 };
    }

    /**
     * SKU商品下架
     * @param {*} skuId 商品ID
     */
    async pullSkuFromShelves(skuId) {
        const { app } = this;
        const sku = await app.dao.sku.getSkuStatusById(skuId);
        if (!sku) {
            return { success: false, code: -1000, message: 'SKU不存在!' };
        } else if (sku.status == 0) {
            return { success: false, code: -1000, message: 'SKU已删除!' };
        }

        return await app.transaction(async (conn) => {
            const [skus] = await conn.query('select count(1) as total from sku where spuId=@p0 and status=1 and id!=@p1', [sku.spuId, skuId]);
            if (skus.total == 0) {
                await app.dao.spu.updateStatus(sku.spuId, 3);
            }
            await app.dao.sku.updateStatus(skuId, 3);
            return { success: true };
        });
    }
}

module.exports = ProductService;