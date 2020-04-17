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
  const { knex } = req.app.locals;

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
        .select("user_id", "name")
        .from("playlists")
        .where("id", playlistId)
        .first()
        .then(playlist => {
          return res.render("playlist", {
            songs,
            playlistId,
            playlistName: playlist.name,
            self: res.locals.authenticated
              ? playlist.user_id == res.locals.user.id
              : false
          });
        });
    });
}

function addSong(req, res, next) {
  // console.log("here");
  // if (err) {
  //   return res.render("add-song-page", {
  //     playlistId: req.body.playlistId,
  //     error: err
  //   });
  //}
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
    .then(response => res.redirect("/profile"))
    .catch(error => res.status(500).json(error));
}
function editPlaylistPage(req, res) {
  const { knex } = req.app.locals;
  const { playlistId } = req.params;
  knex("playlists")
    .select("*")
    .where("id", playlistId)
    .first()
    .then(playlist =>
      res.render("edit-playlist", {
        public: playlist.status === "public",
        private: playlist.status === "private",
        playlist: playlist
      })
    )
    .catch(error => res.status(500).json(error));
}

const editPlaylist = (req, res) => {
  const { knex } = req.app.locals;
  const payload = req.body;
  const { playlistId } = req.params;
  knex("playlists")
    .where("id", playlistId)
    .update({ ...payload })
    .then(response => res.redirect("/profile"))
    .catch(error => res.status(500).json(error));
};

module.exports = {
  addPlaylist,
  listAllPlaylist,
  createPlaylist,
  addPlaylistPage,
  playListPage,
  addSong,
  addSongPage,
  editPlaylistPage,
  editPlaylist
};
