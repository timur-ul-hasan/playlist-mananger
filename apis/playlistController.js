function playlists(req, res) {
  const { knex } = req.app.locals;
  knex
    .select("*")
    .from("playlists")
    .where("status", "public")
    .then((playlists) => {
      return res.json(playlists);
    });
}

function createPlaylist(req, res) {
  const { knex } = req.app.locals;
  const payload = req.body;
  knex("playlists")
    .insert({ ...payload, user_id: req.user.id })
    .then((response) => res.status(201).end())
    .catch((error) => res.status(500).json(error));
}

const editPlaylist = (req, res) => {
  const { knex } = req.app.locals;
  const payload = req.body;
  const { playlistId } = req.params;
  knex("playlists")
    .where("id", playlistId)
    .update({ ...payload })
    .then((response) => res.status(201).end())
    .catch((error) => res.status(500).json(error));
};

const deletePlaylist = (req, res) => {
  const { playlistId } = req.params;
  knex("playlists")
    .where("id", playlistId)
    .del()
    .then(() => {
      res.status(201).end();
    });
};

function playlistSongs(req, res) {
  const { playlistId } = req.params;
  const { knex } = req.app.locals;
  knex
    .select("songs.*", "playlists.user_id as user_id")
    .from("songs")
    .join("playlists", "songs.playlist_id", "=", "playlists.id")
    .where("playlists.id", playlistId)
    .then((songs) => {
      return knex
        .select("user_id", "name")
        .from("playlists")
        .where("id", playlistId)
        .first()
        .then((playlist) => {
          return res.json({
            songs,
            playlistId,
            playlistName: playlist.name,
            self: res.locals.authenticated
              ? playlist.user_id == res.locals.user.id
              : false,
          });
        });
    });
}

function addSong(req, res, next) {
  const { knex } = req.app.locals;
  const file = req.file;
  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }
  knex("songs")
    .insert({
      name: req.body.name,
      playlist_id: req.body.playlistId,
      url: file.path.substring(7),
    })
    .then((song) => {
      res.status(201).end();
    });
}

module.exports = {
  playlists,
  createPlaylist,
  editPlaylist,
  deletePlaylist,
  playlistSongs,
  addSong,
};
