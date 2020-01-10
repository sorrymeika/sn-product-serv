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

alter table spu add searchTags varchar(100);
alter table spu add sortWeight int(12);
alter table spu add comments int(10);

update spu set sortWeight=0;
update spu set comments=0;

-- 2019-12-20
alter table sku add syncStockDetailId int(14);
update sku set syncStockDetailId=0;

