import React from 'react';


function Stock(props) {
    //props will receive an array
    var {completeNames, onRemove} = props;

    function liftUpRemove(e) {
        onRemove(e.target.title  , true);
    }


    let renderStocks = completeNames.map((each , id) => {
            return (
                <div className='material-shadow' key={id}>
                    <div><i onClick={liftUpRemove} title={each.code} className='fa fa-times'></i></div>
                    <p>
                        <b>{each.code}</b>
                    </p>
                    <p>{each.name}</p>
                </div>
            )
        });

    return (
        <div className='stock-container'>
          {renderStocks}
        </div>
    )
    
}

export default Stock;