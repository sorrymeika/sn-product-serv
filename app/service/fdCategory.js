const { Service } = require('sonorpc');
const { PARAM_ERROR } = require('../constants/error');

class FdCategoryService extends Service {
    async getCatesBySellerId(sellerId) {
        if (typeof sellerId !== 'number') {
            return { ...PARAM_ERROR, message: '必须传入sellerId' };
        }
        const rows = await this.app.dao.fdCategory.getCatesBySellerId(sellerId);
        return { success: true, data: rows };
    }

    async getSubCatesTreeByPid(pid) {
        if (typeof pid !== 'number') {
            return { ...PARAM_ERROR, message: '必须传入pid' };
        }
        const fdCategoryDao = this.app.dao.fdCategory;
        const rows = await fdCategoryDao.getSubCatesByPid(pid);
        if (rows.length) {
            const ids = rows.map(row => row.id);
            const subSubCates = await fdCategoryDao.getSubSubCatesByPids(ids);
            rows.forEach((row) => {
                row.children = subSubCates.filter(subSubCate => subSubCate.pid === row.id);
            });
        }
        return { success: true, data: rows };
    }

    async add(data) {
        this.app.validate({
            level: { type: 'number', required: true },
            name: { type: 'string', required: true },
            picture: { type: 'string', required: false },
            pid: { type: 'number', required: true },
            sort: { type: 'number', required: true },
            sellerId: { type: 'number', required: true },
            linkType: { type: 'number', required: false },
            link: { type: 'string', required: false },
            formulaId: { type: 'number', required: false }
        }, data);
        const res = await this.app.dao.fdCategory.add(data);
        return { success: !!res.insertId, id: res.insertId };
    }

    async update(data) {
        this.app.validate({
            name: { type: 'string', required: true },
            id: { type: 'number', required: true },
            sort: { type: 'number', required: true },
            picture: { type: 'string', required: false },
            formulaId: { type: 'number', required: false },
            linkType: { type: 'number', required: false },
            link: { type: 'string', required: false },
        }, data);
        const res = await this.app.dao.fdCategory.add(data);
        return { success: true, data: res };
    }

    async deleteById(id) {
        const res = await this.app.dao.fdCategory.deleteById(id);
        return { success: true, data: res };
    }
}

module.exports = FdCategoryService;
