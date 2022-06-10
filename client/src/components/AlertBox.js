import React from 'react';

function AlertBox({message, active}) {
    return (
        <div className={`AlertBox ${active?'active':''}`}>
            <p>!</p>
            <p>{message}</p>
        </div>
    )
}

export default AlertBox;