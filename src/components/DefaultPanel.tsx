import { type IDockviewPanelProps } from "dockview";
import { Button } from "@/components/ui/button";
import { useSheet } from "@/providers/SheetProvider";
import { Input } from "@/components/ui/input";

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

const DefaultPanel = (props: IDockviewPanelProps) => {
  return (
    <div className="p-2">
      {props.api.title}
      <ProfileButton />
    </div>
  );
};

export { DefaultPanel };
