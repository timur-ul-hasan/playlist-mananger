const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './dev.sqlite3'
  },
  useNullAsDefault: true
});


knex.schema.hasTable('users').then(exists => {
  if (!exists) {
    return knex.schema.createTable('users', table => {
      table.increments('id')
      table.string('username')
      table.string('password')
    })
    .then(() => console.info('Users table created'))
    .catch(error => console.error(error));
  } 
}).catch(error => console.error(error));