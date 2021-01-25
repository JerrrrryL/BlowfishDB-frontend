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
            res: null,
            queryGranularity: null,  // the granularity of the current query
        }

        this.getButtonsUsingMap = this.getButtonsUsingMap.bind(this)
        this.queryComplete = this.queryComplete.bind(this)
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
            attrPolicy: false
        });
        // console.log(this.state.defaultPolicy)
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
            for (let i = 1; i < diff + 1; ++i) {
                curPolicy = curPolicy.concat(i)
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
        // console.log(delPolicy)
        let options = [];
        for (let i = 0; i < delPolicy.policy.length; ++i) {
            options = options.concat({ value: delPolicy.policy[i], label: delPolicy.policy[i].toString() })
        }
        // console.log(options)
        this.setState({
            attrClicked: true,
            selectedAttr: attrName,
            selectedType: attrType,
            defaultPolicy: options
        });
    };

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
        console.log('================')
        console.log(this.state.currentCatPolicy)
        console.log('================')
        // this will be the api request for numerical values
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
            console.log('We enter here')
            console.log(this.state.currentCatPolicy)
            if (this.state.currentCatPolicy !== null) {
                for (let i = 0; i < this.state.currentCatPolicy.length; ++i) {
                    sensitiveSet = sensitiveSet.concat(this.state.currentCatPolicy[i].value)
                }
            }
            console.log('This is the sensitivity set: ', sensitiveSet)
        }
        console.log(threshold_array);
        this.setState({
            privacyThresholds: threshold_array
        })
        // add a huge threshold to derive result for differential privacy
        threshold_array = threshold_array.concat(Number.MAX_SAFE_INTEGER);
        const url = '/'
        // workload is hardcoded here, needs to be dynamically defined
        const data = {
            "workload": ["17<=age and age <18",
                "18<=age and age <19",
                "19<=age and age <20",
                "20<=age and age <21",
                "21<=age and age <22",
                "22<=age and age <23",
                "23<=age and age <24",
                "24<=age and age <25",
                "25<=age and age <26",
                "26<=age and age <27",
                "27<=age and age <28",
                "28<=age and age <29",
                "29<=age and age <30",
                "30<=age and age <31",
                "31<=age and age <32",
                "32<=age and age <33",
                "33<=age and age <34",
                "34<=age and age <35",
                "35<=age and age <36",
                "36<=age and age <37",
                "37<=age and age <38",
                "38<=age and age <39",
                "39<=age and age <40",
                "40<=age and age <41",
                "41<=age and age <42",
                "42<=age and age <43",
                "43<=age and age <44",
                "44<=age and age <45",
                "45<=age and age <46",
                "46<=age and age <47",
                "47<=age and age <48",
                "48<=age and age <49",
                "49<=age and age <50",
                "50<=age and age <51",
                "51<=age and age <52",
                "52<=age and age <53",
                "53<=age and age <54",
                "54<=age and age <55",
                "55<=age and age <56",
                "56<=age and age <57",
                "57<=age and age <58",
                "58<=age and age <59",
                "59<=age and age <60",
                "60<=age and age <61",
                "61<=age and age <62",
                "62<=age and age <63",
                "63<=age and age <64",
                "64<=age and age <65",
                "65<=age and age <66",
                "66<=age and age <67",
                "67<=age and age <68",
                "68<=age and age <69",
                "69<=age and age <70",
                "70<=age and age <71",
                "71<=age and age <72",
                "72<=age and age <73",
                "73<=age and age <74",
                "74<=age and age <75",
                "75<=age and age <76",
                "76<=age and age <77",
                "77<=age and age <78",
                "78<=age and age <79",
                "79<=age and age <80",
                "80<=age and age <81",
                "81<=age and age <82",
                "82<=age and age <83",
                "83<=age and age <84",
                "84<=age and age <85",
                "85<=age and age <86",
                "86<=age and age <87",
                "87<=age and age <88",
                "88<=age and age <89"],
            "attrName": "age",
            "attrType": "Numerical",
            "thresholds": threshold_array
        }
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
                const res = data.results;
                for (let i = 0; i < res.length - 1; ++i) {
                    epsilons = epsilons.concat(res[i].eps_max);
                    let trueAnsObj = {
                        'trueRes': res[i].true_answer
                    }
                    let noisyAnsObj = {
                        'noisyAns': res[i].noisy_answer
                    }
                    trueAns = trueAns.concat(trueAnsObj);
                    noisyAns = noisyAns.concat(noisyAnsObj);
                }
                console.log('---------------------');
                console.log(epsilons);
                // get the epsilons and true answers
                this.setState({
                    attrPolicy: true,
                    apiRespond: epsilons,
                    trueRes: trueAns,
                    noisyRes: noisyAns,
                    dpPrivacy: res[res.length - 1].eps_max
                })
            })
            .catch((err) => console.log(err))
    }

    // This weekend TODO: Compute the privacy loss given the templates, and generate graphs

    // TODO: Provide True answers/Noisy Answers for running the workload, generate graph

    // define policy and accuracy here
    policyPanel = () => {
        // we want to assign granularity Options dynamically
        console.log('This is the default policy(Granularity): ', this.state.defaultPolicy)
        if (this.state.attrClicked) {
            if (this.state.selectedType === 'numerical') {
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
                                onChange={(event) => {
                                    this.setState({
                                        workloadSelected: true,
                                        currentWorkload: event.value // one of histo, 1D-cdf or 2d-cdf
                                    })
                                }}>
                            </Select>
                            <Select
                                options={this.state.defaultPolicy}
                                placeholder='granularity'
                                className='inputEleShortRight'
                                onChange={(event) => {
                                    console.log(event);
                                    this.setState({
                                        queryGranularity: event.value
                                    })
                                }
                                }
                            />
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
        console.log("this is the dp loss", dpVal);
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
            width: 400,
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
        let selectedTrueAns = null;
        let selectedNoisyAns = null;
        // question: do we have to compare with differential privacy?
        for (let i = 0; i < this.state.privacyThresholds.length; ++i) {
            if (this.state.privacyThresholds[i] === e.dataPoint.x) {
                selectedTrueAns = this.state.trueRes[i];
                selectedNoisyAns = this.state.noisyRes[i];
                break;
            }
        }
        console.log('selected true answers ', selectedTrueAns)
        console.log('selected noisy answers ', selectedNoisyAns)
        this.setState({
            queryResult: true,
            res: e
        })
    }

    displayRes = () => {
        // var CanvasJS = CanvasJSReact.CanvasJS;
        var CanvasJSChart = CanvasJSReact.CanvasJSChart;
        console.log('-')
        console.log(this.state.res);
        const options = {
            height: 330,
            width: 400,
            animationEnabled: true,
            exportEnabled: true,
            theme: "light2", //"light1", "dark1", "dark2"
            title: {
                text: "Noisy Answer",
                fontFamily: "cursive",
                fontSize: 22
            },
            axisX: {
                labelAngle: 50
            },
            axisY: {
                includeZero: true
            },
            data: [{
                type: "column", //change type to bar, line, area, pie, etc
                //indexLabel: "{y}", //Shows y value on all Data Points
                indexLabelFontColor: "#5A5757",
                indexLabelPlacement: "outside",
                color: "#6D78AD",
                dataPoints: [
                    { x: 10, y: 71, label: 'abc' },
                    { x: 20, y: 55, label: 'abc' },
                    { x: 30, y: 50, label: 'abc' },
                    { x: 40, y: 65, label: 'abc' },
                    { x: 50, y: 71, label: 'abc' },
                    { x: 60, y: 68, label: 'abc' },
                    { x: 70, y: 38, label: 'abc' },
                    { x: 80, y: 92, label: 'abc' },
                    { x: 90, y: 54, label: 'abc' },
                    { x: 100, y: 60, label: 'abc' },
                    { x: 110, y: 21, label: 'abc' },
                    { x: 120, y: 49, label: 'abc' },
                    { x: 130, y: 36, label: 'abc' }
                ]
            }]
        }

        if (this.state.queryResult) {
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
                    <Grid.Column style={{ width: 540 }}>
                        <Grid rows={2}>
                            <Grid.Row className='chartContainer'>
                                {this.privacyPanelTheshold()}
                            </Grid.Row>
                            <Divider fitted />
                            <Grid.Row>
                                {this.policyGraph()}
                            </Grid.Row>
                        </Grid>
                    </Grid.Column>
                    <Divider vertical style={{ left: 1075, height: 360 }}></Divider>
                    <Grid.Column style={{ width: 810 }}>
                        <Grid rows={2}>
                            <Grid.Row className='chartContainer'>
                                {this.displayRes()}
                            </Grid.Row>
                            <Divider fitted />
                            <Grid.Row style={{ margin: '3em', height: 290 }}>
                            </Grid.Row>
                        </Grid>
                    </Grid.Column>
                </Grid>
            </Segment.Group >
        )
    }
}

export default PanelComponent;