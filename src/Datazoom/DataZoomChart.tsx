import { DataZoomComponentOption, SeriesOption } from "echarts";
import EChartsReact from "echarts-for-react";
import { useEffect, useMemo, useState } from "react";
import { useDataZoom } from "./DataZoomContext";

const headerHeight = 65;
const delay = 25;

const xAxis = {
  type: "time" as const,
  show: false,
};

const yAxis = {
  show: false,
};

const series: SeriesOption[] = [
  {
    type: "line",
    showSymbol: false,
  },
];

const grid = {
  right: 2,
  left: 2,
};

const tooltip = {
  show: false,
};

export default function DataZoomChart() {
  const { zoom, onZoom } = useDataZoom();
  const [isShown, setIsShown] = useState(false);

  // On initial mount if echarts isn't rendered in it takes on
  // the absolute value of the width instead of the percentage
  // thus the delay to mount the component.
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShown(true);
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const dataZoom: DataZoomComponentOption[] = useMemo(
    () => [
      {
        id: "data-zoom",
        labelFormatter: (value) => new Date(value).toLocaleString(),
        start: zoom.start,
        end: zoom.end,
        showDetail: false,
        moveHandleSize: 4,
        bottom: 4,
        moveHandleStyle: {
          color: "#5945d733",
          borderColor: "#7d62df",
        },
        selectedDataBackground: {
          areaStyle: {
            color: "#5945d7",
            opacity: 0.2,
          },
          lineStyle: {
            width: 0,
          },
        },
        right: 4,
        dataBackground: {
          areaStyle: {
            opacity: 0,
          },
          lineStyle: {
            width: 0,
          },
        },
        height: 20,
        fillerColor: "#5945d733",
        handleStyle: {
          color: "#5945d733",
          borderWidth: 1,
        },
        borderRadius: 0,
        borderColor: "#ffffff00",
        top: 0,
      },
    ],
    [zoom]
  );

  const dataset = useMemo(
    () => [
      {
        source: [["2020-01-01"], ["2020-01-02"]],
      },
    ],
    []
  );

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
    // This warning supression is necessary if functions/variables were added as a dependency
    // echarts-for-react starts glitching it continues to re-render over and over
    // making it unusable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chartOption = {
    xAxis,
    yAxis,
    grid,
    series,
    tooltip,
    dataset,
    dataZoom,
  };

  return isShown ? (
    <EChartsReact
      onEvents={onEvents}
      style={{
        height: headerHeight,
        width: "100%",
      }}
      option={chartOption}
    />
  ) : null;
}
