import { FiPlus } from "react-icons/fi";

import { Button } from "./Button";

export function EmptyState({ icon: Icon = FiPlus, title, description, action, onAction }) {
  return (
    <div className="muted-panel grid place-items-center rounded-lg px-6 py-14 text-center">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg border border-white/10 bg-white/[0.08]">
        <Icon className="h-5 w-5 text-brand-aqua" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-white/[0.55]">{description}</p>
      {action ? (
        <Button className="mt-6" icon={FiPlus} variant="primary" onClick={onAction}>
          {action}
        </Button>
      ) : null}
    </div>
  );
}
