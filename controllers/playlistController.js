function listAllPlaylist(req, res) {
  const { knex } = req.app.locals;
  knex
    .select("*")
    .from("playlists")
    .then(playlists => {
      console.log(playlists);

      return res.render("playlists", {
        playlists
      });
    });
}

function addPlaylistPage(req, res) {
  res.render("addPlaylist");
}

function playListPage(req, res) {
  const { playlistId } = req.params;
  const { knex } = req.app.locals;
  knex
    .select("*")
    .from("songs")
    .where("playlist_id", playlistId)
    .then(songs => {
      return res.render("playlist", {
        songs,
        playlistId
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
      url: file.path.substring(7)
    })
    .then(song => {
      res.send(song);
    });
}

function addPlaylist(req, res) {
  res.render("addPlaylist");
}

function createPlaylist(req, res) {
  const { knex } = req.app.locals;
  const payload = req.body;
  knex("playlists")
    .insert(payload)
    .then(response => res.redirect("/playlists"))
    .catch(error => res.status(500).json(error));
}

module.exports = {
  listAllPlaylist,
  createPlaylist,
  addPlaylistPage,
  playListPage,
  addSong
};
