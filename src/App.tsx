import styled from "styled-components";
import "./App.css";
import Chart, { Asset } from "./Chart";
import CustomChart from "./CustomChart";
import DatazoomChart from "./DatazoomChart";
import BrokenDataChart from "./BrokenDataChart";

function App() {
  // const twinSample: Record<string, Sensor[]> = {
  //   Twin1: [
  //     {
  //       sensor: "T1Sensor1",
  //       data: [
  //         [0, 1],
  //         [1, 1],
  //         [2, 1],
  //         [3, 1],
  //         [4, 1],
  //       ],
  //       graphType: "analog",
  //
  //     },
  //     {
  //       sensor: "T1Sensor4",
  //       data: [
  //         [0, 2],
  //         [1, 0],
  //         [2, 1],
  //         [3, 4],
  //         [4, 1],
  //       ],
  //       graphType: "analog",
  //
  //     },
  //     {
  //       sensor: "T1Sensor3",
  //       data: [
  //         [0, 0, 1],
  //         [1, 0, 0],
  //         [2, 0, 0],
  //         [3, 0, 0],
  //         [4, 0, 0],
  //       ],
  //       graphType: "binary",
  //
  //     },
  //     {
  //       sensor: "T1Sensor5",
  //       data: [
  //         [0, 1, 1],
  //         [1, 1, 0],
  //         [2, 1, 0],
  //         [3, 1, 0],
  //         [4, 1, 0],
  //       ],
  //       graphType: "binary",
  //
  //     },
  //     {
  //       sensor: "T1Sensor4",
  //       data: [
  //         [0, 0, 1],
  //         [1, 0, 0],
  //         [2, 0, 0],
  //         [3, 0, 0],
  //         [4, 0, 0],
  //       ],
  //       graphType: "multistate",
  //
  //     },
  //   ],
  //   Twin2: [
  //     {
  //       sensor: "T2Sensor1",
  //       data: [
  //         [0, 1],
  //         [1, 1],
  //         [2, 1],
  //         [3, 1],
  //         [4, 1],
  //       ],
  //       graphType: "binary",
  //
  //     },
  //   ],
  //   Twin3: [
  //     {
  //       sensor: "T3Sensor1",
  //       data: [
  //         [0, 1],
  //         [1, 1],
  //         [2, 1],
  //         [3, 1],
  //         [4, 1],
  //       ],
  //       graphType: "binary",
  //
  //     },
  //   ],
  // };

  interface BoolGraph {
    onCount: number;
    offCount?: number;
  }

  interface MultistateGraph {
    state?: Record<string, string>;
  }

  interface AnalogGraph {
    minimum: number;
    maximum?: number;
    average?: number;
  }

  const twinSample: Asset<BoolGraph | AnalogGraph>[] = [
    // {
    //   sensor: "T1Sensor1",
    //   data: [
    //     [
    //       0,
    //       72.92549324035645,
    //       74.18549537658684,
    //       72.1239929199219,
    //       { minimum: 1, maximum: 2, average: 1.5 },
    //     ],
    //     [
    //       1,
    //       71.92499330308702,
    //       72.46498658921982,
    //       71.7279968261719,
    //       { minimum: 1, maximum: 2, average: 1.5 },
    //     ],
    //     [
    //       2,
    //       72.27011018640856,
    //       72.55811220056876,
    //       72.0879898071289,
    //       { minimum: 1, maximum: 2, average: 1.5 },
    //     ],
    //     [
    //       3,
    //       72.11559321085612,
    //       73.30358912150072,
    //       71.4399948120117,
    //       { minimum: 1, maximum: 2, average: 1.5 },
    //     ],
    //     [
    //       4,
    //       72.22892035507574,
    //       73.11092413925545,
    //       71.7819900512695,
    //       { minimum: 1, maximum: 2, average: 1.5 },
    //     ],
    //   ],
    //   color: "#28838e",
    //   graphType: "analog",
    // },
    // {
    //   sensor: "T1Sensor4",
    //   data: [
    //     [
    //       0,
    //       2.4171752707,
    //       2.8967046779000003,
    //       0.39826,
    //       { minimum: 1, maximum: 2, average: 1.5 },
    //     ],
    //     [
    //       1,
    //       2.6209229364,
    //       11.4491049982,
    //       1.6833036365,
    //       { minimum: 1, maximum: 2, average: 1.5 },
    //     ],
    //     [
    //       2,
    //       2.7207073998,
    //       0.9668634870999999,
    //       2.1287778695,
    //       { minimum: 1, maximum: 2, average: 1.5 },
    //     ],
    //     [
    //       3,
    //       2.7538834531,
    //       0.7258952249,
    //       2.3458167992,
    //       { minimum: 1, maximum: 2, average: 1.5 },
    //     ],
    //     [
    //       4,
    //       2.7982645863,
    //       0.5816866709999999,
    //       2.4777322093,
    //       { minimum: 1, maximum: 2, average: 1.5 },
    //     ],
    //     [
    //       5,
    //       2.8542523129,
    //       10.4853494,
    //       2.6456042288,
    //       { minimum: 1, maximum: 2, average: 1.5 },
    //     ],
    //     [
    //       6,
    //       2.997389027,
    //       0.4167718883,
    //       2.6660088505,
    //       { minimum: 1, maximum: 2, average: 1.5 },
    //     ],
    //     [
    //       7,
    //       2.9919307266,
    //       10.3652780785,
    //       2.7048160059,
    //       { minimum: 1, maximum: 2, average: 1.5 },
    //     ],
    //   ],
    //   unit: "degF",
    //   color: "#dca101",
    //   graphType: "analog",
    // },
    {
      sensor: "T1Sensor3",
      data: [
        ["2020-01-01", 0, 1, { onCount: 1 }],
        ["2020-01-02", 0, 1, { onCount: 1 }],
        ["2020-01-03", 0, 0, { onCount: 1 }],
        ["2020-01-04", 0, 1, { onCount: 1 }],
        ["2020-01-05", 0, 0, { onCount: 1 }],
      ],
      color: "#b41a22",
      graphType: "binary",
    },
    {
      sensor: "T1Sensor5",
      data: [
        ["2020-01-01", 1, 0, { onCount: 1 }],
        ["2020-01-02", 1, 0, { onCount: 1 }],
        ["2020-01-03", 1, 0, { onCount: 1 }],
        ["2020-01-04", 1, 1, { onCount: 1 }],
        ["2020-01-05", 1, 0, { onCount: 1 }],
      ],
      color: "#c15919",
      graphType: "binary",
    },
    // {
    //   sensor: "T1Sensor7",
    //   data: [
    //     [0, 2, 1, { onCount: 1 }],
    //     [1, 2, 2, { onCount: 1 }],
    //     [2, 2, 0, { onCount: 1 }],
    //     [3, 2, 0, { onCount: 1 }],
    //     [4, 2, 0, { onCount: 1 }],
    //   ],
    //   color: "#c15919",
    //   graphType: "multistate",
    //   valueMap: {
    //     "1": "Enable",
    //     "2": "Shutdown",
    //     "3": "Shutdown",
    //   },
    // },
    // {
    //   sensor: "T1Sensor88",
    //   data: [
    //     [0, 1, 0, { onCount: 1 }],
    //     [1, 1, 1, { onCount: 1 }],
    //     [2, 1, 0, { onCount: 1 }],
    //     [3, 1, 1, { onCount: 1 }],
    //     [4, 1, 2, { onCount: 1 }],
    //   ],
    //   color: "#e1aa19",
    //   graphType: "multistate",
    //   valueMap: {
    //     "1": "Enable",
    //     "2": "Shutdown",
    //     "3": "Shutdown",
    //   },
    // },
    // {
    //   sensor: "T1Sensor8",
    //   data: [
    //     [0, 1, 1, 0, { minimum: 1, maximum: 2, average: 1.5 }],
    //     [1, 1, 1, 0, { minimum: 1, maximum: 2, average: 1.5 }],
    //     [2, 1, 1, 0, { minimum: 1, maximum: 2, average: 1.5 }],
    //     [3, 1, 1, 0, { minimum: 1, maximum: 2, average: 1.5 }],
    //     [4, 1, 1, 0, { minimum: 1, maximum: 2, average: 1.5 }],
    //   ],
    //   color: "#28838e",
    //   graphType: "analog",
    // },
    // {
    //   sensor: "T1Sensor8",
    //   data: [
    //     [0, 1, 1, 0, { minimum: 1, maximum: 2, average: 1.5 }],
    //     [1, 1, 1, 0, { minimum: 1, maximum: 2, average: 1.5 }],
    //     [2, 1, 1, 0, { minimum: 1, maximum: 2, average: 1.5 }],
    //     [3, 1, 1, 0, { minimum: 1, maximum: 2, average: 1.5 }],
    //     [4, 1, 1, 0, { minimum: 1, maximum: 2, average: 1.5 }],
    //   ],
    //   unit: "tons",
    //   color: "#28838e",
    //   graphType: "analog",
    // },
  ];

  const analog = twinSample.filter((c) => c.graphType === "analog");
  const binary = twinSample.filter((c) => c.graphType === "binary");
  const multistate = twinSample.filter((c) => c.graphType === "multistate");

  const sensors = [...binary, ...multistate, ...analog];

  const a = [sensors, sensors];

  return (
    <Card>
      {/* {a.map((f, index) => (
        <Chart
          option={{
            id: index.toString(),
            title: "Twin1",
            dataset: f,
            showLegend: index === 0 ? true : false,
          }}
        ></Chart>
      ))} */}

      {/* {a.map((f, index) => (
        <CustomChart
          option={{
            id: "1",
            title: "Twin1",
            dataset: f,
            showLegend: false,
          }}
        ></CustomChart>
      ))} */}

      {/* <DatazoomChart></DatazoomChart> */}
      <BrokenDataChart />
    </Card>
  );
}

const Card = styled.div(() => ({
  borderRadius: `4px`,
  background: "#242424",
  padding: "16px",
  overflow: `hidden`,
}));

export default App;
