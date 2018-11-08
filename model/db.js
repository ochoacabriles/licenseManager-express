var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

require('dotenv').config()

mongoose.connect(process.env.LOCAL_DB_URL);

var rigSchema = new Schema(
    {
        rigId: String,
        rigName: String
    }
)

var licenseSchema = new Schema(
    {
        orderNumber: String,
        email: String,
        licenses: Number,
        registeredRigs: [rigSchema]
    },
    {
        versionKey: false
    });
 
module.exports = mongoose.model('License', licenseSchema);