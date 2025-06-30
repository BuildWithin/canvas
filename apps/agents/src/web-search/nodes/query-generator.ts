import { format } from "date-fns";
import { ChatAnthropic } from "@langchain/anthropic";
import { WebSearchState } from "../state.js";
import { formatMessages } from "../../utils.js";

const QUERY_GENERATOR_PROMPT = `You're a helpful AI assistant tasked with writing a query to search the web.
You're provided with a list of messages between a user and an AI assistant.
The most recent message from the user is the one you should update to be a more search engine friendly query.

Try to keep the new query as similar to the message as possible, while still being search engine friendly.

SPECIAL HANDLING for career/resume contexts:
- If discussing specific companies: Include "[Company] [JobTitle] requirements [year]" or "[Company] hiring [JobTitle]"
- If mentioning job titles: Add "job requirements skills [year]" or "job description [year]"  
- If discussing skills/technologies: Include "trending [skill] jobs [year]" or "[skill] demand market [year]"
- If mentioning industries: Add "industry trends [year]" or "[industry] job market [year]"
- If asking about salaries: Include "salary range [location] [year]"
- If discussing career growth: Add "career path [year]" or "skills needed [year]"

Always include the current year for career-related queries to get the most recent information.

For general queries, maintain the same approach but make them search-engine optimized.

Here is the conversation between the user and the assistant, in order of oldest to newest:

<conversation>
{conversation}
</conversation>

<additional_context>
{additional_context}
</additional_context>

Respond ONLY with the search query, and nothing else.`;

export async function queryGenerator(
  state: WebSearchState
): Promise<Partial<WebSearchState>> {
  const model = new ChatAnthropic({
    model: "claude-3-5-sonnet-latest",
    temperature: 0,
  });

  const additionalContext = `The current date is ${format(new Date(), "PPpp")}`;

  const formattedMessages = formatMessages(state.messages);
  const formattedPrompt = QUERY_GENERATOR_PROMPT.replace(
    "{conversation}",
    formattedMessages
  ).replace("{additional_context}", additionalContext);

  const response = await model.invoke([["user", formattedPrompt]]);

  return {
    query: response.content as string,
  };
}
