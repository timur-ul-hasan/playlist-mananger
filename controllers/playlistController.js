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

  res.render("playlist", {});
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
  playListPage
};
