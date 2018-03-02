const azure = require('azure-storage');

const tableService = azure.createTableService(
    process.env.AZURE_STORAGE_ACCOUNT,
    process.env.AZURE_STORAGE_ACCESS_KEY); // explicit

exports.storeData = function storeData(userData, callback) {
    const {name, location, email, smedia, ment} = userData;
    const tableName = 'participants';
    tableService.createTableIfNotExists(tableName, function (error, result, response) {
        if (!error) {
            // Table exists or created
            var entGen = azure.TableUtilities.entityGenerator;
            var task = {
                PartitionKey: entGen.String('userData'),
                RowKey: entGen.String(email),
                location: entGen.String(location),
                email: entGen.String(email),
                smedia: entGen.String(smedia),
                ment: entGen.String(ment),
                expertise: entGen.String('general')
            };
            tableService.insertEntity(tableName, task, function (error, result, response) {
                if (!error) {
                    callback();
                } else{
                    callback(error);
                }
            });
        } else {
            callback(error);
        }
    });
}