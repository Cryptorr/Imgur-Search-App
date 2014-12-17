//Imgur image schema

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ImageSchema   = new Schema({
  id: String,
	name: String,
  meta: {
    upvotes: Number
  }
});

module.exports = mongoose.model('Image', ImageSchema);
