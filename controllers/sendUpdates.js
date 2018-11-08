var License = require('../model/db')

var sendUpdates = {}

sendUpdates.uploadLicense = (toUpdate, flag, callback) => {
    var query = {'orderNumber': toUpdate.$set.orderNumber}
    License.findOneAndUpdate( query, toUpdate, {upsert: true}, (err) => {
        if (err) {
            console.error(err)
            callback('notAvailable')
        }
        else {
            if( flag ) {
                console.log('Licencias actualizadas en la orden', toUpdate.$set.orderNumber)
            }
            callback('OK')
        }
    })
}

module.exports = sendUpdates