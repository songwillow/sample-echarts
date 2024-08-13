import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as echarts from "echarts";
import {
  SeriesOption,
  LineSeriesOption,
  CustomSeriesOption,
  XAXisComponentOption,
  YAXisComponentOption,
  DatasetComponentOption,
  CustomSeriesRenderItemReturn,
  CustomSeriesRenderItemParams,
  CustomSeriesRenderItemAPI,
  MarkAreaComponentOption,
  DataZoomComponentOption,
} from "echarts";
import { useTheme } from "@willowinc/ui";
import { createPortal } from "react-dom";
import EChartsReact from "echarts-for-react";
import { useTimeSeriesGraph } from "../TimeSeriesGraphContext";
import { useDataZoom } from "../DataZoom/DataZoomContext";
import GraphToolTip2, { GraphToolTipInfo } from "./GraphTooltip/GraphTooltip2";
import useLegendHeight from "./useLegendHeight";

export interface TooltipValue {
  hasNoData?: boolean;
  time: number;
  data?: BoolGraph | MultistateGraph | AnalogGraph;
}

export type GraphType = "binary" | "analog" | "multiState";

export interface BoolGraph {
  onCount: number;
  offCount?: number;
}

export interface MultistateGraph {
  state?: Record<string, number>;
}

export interface AnalogGraph {
  minimum: number;
  maximum?: number;
  average?: number;
}

export type Custom = [
  number, // row
  number, // start
  number, // end
  (number | string)?, // value
  (MultistateGraph | BoolGraph)?
];

export type LineData = [
  string,
  number | string,
  number?,
  number?,
  AnalogGraph?
];
export type Line = {
  null: Array<LineData>;
  valid: Array<LineData>;
  isOutOfRange: Array<LineData>;
};
export interface Asset {
  name: string;
  twinName: string;
  assetId: string;
  pointId: string;
  graphType: GraphType;
  unit?: string;
  color: string;
  valueMap?: Record<string, string>;
  data: Line | Array<Custom>;
}

export interface ShadedRegion {
  start: string;
  end: string;
  color: string;
  boundaryGap?: boolean;
}

interface ChartOptions {
  id: string;
  title: string;
  dataset: Array<Asset>;
  showLegend: boolean;
  shadedRegions?: Array<ShadedRegion>;
  boundaryGap?: Array<string>;
}

const generateOpacity = (count: number) => {
  const opacities: number[] = [];
  for (let i = 1; i <= count; i++) {
    opacities.push(parseFloat((i / count).toFixed(2)));
  }
  return opacities;
};

const trySort = (arr: string[]) => {
  const order = ["binary", "multiState", "analog"];
  const orderMap = new Map(order.map((item, index) => [item, index]));

  return arr.sort((a, b) => {
    const indexA = orderMap.has(a) ? orderMap.get(a)! : order.length;
    const indexB = orderMap.has(b) ? orderMap.get(b)! : order.length;
    return indexA - indexB;
  });
};

const isDataCustom = (
  data: Line | Array<Custom>,
  asset: Asset
): data is Array<Custom> => asset.graphType !== "analog";

const getGraphTypeKey = (asset: Asset, groupingType: string) =>
  asset.unit && groupingType !== "shared"
    ? `${asset.graphType}${asset.unit}`
    : asset.graphType;

const GraphV2 = ({ option }: { option: ChartOptions }) => {
  const yAxisLabelGap = 48;
  const tooltipDomId = `graph-tooltip-${option.id}`;
  const assets = option.dataset;
  const assetsStringify = JSON.stringify(assets);

  const { groupingType } = useTimeSeriesGraph();
  const { zoom, onZoom } = useDataZoom();
  const theme = useTheme();

  const [tooltipValue, setTooltipValue] =
    useState<Record<string, TooltipValue>>();
  const [selectedLegends, setSelectedLegends] = useState<
    Record<string, boolean>
  >({});
  const tooltipRef = useRef<HTMLElement>(null);
  const chartRef = useRef<EChartsReact>(null);
  const legendHeight = useLegendHeight(chartRef);

  // Group the assets by the graph type.
  // If the view is shared, we don't differentiate the unit all analog are grouped together
  const assetGroupByGraphType = Object.groupBy(assets, (asset) =>
    getGraphTypeKey(asset, groupingType)
  );

  // Order it by binary, multistate, analog
  const assetGroupByGraphTypeKeys = trySort(Object.keys(assetGroupByGraphType));

  // Get the analog axis index for datazoom filter
  // Line chart disappears when datazoom is zoomed in because of the filtering
  // to avoid this have a separate datazoom filter for analog indexes
  const analogAxisIndexes = assetGroupByGraphTypeKeys
    .map((graphTypeKey, index) => ({ graphTypeKey, index }))
    .filter((item) => item.graphTypeKey.startsWith("analog"))
    .map((item) => item.index);

  const chartSelectedLegends = Object.entries(selectedLegends)
    .map(([key, value]) => ({
      [key]: value,
      [`${key}-nulls`]: value,
      [`${key}-out-of-range`]: value,
      [`${key}-upper-bound`]: value,
      [`${key}-lower-bound`]: value,
    }))
    .reduce((acc, curr) => ({ ...acc, ...curr }), {});

  useEffect(() => {
    const toolTipContainer = document.getElementById(tooltipDomId);

    if (tooltipRef.current) {
      return;
    }

    tooltipRef.current = toolTipContainer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tooltipValue]);

  useEffect(() => {
    const tooltipPlaceholder = document.createElement("div");
    tooltipPlaceholder.id = tooltipDomId;
    document.body.appendChild(tooltipPlaceholder);

    return () => {
      tooltipRef?.current?.remove();
    };
  }, []);

  const xAxis: XAXisComponentOption[] = useMemo(
    () =>
      assetGroupByGraphTypeKeys.map<XAXisComponentOption>((a, index) => ({
        gridIndex: index,
        type: "time",
        min: "dataMin",
        max: "dataMax",
        boundaryGap: false,
      })),
    [assetGroupByGraphTypeKeys]
  );

  const yAxis: YAXisComponentOption[] = useMemo(
    () =>
      assetGroupByGraphTypeKeys.map((graphType, index) => {
        let axis: YAXisComponentOption = {
          type: "category",
          gridIndex: index,
          axisPointer: {
            show: false,
          },
          splitLine: {
            lineStyle: {
              color: theme.color.neutral.border.default,
            },
          },
        };
        if (graphType === "binary") {
          axis = {
            ...axis,
            axisLabel: {
              color: "red",
              formatter: "bool",
            },
            axisLine: {
              onZero: false,
            },
          };
        } else if (graphType === "multiState") {
          axis = {
            ...axis,
            axisLabel: {
              formatter: "state",
              color: theme.color.neutral.fg.muted,
            },
            axisLine: {
              onZero: false,
            },
          };
        } else {
          const unit = graphType.slice(6);
          axis = {
            ...axis,
            type: "value",
            name: unit,
            nameGap: yAxisLabelGap,
            nameLocation: "middle",
            nameTextStyle: {
              color: theme.color.neutral.fg.muted,
            },
            max: "dataMax",
            min: "dataMin",
            splitNumber: 3,
            axisPointer: {
              show: true,
              snap: false,
            },
          };
        }
        return {
          ...axis,
          axisLabel: {
            ...axis.axisLabel,
            color: theme.color.neutral.border.default,
          },
        };
      }),
    [assetGroupByGraphTypeKeys]
  );

  const dataset = useMemo(
    () =>
      assets.flatMap((asset) => {
        let data: DatasetComponentOption[] = [];

        if (isDataCustom(asset.data, asset)) {
          data = [
            {
              ...data,
              dimensions: ["row", "start", "end", "value"],
              source: asset.data,
            },
          ];
        } else {
          data = [
            {
              ...data,
              dimensions: ["time", "value", "confidence", "lower"],
              source: asset.data.valid,
              name: `${asset.pointId}-valid`,
            },
            {
              ...data,
              dimensions: ["time", "value", "confidence", "lower"],
              source: asset.data.null,
              name: `${asset.pointId}-nulls`,
            },
            {
              ...data,
              dimensions: ["time", "value", "confidence", "lower"],
              source: asset.data.isOutOfRange,
              name: `${asset.pointId}-isOutOfRange`,
            },
          ];
        }
        return data;
      }),
    [assetsStringify]
  );

  const renderRectItem = (
    params: CustomSeriesRenderItemParams,
    api: CustomSeriesRenderItemAPI
  ): CustomSeriesRenderItemReturn => {
    if (
      api.value == null ||
      api.coord == null ||
      api.size == null ||
      api.style == null
    ) {
      throw new Error("Api is undefined");
    }
    if (params.coordSys == null) {
      throw new Error("Params is undefined");
    }
    const id = params.seriesId?.split("_")[1];
    const isBinary = params.seriesId?.includes("binary");

    let opacity = 1;
    if (isBinary) {
      if (api.value(3) === 0) {
        opacity = 0.5;
      }
    } else {
      const valueMap = assets.find((c) => c.pointId === id)?.valueMap;
      if (!valueMap) {
        throw new Error("Value map is missing");
      }
      const valueMapCount = Object.keys(valueMap).length;
      const opacities = generateOpacity(valueMapCount);
      opacity = opacities[api.value(3)];
    }

    const categoryIndex = api.value(0);
    const start = api.coord([api.value(1), categoryIndex]);
    const end = api.coord([api.value(2), categoryIndex]);

    const height = api.size([0, 1])[1];
    const width = end[0] - start[0];
    const rectShape = echarts.graphic.clipRectByRect(
      {
        x: start[0] - width / 2,
        y: start[1] - height / 2,
        width,
        height,
      },
      {
        x: params.coordSys.x,
        y: params.coordSys.y,
        width: params.coordSys.width,
        height: params.coordSys.height,
      }
    );
    return {
      type: "rect",
      shape: rectShape,
      ignore: Number.isNaN(api.value(3)),
      style: api.style({
        opacity,
        lineWidth: 0,
      }),
      transition: ["shape"],
      emphasisDisabled: true,
    };
  };

  const getSeries = useCallback(() => {
    let lastGraphType: GraphType | null = null;
    let currentIndex = -1;
    let datasetIndex = 0;
    const graphTypeKeys = Array.from(assetGroupByGraphTypeKeys);
    // let table = {}

    let currentUniqueIndex = 0;
    return assets.flatMap<SeriesOption>((asset, seriesIndex) => {
      if (asset.graphType !== lastGraphType) {
        lastGraphType = asset.graphType;
        currentIndex += 1;
      }
      const graphTypeKey = getGraphTypeKey(asset, groupingType);

      let markArea: MarkAreaComponentOption | undefined;
      if (option.shadedRegions != null) {
        const isMarked = graphTypeKeys.indexOf(graphTypeKey);
        if (isMarked > -1) {
          graphTypeKeys.splice(isMarked, 1);
        }

        // Required since mark area is on the primary series
        // if said series was de-selected (via legend) the whole
        // mark area is removed. So to prevent this move it to the next
        // available primary.
        const nextPrimary = Object.entries(selectedLegends).find(
          ([, b]) => b === true
        )?.[0];

        if (!isMarked || nextPrimary === asset.name) {
          markArea = {
            data: option.shadedRegions?.map((c) => {
              let markAreaItemStyle = {
                color:
                  c.color === "red"
                    ? theme.color.intent.negative.bg.subtle.default
                    : theme.color.intent.secondary.bg.subtle.default,
                opacity: 1,
              };
              if (option.boundaryGap) {
                markAreaItemStyle = {
                  ...markAreaItemStyle,
                  borderType: "dashed",
                  borderWidth: 4,
                  borderColor: "#9B81E6",
                };
              }

              return [
                {
                  xAxis: c.start,
                  itemStyle: { ...markAreaItemStyle },
                },
                {
                  xAxis: c.end,
                  itemStyle: { ...markAreaItemStyle },
                },
              ];
            }),
          };
        }
      }

      let options: Array<SeriesOption | CustomSeriesOption> = [];

      if (asset.graphType === "binary") {
        options = [
          {
            id: `primary-binary_${asset.pointId}`,
            name: asset.name,
            type: "custom",
            clip: true,
            encode: {
              x: ["start", "end"],
              y: "time",
              value: "value",
            },
            renderItem: renderRectItem,
            xAxisIndex: currentIndex,
            yAxisIndex: currentIndex,
            datasetIndex,
            label: {
              show: false,
            },
            itemStyle: {
              color: asset.color,
            },
            zlevel: -1,
            markArea,
          } as CustomSeriesOption,
        ];
        datasetIndex += 1;
      } else if (asset.graphType === "multiState") {
        options = [
          {
            id: `primary-multiState_${asset.pointId}`,
            name: asset.name,
            type: "custom",
            clip: true,
            encode: {
              x: ["start", "end"],
              y: "time",
              value: "value",
            },
            renderItem: renderRectItem,
            xAxisIndex: currentIndex,
            yAxisIndex: currentIndex,
            datasetIndex,
            label: {
              show: false,
            },
            itemStyle: {
              color: asset.color,
            },
            markArea,
          } as CustomSeriesOption,
        ];
        datasetIndex += 1;
      }
      currentUniqueIndex = currentIndex;
      if (asset.graphType === "analog") {
        const unitIndex = assetGroupByGraphTypeKeys.findIndex(
          (d) => d === `${asset.graphType}${asset.unit}`
        );

        const axisIndex = unitIndex !== -1 ? unitIndex : currentIndex;
        currentUniqueIndex = axisIndex;
        options = [
          {
            id: `lower-bound_${asset.pointId}`,
            type: "line",
            name: `${asset.name}-lower-bound`,
            xAxisIndex: axisIndex,
            yAxisIndex: axisIndex,
            datasetIndex,
            encode: {
              y: "lower",
            },
            lineStyle: {
              opacity: 0,
            },
            stack: `confidence-band-${asset.pointId}`,
            symbol: "none",
            showSymbol: false,
          } as LineSeriesOption,
          {
            id: `upper-bound_${asset.pointId}`,
            type: "line",
            name: `${asset.name}-upper-bound`,
            xAxisIndex: axisIndex,
            yAxisIndex: axisIndex,
            datasetIndex,
            lineStyle: {
              opacity: 0,
            },
            encode: {
              y: "confidence",
            },
            areaStyle: {
              color: asset.color,
              opacity: 0.3,
            },
            stack: `confidence-band-${asset.pointId}`,
            symbol: "none",
            showSymbol: false,
          } as LineSeriesOption,
          {
            id: `primary_${asset.pointId}`,
            name: asset.name,
            type: "line",
            xAxisIndex: axisIndex,
            yAxisIndex: axisIndex,
            datasetIndex,
            label: {
              show: false,
            },
            encode: {
              x: "time",
              y: "value",
            },
            itemStyle: {
              color: asset.color,
            },
            markArea,
            showSymbol: false,
          } as LineSeriesOption,
          {
            id: `nullPoints_${asset.pointId}`,
            name: `${asset.name}-nulls`,
            xAxisIndex: axisIndex,
            yAxisIndex: axisIndex,
            datasetIndex: datasetIndex + 1,
            type: "line",
            lineStyle: {
              color: "grey",
              type: "dashed",
            },
            showSymbol: false,
            showAllSymbol: false,
            symbol: "none",
          } as LineSeriesOption,
          {
            id: `outOfRangePoints_${asset.pointId}`,
            name: `${asset.name}-out-of-range`,
            xAxisIndex: axisIndex,
            yAxisIndex: axisIndex,
            datasetIndex: datasetIndex + 2,
            type: "line",
            lineStyle: {
              color: "grey",
            },
            showSymbol: false,
          } as LineSeriesOption,
        ];
        datasetIndex += 3;
      }
      // if (table[currentUniqueIndex] != null) {
      //   table[currentUniqueIndex].push(seriesIndex)
      // } else {
      //   table[currentUniqueIndex] = [seriesIndex]
      // }
      return options;
    });
  }, [assetsStringify, selectedLegends]);

  const getAnalogHeight = () => {
    if (groupingType === "stacked") {
      return 200;
    } else if (groupingType === "shared") {
      return 400;
    }
    return 300;
  };

  const getChartHeight = useCallback(() => {
    const numberOfBinary = assetGroupByGraphType.binary?.length ?? 0;
    const numberOfMultiState = assetGroupByGraphType.multiState?.length ?? 0;

    const rawHeights = assetGroupByGraphTypeKeys.map((graphType) => {
      let height = 0;
      if (graphType === "binary") {
        height = numberOfBinary * 64;
      } else if (graphType === "multiState") {
        height = numberOfMultiState * 64;
      } else {
        height = getAnalogHeight();
      }
      return height;
    });

    let start = 48;
    const graphGap = 32;
    const chartHeights = rawHeights.map((height, index) => {
      if (index !== 0) {
        start += rawHeights[index - 1] + graphGap;
      }
      return {
        start,
        height,
      };
    });

    return chartHeights;
  }, [assetsStringify]);

  const chartHeights = getChartHeight();

  const totalGraphHeight =
    chartHeights[chartHeights.length - 1].height +
    chartHeights[chartHeights.length - 1].start +
    24 +
    (option.showLegend ? 24 + legendHeight : 0);

  const tooltipData =
    tooltipValue &&
    Object.values(assets).reduce((acc, line) => {
      if (!acc[line.assetId]) {
        acc[line.assetId] = [];
      }
      acc[line.assetId].unshift({
        name: line.name,
        assetName: line.twinName,
        unit: line.unit,
        pointId: line.pointId,
        item: { ...tooltipValue[line.pointId]?.data },
        color: line.color,
        hasNoData: tooltipValue[line.pointId]?.hasNoData,
        graphType: line.graphType,
        valueMap: line.valueMap,
        time: tooltipValue[line.pointId]?.time,
      });
      return acc;
    }, {} as Record<string, GraphToolTipInfo[]>);

  const grid = useMemo(
    () =>
      chartHeights.map((chartHeight) => ({
        top: chartHeight.start,
        left: 60,
        right: 8,
        height: chartHeight.height,
        show: true,
        borderWidth: 1,
        borderColor: "rgba(128, 128, 128, 0.5)",
      })),
    [chartHeights]
  );

  const datazoom: DataZoomComponentOption[] = useMemo(
    () => [
      {
        type: "inside",
        start: zoom.start,
        end: zoom.end,
        xAxisIndex: analogAxisIndexes,
        filterMode: "none",
        zoomOnMouseWheel: "shift",
      },
      {
        type: "slider",
        start: zoom.start,
        end: zoom.end,
        xAxisIndex: analogAxisIndexes,
        show: false,
        filterMode: "none",
      },
      {
        type: "inside",
        start: zoom.start,
        end: zoom.end,
        xAxisIndex: Array.from(xAxis.keys()),
        filterMode: "weakFilter",
        zoomOnMouseWheel: "shift",
      },
      {
        type: "slider",
        start: zoom.start,
        end: zoom.end,
        xAxisIndex: Array.from(xAxis.keys()),
        show: false,
        filterMode: "weakFilter",
      },
    ],
    [analogAxisIndexes, xAxis, zoom.end, zoom.start]
  );

  const tooltip = useMemo(
    () => ({
      backgroundColor: "#ffffff00",
      borderColor: "#ffffff00",
      padding: 0,
      formatter: (params) => {
        params
          .filter((s) => s.seriesId.startsWith("primary"))
          .forEach((s) => {
            const isNull =
              s.seriesType === "custom"
                ? s.value[3] === "-"
                : s.value[1] === "-";

            const id = s.seriesId?.split("_")[1];
            if (!s.axisValue) {
              return;
            }
            const time = new Date(s.axisValue).getTime();

            if (!id) {
              return;
            }

            setTooltipValue((prev) => ({
              ...prev,
              [id]: {
                time,
                hasNoData: isNull,

                data:
                  s.seriesType === "custom"
                    ? { ...s.value[4] }
                    : { ...s.value[4] },
              },
            }));
          });

        return tooltipRef.current ?? "";
      },
      axisPointer: {
        axis: "x",
        snap: true,
        show: false,
        type: "cross",
      },
      confine: true,
      trigger: "axis",
    }),
    []
  );

  const chartOption = {
    title: {
      text: option.title,
      textStyle: {
        color: theme.color.neutral.fg.default,
      },
    },
    grid,
    dataZoom: datazoom,
    legend: option.showLegend
      ? {
          textStyle: {
            color: theme.color.neutral.fg.default,
          },
          bottom: 0,
          left: 0,
          data: assets.flatMap((item) => [
            {
              name: item.name,
              icon: "roundRect",
              textStyle: {
                color: theme.color.neutral.fg.default,
              },
            },
          ]),
          selected: chartSelectedLegends,
        }
      : undefined,
    xAxis,
    yAxis,
    dataset,
    tooltip,
    series: getSeries(),
    backgroundColor: theme.color.neutral.bg.accent.default,
  };

  const onEvents = useMemo(() => {
    const handleOnDataZoom = (params) => {
      if (params.batch && params.batch?.length !== 0) {
        onZoom(params.batch[0].start, params.batch[0].end);
      } else {
        onZoom(params.start, params.end);
      }
    };

    const handleOnLegendSelectChanged = (params) => {
      setSelectedLegends(params.selected);
    };

    return {
      datazoom: handleOnDataZoom,
      legendselectchanged: handleOnLegendSelectChanged,
    };
  }, []);

  return (
    <>
      <EChartsReact
        ref={chartRef}
        onEvents={onEvents}
        option={chartOption}
        style={{
          height: totalGraphHeight,
          width: "100%",
        }}
      />
      {tooltipData && tooltipRef.current
        ? createPortal(<GraphToolTip2 data={tooltipData} />, tooltipRef.current)
        : null}
    </>
  );
};

export default GraphV2;
