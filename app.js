const express = require('express');
const bodyParser = require('body-parser');
const Genre = require('./models/genre');
const Artist = require('./models/artist');
const Album = require('./models/album');
const Track = require('./models/track');
const Playlist = require('./models/playlist');
const Sequelize = require('sequelize');

const { Op } = Sequelize;
const app = express();
app.use(bodyParser.json());

Album.belongsTo(Artist, {
  foreignKey: 'ArtistId'
});

Artist.hasMany(Album, {
  foreignKey: 'ArtistId'
});

Track.belongsToMany(Playlist, {
  through: 'playlist_track',
  foreignKey: 'TrackId',
  timestamps: false
});

Playlist.belongsToMany(Track, {
  through: 'playlist_track',
  foreignKey: 'PlaylistId',
  timestamps: false
});

app.get('/api/genres', function(request, response) {
  let { q } = request.query;
  let filter = {};

  if (q) {
    filter = {
      where: {
        name: {
          [Op.like]: `${q}%`
        }
      }
    };
  }

  Genre.findAll(filter).then((genres) => {
    response.json(genres);
  });
});

app.get('/api/genres/:id', function(request, response) {
  let { id } = request.params;

  Genre
    .findByPk(id)
    .then((genre) => {
      if (genre) {
        response.json(genre);
      } else {
        response.status(404).send();
      }
    });
});

app.get('/api/playlists', function(request, response) {
  Playlist.findAll().then((playlists) => {
    response.json(playlists);
  });
});

app.get('/api/playlists/:id', function(request, response) {
  let { id } = request.params;

  Playlist
    .findByPk(id, {
      include: [Track]
    })
    .then((playlist) => {
      if (playlist) {
        response.json(playlist);
      } else {
        response.status(404).json({
          error: `Playlist ${id} not found`
        });
      }
    });
});

app.get('/api/tracks/:id', function(request, response) {
  let { id } = request.params;

  Track
    .findByPk(id, {
      include: [Playlist]
    })
    .then((track) => {
      if (track) {
        response.json(track);
      } else {
        response.status(404).json({
          error: `Track ${id} not found`
        });
      }
    });
});

app.get('/api/albums/:id', function(request, response) {
  let { id } = request.params;

  Album
    .findByPk(id, {
      include: [Artist]
    })
    .then((album) => {
      if (album) {
        response.json(album);
      } else {
        response.status(404).send();
      }
    });
});

app.get('/api/artists/:id', function(request, response) {
  let { id } = request.params;

  Artist
    .findByPk(id, {
      include: [Album]
    })
    .then((artist) => {
      if (artist) {
        response.json(artist);
      } else {
        response.status(404).send();
      }
    });
});

app.post('/api/genres', function(request, response) {
  Genre
    .create({
      name: request.body.name
    })
    .then((genre) => {
      response.json(genre);
    }, (error) => {
      response.status(422).json({
        errors: error.errors.map((error) => {
          return {
            attribute: error.path,
            message: error.message
          };
        })
      });
    });
});

// Another approach is to soft delete the playlist. This way you don't have to
// cascade delete the records in playlist_track and you preserve the data.
app.delete('/api/playlists/:id', function(request, response) {
  let { id } = request.params;

  Playlist
    .findByPk(id)
    .then((playlist) => {
      if (playlist) {
        return playlist.setTracks([]).then((a) => {
          return playlist.destroy();
        });
      } else {
        return Promise.reject();
      }
    })
    .then(() => {
      response.status(204).send();
    }, () => {
      response.status(404).send();
    });
});

// skip this since this is similar to the lab
app.patch('/api/genres/:id', function(request, response) {
  let { id } = request.params;

  Genre.update({
    name: request.body.name
  }, {
    where: { id }
  })
  .then((numberOfAffectedRows) => {
    // console.log({ numberOfAffectedRows });
    return Genre.findByPk(id);
  }, () => {
    response.status(404).send();
  })
  .then((genre) => {
    response.json(genre);
  });
});

app.listen(process.env.PORT || 8000);
