import { format } from "date-fns";
import { ChatAnthropic } from "@langchain/anthropic";
import { WebSearchState } from "../state.js";
import { formatMessages } from "../../utils.js";

const QUERY_GENERATOR_PROMPT = `You're a helpful AI assistant tasked with writing a query to search the web.
You're provided with a list of messages between a user and an AI assistant.
The most recent message from the user is the one you should update to be a more search engine friendly query.

Try to keep the new query as similar to the message as possible, while still being search engine friendly.

SPECIAL HANDLING for career/resume contexts - TARGET ACTUAL JOB MARKET DATA:

FOCUS ON REAL JOB POSTINGS AND COMPANY DATA:
- If discussing specific companies: Use "site:linkedin.com/jobs [Company] [JobTitle]" or "[Company] careers site:[company].com [JobTitle]" or "glassdoor [Company] [JobTitle] requirements"
- If mentioning job titles: Use "linkedin jobs [JobTitle] [year]" or "indeed [JobTitle] requirements" or "[JobTitle] job postings [year]"
- If discussing skills/technologies: Use "linkedin jobs [skill] requirements [year]" or "glassdoor [skill] salary [year]" or "[skill] developer jobs [year]"
- If mentioning industries: Use "[industry] jobs hiring [year]" or "linkedin [industry] job trends [year]"
- If asking about salaries: Use "glassdoor [JobTitle] salary [year]" or "levels.fyi [Company] [JobTitle]" or "[JobTitle] compensation [year]"

EXCLUDE RESUME BUILDING SERVICES by adding these negative terms when relevant: -"resume builder" -"CV maker" -"resume template" -"resume service"

PRIORITIZE JOB SITES AND COMPANY SOURCES:
- LinkedIn jobs, company career pages, Glassdoor, Indeed, AngelList (for startups)
- Use "site:" operator for specific domains when targeting companies
- Include current year for fresh job market data

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
