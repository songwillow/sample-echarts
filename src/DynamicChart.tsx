import {
  BarSeriesOption,
  DatasetComponentOption,
  DataZoomComponentOption,
  EChartsOption,
  GridComponentOption,
  LineSeriesOption,
  XAXisComponentOption,
  YAXisComponentOption,
} from "echarts";
import EChartsReact from "echarts-for-react";
import { useEffect, useMemo, useRef } from "react";
import _ from "lodash";
import { useDataZoom } from "./Datazoom/DataZoomContext";

type GraphType = "A" | "B";
export type Data = {
  type: GraphType;
  name: string;
};

const DynamicChart = ({ data }: { data: Data[] }) => {
  const chartRef = useRef<EChartsReact>(null);
  const x: Record<GraphType, Data[]> = _.groupBy(data, (d) => d.type);
  const { zoom, onZoom } = useDataZoom();

  const grid: GridComponentOption[] = [
    ...Object.keys(x).map<GridComponentOption>((type, index) => {
      let size = 100;
      if (type === "B") size = 120;
      return {
        id: type,
        top: size * index + (index === 0 ? 0 : 10),
        backgroundColor: "red",
        height: size,
      };
    }),
  ];

  const xAxis: XAXisComponentOption[] = [
    ...Object.keys(x).map<XAXisComponentOption>((type) => {
      return {
        gridId: type,
        id: type,
        type: "time",
      };
    }),
  ];

  const yAxis: YAXisComponentOption[] = [
    ...Object.keys(x).map<YAXisComponentOption>((type) => {
      return {
        gridId: type,
        id: type,
        type: type === "A" ? "category" : "value",
      };
    }),
  ];

  const series = [
    ...(x?.A?.map<BarSeriesOption>((data) => ({
      xAxisId: data.type,
      yAxisId: data.type,
      datasetId: `${data.name}${data.type}`,
      type: "bar",
      encode: {
        x: 0,
      },
    })) ?? []),
    ...(x?.B?.map<LineSeriesOption>((data) => ({
      xAxisId: data.type,
      yAxisId: data.type,
      datasetId: `${data.name}${data.type}`,
      type: "line",
    })) ?? []),
  ];

  const dataset = [
    ...(x?.A?.map<DatasetComponentOption>((data) => ({
      id: `${data.name}${data.type}`,
      source: [
        ["2024-01-01"],
        ["2024-01-02"],
        ["2024-01-03"],
        ["-"],
        ["2024-01-05"],
      ],
    })) ?? []),
    ...(x?.B?.map<DatasetComponentOption>((data) => ({
      id: `${data.name}${data.type}`,
      source: [
        ["2024-01-01", 100],
        ["2024-01-02", 200],
        ["2024-01-03", 300],
        ["2024-01-04", "-"],
        ["2024-01-05", 400],
      ],
    })) ?? []),
  ];

  const dataZoom: DataZoomComponentOption[] = [
    {
      type: "inside",
      ...zoom,
      filterMode: "none",
      zoomOnMouseWheel: "shift",
      xAxisIndex: [0, 1],
    },
    {
      type: "slider",
      ...zoom,
      show: false,
      filterMode: "none",
      xAxisIndex: [0, 1],
    },
  ];

  const onEvents = useMemo(() => {
    const handleDataZoom = (params) => {
      if (params.batch && params.batch?.length !== 0) {
        onZoom(params.batch[0].start, params.batch[0].end);
      } else {
        onZoom(params.start, params.end);
      }
    };

    return {
      datazoom: handleDataZoom,
    };
  }, []);

  const chartOption: EChartsOption = {
    grid: grid,
    xAxis: xAxis,
    yAxis: yAxis,
    series: series,
    dataZoom: dataZoom,
    animation: false,
    dataset: dataset,
  };

  useEffect(() => {
    const chart = chartRef.current?.getEchartsInstance();
    if (chart) {
      chart.setOption(chartOption, {
        replaceMerge: ["series", "xAxis", "yAxis", "grid"],
      });
    }
  }, [chartRef, chartOption]);

  return (
    <EChartsReact
      style={{
        width: 1000,
        height: 400,
      }}
      onEvents={onEvents}
      option={chartOption}
      ref={chartRef}
    />
  );
};

export default DynamicChart;
