import { memo } from "react";

interface CommandOutputProps {
  command: string;
  output: string;
}

function CommandOutput({ command, output }: CommandOutputProps) {
  return (
    <div className="mb-2">
      <div className="text-green-500 dark:text-green-300">$ {command}</div>
      <pre
        className="whitespace-pre-wrap ml-4"
        key={command}
        dangerouslySetInnerHTML={{
          __html: output,
        }}
      />
    </div>
  );
}

export default memo(CommandOutput);
