function Table({ queryResult }) {
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
                            {Object.values(q).map((v, j) => (
                                <td key={j}>{v}</td>
                            ))}
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}

export default Table
