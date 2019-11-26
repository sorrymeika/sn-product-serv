const { Service } = require('sonorpc');

const ORDER_BY = {
    SALES_ASC: 1,
    SALES_DESC: 2,
    PRICE_ASC: 3,
    PRICE_DESC: 4,
    CREATE_DT_ASC: 5,
    COMMENTS_NUM_DESC: 6,
};


class SearchService extends Service {
    async searchByConditions({
        keywords,
        sellerIds,
        types,
        cates,
        brandName,
        minSales,
        maxSales,
        minPrice,
        maxPrice,
        orderBy,
        pageIndex,
        pageSize
    }) {
        const args = [];
        let where = 'a.status=1';
        const start = Math.max(0, pageIndex - 1) * pageSize;

        if (Array.isArray(sellerIds) && !sellerIds.some((id) => (typeof id === 'number'))) {
            where += ' and a.sellerId in (' + sellerIds.join(',') + ')';
        }

        if (keywords) {
            where += ' and (a.title like CONCAT(\'%\',@p' + args.length + ',\'%\') or b.subtitle like CONCAT(\'%\',@p' + args.length + ',\'%\')'
                + (brandName ? '' : ' or c.name like CONCAT(\'%\',@p' + args.length + ',\'%\')')
                + ')';
            args.push(keywords);
        }
        if (brandName) {
            where += ' and c.name like CONCAT(\'%\',@p' + args.length + ',\'%\')';
            args.push(brandName);
        }

        if (types && types.length) {
            let typesCondition = [];
            types.forEach(({ type, subType }) => {
                if (subType) {
                    typesCondition.push('a.subType=@p' + args.length);
                    args.push(subType);
                } else if (type) {
                    typesCondition.push('a.type=@p' + args.length);
                    args.push(type);
                }
            });
            if (typesCondition.length) {
                where += ' and (' + typesCondition.join(' or ') + ')';
            }
        }

        if (cates && cates.length) {
            let catesCondition = [];
            cates.forEach(({ cateId, subCateId, subSubCateId }) => {
                if (subSubCateId) {
                    catesCondition.push('a.subSubCateId=@p' + args.length);
                    args.push(subSubCateId);
                } else if (subCateId) {
                    catesCondition.push('a.subCateId=@p' + args.length);
                    args.push(subCateId);
                } else if (cateId) {
                    catesCondition.push('a.cateId=@p' + args.length);
                    args.push(cateId);
                }
            });
            if (catesCondition.length) {
                where += ' and (' + catesCondition.join(' or ') + ')';
            }
        }

        if (minSales) {
            where += ' and a.sales>=@p' + args.length;
            args.push(minSales);
        }

        if (maxSales) {
            where += ' and a.sales<=@p' + args.length;
            args.push(maxSales);
        }

        if (minPrice) {
            where += ' and d.maxPrice>=@p' + args.length;
            args.push(minPrice);
        }

        if (maxPrice) {
            where += ' and d.minPrice<=@p' + args.length;
            args.push(maxPrice);
        }

        let orderBySQL;

        if (orderBy == ORDER_BY.SALES_ASC) {
            orderBySQL = "a.sales asc";
        } else if (orderBy == ORDER_BY.SALES_DESC) {
            orderBySQL = "a.sales desc";
        } else if (orderBy == ORDER_BY.PRICE_ASC) {
            orderBySQL = "d.minPrice asc";
        } else if (orderBy == ORDER_BY.PRICE_DESC) {
            orderBySQL = "d.maxPrice desc";
        } else if (orderBy == ORDER_BY.CREATE_DT_ASC) {
            orderBySQL = "a.createDt desc";
        } else {
            orderBySQL = "a.sortWeight desc";
        }

        const rows = await this.ctx.mysql.query(
            `select 
                a.id,a.title,a.sales,a.cateId,a.subCateId,a.subSubCateId,a.type,a.subType,a.sellerId,a.status,a.comments,
                b.subtitle,b.brandId,b.barcode,b.company,b.pictures,b.video,b.specOnTitle,b.props,
                c.name as brandName,
                c1.name as cateName,
                c2.name as subCateName,
                c3.name as subSubCateName,
                t1.name as typeName,
                t2.name as subTypeName,
                d.minPrice,d.minPrice as price,d.maxPrice
                from spu a 
                    join spuBasic b on a.id=b.spuId
                    left join brand c on b.brandId=c.id
                    left join category c1 on a.cateId=c1.id
                    left join category c2 on a.subCateId=c2.id
                    left join category c3 on a.subSubCateId=c3.id
                    left join spuType t1 on a.type=t1.id
                    left join spuType t2 on a.subType=t2.id
                    left join (select max(price) as maxPrice,min(price) as minPrice,spuId from sku group by spuId) d on a.id=d.spuId
                where ` + where + 'order by ' + orderBySQL + ' limit ' + start + ',' + pageSize,
            args
        );

        return { success: true, code: 0, data: rows };
    }

    async searchByFormula(formulaId, pageIndex, pageSize) {
        const rows = await this.ctx.mysql.query('select id,name,tagIds,sellerId,cates,types,keywords,brandName,minSales,maxSales,minPrice,maxPrice from formula where id=@p0', [formulaId]);

        if (rows && rows.length) {
            const { cates, types, keywords, brandName, minSales, maxSales, minPrice, maxPrice } = rows[0];
            const cateArray = (cates || '').split(',')
                .map((cateStr) => {
                    const [cateId, subCateId, subSubCateId] = cateStr.split('-');
                    return {
                        cateId: Number(cateId),
                        subCateId: Number(subCateId),
                        subSubCateId: Number(subSubCateId),
                    };
                });
            const typeArray = (types || '').split(',')
                .map((typeStr) => {
                    const [type, subType] = typeStr.split('-');
                    return {
                        type: Number(type),
                        subType: Number(subType),
                    };
                });

            return this.searchByConditions({
                types: typeArray,
                cates: cateArray,
                keywords,
                brandName,
                minSales,
                maxSales,
                minPrice,
                maxPrice,
                pageIndex,
                pageSize
            });
        } else {
            return { success: true, code: 0, data: [] };
        }
    }
}

module.exports = SearchService;