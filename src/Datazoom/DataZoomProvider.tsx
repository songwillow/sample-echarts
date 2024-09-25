import { useState } from "react";
import DataZoomContext, { DataZoom } from "./DataZoomContext";

export default function DataZoomProvider({ children }) {
  const [zoom, setZoom] = useState<DataZoom>({
    start: 0,
    end: 100,
  });

  const onZoom = (start, end) =>
    setZoom({
      start,
      end,
    });

  const onReset = () =>
    setZoom({
      start: 0,
      end: 100,
    });

  return (
    <DataZoomContext.Provider
      value={{
        zoom,
        onZoom,
        resetZoom: onReset,
      }}
    >
      {children}
    </DataZoomContext.Provider>
  );
}
