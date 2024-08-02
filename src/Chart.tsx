import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";

export interface Sensor {
  sensor: string;
  type: "line" | "heatmap";
  graphType: "binary" | "analog" | "multistate";
  data: [number, number][] | [number, number, number][];
}

interface ChartOptions {
  dataset: Record<string, Sensor[]>;
  showLegend: boolean;
}

const Chart = ({ option }: { option: ChartOptions }) => {
  const echartsDomId = `graph-container`;
  const [echart, setEchart] = useState<echarts.ECharts | null>(null);
  const graphContainer = useRef<HTMLElement | null>();
  const tooltipRef = useRef<HTMLElement | null>();

  const twins = Object.values(option.dataset);
  const twinKeys = Object.keys(option.dataset);
  const twinCount = twinKeys.length;
  const sensors = twins.flatMap((sensor) => sensor);

  const graphTypeGroup = Object.values(option.dataset).flatMap((twin) => {
    const group = Object.groupBy(twin, (t) => t.graphType);
    return Object.keys(group);
  });

  const graphTypes = Object.values(option.dataset).flatMap((twin) =>
    twin.flatMap((sensor) => sensor.graphType)
  );

  const getVisualMap = () => {
    const visualMaps: echarts.EChartOption.VisualMap[] = [];

    graphTypes.forEach((a, index) => {
      if (a !== "analog") {
        visualMaps.push({
          pieces: [
            {
              value: 0,
              color: "#2c7339",
            },
            {
              value: 1,
              color: "#2c7339",
              opacity: 0.1,
            },
          ],
          seriesIndex: index,
          show: false,
          type: "piecewise",
          right: 10,
        });
      }
    });

    return visualMaps;
  };

  const getXAxis = (): echarts.EChartOption.XAxis[] => {
    return graphTypeGroup.map((a, index) => ({
      gridIndex: index,
      type: "category",
    }));
  };

  const getYAxis = (): echarts.EChartOption.YAxis[] => {
    return graphTypeGroup.map((a, index) => {
      let option = {};
      if (a === "binary") {
        option = {
          ...option,
          axisLabel: {
            formatter: "bool",
          },
          axisLine: {
            onZero: false,
          },
        };
      } else if (a === "multistate") {
        option = {
          ...option,
          axisLabel: {
            formatter: "multistate",
          },
          axisLine: {
            onZero: false,
          },
        };
      }
      return {
        type: "category",
        ...option,
        gridIndex: index,
      };
    });
  };

  const getSeries = () => {
    let lastGraphType = null;
    let currentIndex = -1;
    let twinPlacment = 0;
    return Object.entries(option.dataset).flatMap(([, twin], twinIndex) =>
      twin.flatMap((sensor, index) => {
        if (sensor.graphType !== lastGraphType) {
          lastGraphType = sensor.graphType;
          currentIndex++;
        }
        if (twinPlacment !== twinIndex) {
          twinPlacment = twinIndex - 1;
        }
        const axisIndex = currentIndex + twinPlacment;
        const result = {
          name: sensor.sensor,
          type: sensor.graphType === "analog" ? "line" : "heatmap",
          xAxisIndex: axisIndex,
          yAxisIndex: axisIndex,
          datasetIndex: index,
          label: {
            show: false,
          },
        };

        return result;
      })
    );
  };

  const getChartHeight = () => {
    let lastValue = 0;
    const rawHeights = Object.values(option.dataset).flatMap(
      (twin, twinIndex) => {
        const initialPoint = (twinIndex / twinCount) * 100;
        const start = lastValue + initialPoint;
        let secondPoint = start;

        const graphTypeGroup = Object.groupBy(twin, (t) => t.graphType);

        const numberOfBinary = graphTypeGroup["binary"]?.length ?? 0;
        const numberOfAnalog = graphTypeGroup["analog"]?.length ?? 0;
        const numberOfMultiState = graphTypeGroup["multistate"]?.length ?? 0;
        const graphTypes = Object.keys(graphTypeGroup);

        return graphTypes.map((graphType, index) => {
          let height = 0;
          if (graphType === "binary") {
            height = numberOfBinary * 64;
            secondPoint = secondPoint + height;
          } else if (graphType === "multistate") {
            height = numberOfMultiState * 64;
            secondPoint = secondPoint + height;
          } else {
            height = 400;
            secondPoint = secondPoint + height;
          }
          if (index === graphTypes.length - 1) {
            lastValue = Math.ceil(secondPoint);
          }
          return height;
        });
      }
    );

    let start = 0;
    const chartHeights = rawHeights.map((height, index) => {
      if (index !== 0) {
        start += rawHeights[index - 1] + 32;
      }
      return {
        start: index === 0 ? 0 : start,
        height: height,
      };
    });
    return chartHeights;
  };

  const chartHeight = getChartHeight();
  const totalGraphHeight =
    chartHeight[chartHeight.length - 1].height +
    chartHeight[chartHeight.length - 1].start;

  // useEffect(() => {
  //   const toolTipContainer = document.getElementById("test");

  //   if (tooltipRef.current) {
  //     return;
  //   }

  //   tooltipRef.current = toolTipContainer;
  // }, []);

  useEffect(() => {
    const container = document.getElementById(echartsDomId);
    if (!container || !graphContainer) {
      return;
    }
    graphContainer.current = container;
    initializeECharts(container);

    return () => {
      window.removeEventListener("resize", resize);
      echart?.dispose();
      setEchart(null);
    };
  }, []);

  useEffect(() => {
    if (!echart) {
      return;
    }

    window.addEventListener("resize", resize);
  }, [echart]);

  const initializeECharts = (container: HTMLElement) => {
    setEchart(
      echarts.init(container, null, {
        width: 1000,
        height: totalGraphHeight,
      })
    );
  };

  const resize = () => {
    if (echart?.isDisposed()) {
      return;
    }

    echart?.resize();
  };

  useEffect(() => {
    if (!echart) {
      return;
    }

    if (echart.isDisposed() && graphContainer.current) {
      initializeECharts(graphContainer.current);
    }

    echart.setOption({
      backgroundColor: "pink",
      grid: chartHeight.map((chartHeight) => ({
        top: chartHeight.start,
        height: chartHeight.height,
        show: true,
        backgroundColor: "red",
      })),
      tooltip: {
        trigger: "axis",
      },
      xAxis: getXAxis(),
      yAxis: getYAxis(),
      visualMap: getVisualMap(),
      dataset: sensors.flatMap((sensor) => ({
        source: sensor.data,
      })),
      series: getSeries(),
    });
  }, [echart]);

  return <div id={echartsDomId}></div>;
};

export default Chart;
