import React from 'react';
import 'jquery';


var seriesOptions = [],
    seriesCounter = 0,
    names = ['MSFT', 'AAPL', 'GOOG', 'F'];


// you need to update the graph when you update state
// currently it is not updating instantly .
// maybe you should pass the names as a value to the function.
   


class Main extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {
            names: ['MSFT', 'AAPL', 'GOOG', 'F']
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        console.log(this.refs.code.value);
        let code = this.refs.code.value.toUpperCase();
        this.setState((prevState , props) => {
           
            return {
                names: [
                    ...prevState.names,
                    code
                ]
            }
        })
        
        this.getData();

    }

    createChart() {

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
}
   
    componentDidMount() {
        console.log('did');
       this.getData();

    }

    getData() {
        console.log('get data called', this.state.names);
         let that = this;    
        $.each(this.state.names , function (i, name) {
// https://www.quandl.com/api/v3/datasets/WIKI/FB.json?column_index=4&order=asc&collapse=daily&api_key=8TZgcVZUcVLzS2EUsioo
    $.getJSON('https://www.quandl.com/api/v3/datasets/WIKI/'+name+'.json?column_index=4&order=asc&collapse=daily&api_key=8TZgcVZUcVLzS2EUsioo',    function (data) {

        let receivedData = data.dataset.data;
        let parsedData = data.dataset.data.map((each)=> {
            //below you are parsing the year-month-day format to milliseconds
            return [ new Date(each[0]).getTime() ,each[1]]
        })
        
        

        seriesOptions[i] = {
            name: data.dataset.name,
            data: parsedData
        };

        // As we're loading the data asynchronously, we don't know what order it will arrive. So
        // we keep a counter and create the chart when all the data is loaded.
        seriesCounter += 1;

        if (seriesCounter === names.length) {
            that.createChart();
        }
    });
});
    }

    render() {
       
        return (
            <div>
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
            </div>
        )
    }
};

export default Main;






