import React from 'react';
import 'jquery';
import Stock from './Stock';
import WarningMsg from './WarningMsg';


var seriesOptions = [],
    seriesCounter = 0,
    names = ['MSFT', 'AAPL', 'GOOG', 'F'],
    completeNames = [],
    test = 'test';

// you need to fix what to do when you make an bad ajax call example ntfx
// how to handle server timeouts and wrong calls 
   


class Main extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.createChart = this.createChart.bind(this);
        this.handleRemoveName = this.handleRemoveName.bind(this);
        this.state = {
            names: [],
            completeNames: [],
            isLoading: true,
            notMessage: false,
            Message: null
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
        if(nextState.notMessage) {
            return true;
        } else if (this.state.names.length != nextState.names.length) {
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
    $.getJSON('https://www.quandl.com/api/v3/datasets/WIKI/'+name+'.json?column_index=4&order=asc&collapse=daily&api_key=8TZgcVZUcVLzS2EUsioo').done(function (data) {
        
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
    }).fail((jqxhr, textStatus, error)=> {
        // incase some adds an wrong code delete the code and reload
        // 429 when you have CORS problem  404 when not found

         if(jqxhr.status == '404'){
             // then it didnt find the code so delete the code and reload
             console.log('item not found');
             that.notFound(name);
             return 
         } else {
             // it had a bad call therefore just reload everything or refresh
                location.reload();
         }
    })
});
    }

    handleRemoveName(stockCode) {
  
        
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
    
    }

    notFound(name) {
        let newState = []; 
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

    render() {
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
                <WarningMsg show={this.state.notMessage} msg={this.state.Message}></WarningMsg>
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





