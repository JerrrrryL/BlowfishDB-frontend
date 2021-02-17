import React, { Component } from 'react'
import Select from 'react-select'
import { Grid } from 'semantic-ui-react'
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
      <Grid>
        <Grid.Row className="titlePosition">
          <h1 className='sysTitle'>Dynamic Blowfish</h1>
        </Grid.Row>
        <Grid.Row className="selectDatasetPosition">
          <Grid.Column style={{ width: 300, height: 40 }} className="fontDataset">
            Select Dataset for Privacy Analysis
          </Grid.Column>
          <Grid.Column style={{ width: 235, height: 40 }}>
            <Select className="selectDataset" options={dbOptions}
              onChange={() => {
                this.setState({
                  datasetSelected: true
                })
              }} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row className='bottomPanels'>
          <PanelComponent
            datasetSelected={this.state.datasetSelected}
            workloadSelected={this.state.workloadSelected}>
          </PanelComponent>
        </Grid.Row>
      </Grid>
      // <div className='Layout'>
      //   <div>
      //     <h1 className='sysTitle'>Dynamic Blowfish</h1>
      //   </div>
      //   <div className='selections'>
      //     <div className='selectData'>
      //       <label className='fontDataset'>Select Dataset for demonstration</label>
      //     </div>
      //   </div>
      // </div>
    )
  }
}

export default App
