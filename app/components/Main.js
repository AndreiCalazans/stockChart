import React from 'react';
import 'jquery';
import Stock from './Stock';
import WarningMsg from './WarningMsg';
import io from 'socket.io-client';
var socket = io();

// hook up database to codes in the server;


var seriesOptions = [],
    seriesCounter = 0;

import './ChartTheme';
class Main extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.createChart = this.createChart.bind(this);
        this.handleCloseErrorMsg = this.handleCloseErrorMsg.bind(this);
        this.handleRemoveName = this.handleRemoveName.bind(this);
        this.state = {
            names: [],
            isLoading: true,
            notMessage: false,
            Message: null,
            series : []
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        let code = this.refs.code.value.toUpperCase();
        this.refs.code.value = '';
        if (this.state.names.indexOf(code) >= 0) {
            // warn user that this name already exists
            this.setState({
                Message: code + ' is already in chart',
                notMessage: true,
                isLoading: false
            })
            
        } else {
            socket.emit('addStock' , code);
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
        
       

    }

    createChart() {
    let that = this;
    this.setState( {
        isLoading: false
    });
    
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

        series: that.state.series
    });


}
    componentWillMount() {
        // this is where you will connect to the database.
        let that = this;
        socket.emit('new', 'new user')
        
        
        socket.on('update', function(data) {
          // this is to update the state when someone else deletes a user
          // you also have to remove the series
          let newSeries = []
          that.state.series.forEach((each)=> {
            if (data.indexOf(each.code) >= 0) {
                newSeries.push(each);
            }
          })
            that.setState({
                names:data,
                series: newSeries
            })
        })

       
    }
    componentDidMount() {
      this.getData();
    }

    componentDidUpdate(prevProps, prevState) {
  
        if(this.state.names.length != prevState.names.length) {
            this.getData();
            
        }

    }

    

    shouldComponentUpdate(nextProps, nextState) {
        if (nextState.isLoading != this.state.isLoading) {
            return true
        } else if(nextState.notMessage != this.state.notMessage ) {
            return true;
        } else if (this.state.names.length != nextState.names.length) {
            return true
        } else if(this.state.series.length === nextState.series.length) {
            return false
        } else {
            return true
        }
    }

    getData() {

        if(this.state.names.length === 0 ) {
            
            this.setState({
                series: [{
                    name: '',
                    data: 0
                }],
                isLoading: false
            })
        }
            
         let that = this;
         // empty completeNames incase it was already called before
        $.each(this.state.names , function (i, name) {
           var fetchedNames = that.state.series.map((each) => {
                return each.code;
            })


            if (fetchedNames.indexOf(name) == -1  || fetchedNames[0] == undefined){
                //fetch data
                
             $.getJSON('https://www.quandl.com/api/v3/datasets/WIKI/'+name+'.json?column_index=4&order=asc&collapse=daily&api_key=8TZgcVZUcVLzS2EUsioo').done(function (data) {
        
                let receivedData = data.dataset.data;
                let parsedData = data.dataset.data.map((each)=> {
                    //below you are parsing the year-month-day format to milliseconds
                    return [ new Date(each[0]).getTime() ,each[1]]
                })
               

                that.setState((prevState , props) => {
                    return {
                        series: [
                            ...prevState.series,
                            {
                                code: name,
                                name: data.dataset.name,
                                data: parsedData
                            }
                        ]
                    }
                })


                // As we're loading the data asynchronously, we don't know what order it will arrive. So
                // we keep a counter and create the chart when all the data is loaded.
                seriesCounter += 1;
                
                if (seriesCounter >= that.state.names.length) {
                            
                            seriesCounter = 0;
                            that.createChart();
                        
                        }
               
            }).fail((jqxhr, textStatus, error)=> {
                // incase some adds an wrong code delete the code and reload
                // 429 when you have CORS problem  404 when not found

                if(jqxhr.status == '404'){
                    // then it didnt find the code so delete the code and reload
                    
                    that.notFound(name , true);
                    return 
                } else {
                    that.notFound('Please reload' , false);
                }
            })

        } else {
            // data had already been fetched
            seriesCounter++;

         if (seriesCounter === that.state.names.length) {
                    
                    seriesCounter = 0;
                    that.createChart();
                
                }
        }


        
});
    }

    handleRemoveName(stockCode , shouldEmit) {
        if(shouldEmit) {
            socket.emit('removeStock' , stockCode);
        }
        let newSeries = [];
        let newCodeNames = [];
        this.state.series.forEach((e) => {
            if (e.code != stockCode) {
                newSeries.push(e);
                newCodeNames.push(e.code);
            }
        })
        
        this.setState({
            series: newSeries,
            names: newCodeNames
        })
    
    }

    notFound(name , shouldDelete) {
        if (shouldDelete) {
        let newState = []; 
        
            socket.emit('removeStock' , name);
            this.setState((prevState , props) => {
                 prevState.names.forEach((each) => {
                    if(each != name) {
                        newState.push(each);
                    }
                });
                return {
                    names: newState,
                    Message: name + ' not found',
                    notMessage: true,
                    isLoading: false
                }
            })
        } else {
            this.setState ({
                    Message: 'Please reload, problem while fetching',
                    notMessage: true,
                    isLoading: false
            })
        }


    }

    handleCloseErrorMsg() {
        this.setState({
            notMessage: false,
            Message: null
        })
    }

    render() {
        var Boxes = this.state.series.map((each, key) => {
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
                <WarningMsg onClick={this.handleCloseErrorMsg} show={this.state.notMessage} msg={this.state.Message}></WarningMsg>
                {this.state.isLoading &&
                    <div className="loading">
                        <div className="spinner">
                            <div className="bounce1"></div>
                            <div className="bounce2"></div>
                            <div className="bounce3"></div>
                        </div>
                    </div>
                }
                <div className="header">
                    <h1>Stock Chart</h1>
                    <p>By <a href="http://andrei-calazans.herokuapp.com/">Andrei Calazans</a></p>
                </div>
                <div id="container" style={{height: "400px", minWidth: "310px"}}></div>
                <div>
                    <form onSubmit={this.handleSubmit} >
                        <label htmlFor="">
                            Follow a Stock, Add a Stock Code: 
                            <input type="text" ref='code' />
                            <button>Add</button>

                            <a href="https://www.google.com.br/search?q=STOCK+CODES&oq=stock+CODES&aqs=chrome.0.69i59l2j0l4.1687j0j7&sourceid=chrome&ie=UTF-8" target='_blank'>List of Stock Codes</a>
                        </label>
                    </form>
                </div>
               <Stock onRemove={this.handleRemoveName} completeNames={this.state.series}></Stock>
            </div>
        )
    }
};

export default Main;





