import { EChart } from "@kbox-labs/react-echarts";

const data = [
  ["2020-01-01", 12],
  ["2020-01-02", 1],
  ["2020-01-03", 4],
  ["2020-01-04", "-"],
  ["2020-01-05", 16],
  ["2020-01-06", 2],
  ["2020-01-07", 52],
  ["2020-01-08", 52],
];

const nulls = [
  ["2020-01-03", 4],
  ["2020-01-04", 8], // Missing
  ["2020-01-05", 16],

  ["2020-01-07", "-"],
  ["2020-01-08", 52],
  ["2020-01-09", 52],
  ["2020-01-10", 52],
];

const BrokenDataChart = () => {
  return (
    <EChart
      style={{
        width: 1000,
        height: 1000,
      }}
      xAxis={[
        {
          type: "time",
          min: "dataMin",
          max: "2020-01-11",
        },
      ]}
      yAxis={[
        {
          type: "value",
        },
      ]}
      dataset={[
        {
          source: data,
        },
        {
          source: nulls,
        },
      ]}
      series={[
        {
          type: "line",
        },
        {
          type: "line",
          datasetIndex: 1,
        },
      ]}
    />
  );
};

export default BrokenDataChart;
