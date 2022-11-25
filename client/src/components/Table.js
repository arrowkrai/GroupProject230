import { useState } from "react"

function Table({ queryResult, handleDelete, handleShowUpdateForm }) {
    // if (!queryResult?.tableName) return <></>
    const tableName = queryResult.tableName
    queryResult = queryResult.results
    const tableHead = Object.keys(queryResult[0])

    return (
        <table className="table table-striped">
            <thead>
                <tr>
                    {tableHead.map((t, i) => (
                        <th key={i} scope="col">
                            {t}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {queryResult.map((q, i) => {
                    return (
                        <tr key={i}>
                            {Object.values(q).map((v, j) => {
                                if (Object.values(q).length - 1 === j && tableName !== "__MULTIPLE_TABLES") {
                                    return (
                                        <>
                                            <td key={j}>{v}</td>
                                            <td
                                                style={{ cursor: "pointer" }}
                                                className="text-primary"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    if (window.confirm("Are you sure you want to update?")) {
                                                        handleShowUpdateForm({ ...q, tableName })
                                                    }
                                                }}
                                            >
                                                Update
                                            </td>
                                            <td
                                                style={{ cursor: "pointer" }}
                                                className="text-danger"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    if (window.confirm("Are you sure you want to delete?")) {
                                                        handleDelete({ ...q, tableName })
                                                    }
                                                }}
                                            >
                                                Delete
                                            </td>
                                        </>
                                    )
                                }
                                return <td key={j}>{v}</td>
                            })}
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}

export default Table
