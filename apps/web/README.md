# BuildWithin Resume Agent

![Screenshot of app](./public/screenshot.png)

**BuildWithin Resume Agent** is an AI-powered platform specifically designed for building exceptional resumes and advancing careers. Originally forked from LangChain's Open Canvas, we've enhanced it with powerful resume-focused features and intelligent job market integration.

## What Makes BuildWithin Different

1. **Resume-Focused Intelligence**: Our AI agent specializes in resume building, career advice, and job market analysis with built-in web search for current job requirements.
2. **Smart Job Market Integration**: Automatically searches LinkedIn, Glassdoor, and company career pages for real-time job requirements and salary data.
3. **URL Context System**: Share targeted links with job-specific context to provide personalized resume assistance.
4. **Built-in Memory**: Remembers your career goals, writing style, and preferences across sessions for increasingly personalized assistance.
5. **Professional Document Collaboration**: Start with existing content or build from scratch with our intelligent document editor.

## Core Features

### 🎯 **Resume Intelligence**

- **Intelligent Job Market Research**: Automatically searches current job postings, requirements, and salary data from LinkedIn, Glassdoor, and company career pages
- **Resume-Specific Query Generation**: Smart search queries that target actual job market data instead of generic resume builders
- **Company-Targeted Assistance**: Get specific guidance for applications to Google, Meta, startups, or any company

### 🔗 **URL Context System**

- **Deep Link Integration**: Share links with context like `?context=software-engineer-at-meta` for targeted assistance
- **Invisible Context**: Context is provided to the AI via SystemMessage while keeping user messages clean
- **Marketing Integration**: Perfect for landing pages and guided user experiences

### 🧠 **Personalized Memory**

- **Career Memory**: Remembers your career goals, writing style, and professional preferences across sessions
- **Style Consistency**: Maintains your preferred resume format and language patterns
- **Progressive Learning**: Gets better at helping you over time

### ⚡ **Professional Workflow**

- **Custom Quick Actions**: Define your own resume prompts and career advice shortcuts
- **Resume Versioning**: Track changes and revert to previous versions of your resume
- **Live Editing**: Real-time markdown rendering with professional formatting
- **Multiple Document Types**: Support for resumes, cover letters, and other career documents

## Setup locally

This guide will cover how to setup and run BuildWithin Resume Agent locally.

### Prerequisites

BuildWithin Resume Agent requires the following API keys and external services:

#### Package Manager

- [Yarn](https://yarnpkg.com/)

#### LLM APIs

- [OpenAI API key](https://platform.openai.com/signup/)
- [Anthropic API key](https://console.anthropic.com/)
- (optional) [Google GenAI API key](https://aistudio.google.com/apikey)
- (optional) [Fireworks AI API key](https://fireworks.ai/login)

#### Authentication

- [Supabase](https://supabase.com/) account for authentication

#### LangGraph Server

- [LangGraph CLI](https://langchain-ai.github.io/langgraph/cloud/reference/cli/) for running the graph locally

#### LangSmith

- [LangSmith](https://smith.langchain.com/) for tracing & observability

### Installation

First, clone the repository:

```bash
git clone https://github.com/buildwithin/canvas.git
cd canvas
```

Next, install the dependencies:

```bash
yarn install
```

After installing dependencies, copy the `.env.example` file contents into `.env` and set the required values:

```bash
cp .env.example .env
```

Then, setup authentication with Supabase.

### Setup Authentication

After creating a Supabase account, visit your [dashboard](https://supabase.com/dashboard/projects) and create a new project.

Next, navigate to the `Project Settings` page inside your project, and then to the `API` tag. Copy the `Project URL`, and `anon public` project API key. Paste them into the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables in the `.env` file.

After this, navigate to the `Authentication` page, and the `Providers` tab. Make sure `Email` is enabled (also ensure you've enabled `Confirm Email`). You may also enable `GitHub`, and/or `Google` if you'd like to use those for authentication. (see these pages for documentation on how to setup each provider: [GitHub](https://supabase.com/docs/guides/auth/social-login/auth-github), [Google](https://supabase.com/docs/guides/auth/social-login/auth-google))

#### Test authentication

To verify authentication works, run `yarn dev` and visit [localhost:3000](http://localhost:3000). This should redirect you to the [login page](http://localhost:3000/auth/login). From here, you can either login with Google or GitHub, or if you did not configure these providers, navigate to the [signup page](http://localhost:3000/auth/signup) and create a new account with an email and password. This should then redirect you to a conformation page, and after confirming your email you should be redirected to the [home page](http://localhost:3000).

### Setup LangGraph Server

Now we'll cover how to setup and run the LangGraph server locally.

Follow the [`Installation` instructions in the LangGraph docs](https://langchain-ai.github.io/langgraph/cloud/reference/cli/#installation) to install the LangGraph CLI.

Once installed, navigate to the root of the BuildWithin Resume Agent repo and run `yarn dev:server` (this runs `npx @langchain/langgraph-cli dev --port 54367`).

Once it finishes pulling the docker image and installing dependencies, you should see it log:

```
Ready!
- 🚀 API: http://localhost:54367
- 🎨 Studio UI: https://smith.langchain.com/studio?baseUrl=http://localhost:54367
```

After your LangGraph server is running, execute the following command to start the BuildWithin Resume Agent app:

```bash
yarn dev
```

On initial load, compilation may take a little bit of time.

Then, open [localhost:3000](http://localhost:3000) with your browser and start interacting!

## LLM Models

BuildWithin Resume Agent is designed to be compatible with any LLM model. The current deployment has the following models configured:

- **Anthropic Claude 3 Haiku 👤**: Haiku is Anthropic's fastest model, great for quick tasks like making edits to your document. Sign up for an Anthropic account [here](https://console.anthropic.com/).
- **Fireworks Llama 3 70B 🦙**: Llama 3 is a SOTA open source model from Meta, powered by [Fireworks AI](https://fireworks.ai/). You can sign up for an account [here](https://fireworks.ai/login).
- **OpenAI GPT 4o Mini 💨**: GPT 4o Mini is OpenAI's newest, smallest model. You can sign up for an API key [here](https://platform.openai.com/signup/).

If you'd like to add a new model, follow these simple steps:

1. Add to or update the model provider variables in `constants.ts`.
2. Install the necessary package for the provider (e.g. `@langchain/anthropic`).
3. Update the `getModelConfig` function in `src/agent/utils.ts` to include an `if` statement for your new model name and provider.
4. Manually test by checking you can:
   > - 4a. Generate a new artifact
   > - 4b. Generate a followup message (happens automatically after generating an artifact)
   > - 4c. Update an artifact via a message in chat
   > - 4d. Update an artifact via a quick action
   > - 4e. Repeat for text/code (ensure both work)

### Local Ollama models

BuildWithin Resume Agent supports calling local LLMs running on Ollama. This is not enabled in the hosted version, but you can use this in your own local/deployed instance.

To use a local Ollama model, first ensure you have [Ollama](https://ollama.com) installed, and a model that supports tool calling pulled (the default model is `llama3.3`).

Next, start the Ollama server by running `ollama run llama3.3`.

Then, set the `NEXT_PUBLIC_OLLAMA_ENABLED` environment variable to `true`, and the `OLLAMA_API_URL` environment variable to the URL of your Ollama server (defaults to `http://host.docker.internal:11434`. If you do not set a custom port when starting your Ollama server, you should not need to set this environment variable).

> [!NOTE]
> Open source LLMs are typically not as good at instruction following as proprietary models like GPT-4o or Claude Sonnet. Because of this, you may experience errors or unexpected behavior when using local LLMs.

## Troubleshooting

Below are some common issues you may run into if running BuildWithin Resume Agent yourself:

- **I have the LangGraph server running successfully, and my client can make requests, but no text is being generated:** This can happen if you start & connect to multiple different LangGraph servers locally in the same browser. Try clearing the `oc_thread_id_v2` cookie and refreshing the page. This is because each unique LangGraph server has its own database where threads are stored, so a thread ID from one server will not be found in the database of another server.

- **I'm getting 500 network errors when I try to make requests on the client:** Ensure you have the LangGraph server running, and you're making requests to the correct port. You can specify the port to use by passing the `--port <PORT>` flag to the `npx @langchain/langgraph-cli dev` command, and you can set the URL to make requests to by either setting the `LANGGRAPH_API_URL` environment variable, or by changing the fallback value of the `LANGGRAPH_API_URL` variable in `constants.ts`.

- **I'm getting "thread ID not found" error toasts when I try to make requests on the client:** Ensure you have the LangGraph server running, and you're making requests to the correct port. You can specify the port to use by passing the `--port <PORT>` flag to the `npx @langchain/langgraph-cli dev` command, and you can set the URL to make requests to by either setting the `LANGGRAPH_API_URL` environment variable, or by changing the fallback value of the `LANGGRAPH_API_URL` variable in `constants.ts`.

- **`Model name is missing in config.` error is being thrown when I make requests:** This error occurs when the `customModelName` is not specified in the config. You can resolve this by setting the `customModelName` field inside `config.configurable` to the name of the model you want to use when invoking the graph. See [this doc](https://langchain-ai.github.io/langgraphjs/how-tos/configuration/) on how to use configurable fields in LangGraph.

## About

BuildWithin Resume Agent is built on the foundation of LangChain's Open Canvas but has been significantly enhanced with resume-focused intelligence, job market integration, and professional workflow features. This specialized version is designed specifically for career advancement and resume optimization.

For technical support or questions about setup, please refer to the documentation above or contact the BuildWithin team.
