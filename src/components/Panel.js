import React, { Component } from 'react'
import CanvasJSReact from './canvasjs.react';
import { Button, Divider, Grid, Segment } from 'semantic-ui-react'
import Select from 'react-select'
import makeAnimated from 'react-select/animated';
import PolicyGraph from './PolicyGraph'
import SchemaComponent from './Schema'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const url = '/'

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
    { value: 0.005, label: '0.005' },
    // { value: 10, label: '10' },
    // { value: 1, label: '1' }
]

const epsilonOptions = [
    { value: 0.001, label: '0.001' },
    { value: 0.01, label: '0.01' },
    { value: 0.1, label: '0.1' },
    { value: 1, label: '1' },
    { value: 5, label: '5' },
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
                { attrName: 'age', domain: [0, 100] },
                {
                    attrName: 'workclass',
                    domain: ['?', 'Federal-gov', 'Local-gov', 'Never-worked', 'Private',
                        'Self-emp-inc', 'Self-emp-not-inc', 'State-gov', 'Without-pay']
                },
                {
                    attrName: 'fnlwgt',
                    domain: [0, 1490400]
                },
                {
                    attrName: 'education',
                    domain: ['Bachelors', 'Some-college', '11th',
                        'HS-grad', 'Prof-school', 'Assoc-acdm', 'Assoc-voc', '9th', '7th-8th',
                        '12th', 'Masters', '1st-4th', '10th', 'Doctorate', '5th-6th', 'Preschool']
                },
                { attrName: 'edunum', domain: [0, 20] },
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
                    domain: [0, 100000]
                },
                {
                    attrName: 'caploss',
                    domain: [0, 5000]
                },
                {
                    attrName: 'hourweek',
                    domain: [0, 100]
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
            policyNoisyRes: [],  // the noisy answers with Threshold (Blowfish)
            noisyRes: [],  // the noisy answers with DP
            trueRes: [],  // the true answers
            privacyThresholds: [], // the x values for privacy analysis
            dpPrivacy: null,  // the privacy loss for differential privacy
            trueResult: false,  // if this is true, we have the true query results ready
            noisyResult: false,  // if this is true, we have the noisy query results ready (DP)
            policyResult: false,  // if this is true, we have the noisy query results ready (Blowfish)
            queryGranularity: null,  // the granularity of the current query
            granularityLabels: null,  // the granularity labels for the granularity specified above
            queryAccuracy: [],  // the accuracy of the queries
            selectedAccuracy: null,  // the accuracy of the selected queries
            targetEpsilon: null,  // target epsilon for accuracy v.s. threshold panel
            displayAccuracyComparison: false,  // if this is true, we display the comparison between blowfish and DP
            selectedAccuracies: [],  // the accuracies for epsilons
            selectedDPAccuracies: [],  // the dp accuracies for epsilons
            epsilonArr: [],  // available epsilons 
        }

        this.getButtonsUsingMap = this.getButtonsUsingMap.bind(this);
        this.thresholdSelected = this.thresholdSelected.bind(this);
        this.asyncResFunction = this.asyncResFunction.bind(this);
        this.asyncNoisyFunction = this.asyncNoisyFunction.bind(this);
        this.asyncPolicyFunction = this.asyncPolicyFunction.bind(this);
        this.asyncComparisonFunction = this.asyncComparisonFunction.bind(this);
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
            attrPolicy: false,
            currentWorkload: null,
            queryGranularity: null,
            granularityLabels: null,
            queryAccuracy: [],
            selectedAccuracy: null,
            trueResult: false,
            noisyResult: false,
            policyResult: false,
            displayAccuracyComparison: false,
            selectedAccuracies: [],
            selectedDPAccuracies: [],
            epsilonArr: [],
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

    // visualize the policy graph
    visualizePolicy = () => {
        console.log('------------------------This is here-----------------------')
        this.setState({
            policyVisualization: true
        })
    }

    // visualize policy graph when pressing the button
    // pass the attribute the visualize into the function
    policyGraph = () => {
        if (this.state.policyVisualization && this.state.attrClicked) {
            // this.computeGranularity(this.state.queryGranularity);
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
                        granularity={this.state.queryGranularity}
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
            <Grid.Row> Select threshold to compare accuracy with Differential Privacy
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
            </Grid.Row>
        )
    }

    // visualization for default policy
    numerical_menu_single = () => {
        const animatedComponents = makeAnimated();
        // console.log(this.state.defaultPolicy)
        return (
            <Grid rows={2}>
                <Grid.Row className="blowfishCountLabel">Display Query Result wrt specified Blowfish Privacy</Grid.Row>
                <Grid.Row className="blowfishThreshold">
                    <Grid columns={2}>
                        <Grid.Column className='policyThresholdLabel'>
                            Policy Threshold:
                        </Grid.Column>
                        <Grid.Column>
                            <Select
                                placeholder='Threshold'
                                components={animatedComponents}
                                className='inputEleShort'
                                options={this.state.defaultPolicy}
                                value={this.state.visualNumPolicy}
                                onChange={this.handleChangeThreshold} />
                        </Grid.Column>
                    </Grid>
                </Grid.Row>
            </Grid>
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

    // get the true answer for queries, only the attribute name and granularity are needed
    getQueryTrueAnswer(granu, callback) {
        if (this.state.selectedType === 'numerical') {
            let workload = null;
            if (this.state.currentWorkload === null) {
                workload = '1D-Histogram'
            } else { workload = this.state.currentWorkload.value }
            const data = {
                "granularity": granu,
                "lower": this.state.currentNumericalDomain.domain[0],
                "upper": this.state.currentNumericalDomain.domain[1],
                "alpha": this.state.alpha,
                "beta": this.state.beta,
                "workload": workload,
                "attrName": this.state.selectedAttr,
                "attrType": this.state.selectedType,
            }
            // console.log("This is the API request Data", data)
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
                    const res = data.results;
                    // console.log('This is the API response: ', res)
                    this.setState({
                        trueRes: res,
                    })
                    callback();
                })
                .catch((err) => console.log(err))
        }
    }

    getQueryNoisyAnswer(granu, epsilon, alpha, beta, threshold, callback) {
        console.log('This is the threshold:', epsilon)
        if (this.state.selectedType === 'numerical') {
            let workload = null;
            const isArray = Array.isArray(epsilon);
            console.log('This is the data type: ', isArray);
            if (this.state.currentWorkload === null) {
                workload = '1D-Histogram';
            } else { workload = this.state.currentWorkload.value }
            const data = {
                "granularity": granu,
                "workload": workload,
                "lower": this.state.currentNumericalDomain.domain[0],
                "upper": this.state.currentNumericalDomain.domain[1],
                "attrName": this.state.selectedAttr,
                "attrType": this.state.selectedType,
                "target_epsilon": epsilon,
                "target_dp": threshold,
                "alpha": alpha,
                "beta": beta,
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
                    const res = data.results;
                    console.log('This is the API response: ', res)
                    if (isArray) {
                        let accuracies = [];
                        let dpaccuracies = [];
                        // When the epsilon value is an array
                        for (let i = 0; i < res.length; ++i) {
                            accuracies = accuracies.concat(res[i].accuracy);
                            ++i;
                            dpaccuracies = dpaccuracies.concat(res[i].accuracy);
                        }
                        console.log("This is the accuracy:", accuracies);
                        console.log("This is DP accuracy", dpaccuracies);
                        this.setState({
                            selectedAccuracies: accuracies,
                            selectedDPAccuracies: dpaccuracies,
                        })
                    } else {
                        // When we only give a single epsilon value
                        // or a single pair of alpha and beta
                        if (threshold === Number.MAX_SAFE_INTEGER) {
                            this.setState({
                                noisyRes: res,
                            })
                        } else {
                            this.setState({
                                policyNoisyRes: res,
                            })
                        }
                    }
                    callback();
                })
                .catch((err) => console.log(err))
        }
    }

    // after confirmation, we submit the result to the api
    toggleButtonState = () => {
        // this.computeGranularity(this.state.queryGranularity);
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
        threshold_array = threshold_array.concat(Number.MAX_SAFE_INTEGER);

        if (this.state.selectedType === 'numerical') {
            let queryGranu = null;
            let workload = null;
            let epsilon = null;
            if (this.state.queryGranularity === null) {
                queryGranu = 1;
            } else {
                queryGranu = this.state.queryGranularity.value
            }
            if (this.state.currentWorkload === null) {
                workload = '1D-Histogram'
            } else { workload = this.state.currentWorkload.value }
            if (this.state.targetEpsilon !== null) {
                epsilon = this.state.targetEpsilon.value;
            }
            // console.log('This is the current workload: ', this.state.currentWorkload)
            const data = {
                "workload": workload,
                "granularity": queryGranu,
                "alpha": this.state.alpha,
                "beta": this.state.beta,
                "lower": this.state.currentNumericalDomain.domain[0],
                "upper": this.state.currentNumericalDomain.domain[1],
                "target_epsilon": epsilon,
                "attrName": this.state.selectedAttr,
                "attrType": this.state.selectedType,
                "thresholds": threshold_array,
            }

            // TODO: need alerts to make sure the granularity and the attrNa
            // console.log("This is the API request Data", data)
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
                    let accuracies = []
                    const res = data.results;
                    // console.log('This is the API response: ', res)
                    for (let i = 0; i < res.length; ++i) {
                        accuracies = accuracies.concat(res[i].accuracy)
                    }
                    this.setState({
                        attrPolicy: true,
                        queryAccuracy: accuracies,
                    })
                })
                .catch((err) => console.log(err))
        }
    }

    handleChangeAlpha = value => {
        this.setState({
            alpha: value
        },
            () => {
                if (this.state.beta !== null) {
                    this.getQueryNoisyAnswer(
                        this.state.queryGranularity.value,
                        null,
                        this.state.alpha,
                        this.state.beta,
                        Number.MAX_SAFE_INTEGER,
                        this.asyncNoisyFunction,
                    );
                }
            }
        )
    };

    handleChangeBeta = value => {
        this.setState({
            beta: value
        },
            () => {
                if (this.state.alpha !== null) {
                    this.getQueryNoisyAnswer(
                        this.state.queryGranularity.value,
                        null,
                        this.state.alpha,
                        this.state.beta,
                        Number.MAX_SAFE_INTEGER,
                        this.asyncNoisyFunction,
                    );
                }
            }
        )
    };

    handleChangeWorkload = value => {
        this.setState({
            workloadSelected: true,
            currentWorkload: value
        })
    };

    asyncResFunction() {
        // console.log('This is the true counts:', this.state.trueRes)
        this.setState({
            trueResult: true,
        })
    }

    asyncNoisyFunction() {
        // console.log('This is the noisy counts:', this.state.noisyRes)
        this.setState({
            noisyResult: true,
        })
    }

    // for policy graph
    asyncPolicyFunction() {
        this.setState({
            policyResult: true,
        })
    }

    computeGranularity = (queryGranularity, lowerBound, upperBound) => {
        // console.log('Parameters:', queryGranularity, lowerBound, upperBound)
        let selectedGranu = queryGranularity;
        // sanity check, assign defaut to be 1 if null
        if (selectedGranu === null) {
            selectedGranu = 1
        }
        let granuLabels = [];
        let numEle = Math.ceil((upperBound - lowerBound + 1) / selectedGranu)
        for (let i = 0; i < numEle; ++i) {
            granuLabels = granuLabels.concat({
                lower: lowerBound + i * selectedGranu,
                upper: lowerBound + (i + 1) * selectedGranu
            })
        }
        // console.log('This is the computed granularity at the end: ', granuLabels)
        return granuLabels;
    }

    plotTrueCounts = () => {
        var CanvasJSChart = CanvasJSReact.CanvasJSChart;
        let trueAnsPoints = [];
        const granularity = this.state.queryGranularity.value;
        const lower = this.state.currentNumericalDomain.domain[0];
        const upper = this.state.currentNumericalDomain.domain[1];
        const trueCounts = this.state.trueRes;
        const attrName = this.state.selectedAttr;
        const granularityLabels = this.computeGranularity(granularity, lower, upper);
        // console.log('the granularity labels are:', granularityLabels)
        const numPredicates = trueCounts.length;
        for (let i = 0; i < numPredicates; ++i) {
            const x = (granularityLabels[i].lower + granularityLabels[i].upper) / 2;
            if (i === 0) {
                trueAnsPoints = trueAnsPoints.concat(
                    {
                        x: x,
                        label: attrName + "<" + granularityLabels[i].upper.toString(),
                        y: trueCounts[i]
                    }
                )
            } else if (i === numPredicates - 1) {
                trueAnsPoints = trueAnsPoints.concat(
                    {
                        x: x,
                        label: granularityLabels[i].lower.toString() + "<=" + attrName,
                        y: trueCounts[i]
                    }
                )
            } else {
                trueAnsPoints = trueAnsPoints.concat(
                    {
                        x: x,
                        label: granularityLabels[i].lower.toString() + "<=" + attrName + "<" + granularityLabels[i].upper.toString(),
                        y: trueCounts[i]
                    }
                )
            }
        }
        const options = {
            height: 250,
            width: 275,
            animationEnabled: true,
            exportEnabled: true,
            theme: "light2", //"light1", "dark1", "dark2"
            title: {
                text: 'True Counts',
                fontSize: 16
            },
            axisX: {
                labelAngle: 50,
                minimum: lower,
                maximum: upper
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
    }

    // currently they are separated, then we
    plotNoisyCounts = (noisyCounts) => {
        var CanvasJSChart = CanvasJSReact.CanvasJSChart;
        let noisyAnsPoints = [];
        const granularity = this.state.queryGranularity.value;
        const lower = this.state.currentNumericalDomain.domain[0];
        const upper = this.state.currentNumericalDomain.domain[1];
        // let noisyCounts = this.state.noisyRes;
        const attrName = this.state.selectedAttr;
        const granularityLabels = this.computeGranularity(granularity, lower, upper);
        const numPredicates = noisyCounts.length;
        // console.log('This is the granularity labels:', granularityLabels)
        // console.log('This is the granularity labels length:', this.state.noisyRes)
        if (numPredicates === granularityLabels.length) {
            for (let i = 0; i < numPredicates; ++i) {
                let y = 0;
                const x = (granularityLabels[i].lower + granularityLabels[i].upper) / 2
                if (noisyCounts[i] >= 0) {
                    y = noisyCounts[i];
                }
                if (i === 0) {
                    noisyAnsPoints = noisyAnsPoints.concat(
                        {
                            x: x,
                            label: attrName + "<" + granularityLabels[i].upper.toString(),
                            y: y
                        }
                    )
                } else if (i === numPredicates - 1) {
                    noisyAnsPoints = noisyAnsPoints.concat(
                        {
                            x: x,
                            label: granularityLabels[i].lower.toString() + "<=" + attrName,
                            y: y
                        }
                    )
                } else {
                    noisyAnsPoints = noisyAnsPoints.concat(
                        {
                            x: x,
                            label: granularityLabels[i].lower.toString() + "<=" + attrName + "<" + granularityLabels[i].upper.toString(),
                            y: y
                        }
                    )
                }
            }
        }
        const options = {
            height: 250,
            width: 275,
            animationEnabled: true,
            exportEnabled: true,
            theme: "light2", //"light1", "dark1", "dark2"
            title: {
                text: 'Noisy Counts',
                fontSize: 16
            },
            axisX: {
                labelAngle: 50,
                minimum: lower,
                maximum: upper
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
    }

    displayTrueCounts = () => {
        if (this.state.trueResult) {
            return (
                this.plotTrueCounts()
            )
        } else {
            return null;
        }
    }

    // display the noisy results after target epsilon is selected (DP)
    displayNoisyCounts = () => {
        if (this.state.noisyResult) {
            return (
                this.plotNoisyCounts(this.state.noisyRes)
            )
        } else {
            return null;
        }
    }

    // display the noisy results under target epsilon and 
    displayPolicyNoisyCounts = () => {
        if (this.state.policyResult) {
            return (
                this.plotNoisyCounts(this.state.policyNoisyRes)
            )
        } else {
            return null;
        }
    }

    handleChangeGranularity = value => {
        this.setState({
            queryGranularity: value
        })
        if (this.state.trueResult) {
            this.setState({
                trueResult: false,  // make sure we can switch granularity
            })
        }
        // console.log('This is the query granularity: ', value.value)
        this.getQueryTrueAnswer(value.value, this.asyncResFunction)
        if (this.state.noisyResult) {
            this.setState({
                noisyResult: false,  // make sure we are able to switch target epsilon
            })
            this.getQueryNoisyAnswer(value.value,
                this.state.targetEpsilon.value,
                null,
                null,
                Number.MAX_SAFE_INTEGER,
                this.asyncNoisyFunction);
        }

        // update the policy threshold counts correspondingly as well
        if (this.state.policyResult) {
            this.setState({
                policyResult: false,  // make sure we are able to switch policy thresholds
            })
            this.getQueryNoisyAnswer(value.value,
                this.state.targetEpsilon.value,
                null,
                null,
                this.state.visualNumPolicy.value,
                this.asyncPolicyFunction);
        }
    }

    // Update Noisy Count with Epsilon
    handleChangeEpsilon = value => {
        this.setState({
            targetEpsilon: value
        })
        if (this.state.noisyResult) {
            this.setState({
                noisyResult: false,  // make sure we are able to switch target epsilon
            })
        }
        this.getQueryNoisyAnswer(this.state.queryGranularity.value,
            value.value,
            null,
            null,
            Number.MAX_SAFE_INTEGER,
            this.asyncNoisyFunction);
        // update the policy threshold counts correspondingly as well
        if (this.state.policyResult) {
            this.setState({
                policyResult: false,  // make sure we are able to switch policy thresholds
            })
            this.getQueryNoisyAnswer(this.state.queryGranularity.value,
                this.state.targetEpsilon.value,
                null,
                null,
                value.value,
                this.asyncPolicyFunction);
        }
    }

    // Update Noisy Count with threshold
    handleChangeThreshold = value => {
        console.log('--------------------------', value);
        this.setState({
            visualNumPolicy: value,
        })
        if (this.state.policyResult) {
            this.setState({
                policyResult: false,  // make sure we are able to switch policy thresholds
            })
        }
        if (this.state.targetEpsilon === null) {
            this.getQueryNoisyAnswer(this.state.queryGranularity.value,
                null,
                this.state.alpha,
                this.state.beta,
                value.value, this.asyncPolicyFunction);
        } else {
            this.getQueryNoisyAnswer(this.state.queryGranularity.value,
                this.state.targetEpsilon.value,
                this.state.alpha,
                this.state.beta,
                value.value, this.asyncPolicyFunction);
        }
    }

    // Helper for numerical policy panel for privacy budget vs threshold
    numPolicyPanelPrivacyBudget = () => {
        const { currentWorkload } = this.state
        const { targetEpsilon } = this.state
        const { queryGranularity } = this.state
        return (
            <Grid padding textAlign='left' style={{ margin_bottom: '0.1em', height: 20 }}>
                <Grid.Row className='attr'>
                    Name: {this.state.selectedAttr}
                </Grid.Row>
                <Grid.Row className='attr'>
                    Type: {this.state.selectedType}  [{this.state.currentNumericalDomain.domain[0]}, {this.state.currentNumericalDomain.domain[1]}]
                </Grid.Row>
                <Grid.Row>
                    <div> Query Type:
                        <Select
                            placeholder='Workload'
                            className='inputEleShortLeft'
                            options={workloadOptions}
                            defaultInputValue='1D-Histogram'
                            value={currentWorkload}
                            onChange={this.handleChangeWorkload}
                        />
                    </div>
                    <div> Query Granularity:
                        <Select
                            options={this.state.defaultPolicy}
                            placeholder='Granularity'
                            className='inputEleShortRight'
                            value={queryGranularity}
                            onChange={this.handleChangeGranularity}
                        />
                    </div>
                </Grid.Row>
                <Grid.Row>
                    <div> Target Privacy Loss:
                        <Select
                            options={epsilonOptions}
                            placeholder='Epsilon'
                            className='inputEle'
                            value={targetEpsilon}
                            onChange={this.handleChangeEpsilon} />
                    </div>
                </Grid.Row>
                <Grid.Row style={{ margin: '0.3em', height: 60 }}>
                    {this.visualButton()}
                </Grid.Row>
            </Grid >
        )
    }

    // Ensure that query granularity is selected before we visualize them
    visualButton = () => {
        if (this.state.queryGranularity === null) {
            return (
                null
            )
        } else {
            return (
                <Button
                    onClick={() =>
                        this.visualizePolicy(this.state.alpha, this.state.beta)
                    } style={{ width: 230, height: 40 }}>Visualize Policy</Button>
            )
        }
    }

    // To submit the policies
    numPolicySubmit = () => {
        if (this.state.policyVisualization && this.state.attrClicked) {
            return (
                <Grid>
                    <Grid.Row>
                        {this.numerical_menu()}
                    </Grid.Row>
                    <Grid.Row></Grid.Row>
                    <Grid.Row></Grid.Row>
                    <Grid.Row></Grid.Row>
                    <Grid.Row>
                        <Button onClick={
                            // () => this.submitPolicy()
                            this.toggleButtonState
                        } style={{ width: 235, height: 40 }}>Confirm</Button>
                    </Grid.Row>
                </Grid>
            )
        }
    }

    // To select the threshold
    numPolicyVisual = () => {
        if (this.state.policyVisualization && this.state.attrClicked) {
            return (
                <Grid>
                    <Grid.Row>
                        {this.numerical_menu_single()}
                    </Grid.Row>
                </Grid>
            )
        }
    }

    // Helper for numerical policy panel for Accuracy (alpha & beta) vs threshold
    numPolicyPanelAcc = () => {
        const { currentWorkload } = this.state
        const { alpha } = this.state
        const { beta } = this.state
        const { queryGranularity } = this.state
        return (
            <Grid textAlign='left' class="numPolicyPanel">
                <Grid.Row className='attr'>
                    Name: {this.state.selectedAttr}
                </Grid.Row>
                <Grid.Row className='attr'>
                    Type: {this.state.selectedType} [{this.state.currentNumericalDomain.domain[0]}, {this.state.currentNumericalDomain.domain[1]}]
                </Grid.Row>
                <Grid.Row>
                    <div> Query Type:
                        <Select
                            placeholder='Workload'
                            className='inputEleShortLeft'
                            options={workloadOptions}
                            defaultInputValue='1D-Histogram'
                            value={currentWorkload}
                            onChange={this.handleChangeWorkload}
                        />
                    </div>
                    <div> Query Granularity:
                        <Select
                            options={this.state.defaultPolicy}
                            placeholder='Granularity'
                            className='inputEleShortRight'
                            value={queryGranularity}
                            onChange={this.handleChangeGranularity}
                        />
                    </div>
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
                <Grid.Row style={{ margin: '0.3em', height: 60 }}>
                    {this.visualButton()}
                </Grid.Row>
            </Grid >
        )
    }


    policyPanel = () => {
        // we want to assign granularity Options dynamically
        if (this.state.attrClicked) {
            if (this.state.selectedType === 'numerical') {
                return (
                    <Tabs>
                        <TabList>
                            <Tab>Accuracy vs. Threshold</Tab>
                            <Tab>Privacy Budget vs. Threshold</Tab>
                        </TabList>
                        <TabPanel>
                            <Grid columns={2}>
                                <Grid.Column style={{ width: 300 }}>
                                    <Grid.Row className="policyPanel">
                                        {this.numPolicyPanelAcc()}
                                    </Grid.Row>
                                    <Grid.Row className="policyVisual">
                                        {this.policyGraph()}
                                    </Grid.Row>
                                </Grid.Column>
                                <Grid.Column style={{ width: 600 }}>
                                    <Grid.Row className='chartContainer'>
                                        <Grid columns={2}>
                                            <Grid.Column style={{ width: 300 }}>
                                                <Grid.Row className="trueCount">
                                                    {this.displayTrueCounts()}
                                                </Grid.Row>
                                                <Grid.Row>
                                                    {this.numPolicyVisual()}
                                                </Grid.Row>
                                                <Grid.Row className="blowfishCount">
                                                    {this.displayPolicyNoisyCounts()}
                                                </Grid.Row>
                                            </Grid.Column>
                                            <Grid.Column style={{ width: 300 }}>
                                                <Grid.Row className="trueCount">
                                                    {this.displayNoisyCounts()}
                                                </Grid.Row>
                                                <Grid.Row>
                                                    {this.numPolicySubmit()}
                                                </Grid.Row>
                                            </Grid.Column>
                                        </Grid>
                                    </Grid.Row>
                                </Grid.Column>
                            </Grid>
                            {/* <Grid columns={1}>
                                    <Grid.Column style={{ width: 400 }}>
                                        {this.privacyPanelTheshold()}
                                    </Grid.Column>
                                </Grid>
                            <Grid.Row>
                                {this.policyGraph()}
                            </Grid.Row> */}
                        </TabPanel>
                        <TabPanel>
                            <Grid columns={3}>
                                <Grid.Column style={{ width: 300 }}>
                                    <Grid.Row className="policyPanel">
                                        {this.numPolicyPanelPrivacyBudget()}
                                    </Grid.Row>
                                    <Grid.Row className="policyVisual">
                                        {this.policyGraph()}
                                    </Grid.Row>
                                </Grid.Column>
                                <Grid.Column style={{ width: 600 }}>
                                    <Grid.Row className='chartContainer'>
                                        <Grid columns={2}>
                                            <Grid.Column style={{ width: 300 }}>
                                                <Grid.Row className="trueCount">
                                                    {this.displayTrueCounts()}
                                                </Grid.Row>
                                                <Grid.Row>
                                                    {this.numPolicyVisual()}
                                                </Grid.Row>
                                                <Grid.Row className="blowfishCount">
                                                    {this.displayPolicyNoisyCounts()}
                                                </Grid.Row>
                                            </Grid.Column>
                                            <Grid.Column style={{ width: 300 }}>
                                                <Grid.Row className="trueCount">
                                                    {this.displayNoisyCounts()}
                                                </Grid.Row>
                                                <Grid.Row>
                                                    {this.numPolicySubmit()}
                                                </Grid.Row>
                                            </Grid.Column>
                                        </Grid>
                                    </Grid.Row>
                                </Grid.Column>
                            </Grid>
                        </TabPanel>
                    </Tabs>
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
    plotAccuracyThreshold = () => {
        // var CanvasJS = CanvasJSReact.CanvasJS;
        var CanvasJSChart = CanvasJSReact.CanvasJSChart;
        let accuracyPoints = [];
        let accuracyVal = this.state.queryAccuracy[this.state.queryAccuracy.length - 1];
        // console.log("this is the dp loss", dpVal);
        for (let i = 0; i < this.state.queryAccuracy.length - 1; ++i) {
            accuracyPoints = accuracyPoints.concat(
                {
                    x: this.state.privacyThresholds[i],
                    y: this.state.queryAccuracy[i]
                }
            )
        }

        const options = {
            height: 250,
            width: 300,
            theme: "light2",
            animationEnabled: true,
            exportEnabled: true,
            title: {
                text: "Accuracy VS Thresholds",
                fontSize: 16
            },
            axisX: {
                title: "Thresholds",
                titleFontSize: 16,
                interval: 1
            },
            axisY: {
                titleFontSize: 16,
                titleFontColor: "#6D78AD",
                lineColor: "#6D78AD",
                labelFontColor: "#6D78AD",
                tickColor: "#6D78AD",
                maximum: 1,
                minimum: accuracyVal - 0.005,
                stripLines: [
                    {
                        label: "Differential Privacy",
                        labelFontColor: "#6D78AD",
                        value: accuracyVal,
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
                click: this.thresholdSelected,
                type: "spline",
                name: "Privacy Loss (Blowfish)",
                showInLegend: true,
                xValueFormatString: "Threshold: ####",
                yValueFormatString: "##0.###",
                dataPoints: accuracyPoints
            },
            ]
        }

        console.log('This is the datapoints ', options)
        return (
            <div>
                <CanvasJSChart options={options}
                    onRef={ref => this.chart = ref}
                />
                {/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
            </div>
        );
    }

    asyncComparisonFunction() {
        this.setState({
            displayAccuracyComparison: true,
        })
    }

    thresholdSelected = (e) => {
        const selecetedThreshold = e.dataPoint.x;
        console.log('This is the selected threshold ', selecetedThreshold)
        let epsilonArray = [];
        for (let i = 0; i < epsilonOptions.length; ++i) {
            epsilonArray = epsilonArray.concat(epsilonOptions[i].value);
        }
        console.log('This is the total number of epsilons we wanna visualize ', epsilonArray);
        this.setState({
            epsilonArr: epsilonArray,
        },
            () => {
                this.getQueryNoisyAnswer(this.state.queryGranularity.value,
                    epsilonArray,
                    this.state.alpha,
                    this.state.beta,
                    selecetedThreshold,
                    this.asyncComparisonFunction)
            }
        )
    }

    plotAccuracyComparison = () => {
        var CanvasJSChart = CanvasJSReact.CanvasJSChart;
        let blowfishAccuracy = [];
        let dpAccuracy = [];
        // console.log("this is the dp loss", dpVal);
        for (let i = 0; i < this.state.selectedAccuracies.length; ++i) {
            blowfishAccuracy = blowfishAccuracy.concat(
                {
                    x: this.state.epsilonArr[i],
                    y: this.state.selectedAccuracies[i]
                }
            )
            dpAccuracy = dpAccuracy.concat(
                {
                    x: this.state.epsilonArr[i],
                    y: this.state.selectedDPAccuracies[i]
                }
            )
        }
        console.log("This is the final res:", blowfishAccuracy, dpAccuracy)

        const options = {
            height: 250,
            width: 300,
            theme: "light2",
            animationEnabled: true,
            exportEnabled: true,
            title: {
                text: "Accuracy VS Privacy Budget",
                fontSize: 16
            },
            axisX: {
                title: "Privacy Budget",
                titleFontSize: 14,
                logarithmic: true,
            },
            axisY: {
                title: "Accuracy",
                titleFontSize: 14,
                titleFontColor: "#6D78AD",
                lineColor: "#6D78AD",
                labelFontColor: "#6D78AD",
                tickColor: "#6D78AD",
            },
            toolTip: {
                shared: true
            },
            legend: {
                cursor: "pointer",
                itemclick: this.toggleDataSeries
            },
            data: [{
                type: "spline",
                name: "Accuracy (Blowfish)",
                showInLegend: true,
                xValueFormatString: "Epsilon: ####",
                yValueFormatString: "##0.###",
                dataPoints: blowfishAccuracy
            }, {
                type: "spline",
                name: "Accuracy (Differential Privacy)",
                showInLegend: true,
                xValueFormatString: "Epsilon: ####",
                yValueFormatString: "##0.###",
                dataPoints: dpAccuracy
            },
            ]
        }

        if (this.state.displayAccuracyComparison) {
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

    displayStats = () => {
        if (this.state.attrPolicy) {
            return (
                <Grid columns={1}>
                    <Grid.Column style={{ width: 350 }}>
                        <Grid.Row className="querySummaryPosition">Outstanding Thresholds wrt Query Accuracy.</Grid.Row>
                        <Grid.Row className="resultPlot">
                            {this.plotAccuracyThreshold()}
                        </Grid.Row>
                        <Grid.Row className="thresholdComparisonDesc">
                            Please select the points in the graph above to plot Comparison betweeen Blowfish and Differential Privacy
                        </Grid.Row>
                        <Grid.Row className="chartContainer">
                            {this.plotAccuracyComparison()}
                        </Grid.Row>
                    </Grid.Column>
                </Grid>

            )
        } else {
            return null;
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
            <Segment.Group className="mainPanelSize">
                <Grid className="gridStyle" columns={4}>
                    <Grid.Column style={{ width: 250 }}>
                        <SchemaComponent
                            rowGeneratingFunction={this.getButtonsUsingMap}
                            datasetSelected={this.props.datasetSelected}
                        ></SchemaComponent>
                    </Grid.Column>
                    <Divider vertical style={{ left: 240, height: 360 }} />
                    <Grid.Column style={{ width: 900 }}>
                        {this.policyPanel()}
                    </Grid.Column>
                    <Divider vertical style={{ left: 1135, height: 360 }}></Divider>
                    <Grid.Column style={{ width: 350 }}>
                        {this.displayStats()}
                    </Grid.Column>
                </Grid>
            </Segment.Group>
        )
    }
}

export default PanelComponent;