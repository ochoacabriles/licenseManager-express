const https = require('https')
const sendUpdates = require('./sendUpdates')
require('dotenv').config()

var getUpdates = {} = module.exports

getUpdates.update = (orderId, callback) => {

    const URL = 'https://' + process.env.API_KEY + ':' + process.env.API_PASSWORD + '@' +
            process.env.STORE_URL + orderId + '.json?fields=order_number,line_items,email'
    getDbUpdates(URL, callback)
    
}

function getDbUpdates(URL, callback) {
    https.get(URL, (res) => {
        var receivedData = []
        res.on('data', (chunk) => {
            receivedData.push(chunk)
        }).on('end', () => {
            var buffer = Buffer.concat(receivedData)
            var stringData = buffer.toString()
            var order = JSON.parse(stringData)
            if ('orders' in order) {
                var messages = []
                var length = order.orders.length
                order.orders.forEach( (order, i) => {
                    uploadData(order, false, (message) => {
                        if (message != 'ok')
                            messages.push(message)
                    })
                    if (i == length - 1) {
                        callback(String(messages.length))
                    }
                })
            } else {
                if ('order' in order) {
                    uploadData(order.order, true, callback)
                } else {
                    callback('invalidOrder')
                }
            }

        })
    })
}

function uploadData(order, flag, callback) {
    var licenses = 0
    if ('line_items' in order) {
        order.line_items.forEach( (item) => {
            if ( item.sku == process.env.ITEM_SKU1 || item.sku == process.env.ITEM_SKU2) {
                licenses += item.quantity
            }
        })
        var toUpdate = {
            $set : {
                orderNumber: order.order_number,
                email: order.email,
                licenses: licenses,
            }
        }
        sendUpdates.uploadLicense(toUpdate, flag, callback)
    } else {
        callback('invalidOrder')
    }
}

function backupUpdate(time) {
    var timer = new Date()
    timer.setHours(timer.getHours() - time)
    var date = timer.toISOString()

    const URL = 'https://' + process.env.API_KEY + ':' + process.env.API_PASSWORD + '@' +
        process.env.API_URL + '?created_at_min=' + date + '&fields=order_number,line_items,email'
    getDbUpdates(URL, (message) => {
        console.log('Sincronización de la base de datos completada con %s errores ', message)
    })
}

backupUpdate(48)
setInterval ( function() {
    backupUpdate(6)
}, 21600000 )