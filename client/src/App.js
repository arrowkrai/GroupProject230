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
    const [initialFormData, setInitialFormData] = useState({})
    const [isUserUpdate, setIsUserUpdate] = useState(false)
    const [custQuery, setcustQuery] = useState("")

    const createTables = async () => {
        try {
            await axios.post("http://localhost:8888/createTable")
            window.location.reload()
        } catch (err) {
            console.log(err)
        }
    }

    const delTables = async () => {
        try {
            await axios.post("http://localhost:8888/delTable")
            if (tables.length > 0) {
                //First sweep will miss forgien key constraints
                await axios.post("http://localhost:8888/delTable")
            }
            window.location.reload()
        } catch (err) {
            console.log(err)
        }
    }

    const DMLQuery = async (endpoint) => {
        try {
            const res = await axios.post("http://localhost:8888/" + endpoint, { custQuery: custQuery })
            if (res.data.hasOwnProperty("results")) {
                setInsertTableName("")
                setStatusMessage("Successfully Ran Query!")
                setQueryResult(res.data)
            } else {
                setStatusMessage(`Error: ${res.data}`)
            }
        } catch (err) {
            console.log(err)
        }
    }

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
        setIsUserUpdate(false)
        setInitialFormData({})
        if (tableChecked.checked.length === 0) {
            setStatusMessage(`You must select at least 1 table to search.`)
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
            setStatusMessage(`You must select 1 table to insert into. You have selected ${tableNames.size} tables.`)
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

    const handleDelete = (data) => {
        setStatusMessage("")
        const fetchDeleteResult = async () => {
            try {
                const res = await axios.post("http://localhost:8888/api/delete", data)
                if (res.data === "SUCCESS") {
                    if (tableChecked.checked.length !== 0) await fetchQueryResult()
                    setInsertTableName("")
                    setStatusMessage("Successfully Deleted Row!")
                } else {
                    setStatusMessage(`Error Deleting Row: ${res.data}`)
                }
            } catch (err) {
                console.log(err)
            }
        }
        fetchDeleteResult()
    }

    const handleShowUpdateForm = (data) => {
        setStatusMessage("")
        setIsUserUpdate(true)
        setInsertTableName(data?.tableName)
        delete data?.tableName
        setInitialFormData(data)
    }

    const handleUpdate = (data) => {
        setStatusMessage("")
        const fetchUpdateResult = async () => {
            try {
                const res = await axios.post("http://localhost:8888/api/update", data)
                if (res.data === "SUCCESS") {
                    if (tableChecked.checked.length !== 0) await fetchQueryResult()
                    setInsertTableName("")
                    setStatusMessage("Successfully Updated Row!")
                } else {
                    setStatusMessage(`Error Updated Row: ${res.data}`)
                }
            } catch (err) {
                console.log(err)
            }
        }
        fetchUpdateResult()
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

                        <div className="m-3">
                            <textarea
                                className=""
                                style={{ height: 100 }}
                                placeholder="Enter SQL query..."
                                value={custQuery}
                                onChange={(e) => {
                                    e.preventDefault()
                                    setcustQuery(e.target.value)
                                }}
                            />
                            <button onClick={() => DMLQuery("testQ")} type="button" className="btn btn-primary btn-sm">
                                Submit SQL Query
                            </button>
                        </div>

                        <button
                            onClick={() => DMLQuery("loadData")}
                            type="button"
                            className="btn btn-primary btn-sm m-3"
                        >
                            Load Dummy Data
                        </button>

                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                if (window.confirm("Are you sure you want to delete all tables?")) {
                                    delTables()
                                }
                            }}
                            type="button"
                            className="btn delBtn btn-primary btn-sm m-3"
                        >
                            Delete Tables
                        </button>
                    </>
                ) : (
                    <button
                        onClick={createTables}
                        type="button"
                        className="btn createBtn btn-primary btn-sm m-3 ms-0 mt-0"
                    >
                        Create Tables
                    </button>
                )}
            </div>
            <div className="w-100">
                {statusMessage !== "" && (
                    <div>
                        {!statusMessage.includes("Successfully") ? (
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
                        <Form
                            tables={tables}
                            insertTableName={insertTableName}
                            handleInsert={handleInsert}
                            initialFormData={initialFormData}
                            setInitialFormData={setInitialFormData}
                            isUserUpdate={isUserUpdate}
                            handleUpdate={handleUpdate}
                        />
                    </div>
                ) : (
                    <div>
                        {queryResult?.results?.length > 0 ? (
                            <Table
                                queryResult={queryResult}
                                handleDelete={handleDelete}
                                tableChecked={tableChecked}
                                handleShowUpdateForm={handleShowUpdateForm}
                            />
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
