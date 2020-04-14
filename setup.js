const knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "./dev.sqlite3"
  },
  useNullAsDefault: true
});

knex.schema
  .hasTable("users")
  .then(exists => {
    if (!exists) {
      return knex.schema
        .createTable("users", table => {
          table.increments("id");
          table.string("name");
          table.string("username");
          table.string("password");
          table.string("confirmPassword");
          table.string("question");
          table.string("answer");
        })
        .then(() => console.info("Users table created"))
        .catch(error => console.error(error));
    }
  })
  .catch(error => console.error(error));

knex.schema
  .hasTable("playlists")
  .then(exists => {
    if (!exists) {
      return knex.schema
        .createTable("playlists", table => {
          table.increments("id");
          table.string("name");
          table.string("user_id");
          table.string("status");
        })
        .then(() => console.info("Users table created"))
        .catch(error => console.error(error));
    }
  })
  .catch(error => console.error(error));

knex.schema
  .hasTable("songs")
  .then(exists => {
    if (!exists) {
      return knex.schema
        .createTable("songs", table => {
          table.increments("id");
          table.integer("playlist_id");
          table.string("name");
          table.string("url");
        })
        .then(() => console.info("Songs table created"))
        .catch(error => console.error(error));
    }
  })
  .catch(error => console.error(error));
