import React, { Component } from 'react'
import Select from 'react-select'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import { Grid } from 'semantic-ui-react'
import '../App.css'
import PanelComponent from './Panel'
import '../navbar.css'
import AnalystPanelComponent from './AnalystPanel'

const dbOptions = [
  { value: 'income', label: 'Census Income' }
]


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      datasetSelected: false,
      datasetSelectedAnalyst: false,
      policy: null,
    }
  }

  setPolicy = (policy) => {
    // callback function
    this.setState({
      policy: policy,
    })
  }

  render() {
    return (
      <Tabs>
        <TabList className="tablistStyle">
          <Tab className="tabStyleLeft" selectedClassName="tabSelected">
            Problem Statement
          </Tab>
          <Tab className="tabStyleMiddle" selectedClassName="tabSelected">
            Database Owner
          </Tab>
          <Tab className="tabStyleRight" selectedClassName="tabSelected">
            Data Analyst
          </Tab>
        </TabList>
        <TabPanel>
          <div>
            <h1 className="blowfishHomepage">Welcome to BLOWFISH</h1>
            <div className="blowfishDesc">Blowfish is a full-stack tool to interact with database under user-specified privacy definition.
            You may either select the Database Owner tab or the Data Analyst tab to perform the exploration.
            </div>
          </div>
        </TabPanel>
        <TabPanel>
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
                updatePolicy={this.setPolicy}>
              </PanelComponent>
            </Grid.Row>
          </Grid>
        </TabPanel>
        <TabPanel>
          <Grid>
            <Grid.Row className="titlePosition">
              <h1 className='sysTitle'>Dynamic Blowfish</h1>
            </Grid.Row>
            <Grid.Row className="selectDatasetPosition">
              <Grid.Column style={{ width: 300, height: 40 }} className="fontDataset">
                Select Dataset for Query Result
          </Grid.Column>
              <Grid.Column style={{ width: 235, height: 40 }}>
                <Select className="selectDataset" options={dbOptions}
                  onChange={() => {
                    this.setState({
                      datasetSelectedAnalyst: true
                    })
                  }} />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row className='bottomPanelsAnalyst'>
              <AnalystPanelComponent
                datasetSelected={this.state.datasetSelectedAnalyst}
                policy={this.state.policy}>
              </AnalystPanelComponent>
            </Grid.Row>
          </Grid>
        </TabPanel>
      </Tabs>
    )
  }
}

export default App
