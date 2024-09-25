import { createContext, useContext } from "react";

export type DataZoom = {
  start: number;
  end: number;
};

export type State = {
  zoom: DataZoom;
};

type DataZoomState = State & {
  onZoom: (start, end) => void;
  resetZoom: () => void;
};

const DataZoomContext = createContext<DataZoomState | undefined>(undefined);

export function useDataZoom() {
  const context = useContext(DataZoomContext);
  if (!context) {
    throw new Error("DataZoom");
  }
  return context;
}

export default DataZoomContext;
