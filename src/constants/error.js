const PARAM_ERROR = { success: false, code: -140, message: '参数错误' };
const TOKEN_ERROR = { success: false, code: -320, message: 'token错误' };

const SKU_CODE_EXISTS_ERROR = { success: false, code: 12000, message: 'SKU编码已存在!' };

module.exports = {
    PARAM_ERROR,
    TOKEN_ERROR,
    SKU_CODE_EXISTS_ERROR
};