import {
  NEW_ARTIFACT_PROMPT,
  GENERATE_RESUME_PROMPT,
  GENERATE_RESUME_WITH_SEARCH_PROMPT,
} from "../../prompts.js";
import {
  ArtifactCodeV3,
  ArtifactMarkdownV3,
  ProgrammingLanguageOptions,
  SearchResult,
} from "@opencanvas/shared/types";
import { z } from "zod";
import { ARTIFACT_TOOL_SCHEMA } from "./schemas.js";
import { BaseMessage } from "@langchain/core/messages";
import { getStringFromContent } from "../../../utils.js";

/**
 * Detects if the conversation context suggests resume/career building scenarios.
 */
function detectResumeContext(messages: BaseMessage[]): boolean {
  const recentMessages = messages.slice(-3);
  const conversationText = recentMessages
    .map((msg) => getStringFromContent(msg.content))
    .join(" ")
    .toLowerCase();

  const resumeKeywords = [
    "resume",
    "cv",
    "curriculum vitae",
    "job application",
    "job search",
    "hiring",
    "interview",
    "career",
    "professional",
    "employment",
    "software engineer",
    "product manager",
    "data scientist",
    "designer",
    "developer",
    "programmer",
    "analyst",
    "consultant",
    "google",
    "meta",
    "amazon",
    "microsoft",
    "apple",
    "netflix",
    "startup",
    "company",
    "position",
    "role",
    "skills",
    "experience",
    "qualifications",
    "requirements",
    "salary",
    "compensation",
    "benefits",
    "industry",
    "tech",
    "technology",
    "finance",
    "healthcare",
  ];

  return resumeKeywords.some((keyword) => conversationText.includes(keyword));
}

/**
 * Formats search results for inclusion in resume prompts.
 */
function formatSearchResultsForPrompt(searchResults: SearchResult[]): string {
  if (!searchResults || searchResults.length === 0) {
    return "No recent market research available.";
  }

  return searchResults
    .map((result, index) => {
      const title = result.metadata?.title || "Search Result";
      const url = result.metadata?.url || "";
      const content = result.pageContent || "";

      return `**Result ${index + 1}: ${title}**
${url ? `Source: ${url}` : ""}
${content.substring(0, 500)}${content.length > 500 ? "..." : ""}
`;
    })
    .join("\n\n");
}

export const formatNewArtifactPrompt = (
  memoriesAsString: string,
  modelName: string,
  messages?: BaseMessage[],
  webSearchResults?: SearchResult[]
): string => {
  const disableChainOfThought = modelName.includes("claude")
    ? "\n\nIMPORTANT: Do NOT preform chain of thought beforehand. Instead, go STRAIGHT to generating the tool response. This is VERY important."
    : "";

  // Check if this is a resume context
  const isResumeContext = messages && detectResumeContext(messages);
  const hasSearchResults = webSearchResults && webSearchResults.length > 0;

  if (isResumeContext && hasSearchResults) {
    // Use resume prompt with search results
    const formattedSearchResults =
      formatSearchResultsForPrompt(webSearchResults);
    return GENERATE_RESUME_WITH_SEARCH_PROMPT.replace(
      "{reflections}",
      memoriesAsString
    )
      .replace("{webSearchResults}", formattedSearchResults)
      .replace("{disableChainOfThought}", disableChainOfThought);
  } else if (isResumeContext) {
    // Use basic resume prompt
    return GENERATE_RESUME_PROMPT.replace(
      "{reflections}",
      memoriesAsString
    ).replace("{disableChainOfThought}", disableChainOfThought);
  }

  // Default to original logic for non-resume contexts
  return NEW_ARTIFACT_PROMPT.replace("{reflections}", memoriesAsString).replace(
    "{disableChainOfThought}",
    disableChainOfThought
  );
};

export const createArtifactContent = (
  toolCall: z.infer<typeof ARTIFACT_TOOL_SCHEMA>
): ArtifactCodeV3 | ArtifactMarkdownV3 => {
  const artifactType = toolCall?.type;

  if (artifactType === "code") {
    return {
      index: 1,
      type: "code",
      title: toolCall?.title,
      code: toolCall?.artifact,
      language: toolCall?.language as ProgrammingLanguageOptions,
    };
  }

  return {
    index: 1,
    type: "text",
    title: toolCall?.title,
    fullMarkdown: toolCall?.artifact,
  };
};
