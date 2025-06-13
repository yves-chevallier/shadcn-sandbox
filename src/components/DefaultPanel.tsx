import { type IDockviewPanelProps } from "dockview";
import React, { useEffect, useRef } from "react";
import { type WidgetMetadata } from "@/types/IWidgetComponent";

export const DefaultPanel: React.FC<IDockviewPanelProps<WidgetMetadata>> = ({
  params,
  api,
}) => {
  const hasUpdated = useRef(false);
  useEffect(() => {
    if (params && !hasUpdated.current) {
      api.setTitle(params.title);
      api.updateParameters(params);
      hasUpdated.current = true;
    }
  }, [params, api]);

  return <div className="p-2">Default Widget</div>;
};
