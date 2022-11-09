import React from "react"
import CheckboxTree from "react-checkbox-tree"
import "react-checkbox-tree/lib/react-checkbox-tree.css"

class Checkboxes extends React.Component {
    state = {
        checked: [],
        expanded: [],
    }

    render() {
        return (
            <CheckboxTree
                icons={{
                    check: <span className="rct-icon rct-icon-check" />,
                    uncheck: <span className="rct-icon rct-icon-uncheck" />,
                    halfCheck: <span className="rct-icon rct-icon-half-check" />,
                    expandClose: <span className="rct-icon rct-icon-expand-close" />,
                    expandOpen: <span className="rct-icon rct-icon-expand-open" />,
                    expandAll: <span className="rct-icon rct-icon-expand-all" />,
                    collapseAll: <span className="rct-icon rct-icon-collapse-all" />,
                    parentClose: <span className="fa fa-table" />,
                    parentOpen: <span className="fa fa-table" />,
                    leaf: <span className="fa fa-columns" />,
                }}
                nodes={this.props.tables}
                checked={this.state.checked}
                expanded={this.state.expanded}
                // onCheck={(checked) => this.setState({ checked })}
                onCheck={(checked) => {
                    this.setState({ checked })
                    this.props.setTableChecked({ checked })
                }}
                onExpand={(expanded) => {
                    this.setState({ expanded })
                }}
            />
        )
    }
}

export default Checkboxes
