const { Service } = require('sonorpc');
const { PARAM_ERROR, SKU_CODE_EXISTS_ERROR } = require('../constants/error');

class ProductService extends Service {
    async listSpuTypes() {
        const rows = await this.ctx.mysql.query('select id,name,pid from spuType');
        return { success: true, code: 0, data: rows };
    }

    async getSpusByIds(spuIds) {
        if (!Array.isArray(spuIds)) return PARAM_ERROR;
        if (spuIds.some((id) => (typeof id != 'number'))) return PARAM_ERROR;

        const rows = await this.ctx.mysql.query(
            `select 
                a.id,a.title,a.sales,a.cateId,a.subCateId,a.subSubCateId,a.type,a.subType,a.sellerId,a.status,
                b.subtitle,b.brandId,b.barcode,b.company,b.pictures,b.video,b.specOnTitle,b.props,
                c.name as brandName,
                d.price,d.price as minPrice,d.maxPrice
            from spu a 
                join spuBasic b on a.id=b.spuId
                left join brand c on b.brandId=c.id
                left join (select min(price) as price,max(price) as maxPrice,spuId from sku group by spuId) d on a.id=d.spuId
            where a.id in (${spuIds.join(',')})`,
        );

        return { success: true, code: 0, data: rows };
    }

    async listSpu({
        spuId,
        title,
        sellerId,
        status,
        type,
        subType,
        cateId,
        subCateId,
        subSubCateId,
        approvalStatus,
        brandId,
        pageIndex,
        pageSize
    }) {
        const args = [];
        let where = '1=1';
        const start = Math.max(0, pageIndex - 1) * pageSize;

        if (spuId) {
            where += ' and a.id=@p' + args.length;
            args.push(spuId);
        }

        if (typeof status === 'number') {
            where += ' and a.status=@p' + args.length;
            args.push(status);
        }

        if (typeof sellerId === 'number') {
            where += ' and a.sellerId=@p' + args.length;
            args.push(sellerId);
        }

        if (typeof approvalStatus === 'number') {
            where += ' and a.approvalStatus=@p' + args.length;
            args.push(approvalStatus);
        }

        if (title) {
            where += ' and (a.title like CONCAT(\'%\',@p' + args.length + ',\'%\') or b.subtitle like CONCAT(\'%\',@p' + args.length + ',\'%\') or c.name like CONCAT(\'%\',@p' + args.length + ',\'%\'))';
            args.push(title);
        }

        if (subType) {
            where += ' and a.subType=@p' + args.length;
            args.push(subType);
        } else if (type) {
            where += ' and a.type=@p' + args.length;
            args.push(type);
        }

        if (subSubCateId) {
            where += ' and a.subSubCateId=@p' + args.length;
            args.push(subSubCateId);
        } else if (subCateId) {
            where += ' and a.subCateId=@p' + args.length;
            args.push(subCateId);
        } else if (cateId) {
            where += ' and a.cateId=@p' + args.length;
            args.push(cateId);
        }

        if (brandId) {
            where += ' and b.brandId=@p' + args.length;
            args.push(brandId);
        }

        const rows = await this.ctx.mysql.query(
            `select 
                a.id,a.title,a.sales,a.cateId,a.subCateId,a.subSubCateId,a.type,a.subType,a.sellerId,a.status,
                b.subtitle,b.brandId,b.barcode,b.company,b.pictures,b.video,b.specOnTitle,b.props,
                c.name as brandName,
                c1.name as cateName,
                c2.name as subCateName,
                c3.name as subSubCateName,
                t1.name as typeName,
                t2.name as subTypeName,
                d.price,d.price as minPrice,d.maxPrice
            from spu a 
                join spuBasic b on a.id=b.spuId
                left join brand c on b.brandId=c.id
                left join category c1 on a.cateId=c1.id
                left join category c2 on a.subCateId=c2.id
                left join category c3 on a.subSubCateId=c3.id
                left join spuType t1 on a.type=t1.id
                left join spuType t2 on a.subType=t2.id
                left join (select min(price) as price,max(price) as maxPrice,spuId from sku group by spuId) d on a.id=d.spuId
            where ` + where + ' limit ' + start + ',' + pageSize,
            args
        );

        return { success: true, code: 0, data: rows };
    }

    async getSpuById(id) {
        const connection = await this.ctx.mysql.connect();

        try {
            const rows = await connection.query(
                `select 
                    a.id,a.title,a.sales,a.cateId,a.subCateId,a.subSubCateId,a.type,a.subType,a.sellerId,a.status,
                    b.subtitle,b.brandId,b.barcode,b.company,b.pictures,b.video,b.specOnTitle,b.minBuyNum,b.maxBuyNum,b.skuPropKey0,b.skuPropKey1,b.skuPropKey2,b.skuPropKey3,b.skuPropKey4,b.props,
                    c.detailVideo,c.content 
                from spu a 
                    left join spuBasic b on a.id=b.spuId
                    left join spuDetail c on a.id=c.spuId
                where a.id=@p0 and a.status!=0`,
                [id]
            );

            return { success: true, code: 0, data: rows && rows.length > 0 ? rows[0] : null };
        } finally {
            connection.release();
        }
    }

    async getBasicInfoById(id) {
        const rows = await this.ctx.mysql.query(
            `select 
                a.id,a.title,a.sales,a.cateId,a.subCateId,a.subSubCateId,a.type,a.subType,a.sellerId,a.status,
                b.subtitle,b.brandId,b.barcode,b.company,b.pictures,b.video,b.specOnTitle,b.minBuyNum,b.maxBuyNum,b.skuPropKey0,b.skuPropKey1,b.skuPropKey2,b.skuPropKey3,b.skuPropKey4,b.props,
                c.name as brandName
            from spu a 
                left join spuBasic b on a.id=b.spuId
                left join brand c on b.brandId=c.id
            where a.id=@p0 and a.status!=0`,
            [id]
        );

        return { success: true, code: 0, data: rows && rows.length > 0 ? rows[0] : null };
    }

    async getDetailById(spuId) {
        const rows = await this.ctx.mysql.query(
            'select detailVideo,content from spuDetail where spuId=@p0', [spuId]
        );
        return { success: true, code: 0, data: rows && rows.length > 0 ? rows[0] : null };
    }

    async addSpu({
        title,
        cateId,
        subCateId,
        subSubCateId,
        type,
        subType,
        sellerId,
        creator,
        subtitle,
        brandId,
        barcode,
        company,
        pictures,
        video,
        specOnTitle,
        minBuyNum,
        maxBuyNum,
        skuPropKey0,
        skuPropKey1,
        skuPropKey2,
        skuPropKey3,
        skuPropKey4
    }) {
        return await this.ctx.mysql.useTransaction(async (connection) => {
            const res = await connection.insert('spu', {
                title,
                sales: 0,
                status: 2,
                approvalStatus: 2,
                cateId,
                subCateId,
                subSubCateId,
                type,
                subType,
                sellerId,
                creator,
                createDt: new Date()
            });
            const id = res.insertId;

            await connection.insert('spuBasic', {
                spuId: id,
                subtitle,
                brandId,
                barcode,
                company,
                pictures,
                video,
                specOnTitle,
                minBuyNum,
                maxBuyNum,
                skuPropKey0,
                skuPropKey1,
                skuPropKey2,
                skuPropKey3,
                skuPropKey4
            });

            await connection.insert('spuDetail', {
                spuId: id,
            });

            return { success: true, code: 0, id };
        });
    }

    /**
     * 修改商品信息
     * @param {Object} spu 商品信息
     */
    async updateSpu({
        id,
        title,
        sellerId,
        modifyer,
        subtitle,
        brandId,
        barcode,
        company,
        pictures,
        video,
        specOnTitle,
        minBuyNum,
        maxBuyNum,
        skuPropKey0,
        skuPropKey1,
        skuPropKey2,
        skuPropKey3,
        skuPropKey4,
        props,
        detailVideo,
        content
    }) {
        const connection = await this.ctx.mysql.connect();

        try {
            await connection.update('spu', {
                title,
                sellerId,
                modifyer,
                modifyDt: new Date()
            }, { id });

            await connection.update('spuBasic', {
                subtitle,
                brandId,
                barcode,
                company,
                pictures,
                video,
                specOnTitle,
                minBuyNum,
                maxBuyNum,
                skuPropKey0,
                skuPropKey1,
                skuPropKey2,
                skuPropKey3,
                skuPropKey4,
                props,
            }, { spuId: id });

            const shouldUpdateContent = content !== undefined;
            const shouldUpdateDetailVideo = detailVideo !== undefined;
            if (shouldUpdateContent && shouldUpdateDetailVideo) {
                const detailInfo = {};
                if (shouldUpdateContent) {
                    detailInfo.content = content;
                }
                if (shouldUpdateDetailVideo) {
                    detailInfo.detailVideo = detailVideo;
                }
                await connection.update('spuDetail', detailInfo, { spuId: id, });
            }
        } finally {
            connection.release();
        }

        return { success: true, code: 0 };
    }

    /**
     * SPU商品上架
     * @param {number} spuId 商品ID
     */
    async shelveSpu(spuId) {
        const rows = await this.ctx.mysql.query('select status from spu where id=@p0', [spuId]);
        if (!rows[0]) {
            return { success: true, code: -1000, message: '商品不存在!' };
        } else if (rows[0].status == 0) {
            return { success: true, code: -1000, message: '商品已删除!' };
        }
        await this.ctx.mysql.update("spu", { status: 1 }, { id: spuId });
        return { success: true, code: 0 };
    }

    /**
     * SPU商品下架
     * @param {*} spuId 商品ID
     */
    async pullSpuFromShelves(spuId) {
        const rows = await this.ctx.mysql.query('select status from spu where id=@p0', [spuId]);
        if (!rows[0]) {
            return { success: true, code: -1000, message: '商品不存在!' };
        } else if (rows[0].status != 1) {
            return { success: true, code: -1000, message: '商品状态错误!' };
        }
        await this.ctx.mysql.update("spu", { status: 3 }, { id: spuId });
        return { success: true, code: 0 };
    }

    async getSkusBySpuId(spuId) {
        const rows = await this.ctx.mysql.query('select id,spuId,code,status,price,kgWeight,picture,stockType,stock,skuPropVal0,skuPropVal1,skuPropVal2,skuPropVal3,skuPropVal4 from sku where spuId=@p0 and status!=0', [spuId]);
        return { success: true, code: 0, data: rows };
    }

    async getBuySkusByIds(skuIds) {
        const rows = await this.ctx.mysql.query(
            `select 
                sku.id as skuId,spuId,code,sku.status as skuStatus,price,kgWeight,picture,stockType,stock,skuPropVal0,skuPropVal1,skuPropVal2,skuPropVal3,skuPropVal4,
                spu.sellerId,spu.title,spu.status as spuStatus
            from sku
                inner join spu on sku.spuId=spu.id
            where sku.id in (${skuIds.join(',')}) and sku.status!=0 and spu.status!=0`
        );
        return { success: true, code: 0, data: rows };
    }

    async getSkuStatusByIds(skuIds) {
        const rows = await this.ctx.mysql.query(
            `select 
                sku.id as skuId,sku.status as skuStatus,
                spu.status as spuStatus
            from sku
                inner join spu on sku.spuId=spu.id
            where sku.id in (${skuIds.join(',')}) and sku.status!=0 and spu.status!=0`
        );
        return { success: true, code: 0, data: rows };
    }

    /**
     * 添加SKU
     * @param {*} sku SKU信息
     */
    async addSku({ spuId, code, price, kgWeight, picture, stockType, stock, skuPropVal0, skuPropVal1, skuPropVal2, skuPropVal3, skuPropVal4 }) {
        if (!code || !spuId) return PARAM_ERROR;

        const connection = await this.ctx.mysql.connect();
        try {
            const rows = await connection.query('select 1 from sku a inner join spu b on a.spuId=b.id where a.code=@p0 and b.sellerId=(select sellerId from spu where spuId=@p1)', [code, spuId]);

            if (rows && rows.length) {
                return SKU_CODE_EXISTS_ERROR;
            }

            const res = await connection.insert('sku', {
                spuId,
                code,
                status: 2,
                price,
                kgWeight,
                picture,
                stockType,
                stock,
                skuPropVal0,
                skuPropVal1,
                skuPropVal2,
                skuPropVal3,
                skuPropVal4
            });

            return { success: true, code: 0, id: res.insertId };
        } finally {
            connection.release();
        }
    }

    async updateSku({ id, price, kgWeight, picture, stockType, stock, skuPropVal0, skuPropVal1, skuPropVal2, skuPropVal3, skuPropVal4 }) {
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
        if (stockType == 2) {
            data.stock = stock;
        }
        await this.ctx.mysql.update('sku', data, { id });

        return { success: true, code: 0 };
    }

    /**
     * SKU商品上架
     * @param {number} skuId 商品ID
     */
    async shelveSku(skuId) {
        const rows = await this.ctx.mysql.query('select status from sku where id=@p0', [skuId]);
        if (!rows[0]) {
            return { success: true, code: -1000, message: 'SKU不存在!' };
        } else if (rows[0].status == 0) {
            return { success: true, code: -1000, message: 'SKU已删除!' };
        }
        await this.ctx.mysql.update("sku", { status: 1 }, { id: skuId });
        return { success: true, code: 0 };
    }

    /**
     * SKU商品下架
     * @param {*} skuId 商品ID
     */
    async pullSkuFromShelves(skuId) {
        const rows = await this.ctx.mysql.query('select status from sku where id=@p0', [skuId]);
        if (!rows[0]) {
            return { success: true, code: -1000, message: '商品不存在!' };
        } else if (rows[0].status != 1) {
            return { success: true, code: -1000, message: '商品状态错误!' };
        }
        await this.ctx.mysql.update("sku", { status: 3 }, { id: skuId });
        return { success: true, code: 0 };
    }
}

module.exports = ProductService;