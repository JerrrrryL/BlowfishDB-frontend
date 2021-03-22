import React, { Component } from 'react'
import CanvasJSReact from './canvasjs.react';
import { Button, Divider, Grid, Segment } from 'semantic-ui-react'
import Select from 'react-select'
import makeAnimated from 'react-select/animated';
import SchemaComponent from './Schema'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Table from './analystTable';

const url = '/'

const workloadOptions = [
    { value: '1D-Histogram', label: '1D-Histogram' },
    { value: '1D-Cumulative', label: '1D-Acc' },
    { value: '2D-Cumulative', label: '2D-Histogram' }
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

// The bottom left panel for user input
class AnalystPanelComponent extends Component {
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
            alpha: null, // alpha and beta for APEx
            beta: null,
            defaultPolicy: null, // {'attrName': '', 'policy': []} used for dropdown menu for users to select
            attrPolicy: false, // if this is true, generate privacy analysis graph wrt the attribute
            currentWorkload: null, // current workload selected by the user
            policyVisualization: false, // if we want to visualize the policy
            currentNumericalDomain: null, // current domain for numerical attribute
            currentCatPolicy: null, // sensitivity set by user, used for both privacy analysis and attribute visualization
            currentNumPolicy: null, // threshold by user, used for privacy analysis but not attribute visualization
            currentCategorcialDomain: [],
            visualNumPolicy: null, // threshold for the user to visualize policy
            curNoisyRes: [],  // the current noisy count
            noisyRes: [],  // the noisy answers by data analyst
            privacyThresholds: [], // the x values for privacy analysis
            noisyResult: false,  // if this is true, we have the noisy query results ready (DP)
            queryGranularity: null,  // the granularity of the current query
            granularityLabels: null,  // the granularity labels for the granularity specified above
            queryAccuracy: [],  // the accuracy of the queries
            targetEpsilon: null,  // target epsilon for accuracy v.s. threshold panel
            displayAccuracyComparison: false,  // if this is true, we display the comparison between blowfish and DP
            selectedDPAccuracies: [],  // the dp accuracies for epsilons
            remainingBudget: 2,  // the privacy budget for analyst
            queryAttributes: [],  // the attributes query on, currently a numerical and a categorical
            queryTypes: [],  // the types of attribute to query on
            secondAttributeSelected: false,  // if we want to do 2-dimension
            isTwoDimension: false,  // if the query is 2-dimension
            curTableRows: 0,  // the current number of rows in the summary table
            noisyResCom1: [],  // the composition noisy results
            noisyResCom2: [],
        }

        this.getButtonsUsingMap = this.getButtonsUsingMap.bind(this);
        this.asyncNoisyFunction = this.asyncNoisyFunction.bind(this);
        this.asyncComparisonFunction = this.asyncComparisonFunction.bind(this);
    }

    // attribute selection on click
    attrClick = (attrName, attrType) => {
        if (this.state.queryAttributes.length === 1) {
            let senSet = null;
            for (let i = 0; i < this.state.databaseDomain.length; ++i) {
                if (this.state.databaseDomain[i].attrName === attrName) {
                    senSet = this.state.databaseDomain[i].domain;
                }
            }
            this.setState({
                currentCategorcialDomain: senSet,
                queryAttributes: this.state.queryAttributes.concat(attrName),
                queryTypes: this.state.queryTypes.concat(attrType),
                secondAttributeSelected: true,
            })
        } else {
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
                noisyResult: false,
                displayAccuracyComparison: false,
                selectedDPAccuracies: [],
                secondAttributeSelected: false,
                isTwoDimension: false,
                queryAttributes: [],
                queryTypes: [],
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
                    for (let i = 1; i < 11; ++i) {
                        curPolicy = curPolicy.concat(1000 * i)
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
        }
    };


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

    getQueryNoisyAnswer(granu, alpha, beta) {
        if (this.state.isTwoDimension && this.state.queryAttributes) {
            console.log(this.state.queryAttributes);
            console.log(this.state.queryTypes);
            let workload = null;
            if (this.state.currentWorkload === null) {
                workload = '1D-Histogram';
            } else { workload = this.state.currentWorkload.value }
            // This is the 2D case
            // Now we will assume that we have a numerical and categorical attribute
            let twoDimensionPolicy = [];
            for (let i = 0; i < this.state.queryAttributes.length; ++i) {
                for (let j = 0; j < this.state.databaseSchema.length; ++j) {
                    if (this.state.databaseSchema[j].attrName === this.state.queryAttributes[i]) {
                        if (this.state.databaseSchema[j].attrType === "numerical") {
                            twoDimensionPolicy = twoDimensionPolicy.concat({
                                policy: this.props.policy[j].policy,
                                lower: this.state.databaseDomain[j].domain[0],
                                upper: this.state.databaseDomain[j].domain[1],
                                granularity: granu,
                            })
                        } else {
                            // assume categorical attributes use DP
                            twoDimensionPolicy = twoDimensionPolicy.concat({
                                policy: this.props.policy[j].policy,
                                domain: this.state.databaseDomain[j].domain,
                            })
                        }
                    }
                }
            }
            const data = {
                "attrName": this.state.queryAttributes,
                "attrType": this.state.queryTypes,
                "workload": workload,
                "target_dp": twoDimensionPolicy,
                "alpha": alpha.value,
                "beta": beta.value,
            }
            console.log("This is the API data", data);
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
                    // This is for demo purpose, assume the other attribute is gender
                    // we will have to make it work
                    // for general purpose later
                    console.log('This is the API response: ', data)
                    const noisyRes = data.results.noisy_answer;
                    let noisyAns_female = [];
                    let noisyAns_male = [];
                    // const granularity_labels = this.computeGranularity(twoDimensionPolicy[0].granularity,
                    //     twoDimensionPolicy[0].lower,
                    //     twoDimensionPolicy[0].upper);
                    for (let i = 0; i < noisyRes.length;) {
                        noisyAns_female = noisyAns_female.concat(noisyRes[i]);
                        ++i;
                        noisyAns_male = noisyAns_male.concat(noisyRes[i]);
                        ++i;
                    }
                    const queryCost = Number((data.results.eps_max).toFixed(3));
                    const remainingBudget = Number((this.state.remainingBudget - queryCost).toFixed(3));
                    const dataRecord = this.state.noisyRes.concat(
                        {
                            attrName: this.state.queryAttributes[0] + ',' + this.state.queryAttributes[1],
                            index: this.state.noisyRes.length + 1,
                            alpha: this.state.alpha.value,
                            beta: this.state.beta.value,
                            granularity: this.state.queryGranularity.value,
                            range: {
                                lower: this.state.currentNumericalDomain.domain[0],
                                upper: this.state.currentNumericalDomain.domain[1],
                            },
                            workload: workload,
                            epsilon: queryCost,
                            remainingBudget: remainingBudget,
                            data: {
                                attr1: noisyAns_female,
                                attr2: noisyAns_male
                            },
                        }
                    )
                    console.log("XDXDXDXDXDXDXDXDXDXDXDXD")

                    this.setState({
                        noisyResult: true,
                        noisyResCom1: noisyAns_female,
                        noisyResCom2: noisyAns_male,
                        noisyRes: dataRecord,
                        remainingBudget: remainingBudget,
                    })
                    // console.log("this is what we want in the plot", granularity_labels, noisyAns_female, noisyAns_male)
                })
                .catch((err) => console.log(err))
        } else if (this.state.selectedType === 'numerical') {
            let workload = null;
            if (this.state.currentWorkload === null) {
                workload = '1D-Histogram';
            } else { workload = this.state.currentWorkload.value }
            let attrPolicy = null;
            for (let i = 0; i < this.props.policy.length; ++i) {
                if (this.props.policy[i].attrName === this.state.selectedAttr) {
                    attrPolicy = this.props.policy[i].policy
                }
            }
            const data = {
                "granularity": granu,
                "workload": workload,
                "lower": this.state.currentNumericalDomain.domain[0],
                "upper": this.state.currentNumericalDomain.domain[1],
                "attrName": this.state.selectedAttr,
                "attrType": this.state.selectedType,
                "target_epsilon": null,
                "target_dp": attrPolicy,
                "alpha": alpha.value,
                "beta": beta.value,
            }
            console.log("This is the API data", data)


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
                    console.log('This is the API response: ', data)
                    const res = data.results;
                    // concat the query results into the state
                    let workload = '1D-Histogram';
                    const queryCost = Number((res.eps_max).toFixed(3));
                    const remainingBudget = Number((this.state.remainingBudget - queryCost).toFixed(3));
                    if (this.state.currentWorkload !== null) {
                        workload = this.state.currentWorkload.value;
                    }
                    const dataRecord = this.state.noisyRes.concat(
                        {
                            attrName: this.state.selectedAttr,
                            index: this.state.noisyRes.length + 1,
                            alpha: this.state.alpha.value,
                            beta: this.state.beta.value,
                            granularity: this.state.queryGranularity.value,
                            range: {
                                lower: this.state.currentNumericalDomain.domain[0],
                                upper: this.state.currentNumericalDomain.domain[1],
                            },
                            workload: workload,
                            epsilon: queryCost,
                            remainingBudget: remainingBudget,
                            data: res.noisy_answer,
                        }
                    )
                    console.log('The data record is ', dataRecord)
                    // DP case
                    this.setState({
                        noisyResult: true,
                        noisyRes: dataRecord,
                        curNoisyRes: res.noisy_answer,
                        remainingBudget: remainingBudget,
                    })
                })
                .catch((err) => console.log(err))
        }
    }

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

    handleChangeWorkload = value => {
        this.setState({
            workloadSelected: true,
            currentWorkload: value
        },
            () => {
                console.log(value);
                if (value.value === "2D-Cumulative") {
                    // currently we assume the second attribute is categorical
                    // we need to first select this second attribute
                    this.setState({
                        noisyResult: false,
                        isTwoDimension: true,
                        queryAttributes: [this.state.selectedAttr],
                        queryTypes: [this.state.selectedType],
                    })
                } else {
                    // we will just change the query type, and run the query on this different attribute type
                    if (this.state.noisyResult) {
                        this.setState({
                            noisyResult: false,
                        })
                    }
                }
            }
        )
    };

    asyncNoisyFunction() {
        // console.log('This is the noisy counts:', this.state.noisyRes)
        this.setState({
            noisyResult: true,
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

    // currently they are separated, then we
    plotNoisyCounts = (noisyCounts, noisyCounts1) => {
        var CanvasJSChart = CanvasJSReact.CanvasJSChart;
        let noisyAnsPoints = [];
        let noisyAnsPoints1 = [];
        const granularity = this.state.queryGranularity.value;
        const lower = this.state.currentNumericalDomain.domain[0];
        const upper = this.state.currentNumericalDomain.domain[1];
        // let noisyCounts = this.state.noisyRes;
        const granularityLabels = this.computeGranularity(granularity, lower, upper);
        const numPredicates = noisyCounts.length;
        // console.log('This is the granularity labels:', granularityLabels)
        // console.log('This is the granularity labels length:', this.state.noisyRes)
        if (this.state.isTwoDimension) {
            if (noisyCounts1 !== null) {
                for (let i = 0; i < numPredicates; ++i) {
                    let y = 0;
                    let y1 = 0;
                    const x = (granularityLabels[i].lower + granularityLabels[i].upper) / 2
                    if (noisyCounts[i] >= 0) {
                        y = noisyCounts[i];
                    }
                    if (noisyCounts1[i] >= 0) {
                        y1 = noisyCounts1[i];
                    }
                    noisyAnsPoints = noisyAnsPoints.concat(
                        {
                            x: x,
                            // label: attrName + "<" + granularityLabels[i].upper.toString(),
                            y: y
                        }
                    )
                    noisyAnsPoints1 = noisyAnsPoints1.concat(
                        {
                            x: x,
                            // label: attrName + "<" + granularityLabels[i].upper.toString(),
                            y: y1
                        }
                    )
                }
            }
        } else {
            if (numPredicates === granularityLabels.length) {
                for (let i = 0; i < numPredicates; ++i) {
                    let y = 0;
                    const x = (granularityLabels[i].lower + granularityLabels[i].upper) / 2
                    if (noisyCounts[i] >= 0) {
                        y = noisyCounts[i];
                    }
                    noisyAnsPoints = noisyAnsPoints.concat(
                        {
                            x: x,
                            // label: granularityLabels[i].lower.toString() + "<=" + attrName,
                            y: y
                        }
                    )
                }
            }
        }
        let options = {
            height: 250,
            width: 275,
            animationEnabled: true,
            exportEnabled: true,
            theme: "light2", //"light1", "dark1", "dark2"
            title: {
                text: 'Noisy Counts',
                fontSize: 15
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
                name: this.state.selectedAttr,
                showInLegend: true,
                indexLabelFontColor: "#5A5757",
                indexLabelPlacement: "outside",
                color: "#6D78AD",
                dataPoints: noisyAnsPoints
            }]
        }

        if (this.state.currentWorkload !== null) {
            if (this.state.currentWorkload.value === '1D-Histogram') {
                options.title.text = 'Noisy Counts (Histogram)'
            } else if (this.state.currentWorkload.value === '1D-Cumulative') {
                options.title.text = 'Noisy Counts (Cumulative)'
            } else {
                if (noisyCounts1 !== null) {
                    // This is the 2 dimensional case
                    console.log("XXDDXDXDXDXDXDXDXDX")
                    options.title.text = 'Noisy Counts (2D Histogram)'
                    options.data = [
                        {
                            type: "column",
                            name: this.state.currentCategorcialDomain[0],
                            showInLegend: true,
                            yValueFormatString: "#,##0.##",
                            dataPoints: noisyAnsPoints
                        },
                        {
                            type: "column",
                            name: this.state.currentCategorcialDomain[1],
                            showInLegend: true,
                            yValueFormatString: "#,##0.##",
                            dataPoints: noisyAnsPoints1
                        }
                    ]
                }
            }
        } else {
            options.title.text = 'Noisy Counts (Histogram)'
        }

        return (
            <div className="analystNoisyResult">
                <CanvasJSChart options={options}
                /* onRef={ref => this.chart = ref} */
                />
                {/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
            </div>
        )
    }

    // display the noisy results after target epsilon is selected (DP)
    displayNoisyCounts = () => {
        if (this.state.noisyResult) {
            if (this.state.isTwoDimension) {
                return (
                    <Grid.Row> The result of the query under the privacy policy specified by Database Owner is displayed below.
                        {this.plotNoisyCounts(this.state.noisyResCom1, this.state.noisyResCom2)}
                    </Grid.Row>
                )
            } else {
                return (
                    <Grid.Row> The result of the query under the privacy policy specified by Database Owner is displayed below.
                        {this.plotNoisyCounts(this.state.curNoisyRes, null)}
                    </Grid.Row>
                )
            }
        } else {
            return null;
        }
    }

    handleChangeGranularity = value => {
        this.setState({
            queryGranularity: value,
        },
            () => {
                if (this.state.noisyResult) {
                    this.setState({
                        noisyResult: false,
                    })
                }
            })
    }

    // Update Noisy Count with Epsilon
    handleChangeEpsilon = value => {
        this.setState({
            targetEpsilon: value
        })
    }


    computeResult = () => {
        this.getQueryNoisyAnswer(
            this.state.queryGranularity.value,
            this.state.alpha,
            this.state.beta);
    }

    viewResult = () => {
        if (this.state.queryGranularity === null) {
            return (
                null
            )
        } else {
            return (
                <Button
                    onClick={() =>
                        this.computeResult(this.state.alpha, this.state.beta)
                    } style={{ width: 230, height: 40 }}>Compute Result</Button>
            )
        }
    }

    // Helper for numerical policy panel for Accuracy (alpha & beta) vs threshold
    numPolicyPanelAcc = () => {
        const { currentWorkload } = this.state
        const { alpha } = this.state
        const { beta } = this.state
        const { queryGranularity } = this.state
        if (this.state.isTwoDimension) {
            if (this.state.secondAttributeSelected) {
                // Divide into 2 cases where the second attribute is numerical or categorical
                return (
                    <Grid textAlign='left'>
                        <Grid.Row className='attr'>
                            <div>
                                Name: {this.state.queryAttributes[0]}
                            </div>
                            <div className="queryType">
                                Type: {this.state.queryTypes[0]}
                            </div>
                        </Grid.Row>
                        <Grid.Row className='attr'>
                            <div>
                                Name: {this.state.queryAttributes[1]}
                            </div>
                            <div className="queryType">
                                Type: {this.state.queryTypes[1]}
                            </div>
                        </Grid.Row>
                        <Grid.Row>
                            <div> Query Type:
                                <Select
                                    placeholder='Workload'
                                    className='inputEleShortLeft'
                                    options={workloadOptions}
                                    defaultInputValue='2D-Acc'
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
                            {this.viewResult()}
                        </Grid.Row>
                    </Grid >
                )
            } else {
                return (
                    <Grid textAlign='left'>
                        <Grid.Row className='attr'>
                            <div>
                                Name: {this.state.queryAttributes[0]}
                            </div>
                            <div className="queryType">
                                Type: {this.state.queryTypes[0]}
                            </div>
                        </Grid.Row>
                        <Grid.Row className='attr'>
                            Please select the second attribute
                        </Grid.Row>
                        <Grid.Row>
                            <div> Query Type:
                                <Select
                                    placeholder='Workload'
                                    className='inputEleShortLeft'
                                    options={workloadOptions}
                                    defaultInputValue='2D-Acc'
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
                            {this.viewResult()}
                        </Grid.Row>
                    </Grid >
                )
            }
        } else {
            return (
                <Grid textAlign='left'>
                    <Grid.Row className='attr'>
                        <div>
                            Name: {this.state.selectedAttr}
                        </div>
                        <div className="queryType">
                            Type: {this.state.selectedType}
                        </div>
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
                        {this.viewResult()}
                    </Grid.Row>
                </Grid >
            )
        }
    }

    catPolicyPanelAcc = () => {
        const { currentWorkload } = this.state
        const { alpha } = this.state
        const { beta } = this.state
        const { queryGranularity } = this.state
        return (
            <Grid textAlign='left'>
                <Grid.Row className='attr'>
                    <div>
                        Name: {this.state.selectedAttr}
                    </div>
                    <div className="queryType">
                        Type: {this.state.selectedType}
                    </div>
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
                    {this.viewResult()}
                </Grid.Row>
            </Grid>
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
                        </TabList>
                        <TabPanel>
                            <Grid columns={1}>
                                <Grid.Column style={{ width: 300 }}>
                                    <Grid.Row className="policyPanel">
                                        {this.numPolicyPanelAcc()}
                                    </Grid.Row>
                                    <Grid.Row className="policyVisual">
                                        {this.displayNoisyCounts()}
                                    </Grid.Row>
                                </Grid.Column>
                            </Grid>
                        </TabPanel>
                    </Tabs>
                )
            } else {
                return (
                    <Tabs>
                        <TabList>
                            <Tab>Accuracy vs. Threshold</Tab>
                        </TabList>
                        <TabPanel>
                            <Grid columns={1}>
                                <Grid.Column style={{ width: 300 }}>
                                    <Grid.Row className="policyPanel">
                                        {this.catPolicyPanelAcc()}
                                    </Grid.Row>
                                    <Grid.Row className="policyVisual">
                                        {this.displayNoisyCounts()}
                                    </Grid.Row>
                                </Grid.Column>
                            </Grid>
                        </TabPanel>
                    </Tabs>
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

    asyncComparisonFunction() {
        this.setState({
            displayAccuracyComparison: true,
        })
    }

    // summary the privacy budget and results run by data analysts
    displayStats = () => {
        return (
            <Table dataRecord={this.state.noisyRes}></Table>
        )
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
            <Segment.Group className="mainPanelSizeAnalyst">
                <Grid className="gridStyle" columns={4}>
                    <Grid.Column style={{ width: 250 }}>
                        <SchemaComponent
                            rowGeneratingFunction={this.getButtonsUsingMap}
                            datasetSelected={this.props.datasetSelected}
                        ></SchemaComponent>
                    </Grid.Column>
                    <Divider vertical style={{ left: 240, height: 360 }} />
                    <Grid.Column style={{ width: 300 }}>
                        {this.policyPanel()}
                    </Grid.Column>
                    <Divider vertical style={{ left: 535, height: 360 }}></Divider>
                    <Grid.Column style={{ width: 600 }}>
                        {this.displayStats()}
                    </Grid.Column>
                </Grid>
            </Segment.Group>
        )
    }
}

export default AnalystPanelComponent;