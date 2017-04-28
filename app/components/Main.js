import React from 'react';
import 'jquery';


// you need to parse the data coming from quandl API , the time must be in miliseconds
// try to parse it before creating the chart.


var seriesOptions = [],
    seriesCounter = 0,
    // names = ['MSFT', 'AAPL', 'GOOG'];
    names = ['ORB'];


class Main extends React.Component {


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
        let that = this;
        $.each(names, function (i, name) {
// https://www.quandl.com/api/v3/datasets/WIKI/FB.json?column_index=4collapse=daily&api_key=8TZgcVZUcVLzS2EUsioo
    $.getJSON('https://www.quandl.com/api/v3/datasets/WIKI/'+name+'.json?column_index=4collapse=daily&api_key=8TZgcVZUcVLzS2EUsioo',    function (data) {

        seriesOptions[i] = {
            name: data.dataset.name,
            data: data.dataset.data
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
            </div>
        )
    }
};

export default Main;






