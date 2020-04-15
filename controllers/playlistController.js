function listAllPlaylist(req, res) {
  const { knex } = req.app.locals;
  knex
    .select("*")
    .from("playlists")
    .where("status", "public")
    .then(playlists => {
      return res.render("playlists", {
        playlists
      });
    });
}

function addPlaylistPage(req, res) {
  res.render("addPlaylist");
}

function addSongPage(req, res) {
  const { playlistId } = req.params;
  knex
    .select("*")
    .from("playlists")
    .where("id", playlistId)
    .then(playlist => {
      return res.render("add-song-page", {
        playlistId,
        playlist
      });
    });
}

function playListPage(req, res) {
  const { playlistId } = req.params;
  const { knex } = req.app.locals;
  knex
    .select("songs.*", "playlists.user_id as user_id")
    .from("songs")
    .join("playlists", "songs.playlist_id", "=", "playlists.id")
    .where("playlists.id", playlistId)
    .then(songs => {
      return knex
        .select("user_id")
        .from("playlists")
        .where("id", playlistId)
        .first()
        .then(playlist => {
          console.log(
            songs,
            playlist,
            res.locals.user,
            playlist.user_id == res.locals.user.id
          );

          return res.render("playlist", {
            songs,
            playlistId,
            self: playlist.user_id == res.locals.user.id
          });
        });
    });
}

function addSong(err, req, res, next) {
  if (err) {
    return res.render("add-song-page", {
      playlistId: req.body.playlistId,
      error: err
    });
  }
  return res.json(err);
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
      url: file.path.substring(7)
    })
    .then(song => {
      return res.redirect(`playlist/${req.body.playlistId}`);
    });
}

function addPlaylist(req, res) {
  res.render("addPlaylist");
}

function createPlaylist(req, res) {
  const { knex } = req.app.locals;
  const payload = req.body;
  knex("playlists")
    .insert({ ...payload, user_id: req.session.user.id })
    .then(response => res.redirect("/playlists"))
    .catch(error => res.status(500).json(error));
}

module.exports = {
  addPlaylist,
  listAllPlaylist,
  createPlaylist,
  addPlaylistPage,
  playListPage,
  addSong,
  addSongPage
};
