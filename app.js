const express = require('express');
const bodyParser = require('body-parser');
const Genre = require('./models/genre');
const Artist = require('./models/artist');
const Album = require('./models/album');
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
        response.status(404).json({
          error: `Genre ${id} not found`
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
        response.status(404).json({
          error: `Album ${id} not found`
        });
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
        response.status(404).json({
          error: `Artist ${id} not found`
        });
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

app.listen(process.env.PORT || 8000);
