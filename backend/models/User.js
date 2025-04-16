const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: '/data/database.sqlite', // ✅ 如果你在 Render 上部署，推荐存这里
  logging: false
});

sequelize.authenticate()
  .then(() => console.log('✅ SQLite connected'))
  .catch((err) => console.error('❌ DB connection failed:', err));

module.exports = sequelize;
