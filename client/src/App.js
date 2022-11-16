import { useState, useEffect } from "react"
import axios from "axios"
import Checkboxes from "./components/Checkboxes"
import Table from "./components/Table"
import Form from "./components/Form"

function formatTables(data) {
    let result = []
    let tmp = {}
    let tmpLst = []
    for (let [key, val] of Object.entries(data)) {
        tmp["value"] = key
        tmp["label"] = key
        for (let v of val) {
            tmpLst.push({
                value: `${key}.${v}`,
                label: v.split(".")[0],
            })
        }
        tmp["children"] = tmpLst
        result.push(tmp)
        tmp = {}
        tmpLst = []
    }
    return result
}

function cleanTableChecked({ checked: data }) {
    const result = []
    for (const x of data) {
        const y = x.split(".")
        result.push(`${y[0]}.${y[1]}`)
    }
    return { checked: result }
}

function App() {
    const [tables, setTables] = useState([])
    const [tableChecked, setTableChecked] = useState({ checked: [] })
    const [queryResult, setQueryResult] = useState([])
    const [insertTableName, setInsertTableName] = useState("")
    const [statusMessage, setStatusMessage] = useState("")

    const fetchQueryResult = async () => {
        try {
            const res = await axios.post("http://localhost:8888/api/search", cleanTableChecked(tableChecked))
            setQueryResult(res.data)
        } catch (err) {
            console.log(err)
        }
    }

    const handleSearch = async (e) => {
        e.preventDefault()
        setInsertTableName("")
        setStatusMessage("")
        if (tableChecked.checked.length === 0) {
            // TODO: SHOW ERROR
            // USER PRESSED SEARCH BUT DIDNT SELECT ANY TABLES
        } else {
            await fetchQueryResult()
        }
    }

    const handleShowInsertForm = (e) => {
        e.preventDefault()
        setStatusMessage("")
        const tableNames = new Set()
        for (const colName of tableChecked.checked) {
            const cN = colName.split(".")[0]
            tableNames.add(cN)
        }
        if (tableNames.size === 0 || tableNames.size >= 2) {
            // TODO: SHOW ERROR
            // USER PRESSED SEARCH BUT DIDNT SELECT ANY TABLES
            // SHOW ERROR IF USER SELECTS MORE THAN ONE TABLE TO INSERT INTO
        } else {
            setInsertTableName(Array.from(tableNames)[0])
        }
    }

    const handleInsert = (data) => {
        setStatusMessage("")
        const fetchInsertResult = async () => {
            try {
                const res = await axios.post("http://localhost:8888/api/insert", data)

                if (res.data === "SUCCESS") {
                    if (tableChecked.checked.length !== 0) await fetchQueryResult()
                    setInsertTableName("")
                    setStatusMessage("Successfully Inserted Row!")
                } else {
                    setStatusMessage(`Error Inserting Row: ${res.data}`)
                }
            } catch (err) {
                console.log(err)
            }
        }
        fetchInsertResult()
    }

    useEffect(() => {
        const fetchColumns = async () => {
            try {
                const res = await axios.get("http://localhost:8888")
                setTables(formatTables(res.data))
            } catch (err) {
                console.log(err)
            }
        }
        fetchColumns()
    }, [])
    return (
        <div className="d-flex">
            <div style={{ minWidth: 300 }}>
                {tables.length > 0 ? (
                    <>
                        <div className="m-3">
                            <Checkboxes tables={tables} setTableChecked={setTableChecked} />
                        </div>
                        <button onClick={handleSearch} type="button" className="btn btn-primary btn-sm m-3 mt-0">
                            Search
                        </button>
                        <button
                            onClick={handleShowInsertForm}
                            type="button"
                            className="btn btn-primary btn-sm m-3 ms-0 mt-0"
                        >
                            Insert
                        </button>
                    </>
                ) : (
                    <p>Loading tables from database...</p>
                )}
            </div>
            <div className="w-100">
                {statusMessage !== "" && (
                    <div>
                        {statusMessage !== "Successfully Inserted Row!" ? (
                            <div className="alert alert-danger" role="alert">
                                {statusMessage}
                            </div>
                        ) : (
                            <div className="alert alert-success" role="alert">
                                {statusMessage}
                            </div>
                        )}
                    </div>
                )}
                {insertTableName !== "" ? (
                    <div>
                        <Form tables={tables} insertTableName={insertTableName} handleInsert={handleInsert} />
                    </div>
                ) : (
                    <div>
                        {queryResult.length > 0 ? (
                            <Table queryResult={queryResult} />
                        ) : (
                            <p className="text-secondary m-3">Search tables</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default App
