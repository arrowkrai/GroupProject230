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
                tables[result.TABLE_NAME] = [result.COLUMN_NAME]
            } else {
                tables[result.TABLE_NAME] = [...tables[result.TABLE_NAME], result.COLUMN_NAME]
            }
        }

        return res.json(tables)
    })
})

function formatSearch(data) {
    const tables = new Set()
    // for (const d of data) {
    //     const textArr = d.split(".")
    //     // console.log("textArr[0]")
    //     // console.log(textArr[0])
    //
    //     if (tables[textArr[0]] === undefined) {
    //         tables[textArr[0]] = [textArr[1]]
    //     } else {
    //         tables[textArr[0]] = [...tables[textArr[0]], textArr[1]]
    //     }
    // }
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
        console.log(results)
        return res.json(results)
        // return res.json(tables)
    })

    // --------------------------------------------------------------
    // const tables = {}
    // const columns = `SELECT * FROM information_schema.columns WHERE table_schema = '${databaseName}'`
    // db.query(columns, (err, results) => {
    //     if (err) return res.json(err)
    //
    //     for (const result of results) {
    //         if (tables[result.TABLE_NAME] === undefined) {
    //             tables[result.TABLE_NAME] = [result.COLUMN_NAME]
    //         } else {
    //             tables[result.TABLE_NAME] = [...tables[result.TABLE_NAME], result.COLUMN_NAME]
    //         }
    //     }
    //
    //     return res.json(tables)
    // })
    // --------------------------------------------------------------
})

app.listen(8888, () => {
    console.log("Connection Success!")
})
