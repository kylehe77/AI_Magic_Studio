const { Sequelize } = require('sequelize');

// 使用 SQLite，不需要用户名、密码、host
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: '/data/database.sqlite', // 你可以改成其他路径，比如 './data/mydb.sqlite'
  logging: true // 如果你想关闭SQL日志输出，可以设置为false
});

// 测试连接
sequelize.authenticate()
  .then(() => {
    console.log('✅ SQLite DB connected.');
  })
  .catch(err => {
    console.error('❌ SQLite DB connection failed:', err);
  });

module.exports = sequelize;
