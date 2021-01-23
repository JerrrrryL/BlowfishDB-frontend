import React, { Component } from 'react'
import CytoscapeComponent from 'react-cytoscapejs'

// For a given (categorical) policy, visualize the policy graph for it

class PolicyGraph extends Component {
    constructor(props) {
        super(props);
    }
    state = {
        w: 0,
        h: 0
    }

    componentDidMount = () => {
        this.setState({
            w: window.innerWidth,
            h: window.innerHeight
        })
        this.setUpListeners()
    }

    setUpListeners = () => {
        this.cy.on('click', 'node', (event) => {
            console.log(event.target)
        })
    }

    render() {
        let x1 = 30;
        let y1 = 30;
        let w = 480;
        let h = 280;
        let nodesEdges = []
        // this is the case when we are dealing with categorical data
        if (this.props.attrType === 'categorical') {
            // assign values inside the domain to be nodes
            for (let i = 0; i < this.props.attributeDomain.length; ++i) {
                // console.log(this.props.attributeDomain[i])
                let curNode = {
                    data: { id: this.props.attributeDomain[i].value, label: this.props.attributeDomain[i].label },
                    position: { x: 290, y: 50 },
                    style: {
                        'background-color': '#d4d4d4',
                        "text-valign": "center",
                        "text-halign": "center"
                    }
                }
                nodesEdges = nodesEdges.concat(curNode)
            }
            // assign values in the policy set to be edges
            // Note that this will be a clique in the contained set
            // console.log(this.props.sensitiveSet)
            if (this.props.sensitiveSet !== null) {
                for (let i = 0; i < this.props.sensitiveSet.length; ++i) {
                    for (let j = i + 1; j < this.props.sensitiveSet.length; ++j) {
                        let curEdge = {
                            data: { source: this.props.sensitiveSet[i].value, target: this.props.sensitiveSet[j].value },
                            style: {
                                'line-color': '#000000',
                                'width': 1
                            }
                        }
                        nodesEdges = nodesEdges.concat(curEdge)
                    }
                }
            }
        } else {
            // when attribute type is numerical
            // console.log(this.props.attributeDomain)
            // console.log(this.props.attrThreshold)
            let displayNodes = 12;
            let lowerBound = this.props.attributeDomain.domain[0];
            let upperBound = this.props.attributeDomain.domain[1];
            let attrName = this.props.attributeDomain.attrName;
            let defaultGranularity = Math.round((upperBound - lowerBound) / displayNodes)
            // console.log(defaultGranularity)
            let previousBound = lowerBound + defaultGranularity; // the lower bound for each node in the policy graph
            // set the default granularity to display here
            // add nodes to the graph
            for (let i = 0; i < displayNodes; ++i) {
                let curNode = null;
                if (i === 0) {
                    curNode = {
                        data: {
                            // id cannot be a tuple
                            id: i,
                            label: attrName + "<" + previousBound
                        },
                        position: { x: 290, y: 50 },
                        style: {
                            'background-color': '#d4d4d4',
                            "text-valign": "center",
                            "text-halign": "center"
                        }
                    }
                } else if (i === displayNodes - 1) {
                    curNode = {
                        data: {
                            id: i,
                            label: previousBound + "<=" + attrName
                        },
                        position: { x: 290, y: 50 },
                        style: {
                            'background-color': '#d4d4d4',
                            "text-valign": "center",
                            "text-halign": "center"
                        }
                    }
                } else {
                    let tempUpper = previousBound + defaultGranularity;
                    curNode = {
                        data: {
                            id: i,
                            label: previousBound + "<=" + attrName + "<" + tempUpper
                        },
                        position: { x: 290, y: 50 },
                        style: {
                            'background-color': '#d4d4d4',
                            "text-valign": "center",
                            "text-halign": "center"
                        }
                    }
                }
                nodesEdges = nodesEdges.concat(curNode)
                if (i !== 0) {
                    previousBound += defaultGranularity;
                }
            }

            // note that nodes are sorted
            let threshold = 0;
            if (this.props.attrThreshold !== null) {
                threshold = this.props.attrThreshold.value;
            }
            let degree = Math.ceil(threshold / defaultGranularity);
            // console.log(degree)
            for (let i = 0; i < displayNodes; ++i) {
                // draw edges between nodes based on thresholds
                for (let j = i + 1; j < displayNodes; ++j) {
                    if (j - i <= degree) {
                        let curEdge = {
                            data: { source: i, target: j },
                            style: {
                                'line-color': '#000000',
                                'width': 1
                            }
                        }
                        nodesEdges = nodesEdges.concat(curEdge)
                    }
                }
            }
        }
        const layout = {
            name: 'circle',

            fit: false, // whether to fit to viewport
            padding: 30, // fit padding
            boundingBox: { x1, y1, w, h }, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
            animate: true, // whether to transition the node positions
            animationDuration: 500, // duration of animation in ms if enabled
            animationEasing: undefined, // easing of animation if enabled
            radius: 150,
            animateFilter: function (node, i) { return true; },
            ready: undefined, // callback on layoutready
            stop: undefined, // callback on layoutstop
            nodeSeparation: 3,
            transform: function (node, position) { return position; } // transform a given node position. Useful for changing flow direction in discrete layouts 
        };

        return (
            <div>
                <CytoscapeComponent
                    elements={nodesEdges}
                    style={{ width: this.state.w, height: this.state.h }}
                    cy={(cy) => { this.cy = cy }}
                    layout={layout}
                />
            </div>
        )
    }
}

export default PolicyGraph;