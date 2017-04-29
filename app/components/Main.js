import React from 'react';
import 'jquery';
import Stock from './Stock';

var seriesOptions = [],
    seriesCounter = 0,
    names = ['MSFT', 'AAPL', 'GOOG', 'F'],
    completeNames = [],
    test = 'test';

// now you have to create edit function to remove name from list 
//when clicked by lifting up the name from the child component.

   


class Main extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.createChart = this.createChart.bind(this);
        this.handleRemoveName = this.handleRemoveName.bind(this);
        this.state = {
            names: [],
            completeNames: [],
            isLoading: true
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        let code = this.refs.code.value.toUpperCase();
        this.setState((prevState , props) => {
           
            return {
                names: [
                    ...prevState.names,
                    code
                ],
                isLoading:true
            }
        })
        
       

    }

    createChart(completeNames) {
    
    Highcharts.stockChart('container', {

        rangeSelector: {
            selected: 4
        },

        yAxis: {
            labels: {
                formatter: function () {
                    return (this.value > 0 ? ' + ' : '') + this.value + '%';
                }
            },
            plotLines: [{
                value: 0,
                width: 2,
                color: 'silver'
            }]
        },

        plotOptions: {
            series: {
                compare: 'percent',
                showInNavigator: true
            }
        },

        tooltip: {
            pointFormat: '<span>{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
            valueDecimals: 2,
            split: true
        },

        series: seriesOptions
    });

     this.setState({
            completeNames: completeNames,
            isLoading:false    
        })

}
    componentWillMount() {
        // this is where you will connect to the database.
        this.setState({
            names: ['MSFT', 'AAPL', 'GOOG', 'F']
        })
       
    }
    componentDidMount() {
      this.getData();
    }

    componentDidUpdate(prevProps, prevState) {
        // console.log('its was updated', this.state.names);
        //  this.getData();
        if(this.state.names.length != prevState.names.length) {
            this.getData();
        }

    }

    

    shouldComponentUpdate(nextProps, nextState) {
        console.log(this.state.names.length , nextState.names.length);
        if (this.state.names.length != nextState.names.length) {
            return true
        } else if(this.state.completeNames.length === nextState.completeNames.length) {
            return false
        } else {
            return true
        }
    }

    getData() {
        console.log('get data called', this.state.names);
         let that = this;
         // empty completeNames incase it was already called before
         completeNames = [];    
        $.each(this.state.names , function (i, name) {
// https://www.quandl.com/api/v3/datasets/WIKI/FB.json?column_index=4&order=asc&collapse=daily&api_key=8TZgcVZUcVLzS2EUsioo
    $.getJSON('https://www.quandl.com/api/v3/datasets/WIKI/'+name+'.json?column_index=4&order=asc&collapse=daily&api_key=8TZgcVZUcVLzS2EUsioo',    function (data) {
        
        let receivedData = data.dataset.data;
        let parsedData = data.dataset.data.map((each)=> {
            //below you are parsing the year-month-day format to milliseconds
            return [ new Date(each[0]).getTime() ,each[1]]
        })
       
        
        completeNames.push({
            code: name,
            name: data.dataset.name
        });


        seriesOptions[i] = {
            name: data.dataset.name,
            data: parsedData
        };

        // As we're loading the data asynchronously, we don't know what order it will arrive. So
        // we keep a counter and create the chart when all the data is loaded.
        seriesCounter += 1;

        if (seriesCounter === that.state.names.length) {
            console.log('inside the if seriesCounter', seriesCounter);
            seriesCounter = 0;
            that.createChart(completeNames);
           
        }
    });
});
    }

    handleRemoveName(stockCode) {
        console.log(stockCode);
        // probblem to the way you adding.
        
        if(this.state.names.indexOf(stockCode) >= 0 ) {
            

            let newState = []; 
               

            this.setState((prevState , props) => {
                 prevState.names.forEach((each) => {
                    if(each != stockCode) {
                        newState.push(each);
                    }
                });
                return {
                    names: newState,
                    isLoading: true
                }
            })
        } else {
            console.log('not found');
        }

            // this.setState((prevState) => {
            //     return {
            //         names: [
            //             ...prevState.names,
            //             stockCode
            //         ]
            //     }
            // })
    
    }

    render() {
        console.log(this.state.completeNames);
        var Boxes = this.state.completeNames.map((each, key) => {
                       return (
                           <div key={key}>
                               <p>
                                   <b>{each.code}</b>
                               </p>
                               <p>{each.name}</p>
                           </div>
                       )
                   })   

        return (
            <div>
                {this.state.isLoading &&
                    <div className="loading">
                        <div className="spinner">
                            <div className="bounce1"></div>
                            <div className="bounce2"></div>
                            <div className="bounce3"></div>
                        </div>
                    </div>
                }
                <h1>Stock Chart</h1>
                <div id="container" style={{height: "400px", minWidth: "310px"}}></div>
                <div>
                    <form onSubmit={this.handleSubmit} >
                        <label htmlFor="">
                            Follow a Stock, Add a Stock Code: 
                            <input type="text" ref='code' />
                            <button>Add</button>
                        </label>
                    </form>
                </div>
               <Stock onRemove={this.handleRemoveName} completeNames={this.state.completeNames}></Stock>
            </div>
        )
    }
};

export default Main;





