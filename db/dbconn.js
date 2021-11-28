const mongoose = require('mongoose');

const uri = process.env.DATABASE_URI

mongoose.connect(uri, {
    useNewUrlParser: true,
})
.then(() => {
	console.log("Db connected")
})
.catch(err => console.log("Db error : ", err));

module.exports = mongoose;