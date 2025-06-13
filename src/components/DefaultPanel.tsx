import { type IDockviewPanelProps } from "dockview";
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useSheet } from "@/hooks/useSheet";
import { Input } from "@/components/ui/input";
import { type WidgetMetadata } from "@/types/IWidgetComponent";

function ProfileButton() {
  const { openSheet } = useSheet();

  return (
    <Button
      className="ml-2"
      onClick={() =>
        openSheet({
          title: "Profil",
          description: "Modifier vos informations personnelles",
          content: (
            <div className="space-y-4">
              <Input placeholder="Nom" />
              <Input placeholder="Email" />
            </div>
          ),
        })
      }
    >
      Settings
    </Button>
  );
}

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

  return (
    <div className="p-2">
      <ProfileButton />
    </div>
  );
};
