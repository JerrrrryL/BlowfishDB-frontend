import React, { Component } from 'react'
import { Button, Grid } from 'semantic-ui-react'

// The schema of the chosen database
class SchemaComponent extends Component {

    render() {
        // let numAttr = databaseSchema.length()
        // if workLoad has been specified, show the attributes of that workload
        if (this.props.datasetSelected) {
            return (
                <Grid padded
                    stackable
                    style={{ top: '1em', margin: '-1.5em', width: 400 }}
                    textAlign='left'>
                    <Button.Group vertical>
                        {this.props.rowGeneratingFunction()}
                    </Button.Group>
                </Grid>
            )
        } else {
            return null
        }
    }
}

export default SchemaComponent;