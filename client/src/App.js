import { useState, useEffect } from "react"
import axios from "axios"
import Checkboxes from "./components/Checkboxes"
import Table from "./components/Table"

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
                label: v,
            })
        }
        tmp["children"] = tmpLst
        result.push(tmp)
        tmp = {}
        tmpLst = []
    }
    return result
}

function App() {
    const [tables, setTables] = useState([])
    const [tableChecked, setTableChecked] = useState({ checked: [] })
    const [queryResult, setQueryResult] = useState([])

    const handleSearch = (e) => {
        e.preventDefault()
        const fetchQueryResult = async () => {
            try {
                if (tableChecked.checked.length === 0) {
                    // TODO: SHOW ERROR
                    // USER PRESSED SEARCH BUT DIDNT SELECT ANY TABLES
                } else {
                    const res = await axios.post("http://localhost:8888/api/search", tableChecked)
                    setQueryResult(res.data)
                }
            } catch (err) {
                console.log(err)
            }
        }
        fetchQueryResult()
    }

    useEffect(() => {
        const fetchColumns = async () => {
            try {
                const res = await axios.get("http://localhost:8888")
                formatTables(res.data)
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
                    </>
                ) : (
                    <p>Loading tables from database...</p>
                )}
            </div>
            <div className="">
                {queryResult.length > 0 ? (
                    <Table queryResult={queryResult} />
                ) : (
                    <p className="text-secondary m-3">Search tables</p>
                )}
            </div>
            {/*{<Checkboxes tables={tst} />}*/}
            {/*{tables.forEach((c) => console.log(JSON.stringify(c)))}*/}

            {/*<section className="app__getInsert">*/}
            {/*    {Object.keys(tables).map((table, i) => (*/}
            {/*        <div className="app__table" key={i}>*/}
            {/*            {tables[table].map((col, j) => (*/}
            {/*                <div className="app__col" key={j}>*/}
            {/*                    {col}*/}
            {/*                </div>*/}
            {/*            ))}*/}
            {/*        </div>*/}
            {/*    ))}*/}
            {/*</section>*/}
        </div>
    )
}

export default App
