import React, { Component } from 'react'
import CanvasJSReact from './canvasjs.react';
import { Button, Divider, Grid, Segment } from 'semantic-ui-react'
import Select from 'react-select'
import makeAnimated from 'react-select/animated';
import PolicyGraph from './PolicyGraph'
import SchemaComponent from './Schema'

const workloadOptions = [
    { value: '1D-Histogram', label: '1D-Histogram' },
    { value: '1D-Range', label: '1D-Range' },
    { value: '2D-Range', label: '2D-Range' }
]

const alphaOptions = [
    { value: 0.01, label: '0.01' },
    // { value: 0.001, label: '0.001' },
    // { value: 0.0001, label: '0.0001' }
]

const betaOptions = [
    { value: 100, label: '100' },
    // { value: 10, label: '10' },
    // { value: 1, label: '1' }
]

// The bottom left panel for user input
class PanelComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // currently both the schema and the domain are hardcoded, which will have to be changed later
            // when the demo actually turns into a system
            databaseSchema: [
                { attrName: 'age', attrType: 'numerical' },
                { attrName: 'workclass', attrType: 'categorical' },
                { attrName: 'fnlwgt', attrType: 'numerical' },
                { attrName: 'education', attrType: 'categorical' },
                { attrName: 'edunum', attrType: 'numerical' },
                { attrName: 'marital', attrType: 'categorical' },
                { attrName: 'occupation', attrType: 'categorical' },
                { attrName: 'relationship', attrType: 'categorical' },
                { attrName: 'race', attrType: 'categorical' },
                { attrName: 'sex', attrType: 'categorical' },
                { attrName: 'capgain', attrType: 'numerical' },
                { attrName: 'caploss', attrType: 'numerical' },
                { attrName: 'hourweek', attrType: 'numerical' },
                { attrName: 'country', attrType: 'categorical' },
                { attrName: 'salary', attrType: 'categorical' }
            ],
            databaseDomain: [
                { attrName: 'age', domain: [17, 90] },
                {
                    attrName: 'workclass',
                    domain: ['?', 'Federal-gov', 'Local-gov', 'Never-worked', 'Private',
                        'Self-emp-inc', 'Self-emp-not-inc', 'State-gov', 'Without-pay']
                },
                {
                    attrName: 'fnlwgt',
                    domain: [12285, 1490400]
                },
                {
                    attrName: 'education',
                    domain: ['Bachelors', 'Some-college', '11th',
                        'HS-grad', 'Prof-school', 'Assoc-acdm', 'Assoc-voc', '9th', '7th-8th',
                        '12th', 'Masters', '1st-4th', '10th', 'Doctorate', '5th-6th', 'Preschool']
                },
                { attrName: 'edunum', domain: [1, 16] },
                {
                    attrName: 'marital',
                    domain: ['Married-civ-spouse', 'Divorced', 'Never-married',
                        'Separated', 'Widowed', 'Married-spouse-absent', 'Married-AP-spouse']
                },
                {
                    attrName: 'occupation',
                    domain: ['?', 'Tech-support', 'Craft-repair', 'Other-service', 'Sales',
                        'Exec-managerial', 'Prof-specialty', 'Handlers-cleaners', 'Machine-op-inspct', 'Adm-clerical',
                        'Farming-fishing', 'Transport-moving', 'Priv-house-serv', 'Protective-serv', 'Armed-Forces']
                },
                {
                    attrName: 'relationship',
                    domain: ['Wife', 'Own-child', 'Husband', 'Not-in-family', 'Other-relative', 'Unmarried']
                },
                {
                    attrName: 'race',
                    domain: ['White', 'Asian-Pac-Islander', 'Amer-Indian-Eskimo', 'Other', 'Black']
                },
                {
                    attrName: 'sex',
                    domain: ['Female', 'Male']
                },
                {
                    attrName: 'capgain',
                    domain: [0, 99999]
                },
                {
                    attrName: 'caploss',
                    domain: [0, 4356]
                },
                {
                    attrName: 'hourweek',
                    domain: [0, 99]
                },
                {
                    attrName: 'country',
                    domain: ['?', 'United-States', 'Cambodia', 'England', 'Puerto-Rico', 'Canada', 'Germany',
                        'Outlying-US(Guam-USVI-etc)', 'India', 'Japan', 'Greece', 'South', 'China', 'Cuba', 'Iran',
                        'Honduras', 'Philippines', 'Italy', 'Poland', 'Jamaica', 'Vietnam', 'Mexico', 'Portugal',
                        'Ireland', 'France', 'Dominican-Republic', 'Laos', 'Ecuador', 'Taiwan', 'Haiti', 'Columbia',
                        'Hungary', 'Guatemala', 'Nicaragua', 'Scotland', 'Thailand', 'Yugoslavia', 'El-Salvador',
                        'Trinadad&Tobago', 'Peru', 'Hong', 'Holand-Netherlands']
                },
                {
                    attrName: 'salary',
                    domain: ['<=50K', '>50K']
                }
            ],
            attrClicked: false,
            selectedAttr: null,
            selectedType: null,
            totalPolicy: [], // the policy for all attributes, user select from default policy or specify own
            currentPolicy: null, // temp variable for current attribute
            alpha: null, // alpha and beta for APEx
            beta: null,
            defaultPolicy: null, // {'attrName': '', 'policy': []} used for dropdown menu for users to select
            attrPolicy: false, // if this is true, generate privacy analysis graph wrt the attribute
            currentWorkload: null, // current workload selected by the user
            policyVisualization: false, // if we want to visualize the policy
            currentNumericalDomain: null, // current domain for numerical attribute
            currentCatPolicy: null, // sensitivity set by user, used for both privacy analysis and attribute visualization
            currentNumPolicy: null, // threshold by user, used for privacy analysis but not attribute visualization 
            visualNumPolicy: null, // threshold for the user to visualize policy
            apiLoading: true,
            apiRespond: [],  // the epsilon values
            noisyRes: [],  // the noisy answers
            trueRes: [],  // the true answers
            privacyThresholds: [], // the x values for privacy analysis
            dpPrivacy: null,  // the privacy loss for differential privacy
            queryResult: false,  // if this is true, we will visualize the query results
            queryGranularity: null,  // the granularity of the current query
            granularityLabels: null,  // the granularity labels for the granularity specified above
            selectedTrueAns: [],  // the true counts of selected query
            selectedNoisyAns: [],  // the noisy counts of selected query
            queryAccuracy: [],  // the accuracy of the queries
            selectedAccuracy: null,  // the accuracy of the selected queries
        }

        this.getButtonsUsingMap = this.getButtonsUsingMap.bind(this);
        this.queryComplete = this.queryComplete.bind(this);
    }

    // attribute selection on click
    attrClick = (attrName, attrType) => {
        this.setState({
            defaultPolicy: null,
            alpha: null,
            beta: null,
            policyVisualization: false,
            currentCatPolicy: null,
            visualNumPolicy: null,
            currentNumPolicy: null,
            queryResult: false,
            attrPolicy: false,
            currentWorkload: null,
            queryGranularity: null,
            granularityLabels: null,
            queryAccuracy: [],
            selectedAccuracy: null,
        });
        console.log(this.state.defaultPolicy)
        let delPolicy = null;
        if (attrType === 'numerical') {
            // set the default thresholds, we will set display 10 threshold values
            // for user to select
            let diff = 0;
            for (let i = 0; i < this.state.databaseDomain.length; ++i) {
                if (this.state.databaseDomain[i].attrName === attrName) {
                    diff = this.state.databaseDomain[i].domain[1] - this.state.databaseDomain[i].domain[0]
                    this.setState({
                        currentNumericalDomain: this.state.databaseDomain[i]
                    })
                }
            }
            let curPolicy = [];
            // if the difference is too big, it will stuck here
            if (diff < 100) {
                for (let i = 1; i < diff + 1; ++i) {
                    curPolicy = curPolicy.concat(i)
                }
            } else {
                for (let i = 1; i < 100; ++i) {
                    curPolicy = curPolicy.concat(i)
                }
                // we will add some default thresholds that are big
                for (let i = 1; i < 11; ++i) {
                    curPolicy = curPolicy.concat(100 * i)
                }

            }
            delPolicy = { attrName: attrName, policy: curPolicy }
        } else {
            let senSet = null;
            for (let i = 0; i < this.state.databaseDomain.length; ++i) {
                if (this.state.databaseDomain[i].attrName === attrName) {
                    senSet = this.state.databaseDomain[i].domain;
                }
            }
            delPolicy = { attrName: attrName, policy: senSet };
        }
        // console.log('This is the delPolicy', delPolicy)
        let options = [];
        for (let i = 0; i < delPolicy.policy.length; ++i) {
            options = options.concat({ value: delPolicy.policy[i], label: delPolicy.policy[i].toString() })
        }
        // console.log('This is the options: ', options)
        this.setState({
            attrClicked: true,
            selectedAttr: attrName,
            selectedType: attrType,
            defaultPolicy: options
        });
    };

    // compute the granularity of the query
    // store this in the state since both the query results, and the policy graph visualization needs this
    // to avoid recomputing, only call this when the variable in the state is null 
    // call this function when either Confirm/Visualization is pressed
    computeGranularity = () => {
        console.log('Enter compute Granularity')
        if (this.state.granularityLabels === null) {
            let selectedGranu = this.state.queryGranularity;
            // sanity check, assign defaut to be 1 if null
            if (selectedGranu === null) {
                selectedGranu = 1
            } else {
                selectedGranu = selectedGranu.value
            }
            let lowerBound = this.state.currentNumericalDomain.domain[0];
            let upperBound = this.state.currentNumericalDomain.domain[1];
            let granuLabels = [];
            let numEle = Math.ceil((upperBound - lowerBound + 1) / selectedGranu)
            for (let i = 0; i < numEle; ++i) {
                granuLabels = granuLabels.concat({
                    lower: lowerBound + i * selectedGranu,
                    upper: lowerBound + (i + 1) * selectedGranu
                })
            }
            console.log('This is the computed granularity at the end: ', granuLabels)
            this.setState({
                granularityLabels: granuLabels,
            })
        }
    }

    // visualize the policy graph
    visualizePolicy = () => {
        this.setState({
            policyVisualization: true
        })
    }

    // visualize policy graph when pressing the button
    // pass the attribute the visualize into the function
    policyGraph = () => {
        if (this.state.policyVisualization && this.state.attrClicked) {
            this.computeGranularity();
            if (this.state.selectedType === 'categorical') {
                // only handle the categorical data now
                return (
                    <PolicyGraph
                        attrType={this.state.selectedType}
                        attributeDomain={this.state.defaultPolicy}
                        sensitiveSet={this.state.currentCatPolicy}
                        granularity={this.state.queryGranularity}
                    />
                )
            } else {
                // numerical case
                return (
                    <PolicyGraph
                        attrType={this.state.selectedType}
                        attributeDomain={this.state.currentNumericalDomain}
                        attrThreshold={this.state.visualNumPolicy}
                    />
                )
            }
        } else {
            return null
        }
    }

    // the default policy we get by selecting an attribute
    numerical_menu = () => {
        const animatedComponents = makeAnimated();
        // console.log(this.state.defaultPolicy)
        return (
            <Select
                placeholder='Thresholds'
                components={animatedComponents}
                isMulti
                className='inputEle'
                options={this.state.defaultPolicy}
                value={this.state.currentNumPolicy}
                onChange={(event) => {
                    this.setState({
                        currentNumPolicy: event // this is an array of attributes
                    })
                }} />
        )
    }

    // visualization for default policy
    numerical_menu_single = () => {
        const animatedComponents = makeAnimated();
        // console.log(this.state.defaultPolicy)
        return (
            <Select
                placeholder='Threshold'
                components={animatedComponents}
                className='inputEle'
                options={this.state.defaultPolicy}
                value={this.state.visualNumPolicy}
                onChange={(event) => {
                    this.setState({
                        visualNumPolicy: event // this is an array of attributes
                    })
                }} />
        )
    }

    // similarly, the default policy for an categorical data
    // keep track of the sensitivity sets
    categorical_menu = () => {
        const animatedComponents = makeAnimated();
        // console.log(this.state.defaultPolicy)
        return (
            <Select
                placeholder='Sensitive Categories'
                isMulti
                components={animatedComponents}
                className='inputEle'
                options={this.state.defaultPolicy}
                value={this.state.currentCatPolicy}
                onChange={(event) => {
                    this.setState({
                        currentCatPolicy: event // this is an array of attributes
                    })
                }} />
        )
    }

    // after confirmation, we submit the result to the api
    toggleButtonState = () => {
        this.computeGranularity();
        console.log(this.state.selectedType)
        let threshold_array = [];
        let sensitiveSet = [];
        if (this.state.selectedType === 'numerical') {
            // compute the threshold
            if (this.state.currentNumPolicy !== null) {
                for (let i = 0; i < this.state.currentNumPolicy.length; ++i) {
                    threshold_array = threshold_array.concat(this.state.currentNumPolicy[i].value)
                }
            }
            threshold_array.sort(function (a, b) {
                return a - b;
            });
        } else {
            // compute the sensitivity set
            if (this.state.currentCatPolicy !== null) {
                for (let i = 0; i < this.state.currentCatPolicy.length; ++i) {
                    sensitiveSet = sensitiveSet.concat(this.state.currentCatPolicy[i].value)
                }
            }
        }
        this.setState({
            privacyThresholds: threshold_array
        })
        console.log('Current threshold array: ', threshold_array)
        if (threshold_array.length === 0 || this.state.currentWorkload === null) {
            if (threshold_array.length === 0) {
                alert("Please specify thresholds/sensitivity sets")
            } else {
                alert("Please choose the workload type")
            }
        } else {
            // add a huge threshold to derive result for differential privacy
            threshold_array = threshold_array.concat(Number.MAX_SAFE_INTEGER);
            const url = '/'
            // workload is hardcoded here, needs to be dynamically defined
            // in the backend, we need the granularity, the workload will be dynamic according to the granularity
            // we only need to try different thresholds

            if (this.state.selectedType === 'numerical') {
                let queryGranu = null;
                if (this.state.queryGranularity === null) {
                    queryGranu = 1;
                } else {
                    queryGranu = this.state.queryGranularity.value
                }
                console.log('This is the current workload: ', this.state.currentWorkload)
                const data = {
                    "workload": this.state.currentWorkload.value,
                    "granularity": queryGranu,
                    "attrName": this.state.selectedAttr,
                    "attrType": this.state.selectedType,
                    "thresholds": threshold_array
                }

                // TODO: need alerts to make sure the granularity and the attrNa
                console.log("This is the API request Data", data)
                const headers = new Headers();
                headers.append('Content-Type', 'application/json')

                const requestOption = {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(data)
                }
                const request = new Request(url, requestOption)
                fetch(request).then((response) => response.json())
                    .then((data) => {
                        // after fetching api response, plot the privacy loss graph here
                        let epsilons = [];
                        let trueAns = [];
                        let noisyAns = [];
                        let accuracies = []
                        const res = data.results;
                        console.log('This is the API response: ', res)
                        for (let i = 0; i < res.length - 1; ++i) {
                            epsilons = epsilons.concat(res[i].eps_max);
                            accuracies = accuracies.concat(res[i].accuracy)
                            let trueAnsObj = {
                                'trueRes': res[i].true_answer
                            }
                            let noisyAnsObj = {
                                'noisyAns': res[i].noisy_answer
                            }
                            trueAns = trueAns.concat(trueAnsObj);
                            noisyAns = noisyAns.concat(noisyAnsObj);
                        }
                        // get the epsilons and true answers
                        this.setState({
                            attrPolicy: true,
                            apiRespond: epsilons,
                            trueRes: trueAns,
                            noisyRes: noisyAns,
                            queryAccuracy: accuracies,
                            dpPrivacy: res[res.length - 1].eps_max
                        })
                    })
                    .catch((err) => console.log(err))
            }
        }
    }


    // The following 3 functions to handle selection in the interface
    handleChangeWorkload = value => {
        this.setState({
            workloadSelected: true,
            currentWorkload: value
        })
    };

    handleChangeAlpha = value => {
        this.setState({
            alpha: value
        })
    };

    handleChangeBeta = value => {
        this.setState({
            beta: value
        })
    };

    handleChangeGranularity = value => {
        this.setState({
            queryGranularity: value
        })
    }

    policyPanel = () => {
        // we want to assign granularity Options dynamically
        if (this.state.attrClicked) {
            if (this.state.selectedType === 'numerical') {
                const { currentWorkload } = this.state
                const { alpha } = this.state
                const { beta } = this.state
                const { queryGranularity } = this.state
                return (
                    <Grid padding textAlign='left' style={{ margin_bottom: '0.1em', height: 20 }}>
                        <Grid.Row className='attr'>
                            Attribute Name: {this.state.selectedAttr}
                        </Grid.Row>
                        <Grid.Row className='attr'>
                            Attribute Type: {this.state.selectedType}
                        </Grid.Row>
                        <Grid.Row>
                            <Select
                                placeholder='workload'
                                className='inputEleShortLeft'
                                options={workloadOptions}
                                value={currentWorkload}
                                onChange={this.handleChangeWorkload}
                            >
                            </Select>
                            <Select
                                options={this.state.defaultPolicy}
                                placeholder='granularity'
                                className='inputEleShortRight'
                                value={queryGranularity}
                                onChange={this.handleChangeGranularity}
                            />
                        </Grid.Row>
                        <Grid.Row>
                            <Select
                                options={alphaOptions}
                                placeholder='alpha'
                                className='inputEleShortLeft'
                                value={alpha}
                                onChange={this.handleChangeAlpha} />
                            <Select
                                options={betaOptions}
                                placeholder='beta'
                                className='inputEleShortRight'
                                value={beta}
                                onChange={this.handleChangeBeta}
                            />
                        </Grid.Row>
                        <Grid.Row>
                            {this.numerical_menu()}
                        </Grid.Row>
                        <Grid.Row></Grid.Row>
                        <Grid.Row></Grid.Row>
                        <Grid.Row></Grid.Row>
                        <Grid.Row style={{ margin: '0.3em', height: 60 }}>
                            <Button
                                onClick={() =>
                                    this.visualizePolicy(this.state.alpha, this.state.beta)
                                } style={{ width: 230, height: 40 }}>Visualize Policy</Button>
                        </Grid.Row>
                        <Grid.Row>
                            {this.numerical_menu_single()}
                        </Grid.Row>
                        <Grid.Row>
                            <Button onClick={
                                // () => this.submitPolicy()
                                this.toggleButtonState
                            } style={{ width: 235, height: 40 }}>Confirm</Button>
                        </Grid.Row>
                    </Grid >
                )
            } else {
                return (
                    <Grid textAlign='left' style={{ margin_bottom: '0.1em', height: 20 }}>
                        <Grid.Row className='attr'>
                            Attribute Name: {this.state.selectedAttr}
                        </Grid.Row>
                        <Grid.Row className='attr'>
                            Attribute Type: {this.state.selectedType}
                        </Grid.Row>
                        <Grid.Row>
                            <label className='attr'>Select Workload:</label>
                            <Select
                                placeholder='workload'
                                className='inputEle'
                                options={workloadOptions}
                                onChange={(event) => {
                                    this.setState({
                                        workloadSelected: true,
                                        currentWorkload: event.value // one of histo, 1D-cdf or 2d-cdf
                                    })
                                }}>
                            </Select>
                        </Grid.Row>
                        <Grid.Row>
                            <Select
                                options={alphaOptions}
                                placeholder='alpha'
                                className='inputEleShortLeft'
                                onChange={(event) => {
                                    // console.log(event);
                                    // set alpha and beta to the current selected values
                                    this.setState({
                                        alpha: event.value
                                    })
                                }} />
                            <Select
                                options={betaOptions}
                                placeholder='beta'
                                className='inputEleShortRight'
                                onChange={(event) => {
                                    // console.log(event);
                                    this.setState({
                                        beta: event.value
                                    })
                                }
                                }
                            />
                        </Grid.Row>
                        <Grid.Row>
                            {this.categorical_menu()}
                        </Grid.Row>
                        <Grid.Row></Grid.Row>
                        <Grid.Row></Grid.Row>
                        <Grid.Row></Grid.Row>
                        <Grid.Row></Grid.Row>
                        <Grid.Row></Grid.Row>
                        <Grid.Row style={{ margin: '0.3em', height: 60 }}>
                            <Button
                                onClick={() =>
                                    this.visualizePolicy(this.state.alpha, this.state.beta)
                                } style={{ width: 230, height: 40 }}>Visualize Policy</Button>
                        </Grid.Row>
                        <Grid.Row >
                            <Button onClick={
                                this.toggleButtonState
                            } style={{ width: 235, height: 40 }}>Confirm</Button>
                        </Grid.Row>
                    </Grid>
                )
            }
        } else {
            return (
                null
            )
        }
    }

    toggleDataSeries(e) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        }
        else {
            e.dataSeries.visible = true;
        }
        this.chart.render();
    }

    // used to generate policy graphes
    // all workload, policy, and the alpha and beta can be found in the state
    privacyPanelTheshold = () => {
        // var CanvasJS = CanvasJSReact.CanvasJS;
        var CanvasJSChart = CanvasJSReact.CanvasJSChart;
        let privacyPoints = [];
        let dpVal = this.state.dpPrivacy;
        // console.log("this is the dp loss", dpVal);
        let resComplete = null;
        let selectedRes = null;
        for (let i = 0; i < this.state.apiRespond.length; ++i) {
            privacyPoints = privacyPoints.concat(
                {
                    x: this.state.privacyThresholds[i],
                    y: this.state.apiRespond[i]
                }
            )
        }

        const options = {
            height: 330,
            width: 350,
            theme: "light2",
            animationEnabled: true,
            exportEnabled: true,
            title: {
                text: "Privacy Loss VS Thresholds",
                fontFamily: "cursive",
                fontSize: 22
            },
            axisX: {
                title: "Thresholds",
                titleFontFamily: "cursive",
                titleFontSize: 16,
                interval: 1
            },
            axisY: {
                title: "Privacy Loss",
                titleFontFamily: "cursive",
                titleFontSize: 16,
                titleFontColor: "#6D78AD",
                lineColor: "#6D78AD",
                labelFontColor: "#6D78AD",
                tickColor: "#6D78AD",
                maximum: dpVal + 0.1,
                stripLines: [
                    {
                        label: "Differential Privacy",
                        labelFontColor: "#6D78AD",
                        value: dpVal,
                        showOnTop: true,
                        labelWrap: true,//false
                        labelMaxWidth: 80,
                        thickness: 2,
                        color: "#6D78AD"
                    }
                ]
            },
            toolTip: {
                shared: true
            },
            legend: {
                cursor: "pointer",
                itemclick: this.toggleDataSeries
            },
            data: [{
                click: this.queryComplete,
                type: "spline",
                name: "Privacy Loss (Blowfish)",
                showInLegend: true,
                xValueFormatString: "Threshold: ####",
                yValueFormatString: "##0.###",
                dataPoints: privacyPoints
            },
            ]
        }

        if (resComplete) {
            this.setState({
                queryResult: true,
                res: selectedRes
            })
        }

        if (this.state.attrPolicy) {
            return (
                <div>
                    <CanvasJSChart options={options}
                        onRef={ref => this.chart = ref}
                    />
                    {/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
                </div>
            );
        } else {
            return null
        }
    }

    queryComplete = (e) => {
        console.log(e);
        console.log('selected point ', e.dataPoint.x);
        console.log('All possible noisy answers ', this.state.noisyRes)
        let selectedTrueAns = [];
        let selectedNoisyAns = [];
        let selectedAccuracy = null;
        // question: do we have to compare with differential privacy?
        // let's visualize the results and compare it with DP
        for (let i = 0; i < this.state.privacyThresholds.length; ++i) {
            if (this.state.privacyThresholds[i] === e.dataPoint.x) {
                selectedTrueAns = this.state.trueRes[i].trueRes;
                selectedNoisyAns = this.state.noisyRes[i].noisyAns;
                selectedAccuracy = this.state.queryAccuracy[i]
                break;
            }
        }
        // console.log('selected true answers ', selectedTrueAns)
        // console.log('selected noisy answers ', selectedNoisyAns)
        this.setState({
            queryResult: true,
            selectedTrueAns: selectedTrueAns,
            selectedNoisyAns: selectedNoisyAns,
            selectedAccuracy: selectedAccuracy
        })
    }

    displayResNoisy = () => {
        // console.log('Display Query results here: ', this.state.queryResult)
        console.log('Granularity labels: ', this.state.granularityLabels)
        if (this.state.queryResult) {
            // var CanvasJS = CanvasJSReact.CanvasJS;
            var CanvasJSChart = CanvasJSReact.CanvasJSChart;
            let noisyAnsPoints = [];
            const noisyAnswers = this.state.selectedNoisyAns;
            const numPredicates = noisyAnswers.length;
            // console.log("Selected Noisy Answer: ", noisyAnswers[0])
            for (let i = 0; i < numPredicates; ++i) {
                let y = 0;
                if (noisyAnswers[i] >= 0) {
                    y = noisyAnswers[i]
                }
                if (i === 0) {
                    noisyAnsPoints = noisyAnsPoints.concat(
                        {
                            x: this.state.granularityLabels[i].lower,
                            label: this.state.selectedAttr + "<" + this.state.granularityLabels[i].upper.toString(),
                            y: y
                        }
                    )
                } else if (i === numPredicates - 1) {
                    noisyAnsPoints = noisyAnsPoints.concat(
                        {
                            x: this.state.granularityLabels[i].lower,
                            label: this.state.granularityLabels[i].lower.toString() + "<=" + this.state.selectedAttr,
                            y: y
                        }
                    )
                } else {
                    noisyAnsPoints = noisyAnsPoints.concat(
                        {
                            x: this.state.granularityLabels[i].lower,
                            label: this.state.granularityLabels[i].lower.toString() + "<=" + this.state.selectedAttr + "<" + this.state.granularityLabels[i].upper.toString(),
                            y: y
                        }
                    )
                }
            }
            const options = {
                height: 330,
                width: 350,
                animationEnabled: true,
                exportEnabled: true,
                theme: "light2", //"light1", "dark1", "dark2"
                title: {
                    text: 'Query Noisy Counts(Blowfish)',
                    fontFamily: "cursive",
                    fontSize: 18
                },
                axisX: {
                    labelAngle: 50
                },
                axisY: {
                    includeZero: true
                },
                toolTip: {
                    shared: true
                },
                legend: {
                    cursor: "pointer",
                    itemclick: this.toggleDataSeries
                },
                data: [{
                    type: "column", //change type to bar, line, area, pie, etc
                    //indexLabel: "{y}", //Shows y value on all Data Points
                    indexLabelFontColor: "#5A5757",
                    indexLabelPlacement: "outside",
                    color: "#6D78AD",
                    dataPoints: noisyAnsPoints
                }]
            }

            return (
                <div>
                    <CanvasJSChart options={options}
                    /* onRef={ref => this.chart = ref} */
                    />
                    {/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
                </div>
            )
        } else {
            return (
                null
            )
        }
    }

    displayResTrue = () => {
        // console.log('Display Query results here: ', this.state.queryResult)
        if (this.state.queryResult) {
            // var CanvasJS = CanvasJSReact.CanvasJS;
            var CanvasJSChart = CanvasJSReact.CanvasJSChart;
            let trueAnsPoints = [];
            const trueAnswers = this.state.selectedTrueAns;
            const numPredicates = trueAnswers.length;
            for (let i = 0; i < numPredicates; ++i) {
                if (i === 0) {
                    trueAnsPoints = trueAnsPoints.concat(
                        {
                            x: this.state.granularityLabels[i].lower,
                            label: this.state.selectedAttr + "<" + this.state.granularityLabels[i].upper.toString(),
                            y: trueAnswers[i]
                        }
                    )
                } else if (i === numPredicates - 1) {
                    trueAnsPoints = trueAnsPoints.concat(
                        {
                            x: this.state.granularityLabels[i].lower,
                            label: this.state.granularityLabels[i].lower.toString() + "<=" + this.state.selectedAttr,
                            y: trueAnswers[i]
                        }
                    )
                } else {
                    trueAnsPoints = trueAnsPoints.concat(
                        {
                            x: this.state.granularityLabels[i].lower,
                            label: this.state.granularityLabels[i].lower.toString() + "<=" + this.state.selectedAttr + "<" + this.state.granularityLabels[i].upper.toString(),
                            y: trueAnswers[i]
                        }
                    )
                }
            }
            const options = {
                height: 330,
                width: 350,
                animationEnabled: true,
                exportEnabled: true,
                theme: "light2", //"light1", "dark1", "dark2"
                title: {
                    text: 'Query True Counts(Blowfish)',
                    fontFamily: "cursive",
                    fontSize: 18
                },
                axisX: {
                    labelAngle: 50
                },
                axisY: {
                    includeZero: true
                },
                toolTip: {
                    shared: true
                },
                legend: {
                    cursor: "pointer",
                    itemclick: this.toggleDataSeries
                },
                data: [{
                    type: "column", //change type to bar, line, area, pie, etc
                    //indexLabel: "{y}", //Shows y value on all Data Points
                    indexLabelFontColor: "#5A5757",
                    indexLabelPlacement: "outside",
                    color: "#6D78AD",
                    dataPoints: trueAnsPoints
                }]
            }

            return (
                <div>
                    <CanvasJSChart options={options}
                    /* onRef={ref => this.chart = ref} */
                    />
                    {/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
                </div>
            )
        } else {
            return (
                null
            )
        }
    }

    displayStats = () => {
        if (this.state.queryResult) {
            return (
                <Grid.Row className='attr'>
                    Query Accuracy: {this.state.selectedAccuracy}
                </Grid.Row>
            )
        }
    }

    // generate button from schema
    getButtonsUsingMap = () => {
        return this.state.databaseSchema.map((attr) => {
            return <Grid.Row style={{ margin: '0.1em', height: 50 }}>
                <Button onClick={() => this.attrClick(attr.attrName, attr.attrType)} style={{ margin: '0.5em', width: 200, height: 40 }}>
                    {attr.attrName}
                </Button>
            </Grid.Row>
        })
    }

    render() {
        return (
            <Segment.Group className='bottomPanels' >
                <Grid className="gridStyle" columns={4}>
                    <Grid.Column style={{ width: 250 }}>
                        <SchemaComponent
                            rowGeneratingFunction={this.getButtonsUsingMap}
                            datasetSelected={this.props.datasetSelected}
                        ></SchemaComponent>
                    </Grid.Column>
                    <Divider vertical style={{ left: 240, height: 360 }} />
                    <Grid.Column style={{ width: 300 }}>
                        <Grid rows={1}>
                            <Grid.Row style={{ margin: '3em', height: 290 }}>
                                {this.policyPanel()}
                            </Grid.Row>
                        </Grid>
                    </Grid.Column>
                    <Divider vertical style={{ left: 535, height: 360 }}></Divider>
                    <Grid.Column style={{ width: 500 }}>
                        <Grid rows={2}>
                            <Grid.Row className='chartContainer'>
                                <Grid columns={1}>
                                    <Grid.Column style={{ width: 400 }}>
                                        {this.privacyPanelTheshold()}
                                    </Grid.Column>
                                </Grid>
                            </Grid.Row>
                            <Divider fitted />
                            <Grid.Row>
                                {this.policyGraph()}
                            </Grid.Row>
                        </Grid>
                    </Grid.Column>
                    <Divider vertical style={{ left: 1035, height: 360 }}></Divider>
                    <Grid.Column style={{ width: 850 }}>
                        <Grid rows={2}>
                            <Grid.Row className='chartContainer'>
                                <Grid columns={2}>
                                    <Grid.Column style={{ width: 375 }}>
                                        {this.displayResNoisy()}
                                    </Grid.Column>
                                    <Grid.Column style={{ width: 375 }}>
                                        {this.displayResTrue()}
                                    </Grid.Column>
                                </Grid>
                            </Grid.Row>
                            <Divider fitted />
                            <Grid.Row style={{ margin: '3em', height: 290 }}>
                                {this.displayStats()}
                            </Grid.Row>
                        </Grid>
                    </Grid.Column>
                </Grid>
            </Segment.Group >
        )
    }
}

export default PanelComponent;