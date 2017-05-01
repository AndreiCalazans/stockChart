import React from 'react';

function WarningMsg(props) {

    if(props.show) {
        return (
            <div className='warning'>
                
                <div>
                        <i onClick={props.onClick} className='fa fa-times' aria-hidden='true'></i>
                     
                     <p>{props.msg}</p>
                </div>
            </div>
        )
    } else {
        return null;
    }

}

export default WarningMsg;