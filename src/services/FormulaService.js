const { Service } = require('sonorpc');

class FormulaService extends Service {
    async listFormula({ id, sellerId, name, pageIndex, pageSize }) {
        const args = [];
        const start = Math.max(0, pageIndex - 1) * pageSize;
        let where = '1=1';

        if (id) {
            where += ' and id=@p' + args.length;
            args.push(id);
        }

        if (sellerId != null) {
            where += ' and sellerId=@p' + args.length;
            args.push(sellerId);
        }

        if (name) {
            where += ' and name like CONCAT(\'%\',@p' + (args.length) + ',\'%\')';
            args.push(name);
        }

        const rows = await this.app.mysql.query(
            `select id,name,tagIds,sellerId,cates,types,keywords,brandName,minSales,maxSales,minPrice,maxPrice from formula where ${where} limit ${start},${pageSize}`,
            args
        );

        const cateIds = [];
        const typeIds = [];

        for (let i = 0; i < rows.length; i++) {
            const { cates, types } = rows[i];
            (cates || '').split(',')
                .map((cateStr) => {
                    const [cateId, subCateId, subSubCateId] = cateStr.split('-').map(Number);
                    if (subSubCateId)
                        cateIds.push(subSubCateId);
                    if (subCateId)
                        cateIds.push(subCateId);
                    if (cateId)
                        cateIds.push(cateId);
                });
            (types || '').split(',')
                .map((typeStr) => {
                    const [type, subType] = typeStr.split('-').map(Number);
                    if (subType)
                        typeIds.push(subType);
                    if (type)
                        typeIds.push(type);
                });
        }

        const [categoryRows, typeRows] = await Promise.all([
            cateIds.length ? this.app.mysql.query(`select id,name from category where id in (${cateIds.join(',')})`) : [],
            typeIds.length ? this.app.mysql.query(`select id,name from spuType where id in (${typeIds.join(',')})`) : []
        ]);

        const tmp = {};
        for (let i = 0; i < rows.length; i++) {
            const { cates, types } = rows[i];
            rows[i].cateNames = [];
            rows[i].catesArray = [];

            rows[i].typeNames = [];
            rows[i].typesArray = [];

            (cates || '').split(',')
                .map((cateStr) => {
                    const [cateId, subCateId, subSubCateId] = cateStr.split('-').map(Number);
                    const cateName = (categoryRows.find(row => row.id == cateId) || tmp).name;
                    const subCateName = (categoryRows.find(row => row.id == subCateId) || tmp).name;
                    const subSubCateName = (categoryRows.find(row => row.id == subSubCateId) || tmp).name;

                    rows[i].cateNames.push([cateName, subCateName, subSubCateName].filter(name => !!name).join('/'));
                    rows[i].catesArray.push({
                        cateId,
                        cateName,
                        subCateId,
                        subCateName,
                        subSubCateId,
                        subSubCateName
                    });
                });

            (types || '').split(',')
                .map((typeStr) => {
                    const [type, subType] = typeStr.split('-').map(Number);
                    const typeName = (typeRows.find(row => row.id == type) || tmp).name;
                    const subTypeName = (typeRows.find(row => row.id == subType) || tmp).name;

                    rows[i].typeNames.push([typeName, subTypeName].filter(name => !!name).join('/'));
                    rows[i].typesArray.push({
                        type,
                        typeName,
                        subType,
                        subTypeName,
                    });
                });
        }

        return { success: true, code: 0, data: rows };
    }

    async getFormulaById(id) {
        const rows = await this.app.mysql.query('select id,name,tagIds,sellerId,cates,types,keywords,brandName,minSales,maxSales,minPrice,maxPrice from formula where id=@p0', [id]);
        return { success: true, code: 0, data: rows && rows[0] };
    }

    async addFormula({
        name,
        tagIds,
        sellerId,
        cates,
        types,
        keywords,
        brandName,
        minSales,
        maxSales,
        minPrice,
        maxPrice
    }) {
        const res = await this.app.mysql.insert('formula', {
            name,
            tagIds,
            sellerId,
            cates,
            types,
            keywords,
            brandName,
            minSales,
            maxSales,
            minPrice,
            maxPrice
        });

        return { success: !!res.insertId, id: res.insertId };
    }

    async updateFormula({
        id,
        name,
        tagIds,
        sellerId,
        cates,
        types,
        keywords,
        brandName,
        minSales,
        maxSales,
        minPrice,
        maxPrice
    }) {
        const res = await this.app.mysql.update(`formula`, {
            name,
            tagIds,
            sellerId,
            cates,
            types,
            keywords,
            brandName,
            minSales,
            maxSales,
            minPrice,
            maxPrice
        }, { id });

        return { success: !!res.affectedRows, data: res };
    }
}

module.exports = FormulaService;