var typeorm = require("typeorm")

let fs = require('fs')

async function getEntities() {
    let entities = []
    let files = fs.readdirSync(`${__dirname}/..`)
    for (let file of files) {
        if (!fs.existsSync(`${__dirname}/../${file}/entities`)) continue
        if (fs.lstatSync(`${__dirname}/../${file}`).isDirectory()) {
            let folderFiles = fs.readdirSync(`${__dirname}/../${file}/entities`)
            for (let folderFile of folderFiles) {
                if (folderFile.endsWith(".js")) {
                    let entity = require(`${__dirname}/../${file}/entities/${folderFile}`)
                    entities.push(entity)
                }
            }
        }
    }
    return entities
}

module.exports = async (settings) => {
    
        settings = {
            ...settings,
            db: {
                type: "sqlite",
                database: `${__dirname}/db.sqlite`,
                entities: [ ...(await getEntities()) ],
                logging: true,
                ...settings.db
            },
        }
    return {
        clientMixin: (client) => {
            client.db = new typeorm.DataSource(this.settings.db)
            client.db.initialize().then(() => {
                client.emmit('typeOrmReady')
            })
        },
        intents: 0
    }
}