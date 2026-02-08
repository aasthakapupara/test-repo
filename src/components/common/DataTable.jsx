import { Edit2, Trash2 } from 'lucide-react';
import './DataTable.css';

const DataTable = ({
    columns,
    data,
    onEdit,
    onDelete,
    loading,
    customActions,
    showActions = true
}) => {
    if (loading) {
        return (
            <div className="table-container">
                <div className="empty-state">Loading data...</div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="table-container">
                <div className="empty-state">No records found.</div>
            </div>
        );
    }

    return (
        <div className="table-container">
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            {columns.map((col, i) => (
                                <th key={i} style={{ width: col.width }}>
                                    {col.header}
                                </th>
                            ))}
                            {showActions && (
                                <th style={{ width: '120px' }}>Actions</th>
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((row, i) => (
                            <tr key={i}>
                                {columns.map((col, j) => (
                                    <td key={j} style={{ width: col.width }}>
                                        {col.render
                                            ? col.render(
                                                  col.accessor ? row[col.accessor] : row,
                                                  row
                                              )
                                            : row[col.accessor]}
                                    </td>
                                ))}

                                {showActions && (
                                    <td>
                                        <div className="table-actions">
                                            {customActions && customActions(row)}

                                            {onEdit && (
                                                <button
                                                    className="action-btn edit"
                                                    onClick={() => onEdit(row)}
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            )}

                                            {onDelete && (
                                                <button
                                                    className="action-btn delete"
                                                    onClick={() => onDelete(row)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
