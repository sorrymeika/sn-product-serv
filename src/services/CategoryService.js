const { Service } = require('sonorpc');
const { PARAM_ERROR } = require('../constants/error');

class CategoryService extends Service {
    async listCateByPid(pid) {
        if (typeof pid !== "number") {
            return PARAM_ERROR;
        }

        const rows = await this.ctx.mysql.query('select id,name,level,creator from category where pid=@p0', [pid]);
        return { success: true, code: 0, data: rows };
    }

    async addCate({ name, pid, level, creator }) {
        if (typeof pid !== "number" || !name || !level) {
            return PARAM_ERROR;
        }

        const res = await this.ctx.mysql.insert('category', {
            name,
            pid,
            level,
            creator,
            createDt: new Date()
        });
        return { success: !!res.insertId, id: res.insertId };
    }

    async updateCate({ name, id, modifyer }) {
        if (typeof id !== "number" || !name) {
            return PARAM_ERROR;
        }

        const res = await this.ctx.mysql.query('update category set name={name},modifyer={modifyer},modifyDt={modifyDt} where id={id}', {
            id,
            name,
            modifyer,
            modifyDt: new Date()
        });
        return { success: true, data: res };
    }

    async getSpuPropDefinitions(categoryId, columns = 'least') {
        if (typeof categoryId !== "number") {
            return PARAM_ERROR;
        }

        let selectColumns;

        if (columns == 'least') {
            selectColumns = 'id,label,field';
        } else if (columns == '*' || columns == 'all') {
            selectColumns = '*';
        } else if (!Array.isArray(columns) || columns.some(columnName => !this.ctx.mysql.validateName(columnName))) {
            return PARAM_ERROR;
        } else {
            selectColumns = columns.join(',');
        }

        const rows = await this.ctx.mysql.query('select ' + selectColumns + ' from spuPropDefinition where status=1 and categoryId=@p0', [categoryId]);
        return { success: true, code: 0, data: rows };
    }

    async addSpuPropDefinition({ categoryId, type, inputType, label, field, rules, inputProps, options }) {
        if (typeof categoryId !== "number") {
            return PARAM_ERROR;
        }

        const res = await this.ctx.mysql.insert('spuPropDefinition', {
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

    async updateSpuPropDefinition({ id, type, inputType, label, field, rules, inputProps, options }) {
        if (typeof categoryId !== "number") {
            return PARAM_ERROR;
        }

        await this.ctx.mysql.update('spuPropDefinition', {
            type,
            inputType,
            label,
            field,
            rules,
            inputProps,
            options
        }, { id });
        return { success: true, code: 0 };
    }
}

module.exports = CategoryService;