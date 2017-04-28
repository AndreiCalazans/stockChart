import React from 'react';


function Stock(props) {
    //props will receive an array
    var {completeNames, onRemove} = props;


    let renderStocks = completeNames.map((each , id) => {
            return (
                <div key={id}>
                    <div onClick={onRemove}><i className='fa fa-times'></i></div>
                    <p>
                        <b>{each.code}</b>
                    </p>
                    <p>{each.name}</p>
                </div>
            )
        });

    return (
        <div>
          {renderStocks}
        </div>
    )
    
}

export default Stock;