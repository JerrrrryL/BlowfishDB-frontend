import React from 'react'
import styled from 'styled-components'
import { useTable, useRowSelect } from 'react-table'
import { Grid } from 'semantic-ui-react';
import CanvasJSReact from './canvasjs.react';

const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;
    width: 570px;
    
    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.3rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }
`

const IndeterminateCheckbox = React.forwardRef(
    ({ indeterminate, ...rest }, ref) => {
        const defaultRef = React.useRef()
        const resolvedRef = ref || defaultRef

        React.useEffect(() => {
            resolvedRef.current.indeterminate = indeterminate
        }, [resolvedRef, indeterminate])

        return (
            <>
                <input type="checkbox" ref={resolvedRef} {...rest} />
            </>
        )
    }
)

function computeGranularity(queryGranularity, lowerBound, upperBound) {
    // console.log('Parameters:', queryGranularity, lowerBound, upperBound)
    let selectedGranu = queryGranularity;
    // sanity check, assign defaut to be 1 if null
    if (selectedGranu === null) {
        selectedGranu = 1
    }
    let granuLabels = [];
    let numEle = Math.ceil((upperBound - lowerBound + 1) / selectedGranu)
    // console.log('this is the number of elements', numEle)
    for (let i = 0; i < numEle; ++i) {
        granuLabels = granuLabels.concat({
            lower: lowerBound + i * selectedGranu,
            upper: lowerBound + (i + 1) * selectedGranu
        })
    }
    // console.log('This is the computed granularity at the end: ', granuLabels)
    return granuLabels;
}

function toggleDataSeries(e) {
    if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
        e.dataSeries.visible = false;
    }
    else {
        e.dataSeries.visible = true;
    }
    this.chart.render();
}

function displayPlots(attrNames, noisyCounts, ranges, granus, workloads) {
    var CanvasJSChart = CanvasJSReact.CanvasJSChart;
    let dataOptions = [];
    for (let i = 0; i < noisyCounts.length; ++i) {
        // console.log(noisyCounts[i], ranges[i], granus[i])
        let noisyAnsPoints = [];
        let noisyAnsPoints1 = [];
        const noisyCount = noisyCounts[i].data;
        const granularity = granus[i];
        const lower = ranges[i].lower;
        const upper = ranges[i].upper;
        // let noisyCounts = this.state.noisyRes;
        const granularityLabels = computeGranularity(granularity, lower, upper);
        if (Array.isArray(noisyCount)) {
            const numPredicates = noisyCount.length;
            if (numPredicates === granularityLabels.length) {
                for (let j = 0; j < numPredicates; ++j) {
                    let y = 0;
                    const x = (granularityLabels[j].lower + granularityLabels[j].upper) / 2
                    if (noisyCount[j] >= 0) {
                        y = noisyCount[j];
                    }
                    noisyAnsPoints = noisyAnsPoints.concat(
                        {
                            x: x,
                            // label: granularityLabels[i].lower.toString() + "<=" + attrName + "<" + granularityLabels[i].upper.toString(),
                            y: y
                        }
                    )
                }
            }
        } else {
            const noisyCount1 = noisyCount.attr1;
            const noisyCount2 = noisyCount.attr2;
            const numPredicates = noisyCount1.length;
            for (let i = 0; i < numPredicates; ++i) {
                let y = 0;
                let y1 = 0;
                const x = (granularityLabels[i].lower + granularityLabels[i].upper) / 2
                if (noisyCount1[i] >= 0) {
                    y = noisyCount1[i];
                }
                if (noisyCount2[i] >= 0) {
                    y1 = noisyCount2[i];
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
        // console.log(numPredicates)
        // console.log('This is the granularity labels:', granularityLabels)
        // console.log('This is the granularity labels length:', this.state.noisyRes)
        console.log('This is the datapoints', noisyAnsPoints)
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
                itemclick: toggleDataSeries
            },
            data: [{
                type: "column", //change type to bar, line, area, pie, etc
                //indexLabel: "{y}", //Shows y value on all Data Points
                name: attrNames[i].attrName,
                showInLegend: true,
                indexLabelFontColor: "#5A5757",
                indexLabelPlacement: "outside",
                color: "#6D78AD",
                dataPoints: noisyAnsPoints
            }]
        }

        console.log("This is the workloads", workloads);
        if (workloads[i] === '1D-Histogram') {
            options.title.text = 'Noisy Counts (Histogram)'
        } else if (workloads[i] === '1D-Cumulative') {
            options.title.text = 'Noisy Counts (Cumulative)'
        } else {
            // This is the 2 dimensional case
            console.log("XXDDXDXDXDXDXDXDXDX")
            options.title.text = 'Noisy Counts (2D Histogram)'
            options.data = [
                {
                    type: "column",
                    name: "Female",  // hardcoded here, need to be changed later
                    showInLegend: true,
                    yValueFormatString: "#,##0.##",
                    dataPoints: noisyAnsPoints
                },
                {
                    type: "column",
                    name: "Male",
                    showInLegend: true,
                    yValueFormatString: "#,##0.##",
                    dataPoints: noisyAnsPoints1
                }
            ]
        }
        dataOptions = dataOptions.concat(options);
    }
    console.log(dataOptions);
    if (dataOptions.length === 1) {
        return (
            <Grid.Column style={{ width: 300 }}>
                <div className="analystNoisyResult">
                    <CanvasJSChart options={dataOptions[0]}
                    /* onRef={ref => this.chart = ref} */
                    />
                    {/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
                </div>
            </Grid.Column>
        )
    } else if (dataOptions.length === 2) {
        return (
            <Grid>
                <Grid.Column style={{ width: 300 }}>
                    <div className="analystNoisyResult">
                        <CanvasJSChart options={dataOptions[0]}
                        /* onRef={ref => this.chart = ref} */
                        />
                        {/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
                    </div>
                </Grid.Column>
                <Grid.Column style={{ width: 300 }}>
                    <div className="analystNoisyResult">
                        <CanvasJSChart options={dataOptions[1]}
                        /* onRef={ref => this.chart = ref} */
                        />
                        {/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
                    </div>
                </Grid.Column>
            </Grid>
        )
    } else if (dataOptions.length > 2) {
        alert("Please select at most 2 records")
    }
}

function ConstructTable({ columns, data, counts }) {
    // Use the state and functions returned from useTable to build your UI
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        selectedFlatRows,
        state: { selectedRowIds },
    } = useTable(
        {
            columns,
            data,
        },
        useRowSelect,
        hooks => {
            hooks.visibleColumns.push(columns => [
                // Let's make a column for selection
                {
                    id: 'selection',
                    // The header can use the table's getToggleAllRowsSelectedProps method
                    // to render a checkbox
                    Header: ({ getToggleAllRowsSelectedProps }) => (
                        <div>
                            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
                        </div>
                    ),
                    // The cell can use the individual row's getToggleRowSelectedProps method
                    // to the render a checkbox
                    Cell: ({ row }) => (
                        <div>
                            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                        </div>
                    ),
                },
                ...columns,
            ])
        }
    )

    // console.log(selectedRowIds)
    // variables for graphs
    let noisyCountsIndex = [];
    let noisyCounts = [];
    let ranges = [];
    let granu = [];
    let workloads = [];
    let attrNames = []
    selectedFlatRows.map(
        d => {
            noisyCountsIndex = noisyCountsIndex.concat(d.original.col1)
        }
    )
    for (let i = 0; i < noisyCountsIndex.length; ++i) {
        attrNames = attrNames.concat({
            attrName: counts[noisyCountsIndex[i] - 1].attrName
        })
        noisyCounts = noisyCounts.concat({
            data: counts[noisyCountsIndex[i] - 1].data
        })
        ranges = ranges.concat({
            lower: counts[noisyCountsIndex[i] - 1].range.lower,
            upper: counts[noisyCountsIndex[i] - 1].range.upper
        })
        granu = granu.concat(counts[noisyCountsIndex[i] - 1].granularity)
        workloads = workloads.concat(counts[noisyCountsIndex[i] - 1].workload)
    }
    return (
        <Grid columns={1}>
            <Grid.Row className="privacyBudget">
                The query results will be summarized in the table below
                </Grid.Row>
            <Grid.Row className="resultTable">
                <Styles>
                    <table {...getTableProps()}>
                        <thead>
                            {headerGroups.map(headerGroup => (
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map(column => (
                                        <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody {...getTableBodyProps()}>
                            {rows.slice(0, 10).map((row, i) => {
                                prepareRow(row)
                                return (
                                    <tr {...row.getRowProps()}>
                                        {row.cells.map(cell => {
                                            return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </Styles>
            </Grid.Row>
            <Grid.Row className="resultComparisonDesc">
                Please select at most 2 records for comparison
            </Grid.Row>
            <Grid.Row className="resultComparison">
                {displayPlots(attrNames, noisyCounts, ranges, granu, workloads)}
            </Grid.Row>
        </Grid>
    )
}

function Table(dataRecord) {
    const record = dataRecord.dataRecord;
    let data = [];
    for (let i = 0; i < record.length; ++i) {
        data = data.concat({
            col1: record[i].index,
            col2: record[i].attrName,
            col3: record[i].workload,
            col4: record[i].granularity,
            col5: record[i].alpha,
            col6: record[i].beta,
            col7: record[i].epsilon,
            col8: record[i].remainingBudget,
        })
    }

    const columns = [
        {
            Header: 'Query Ind.',
            accessor: 'col1', // accessor is the "key" in the data
        },
        {
            Header: 'Attribute',
            accessor: 'col2', // accessor is the "key" in the data
        },
        {
            Header: 'Workload Type',
            accessor: 'col3',
        },
        {
            Header: 'Granularity',
            accessor: 'col4',
        },
        {
            Header: 'Alpha',
            accessor: 'col5',
        },
        {
            Header: 'Beta',
            accessor: 'col6',
        },
        {
            Header: 'Privacy Cost',
            accessor: 'col7',
        },
        {
            Header: 'Remaining Budget',
            accessor: 'col8',
        }
    ]
    return (
        <ConstructTable columns={columns} data={data} counts={record} />
    )
}


export default Table;