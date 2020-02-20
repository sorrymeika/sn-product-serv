const { Service } = require('sonorpc');
const { PARAM_ERROR } = require('../constants/error');

class CategoryService extends Service {
    async listCateByPid(pid) {
        if (typeof pid !== "number") {
            return PARAM_ERROR;
        }
        const rows = await this.app.dao.category.getCatesByPid(pid);
        return {
            success: true,
            data: rows
        };
    }

    async addCate({ name, pid, level, creator }) {
        if (typeof pid !== "number" || !name || !level) {
            return PARAM_ERROR;
        }
        const res = await this.app.dao.category.addCate({ name, pid, level, creator });
        return { success: !!res.insertId, id: res.insertId };
    }

    async updateCate({ name, id, modifyer }) {
        if (typeof id !== "number" || !name) {
            return PARAM_ERROR;
        }
        const res = await this.app.dao.category.updateCate({
            id,
            name,
            modifyer
        });
        return { success: true, data: res };
    }

    async getSpuPropDefinitions(categoryId) {
        if (typeof categoryId !== "number") {
            return PARAM_ERROR;
        }
        const rows = this.app.dao.category.getSpuPropDefinitions(categoryId);
        return { success: true, code: 0, data: rows };
    }

    async getSpuPropFields(categoryId) {
        if (typeof categoryId !== "number") {
            return PARAM_ERROR;
        }
        const rows = this.app.dao.category.getSpuPropFields(categoryId);
        return { success: true, code: 0, data: rows };
    }

    async addSpuPropDefinition({ categoryId, type, inputType, label, field, rules, inputProps, options }) {
        if (typeof categoryId !== "number") {
            return PARAM_ERROR;
        }
        const res = this.app.dao.category.addSpuPropDefinition({
            categoryId,
            type,
            inputType,
            label,
            field,
            rules,
            inputProps,
            options,
            status: 1
        });
        return { success: !!res.insertId, id: res.insertId };
    }

    async updateSpuPropDefinition(data) {
        if (typeof data.categoryId !== "number") {
            return PARAM_ERROR;
        }
        await this.app.dao.category.updateSpuPropDefinition('spuPropDefinition', data);
        return { success: true, code: 0 };
    }
}

module.exports = CategoryService;