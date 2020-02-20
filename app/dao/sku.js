const { Dao } = require('sonorpc');

const DEFAULT_COLUMNS = ['id', 'spuId', 'code', 'status', 'price', 'kgWeight', 'picture', 'stockType', 'stock', 'skuPropVal0', 'skuPropVal1', 'skuPropVal2', 'skuPropVal3', 'skuPropVal4'];

class SkuDao extends Dao {
    getAvailableSkusBySpuId(spuId) {
        return this.connection.query(DEFAULT_COLUMNS, 'sku', {
            where: {
                spuId,
                'status!=?': 0
            }
        });
    }

    getById(skuId) {
        return this.connection.query(DEFAULT_COLUMNS, 'sku', {
            where: {
                skuId
            }
        });
    }

    getSkuStatusById(skuId) {
        return this.connection.query(
            `select 
                sku.id as skuId,sku.spuId,sku.status as skuStatus,
                spu.status as spuStatus
            from sku
                inner join spu on sku.spuId=spu.id
            where sku.id=? and sku.status!=0 and spu.status!=0`,
            [skuId]
        )[0];
    }

    getSkusByIds(skuIds) {
        return this.connection.query(
            `select 
                sku.id as skuId,spuId,code,sku.status as skuStatus,price,kgWeight,picture,stockType,stock,skuPropVal0,skuPropVal1,skuPropVal2,skuPropVal3,skuPropVal4,
                spu.sellerId,spu.title,spu.status as spuStatus
            from sku
                inner join spu on sku.spuId=spu.id
            where sku.id in (${skuIds.join(',')}) and sku.status!=0 and spu.status!=0`
        );
    }

    getSkuStatusByIds(skuIds) {
        return this.connection.query(
            `select 
                sku.id as skuId,sku.spuId,sku.status as skuStatus,
                spu.status as spuStatus
            from sku
                inner join spu on sku.spuId=spu.id
            where sku.id in (?) and sku.status!=0 and spu.status!=0`,
            [skuIds]
        );
    }

    /**
     * 添加SKU
     * @param {*} sku SKU信息
     */
    addSku({ spuId, price, kgWeight, picture, stockType, syncStockDetailId, skuPropVal0, skuPropVal1, skuPropVal2, skuPropVal3, skuPropVal4 }) {
        return this.connection.insert('sku', {
            spuId,
            status: 2,
            price,
            kgWeight,
            picture,
            stockType,
            syncStockDetailId,
            stock: 0,
            skuPropVal0,
            skuPropVal1,
            skuPropVal2,
            skuPropVal3,
            skuPropVal4
        });
    }

    async updateSku({ id, price, kgWeight, picture, skuPropVal0, skuPropVal1, skuPropVal2, skuPropVal3, skuPropVal4 }) {
        const data = {
            price,
            kgWeight,
            picture,
            skuPropVal0,
            skuPropVal1,
            skuPropVal2,
            skuPropVal3,
            skuPropVal4
        };
        await this.connection.update('sku', data, { id });
        return { success: true, code: 0 };
    }

    async deleteSku(id) {
        await this.app.transaction(async (conn) => {
            const [sku] = await conn.query('select status,spuId from sku where id=@p0', [id]);
            if (!sku) {
                throw new Error('SKU不存在!');
            }
            if (sku.status == 1) {
                const [skus] = await conn.query('select count(1) as total from sku where spuId=@p0 and status=1 and id!=@p1', [sku.spuId, id]);
                if (skus.total == 0) {
                    await conn.update('spu', { status: 3 }, { id: sku.spuId });
                }
            }
            await this.updateSkuStatus(id, 0);
        });
    }

    async updateStatus(skuId, status) {
        return this.connection.update("sku", { status }, { id: skuId });
    }

    /**
     * SKU商品下架
     * @param {*} skuId 商品ID
     */
    async pullSkuFromShelves(skuId) {
        const [sku] = await this.connection.query('select status,spuId from sku where id=@p0', [skuId]);
        if (!sku) {
            return { success: true, code: -1000, message: '商品不存在!' };
        } else if (sku.status != 1) {
            return { success: true, code: -1000, message: '商品状态错误!' };
        }

        return await this.app.transaction(async (conn) => {
            const [skus] = await conn.query('select count(1) as total from sku where spuId=@p0 and status=1 and id!=@p1', [sku.spuId, skuId]);
            if (skus.total == 0) {
                await conn.update('spu', { status: 3 }, { id: sku.spuId });
            }
            await conn.update("sku", { status: 3 }, { id: skuId });

            return { success: true, code: 0 };
        });
    }
}

module.exports = SkuDao;