import React from 'react';

function WarningMsg(props) {

    if(props.show) {
        return (
            <div className='warning'>
                <div>
                     <p>{props.msg}</p>
                </div>
            </div>
        )
    } else {
        return null;
    }

}

export default WarningMsg;