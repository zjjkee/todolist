const  Sequelize  = require('sequelize');       // 引入 sequelize
const sequelize = new Sequelize('postgres', 'postgres', 'Zj123789', {   //三个参数分别是 数据库、用户名、密码
    host: '127.0.0.1',               //数据库地址,默认本机
    port:5050,                    //端口号
    dialect: 'postgres',
    pool: {                         //连接池设置
        max: 5,
        min: 0,
        idle: 10000
    }
});

const Account = sequelize.define('account', {
    id: {
        type: Sequelize.STRING(32),
        primaryKey: true
    },
    account: {
        type: Sequelize.STRING(20)
    },
    password: {
        type: Sequelize.STRING(20)
    }
}, {
    timestamps: false,      // 默认创建createdAt和updatedAt字段,为false则不创建
    freezeTableName: true   // 默认创建表名为accounts,为true则为account
});

Account.sync({force: true}); 

// Account.create({
//     id: 'test',
//     account: '4619',
//     password: '4619'
// }).then(res => {
//     // 返回创建对象的实例
// }, err => {
//     console.log(err);
// });
