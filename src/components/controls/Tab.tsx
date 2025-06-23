import { type IDockviewDefaultTabProps } from "dockview";
import { type PointerEvent, useRef, useCallback } from "react";
import { X, Bookmark, Settings } from "lucide-react";
import { useSheet } from "@/hooks/useSheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Tab: React.FunctionComponent<IDockviewDefaultTabProps> = (
  props
) => {
  const {
    onPointerDown,
    onPointerUp,
    onPointerLeave,
    api,
    closeActionOverride,
    hideClose,
  } = props;
  const { openSheet } = useSheet();
  const isMiddleMouseButton = useRef<boolean>(false);
  const params = api.getParameters();

  const Icon = params?.icon || Bookmark;
  const title = params?.title || api.id;
  const SettingsComponent = params?.settings;

  const onClose = useCallback(
    (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();

      if (closeActionOverride) {
        closeActionOverride();
      } else {
        api.close();
      }
    },
    [api, closeActionOverride]
  );

  const onBtnPointerDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
  }, []);

  const _onPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      isMiddleMouseButton.current = event.button === 1;
      onPointerDown?.(event);
    },
    [onPointerDown]
  );

  const _onPointerUp = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (isMiddleMouseButton.current && event.button === 1 && !hideClose) {
        isMiddleMouseButton.current = false;
        onClose(event);
      }
      onPointerUp?.(event);
    },
    [onPointerUp, onClose, hideClose]
  );

  const _onPointerLeave = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      isMiddleMouseButton.current = false;
      onPointerLeave?.(event);
    },
    [onPointerLeave]
  );

  return (
    <div
      data-testid="dockview-dv-default-tab"
      onPointerDown={_onPointerDown}
      onPointerUp={_onPointerUp}
      onPointerLeave={_onPointerLeave}
      className="dv-default-tab"
    >
      <span className="dv-default-tab-content flex items-center gap-1">
        <Icon size={20} className="" />
        {title || api.id}
        {SettingsComponent && (
          <Tooltip>
            <TooltipTrigger>
              <Settings
                className="ml-2 size-5 hover:text-secondary-foreground cursor-pointer"
                onClick={() =>
                  openSheet({
                    title: `Settings for ${title || api.id}`,
                    description: "Widget settings",
                    content: <SettingsComponent />,
                  })
                }
              />
            </TooltipTrigger>
            <TooltipContent side="bottom">Widget Settings</TooltipContent>
          </Tooltip>
        )}
        {!props.hideClose && props.tabLocation !== "headerOverflow" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="dv-default-tab-action hover:text-red-500 p-1 transition-colors duration-100"
                onPointerDown={onBtnPointerDown}
                onClick={onClose}
              >
                <X size={15} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={4}>
              Close Widget
            </TooltipContent>
          </Tooltip>
        )}
      </span>
    </div>
  );
};
