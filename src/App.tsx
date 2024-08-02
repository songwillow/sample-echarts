import "./App.css";
import Chart, { Sensor } from "./Chart";

function App() {
  const twinSample: Record<string, Sensor[]> = {
    Twin1: [
      {
        sensor: "T1Sensor1",
        data: [
          [0, 1],
          [1, 1],
          [2, 1],
          [3, 1],
          [4, 1],
        ],
        graphType: "analog",
        type: "line",
      },
      {
        sensor: "T1Sensor4",
        data: [
          [0, 2],
          [1, 0],
          [2, 1],
          [3, 4],
          [4, 1],
        ],
        graphType: "analog",
        type: "line",
      },
      {
        sensor: "T1Sensor3",
        data: [
          [0, 0, 1],
          [1, 0, 0],
          [2, 0, 0],
          [3, 0, 0],
          [4, 0, 0],
        ],
        graphType: "binary",
        type: "heatmap",
      },
      {
        sensor: "T1Sensor5",
        data: [
          [0, 1, 1],
          [1, 1, 0],
          [2, 1, 0],
          [3, 1, 0],
          [4, 1, 0],
        ],
        graphType: "binary",
        type: "heatmap",
      },
      {
        sensor: "T1Sensor4",
        data: [
          [0, 0, 1],
          [1, 0, 0],
          [2, 0, 0],
          [3, 0, 0],
          [4, 0, 0],
        ],
        graphType: "multistate",
        type: "heatmap",
      },
    ],
    Twin2: [
      {
        sensor: "T2Sensor1",
        data: [
          [0, 1],
          [1, 1],
          [2, 1],
          [3, 1],
          [4, 1],
        ],
        graphType: "binary",
        type: "heatmap",
      },
    ],
    Twin3: [
      {
        sensor: "T3Sensor1",
        data: [
          [0, 1],
          [1, 1],
          [2, 1],
          [3, 1],
          [4, 1],
        ],
        graphType: "binary",
        type: "heatmap",
      },
    ],
  };

  return (
    <div
      style={{
        height: "1000px",
        width: "1000px",
      }}
    >
      <Chart
        option={{
          dataset: twinSample,
          showLegend: false,
        }}
      ></Chart>
    </div>
  );
}

export default App;
