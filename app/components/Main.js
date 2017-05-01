import React from 'react';
import 'jquery';
import Stock from './Stock';
import WarningMsg from './WarningMsg';
import io from 'socket.io-client';
var socket = io();


var seriesOptions = [],
    seriesCounter = 0;


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

    createChart() {
    let that = this;
    this.setState( {
        isLoading: false
    });
    console.log('is loading should be off', this.state.isLoading);
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
          
            if(data.length < that.state.names.length) {
                console.log('inside the if state')
                that.state.names.forEach((each) => {
                    if (data.indexOf(each) == -1) {
                      console.log('yes you ', each);
                        that.handleRemoveName(each);
                    }
                })
            } else {
                    that.setState({
                    names: data
                })
            }
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
        console.log('get data called', this.state.names);

        
         let that = this;
         // empty completeNames incase it was already called before
         
        $.each(this.state.names , function (i, name) {
           var fetchedNames = that.state.series.map((each) => {
                return each.code;
            })


            if (fetchedNames.indexOf(name) == -1  || fetchedNames[0] == undefined){
                //fetch data
                console.log('fetching');
             $.getJSON('https://www.quandl.com/api/v3/datasets/WIKI/'+name+'.json?column_index=4&order=asc&collapse=daily&api_key=8TZgcVZUcVLzS2EUsioo').done(function (data) {
        
                let receivedData = data.dataset.data;
                let parsedData = data.dataset.data.map((each)=> {
                    //below you are parsing the year-month-day format to milliseconds
                    return [ new Date(each[0]).getTime() ,each[1]]
                })
            
                
             

                // seriesOptions[i] = {
                //     code: name,
                //     name: data.dataset.name,
                //     data: parsedData
                // };
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

                if (seriesCounter === that.state.names.length) {
                            console.log('inside the if seriesCounter', seriesCounter);
                            seriesCounter = 0;
                            that.createChart();
                        
                        }
               
            })
            .fail((jqxhr, textStatus, error)=> {
                // incase some adds an wrong code delete the code and reload
                // 429 when you have CORS problem  404 when not found

                if(jqxhr.status == '404'){
                    // then it didnt find the code so delete the code and reload
                    console.log('item not found');
                    that.notFound(name);
                    return 
                } else {
                    that.notFound('');
                }
            })

        } else {
            // data had already been fetched
            seriesCounter++;

         if (seriesCounter === that.state.names.length) {
                    console.log('inside the if seriesCounter', seriesCounter);
                    seriesCounter = 0;
                    that.createChart();
                
                }
        }



        
});
    }

    handleRemoveName(stockCode) {
        socket.emit('removeStock' , stockCode);
        let newSeries = [];
        let newCodeNames = [];
        this.state.series.forEach((e) => {
            if (e.code != stockCode) {
                newSeries.push(e);
                newCodeNames.push(e.code);
            }
        })
        console.log(newSeries);
        this.setState({
            series: newSeries,
            names: newCodeNames
        })
    
    }

    notFound(name) {
        let newState = []; 
        socket.emit('removeStock', name);
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

    }

    handleCloseErrorMsg() {
        console.log('closing');
        this.setState({
            notMessage: false,
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
               <Stock onRemove={this.handleRemoveName} completeNames={this.state.series}></Stock>
            </div>
        )
    }
};

export default Main;





