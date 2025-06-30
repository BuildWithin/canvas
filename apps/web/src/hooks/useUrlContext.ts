import { useQueryState } from "nuqs";
import { SystemMessage } from "@langchain/core/messages";

export const useUrlContext = () => {
  const [context] = useQueryState("context");
  console.log("context", context);

  const getContextSystemMessage = (): SystemMessage | null => {
    if (!context || context.trim() === "") {
      return null;
    }

    return new SystemMessage({
      content: `Context for this conversation: ${context.trim()}. Please use this context to provide more relevant and targeted assistance to the user.`,
    });
  };

  return {
    context,
    getContextSystemMessage,
  };
};
