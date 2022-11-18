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

    console.log(s)
    return s
}
app.post("/api/search", async (req, res) => {
    const searchQuery = formatSearch(req.body.checked)
    db.query(searchQuery, (err, results) => {
        if (err) return res.json(err)
        // console.log(results)
        return res.json(results)
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
