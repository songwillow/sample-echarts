import { EChart } from "@kbox-labs/react-echarts";
import HorizontalBar from "./DateRangeBar";

const DatazoomChart = () => {
  return (
    <>
      <div
        style={{
          height: 24,
          position: "relative",
          zIndex: 1,
        }}
      >
        <EChart
          style={{
            width: 1000,
            height: 24,
          }}
          xAxis={[
            {
              type: "time",
            },
          ]}
          yAxis={[
            {
              type: "value",
            },
          ]}
          grid={{
            left: 0,
            right: 0,
          }}
          series={[]}
          dataZoom={[
            {
              backgroundColor: "#ffffff00",
              moveHandleSize: 1,
              moveHandleStyle: {
                color: "#5945D733",
                borderColor: "#7D62DF",
              },
              selectedDataBackground: {
                areaStyle: {
                  color: "#5945D7",
                  opacity: 0.2,
                },
                lineStyle: {
                  width: 0,
                },
              },
              dataBackground: {
                areaStyle: {
                  opacity: 0,
                },
                lineStyle: {
                  width: 0,
                },
              },
              height: 20,
              fillerColor: "#5945D733",
              handleStyle: {
                color: "#5945D733",
                borderWidth: 1,
              },
              borderRadius: 0,
              borderColor: "#ffffff00",
              top: 0,
            },
          ]}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            width: "100%",
            zIndex: 0,
          }}
        >
          <HorizontalBar
            startDate={new Date("2020-01-01")}
            endDate={new Date("2020-01-09")}
          />
        </div>
      </div>
      <EChart
        style={{
          width: 1000,
          height: 1000,
        }}
        xAxis={[
          {
            type: "category",
          },
        ]}
        yAxis={[
          {
            type: "value",
          },
        ]}
        series={[
          {
            type: "line",
            markArea: {
              data: [
                [
                  {
                    xAxis: 1,
                    itemStyle: {
                      color: "red",
                      opacity: 0.4,
                      borderWidth: 4,
                      borderColor: "#9B81E6",
                      borderType: [20, 10],
                      borderDashOffset: 5,
                    },
                  },
                  {
                    xAxis: 2,
                    itemStyle: {
                      color: "red",
                      opacity: 0.4,
                      borderType: "dashed",
                      borderWidth: 4,
                      borderColor: "#9B81E6",
                    },
                  },
                ],
              ],
            },
            data: [
              [0, 1],
              [1, 1],
              [2, 1],
              [3, 1],
            ],
          },
        ]}
      />
    </>
  );
};

export default DatazoomChart;
