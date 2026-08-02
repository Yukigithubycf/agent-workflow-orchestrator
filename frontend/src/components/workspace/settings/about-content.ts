/**
 * About content is inlined because Turbopack does not support raw-loader.
 */
import { APP_VERSION } from "@/version";

export const aboutMarkdown = `# About AstraFlow ${APP_VERSION}

**AstraFlow** is a multi-agent AI workspace for research, coding, analysis,
and content creation. It coordinates tools, skills, memory, sandboxes, and
specialized sub-agents to complete work that spans multiple steps.

---

## Core capabilities

* **Skills and tools**: Extend the system with reusable capabilities.
* **Sub-agents**: Delegate focused work while the lead agent coordinates results.
* **Sandbox and files**: Execute code and work with project files in isolation.
* **Context engineering**: Keep long-running work focused and understandable.
* **Long-term memory**: Carry useful preferences and context across sessions.

---

## Open source

AstraFlow is distributed under the **MIT License** and is built with open-source
projects including LangChain, LangGraph, Next.js, and Shadcn UI.
`;
