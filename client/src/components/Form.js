import { useState } from "react"

function initializeInput(children) {
    const result = {}
    for (const child of children) {
        const c = child.value.split(".")
        result[c[0] + "." + c[1]] = ""
    }

    return result
}

function Form({ tables, insertTableName }) {
    let children = []
    for (const table of tables) {
        if (table.value === insertTableName) {
            children = table.children
        }
    }

    const [inputs, setInputs] = useState(initializeInput(children))

    const handleChange = (e) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    return (
        <>
            <h4 className="my-3">Insert Into: {insertTableName}</h4>
            <form>
                {children.map(({ value }, i) => {
                    const [tblName, colName, colType, isRequired] = value.split(".")
                    return (
                        <div key={i} className="row g-3 align-items-center mb-3">
                            <div className="col-auto">
                                <label htmlFor="test1" className="col-form-label">
                                    {colName}
                                    {isRequired === "REQUIRED" && (
                                        <span className="text-danger small ps-2">*REQUIRED</span>
                                    )}
                                </label>
                            </div>
                            <div className="col-auto">
                                <input
                                    type="text"
                                    id={tblName + "." + colName}
                                    name={tblName + "." + colName}
                                    className="form-control"
                                    onChange={handleChange}
                                    value={inputs[tblName + "." + colName] || ""}
                                />
                            </div>
                            <div className="col-auto">
                                <span className="form-text">{colType}</span>
                            </div>
                        </div>
                    )
                })}

                <div className="my-3">
                    <button className="btn btn-primary btn-sm" type="button">
                        Submit
                    </button>
                    <button className="btn btn-danger btn-sm ms-3" type="button">
                        Clear
                    </button>
                </div>
            </form>
        </>
    )
}

export default Form
