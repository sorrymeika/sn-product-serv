const { Dao } = require('sonorpc');

class ProductDao extends Dao {
    getSpuTypes() {
        return this.connection.query('select id,name,pid from spuType');
    }

    getSpusByIds(spuIds) {
        return this.connection.query(
            `select 
                a.id,a.title,a.sales,a.cateId,a.subCateId,a.subSubCateId,a.type,a.subType,a.sellerId,a.status,
                b.subtitle,b.brandId,b.barcode,b.company,b.pictures,b.video,b.specOnTitle,b.props,
                c.name as brandName,
                d.price,d.price as minPrice,d.maxPrice
            from spu a 
                join spuBasic b on a.id=b.spuId
                left join brand c on b.brandId=c.id
                left join (select min(price) as price,max(price) as maxPrice,spuId from sku group by spuId) d on a.id=d.spuId
            where a.id in (?)`, [spuIds]
        );
    }

    query({
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
            where += ' and (a.title like @p' + args.length + ' or b.subtitle like @p' + args.length + ' or c.name like @p' + args.length + ')';
            args.push('%' + title + '%');
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

        const tables = `spu a 
        join spuBasic b on a.id=b.spuId
        left join brand c on b.brandId=c.id
        left join category c1 on a.cateId=c1.id
        left join category c2 on a.subCateId=c2.id
        left join category c3 on a.subSubCateId=c3.id
        left join spuType t1 on a.type=t1.id
        left join spuType t2 on a.subType=t2.id
        left join (select min(price) as price,max(price) as maxPrice,spuId from sku group by spuId) d on a.id=d.spuId`;

        return Promise.all([
            this.connection.query(
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
                from ${tables}
                where ${where} limit ${start},${pageSize}`,
                args
            ),
            this.connection.query(`select count(1) as total from ${tables} where ${where}`)
                .then(rows => rows[0].total)
        ]);
    }

    async getSpuById(id) {
        const rows = await this.connection.query(
            `select 
                a.id,a.title,a.sales,a.cateId,a.subCateId,a.subSubCateId,a.type,a.subType,a.sellerId,a.searchTags,a.comments,a.status,
                b.subtitle,b.brandId,b.barcode,b.company,b.pictures,b.video,b.specOnTitle,b.minBuyNum,b.maxBuyNum,b.skuPropKey0,b.skuPropKey1,b.skuPropKey2,b.skuPropKey3,b.skuPropKey4,b.props,
                c.detailVideo,c.content 
            from spu a 
                left join spuBasic b on a.id=b.spuId
                left join spuDetail c on a.id=c.spuId
            where a.id=@p0 and a.status!=0`,
            [id]
        );
        return rows[0];
    }

    async getBasicInfoById(id) {
        const rows = await this.connection.query(
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
        return rows[0];
    }

    async getDetailById(spuId) {
        const rows = await this.connection.query(
            'select detailVideo,content from spuDetail where spuId=@p0', [spuId]
        );
        return rows[0];
    }

    async addSpu({
        title,
        cateId,
        subCateId,
        subSubCateId,
        type,
        subType,
        sellerId,
        searchTags,
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
        const { connection } = this;
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
            searchTags,
            sortWeight: 0,
            comments: 0,
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

        return res;
    }

    /**
     * 修改商品信息
     * @param {Object} spu 商品信息
     */
    async updateSpu(data) {
        await this.updateMainInfo(data);
        await this.updateBasicInfo(Object.assign(data, {
            spuId: data.id,
        }));
        await this.updateDetail({
            content: data.content,
            detailVideo: data.detailVideo,
            spuId: data.id,
        });
        return { success: true, code: 0 };
    }

    updateMainInfo({
        id,
        title,
        searchTags,
        modifyer,
    }) {
        return this.connection.update('spu', {
            title,
            searchTags,
            modifyer,
            modifyDt: new Date()
        }, { id });
    }

    updateBasicInfo({
        spuId,
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
    }) {
        return this.connection.update('spuBasic', {
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
        }, { spuId });
    }

    async updateDetail({ spuId, content, detailVideo }) {
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
            await this.connection.update('spuDetail', detailInfo, { spuId });
        }
    }

    /**
     * SPU商品上架
     * @param {number} spuId 商品ID
     */
    async shelveSpu(spuId) {
        const rows = await this.connection.query('select status from spu where id=@p0', [spuId]);
        if (!rows[0]) {
            throw new Error('商品不存在!');
        } else if (rows[0].status == 0) {
            throw new Error('商品已删除!');
        }
        return this.updateStatus(spuId, 1);
    }

    /**
     * SPU商品下架
     * @param {*} spuId 商品ID
     */
    async pullSpuFromShelves(spuId) {
        const rows = await this.connection.query('select status from spu where id=@p0', [spuId]);
        if (!rows[0]) {
            throw new Error('商品不存在!');

        } else if (rows[0].status != 1) {
            throw new Error('商品状态错误!');
        }
        return this.updateStatus(spuId, 3);
    }

    updateStatus(spuId, status) {
        return this.connection.update("spu", { status }, { id: spuId });
    }
}

module.exports = ProductDao;