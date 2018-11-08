var License = require('../model/db')

var register = {}

register.check = (rigInformation, action, callback) => {
    var matchQuery = {'orderNumber': rigInformation.orderNumber, 'email': rigInformation.email}

    License.findOne( matchQuery, (err, doc) => {
        if (err) {
            console.error(err)
            callback('databaseError')
        } else {
            if (!doc) {
                callback('incorrectUser')
            } else {
                var rigIds = []
                var rigNames = []
                doc.registeredRigs.forEach( (rig) => {
                    rigIds.push(rig.rigId)
                    rigNames.push(rig.rigName)
                })
                if (rigIds.includes(rigInformation.rigId)) {
                    callback ('ok')                    
                } else {
                    if (rigNames.includes(rigInformation.rigName)) {
                        if (action == 'delete'){
                            deleteOneLicense(matchQuery, rigInformation.rigName,callback)    
                        } else {
                            callback('invalidRigName')
                        }
                    } else {
                        if (action == 'delete') {
                            if (rigInformation.operation == 'allRigs') {
                                deleteAllLicenses(matchQuery, callback)
                            } else {
                                callback('invalidRigName')
                            }                            
                        } else {
                            if (doc.licenses > rigIds.length) {
                                if( action == 'activate' ) {
                                    var rigId = rigInformation.rigId
                                    var rigName = rigInformation.rigName
                                    updateLicenses(matchQuery, rigId, rigName, callback)
                                } else if (action == 'check') {
                                    callback('notRegistered')
                                }
                            } else {
                                callback('noLicenses')
                            }
                        }
                    }
                }
            }
        }
    })    
}

function deleteOneLicense(matchQuery, rigName, callback) {
    License.update( matchQuery, { $pull: {'registeredRigs': { 'rigName': rigName}}}, (err, doc) => {
        if (err) {
            callback ('databaseError')
        } else {
            console.log('rigName: %s de la orden %s ha sido dado de baja', rigName, matchQuery.orderNumber)
            callback ('deletedRig')
        }                
    })
}

function deleteAllLicenses(matchQuery, callback) {
    License.update( matchQuery, { $set: {'registeredRigs': []}}, (err, doc) => {
        if (err) {
            callback('databaseError')
        } else {
            console.log('Todos los rigs de la orden %s han sido dados de baja', matchQuery.orderNumber)
            callback('allRigsDeleted')
        }
    })
}

function updateLicenses(matchQuery, rigId, rigName, callback) {
    var toAdd = { 'rigId': rigId, 'rigName': rigName}
    License.update( matchQuery, { $push: { 'registeredRigs': toAdd}}, (err, doc) => {
        if (err) {
            callback ('databaseError')
        }
        else {
            console.log('rigName: %s, rigId: %s registrado en la orden %s', rigName, rigId, matchQuery.orderNumber)
            callback ('ok')
        }                
    })
}

module.exports = register