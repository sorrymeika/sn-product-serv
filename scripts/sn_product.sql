--# mysql -u root -p
--# Enter password: 12345Qwert

-- 创建用户
create user 'dev'@'localhost' identified by '12345Qwert';

-- 设置用户密码等级
ALTER USER 'dev'@'localhost' IDENTIFIED WITH mysql_native_password BY '12345Qwert';
FLUSH PRIVILEGES;

-- 查看用户
SELECT User, Host FROM mysql.user;

-- 查看用户权限
show grants for 'dev'@'localhost';


-- 展示所有数据库
show databases;

-- 创建数据库
create database if not exists sn_product;

-- 分配权限
grant ALL on sn_product.* to 'dev'@'localhost';

-- 使用数据库
use sn_product;


-- 展示所有表
-- show tables;

-- 商品系统类目
create table category (
    id int(9) primary key auto_increment,
    name varchar(30),
    pid int(9),
    level int(1), -- 最大三级
    creator varchar(30), -- 创建人
    createDt timestamp, -- 创建时间
    modifyer varchar(30), -- 修改人
    modifyDt timestamp -- 修改时间
);

-- spu属性定义表
create table spuPropDefinition (
    id int(9) primary key auto_increment,
    categoryId int(9), -- 三级类目
    type varchar(20), -- 数据类型 enum { 'string', 'int', 'float', 'boolean', 'timestamp' }
    inputType varchar(20), -- 输入框类型
    label varchar(20),
    field varchar(30),
    rules varchar(1024),
    inputProps varchar(1024), -- 控件属性
    options varchar(4096),
    status int(1) -- 状态 enum { 1: '有效', 0: '无效' }
);

-- 商品品牌
create table brand (
    id int(11) primary key auto_increment,
    name varchar(30) not null,
    logo varchar(20),
    sellerId int(10),
    countryId int(5),
    brandType int(1), -- 品牌类型: enum { 1: '普通', 2: '海淘' }
    note varchar(400),
    status int(1), -- 品牌状态: enum { 0: '审批不通过', 1: '审批通过', 2: '审批中' }
    hasBrandAuth int(1), -- 是否拥有有品牌授权(没有的不用填写下方属性)
    brandExp timestamp, -- 品牌授权到期日
    trademarkRegPic varchar(200), -- 商标注册证(普通品牌必填)(非海淘)
    brandAuthPic varchar(200), -- 品牌授权证明(普通品牌必填)(非海淘)
    inspectionReportPic varchar(200), -- 检验报告(非海淘)
    companyBLPic varchar(200), -- 生产企业营业执照(非海淘)
    prdLicencePic varchar(200), -- 生产许可证(非海淘)
    approvalLicencePic varchar(200), -- 批准许可证(非海淘)
    oemAgreementPic varchar(200), -- 代加工协议(非海淘)
    oosBrandAuthPic varchar(200), -- 品牌授权证明(海淘 overseas online shopping)
    oosPurchaseInvoicePic varchar(200), -- 正规进货凭证(海淘)
    creator varchar(30), -- 创建人
    createDt timestamp, -- 创建时间
    modifyer varchar(30), -- 修改人
    modifyDt timestamp, -- 修改时间
    approver varchar(30), -- 审批人
    approveDt timestamp -- 审批时间
);

-- spu类型，不同类型的spu商详页展示和购买方式不同，如: 虚拟商品->电子卡, 普通品->实物商品|图书, 药品->处方药|非处方药
create table spuType (
    id int(5) primary key,
    name varchar(30),
    pid int(5)
);

insert into spuType (id,name,pid) values (10,'虚拟商品',0);
insert into spuType (id,name,pid) values (1001,'电子卡',10);
insert into spuType (id,name,pid) values (20,'普通品',0);
insert into spuType (id,name,pid) values (2001,'普通实物',20);
insert into spuType (id,name,pid) values (30,'药品',0);
insert into spuType (id,name,pid) values (3001,'处方药',30);
insert into spuType (id,name,pid) values (3002,'非处方药',30);

-- spu表
create table spu (
    id int(12) primary key auto_increment,
    title varchar(200),
    searchTags varchar(100), -- 搜索标签，`,`号隔开
    sortWeight int(12), -- 排序权重，每用户每天点击+1，购买+100，好评+100，差评-100
    status int(2), -- 商品状态: enum { 0: '虚拟删除', 1: '上架', 2: '新建', 3: '下架' }
    approvalStatus int(1), -- 审核状态: enum { 0: '不通过', 1: '审核通过', 2: '审核中', 3: '未提交' }
    sales int(9), -- 销量
    comments int(9), -- 评论数
    minPrice decimal(12,2),
    maxPrice decimal(12,2),
    cateId int(9),
    subCateId int(9),
    subSubCateId int(9),
    type int(9),
    subType int(9),
    sellerId int(10),
    creator varchar(30), -- 创建人
    createDt timestamp, -- 创建时间
    modifyer varchar(30), -- 修改人
    modifyDt timestamp, -- 修改时间
    approver varchar(30), -- 审批人
    approveDt timestamp -- 审批时间
);

create table spuBasic (
    spuId int(12) primary key,
    subtitle varchar(100),
    brandId int(9),
    barcode varchar(50),
    company varchar(50),
    pictures varchar(200),
    video varchar(20),
    specOnTitle varchar(25), -- 规格型号
    minBuyNum int(5),
    maxBuyNum int(10),
    skuPropKey0 varchar(20),
    skuPropKey1 varchar(20),
    skuPropKey2 varchar(20),
    skuPropKey3 varchar(20),
    skuPropKey4 varchar(20),
    props json
);

create table spuDetail (
    spuId int(12) primary key,
    detailVideo varchar(20),
    content text
);

create table sku (
    id int(14) primary key auto_increment,
    spuId int(12),
    code varchar(20),
    status int(2), -- enum { 0: '虚拟删除', 1: '上架', 2: '新建', 3: '下架' }
    price decimal(12,2),
    kgWeight decimal(12,3),
    picture varchar(20),
    stockType int(1), -- enum { 0: '无限库存', 1: '从库存中心同步' }
    stock int(10), -- 同步后的库存
    syncStockDetailId int(14), -- 库存更新ID(最后一次从库存中心同步库存的Id，下次同步只要计算大于该Id的库存)
    skuPropVal0 varchar(100),
    skuPropVal1 varchar(100),
    skuPropVal2 varchar(100),
    skuPropVal3 varchar(100),
    skuPropVal4 varchar(100)
);

create table tag (
    id int(10) primary key auto_increment,
    name varchar(30),
    type int(1), -- 标签类型 enum { 1: '展示类标签', 2: '服务类标签', 3: '促销类标签', 4: '逻辑标签' }
    relId int(11),
    sellerId int(10),
    startDt timestamp,
    endDt timestamp,
    sort int(4),
    status int(1),
    props json
) auto_increment=10000;

insert into tag (id,name,type,props,sort) values (1,'正品保证',2,'{}',4);
insert into tag (id,name,type,props,sort) values (2,'24小时发货',2,'{}',3);
insert into tag (id,name,type,props,sort) values (3,'48小时发货',2,'{}',2);
insert into tag (id,name,type,props,sort) values (4,'7天无理由退换',2,'{}',1);

insert into tag (id,name,type,props) values (10,'限时抢购',3,'{}');

create table spuTagRel (
    id int(12) primary key auto_increment,
    spuId int(12),
    tagId int(12)
);

-- 选品规则表
create table formula (
    id int(10) primary key auto_increment,
    name varchar(30),
    sellerId int(10),
    tagIds varchar(100), -- 标签(多个,隔开)
    cates varchar(200), -- 系统分类(格式: `cateId-subCateId-subSubCateId-id0,cateId-subCateId-subSubCateId-id1`)
    types varchar(200), -- 商品类型(格式: `typeId-subTypeId-id0,typeId-subTypeId-id1`)
    keywords varchar(200), -- 关键字(多个,隔开)
    brandName varchar(100),
    minSales int(10), -- 最小销量
    maxSales int(10), -- 最大销量
    minPrice decimal(12,2), -- 最小价格
    maxPrice decimal(12,2) -- 最大价格
);

-- 商品前台类目
create table fdCategory (
    id int(9) primary key auto_increment,
    name varchar(30),
    picture varchar(20),
    pid int(9),
    sellerId int(10),
    sort int(5),
    level int(1), -- 从1级开始最大三级
    linkType int(1), -- 链接类型: enum { 0: '关键字搜索', 1: '链接跳转', 2: '选品规则搜索' }
    link varchar(400), -- 链接或关键字
    formulaId int(10), -- 选品规则ID
    creator varchar(30), -- 创建人
    createDt timestamp, -- 创建时间
    modifyer varchar(30), -- 修改人
    modifyDt timestamp -- 修改时间
);