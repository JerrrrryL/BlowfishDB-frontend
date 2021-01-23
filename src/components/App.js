import React, { Component } from 'react'
import Select from 'react-select'
import '../App.css'
import PanelComponent from './Panel'


const dbOptions = [
  { value: 'income', label: 'Census Income' }
]


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      workloadSelected: false, // show the workload pannel when workload has been selected
      datasetSelected: false
    }
  }

  render() {
    return (
      <div className='Layout'>
        <div>
          <h1 className='sysTitle'>Dynamic Blowfish</h1>
        </div>
        <div className='selections'>
          <div className='selectData'>
            <label className='fontDataset'>Select Dataset for demonstration</label>
            <Select options={dbOptions}
              onChange={() => {
                this.setState({
                  datasetSelected: true
                })
              }} />
          </div>
        </div>
        <PanelComponent
          datasetSelected={this.state.datasetSelected}
          workloadSelected={this.state.workloadSelected}>
        </PanelComponent>
      </div>
    )
  }
}

export default App
