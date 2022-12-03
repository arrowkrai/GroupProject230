import express from "express"
import mysql from "mysql2"
import cors from "cors"

const app = express()

const databaseName = "test3"

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: databaseName,
})

app.use(express.json())
app.use(cors())

//All our DDL Queries, i.e creating our database table structure
app.post("/createTable", async(req, res) => {
    const DMLArray = []

    /* Order of table creation to avoid refernce errors (change order in DMLArray.push)
    Channel depends on Account
    Video depends on Channel
    Playlist depends on Channel & Video
    Comment depends on Channel & Video
    Subscribers depends on Channel

    Relationship tables depend on the above
    */

    const mkChannelTbl = "CREATE TABLE Channel(channel_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, account_id INT REFERENCES Account(account_id), channel_name VARCHAR(50), subscribers_count INT);"
    const mkVidTbl = "CREATE TABLE Video(video_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, Length TIME, title VARCHAR(63), description VARCHAR(255), views INT, likes INT, Is_short_style BOOLEAN, channel_id INT, FOREIGN KEY (channel_id) REFERENCES Channel(channel_id));"
    const mkVidCatTbl = "CREATE TABLE VideoCategory(Category VARCHAR(20), video_id INT REFERENCES Video(video_id), PRIMARY KEY (Category, video_id));"
    const mkVidPlayTbl = "CREATE TABLE VideoPlaylist(playlist_id INT REFERENCES Playlist(playlist_id), video_id INT REFERENCES Video(video_id), PRIMARY KEY (playlist_id, video_id));"
    const mkPlayTbl = "CREATE TABLE Playlist(playlist_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, playlist_name VARCHAR(50), channel_id INT, FOREIGN KEY (channel_id) REFERENCES Channel(channel_id));"
    const mkAccTbl = "CREATE TABLE Account(account_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, username VARCHAR(63), created_on DATE);"
    const mkCommentTbl = "CREATE TABLE Comment(comment_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, Likes INT, Dislikes INT, words VARCHAR(100), channel_id INT REFERENCES Channel(channel_id), video_id INT REFERENCES Video(video_id));"
    const mkCommentOnTbl = "CREATE TABLE Comment_on(commenter_id INT REFERENCES Comment(comment_id), commentee_id INT, PRIMARY KEY(commenter_id,commentee_id));"
    const mkSubTbl = "CREATE TABLE SubscribeTo(subscriber_id INT REFERENCES Channel(channel_id), subscribee_id INT REFERENCES Channel(channel_id), PRIMARY KEY(subscriber_id,subscribee_id));"

    DMLArray.push(mkAccTbl, mkChannelTbl, mkVidTbl, mkCommentTbl, mkSubTbl, mkPlayTbl, mkVidCatTbl, mkVidPlayTbl, mkCommentOnTbl);

    DMLArray.forEach((curQuery) => {
        db.query(curQuery, (err, result) => {
            if(err) throw err;
            console.log("Created Table")
        })
    })

    return res.json();
})

//Quick delete end point for testing, if tables still exist just call this endpoint again
app.post("/delTable", async(req, res) => {
    //Select all tables in current database
    const restrainedTables = [];

    db.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA='" + databaseName + "'", (err, result) => {
        if(err){
            console.log("Problem getting tables");
        }
        else{
            result.forEach((curQuery) => {
                db.query("DROP TABLE " + curQuery.TABLE_NAME + ";", (err, result) => {
                    if(err){
                        console.log("Could not drop " + curQuery.TABLE_NAME);
                        restrainedTables.push(curQuery.TABLE_NAME);
                    }
                    else{
                        console.log("Dropped " + curQuery.TABLE_NAME);
                    }
                })
            })
        
            return res.json();
        }
    })
    return res.json();
})

//DML Queries START

app.post("/makeAccount", async(req, res) => {

    //TODO: Replace values with req data, make account_id an account increment value
    //id is auto incremented
    var profile_pic = "0"

    var today = new Date();
    var created_on = String(today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate());
    created_on = "'" + created_on + "'"; //These extra quotes are needed to make SQL happy about strings

    if(req.query.profile_pic != null){ //if there is picture data
        profile_pic = req.query.profile_pic;
    }
    if(req.query.username == null){ //if there is no username we fail
        return res.json();
    }
    var username = "'" + req.query.username + "'"; //These extra quotes are needed to make SQL happy about strings


    const makeAccQuery = "INSERT INTO Account (profile_picture, username, created_on) VALUES (" + profile_pic + "," + username + "," + created_on + ");"
    
    db.query(makeAccQuery, (err, result) => {
        if(err) throw err;
        console.log("Created Account");
    })
    
    return res.json();
})

app.get("/seeAccount", async(req, res) => {

    if(req.query.id == null){ //no specific account
        var seeQuery = "SELECT * FROM Account;"
    }
    else { //specific account_id
        var id = req.query.id;
        var seeQuery = "SELECT * FROM Account WHERE account_id=" + id + ";"
    }

    db.query(seeQuery, (err, result) => {
        if(err) throw err;
        console.log(result);
        return res.json(result);
    })
})

app.post("/testQ", async(req, res) => {
    const seeQuery = "SELECT * FROM Account"
    db.query(seeQuery, (err, result) => {
        if(err) throw err;
        console.log(result);
        return res.json(result);
    })
})
//DML Queries END

//Display our database info
app.get("/", async (req, res) => {
    const tables = {}
    const columns = `SELECT * FROM information_schema.columns WHERE table_schema = '${databaseName}'`
    db.query(columns, (err, results) => {
        if (err) return res.json(err)

        for (const result of results) {
            if (tables[result.TABLE_NAME] === undefined) {
                tables[result.TABLE_NAME] = [
                    `${result.COLUMN_NAME}.${result.COLUMN_TYPE}.${
                        result.IS_NULLABLE === "YES" ? "OPTIONAL" : "REQUIRED"
                    }`,
                ]
            } else {
                tables[result.TABLE_NAME] = [
                    ...tables[result.TABLE_NAME],
                    `${result.COLUMN_NAME}.${result.COLUMN_TYPE}.${
                        result.IS_NULLABLE === "YES" ? "OPTIONAL" : "REQUIRED"
                    }`,
                ]
            }
        }
        // console.log(results)

        return res.json(tables)
    })
})

//Display database END

function formatSearch(data) {
    const tables = new Set()
    for (const d of data) {
        const textArr = d.split(".")
        if (!tables.has(textArr[0])) {
            tables.add(textArr[0])
        }
    }

    let s = "SELECT "
    for (let i = 0; i < data.length; i++) {
        if (i === data.length - 1) {
            s += data[i]
        } else {
            s += data[i] + ", "
        }
    }
    s += " FROM "

    const tablesArr = Array.from(tables)
    for (let i = 0; i < tablesArr.length; i++) {
        if (i === tablesArr.length - 1) {
            s += tablesArr[i]
        } else {
            s += tablesArr[i] + ", "
        }
    }

    s += ";"

    return s
}

function formatTableName(data) {
    const s = new Set()
    for (const tableName of data) {
        s.add(tableName.split(".")[0])
    }
    if (s.size >= 2) {
        return "__MULTIPLE_TABLES"
    } else return Array.from(s)[0]
}
app.post("/api/search", async (req, res) => {
    const searchQuery = formatSearch(req.body.checked)
    const tableName = formatTableName(req.body.checked)
    db.query(searchQuery, (err, results) => {
        if (err) return res.json(err)
        // console.log(results)
        return res.json({ results, tableName })
    })
})

function formatInsert(data) {
    let tableName = ""
    let colNames = []
    let values = []
    for (const [key, val] of Object.entries(data)) {
        if (tableName === "") tableName = key.split(".")[0]
        if (val !== "") {
            colNames.push(key.split(".")[1])
            values.push(val)
        }
    }

    let s = `INSERT INTO ${tableName} (`
    for (let i = 0; i < colNames.length; i++) {
        if (i === colNames.length - 1) {
            s += colNames[i] + ") "
        } else {
            s += colNames[i] + ", "
        }
    }

    s += "VALUES ("
    for (let i = 0; i < values.length; i++) {
        if (i === values.length - 1) {
            s += `'${values[i]}'` + ")"
        } else {
            s += `'${values[i]}'` + ","
        }
    }

    s += ";"

    return s
}

app.post("/api/insert", async (req, res) => {
    const insertQuery = formatInsert(req.body)
    db.query(insertQuery, (err, results) => {
        if (err) return res.json(err.sqlMessage)
        return res.json("SUCCESS")
    })
})

function formatDelete(data) {
    let s = "DELETE FROM "
    s += data?.tableName
    delete data?.tableName
    s += " WHERE "
    for (const [key, val] of Object.entries(data)) {
        s += key + "=" + `'${val}'`
        s += " AND "
    }
    s = s.slice(0, -5)
    s += ";"
    return s
}

app.post("/api/delete", async (req, res) => {
    const deleteQuery = formatDelete(req.body)
    db.query(deleteQuery, (err, results) => {
        if (err) return res.json(err.sqlMessage)
        return res.json("SUCCESS")
    })
})

function formatUpdate(data) {
    let s = "UPDATE "
    let tableName = ""
    const inputs = data.inputs
    const oldInputs = data.oldInputs
    for (const [key, val] of Object.entries(inputs)) {
        if (tableName === "") tableName += key.split(".")[0]
        if (val === null) {
            delete inputs[key]
        }
    }
    for (const [key, val] of Object.entries(oldInputs)) {
        if (tableName === "") tableName += key.split(".")[0]
        if (val === null) {
            delete oldInputs[key]
        }
    }

    s += tableName
    s += " SET "

    for (const [key, val] of Object.entries(inputs)) {
        s += key + "=" + `'${val}'`
        s += ", "
    }
    s = s.slice(0, -2)
    s += " WHERE "
    for (const [key, val] of Object.entries(oldInputs)) {
        s += key + "=" + `'${val}'`
        s += " AND "
    }
    s = s.slice(0, -5)
    s += ";"
    return s
}

app.post("/api/update", async (req, res) => {
    const updateQuery = formatUpdate(req.body)
    db.query(updateQuery, (err, results) => {
        if (err) return res.json(err.sqlMessage)
        return res.json("SUCCESS")
    })
})

app.listen(8888, () => {
    db.ping((err) => {
        if (err) {
            console.log("Connection Error!")
            console.log("Have you started Apache and MySQL on XAMPP?")
            console.log(`Have you created a database in phpMyAdmin with the name: ${databaseName}?`)
        } else {
            console.log("Connection Success!")
        }
    })
})
