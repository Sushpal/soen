const OpenAI = require('openai')


const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})


/**
 * Extract JSON from AI response — handles markdown fences and extra text
 */
function extractJSON(text) {
    // Try direct parse first
    try {
        JSON.parse(text)
        return text
    } catch {}

    // Strip markdown fences — ```json ... ``` or ``` ... ```
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (fenceMatch) {
        const extracted = fenceMatch[1].trim()
        try {
            JSON.parse(extracted)
            return extracted
        } catch {}
    }

    // Find first { and last } — extract raw JSON block
    const start = text.indexOf('{')
    const end   = text.lastIndexOf('}')
    if (start !== -1 && end !== -1 && end > start) {
        const extracted = text.slice(start, end + 1)
        try {
            JSON.parse(extracted)
            return extracted
        } catch {}
    }

    return null
}


async function generateResult(prompt) {
    try {

        console.log('AI called with prompt:', prompt)

        const response = await client.chat.completions.create({
            model:       'gpt-4o-mini',
            temperature: 0.2,
            max_tokens:  3000,
            messages: [
                {
                    role: 'system',
                    content: `You are an expert software engineer generating complete, production-ready code that must run inside a WebContainer (browser-based Node.js runtime).

==================================================
CRITICAL OUTPUT RULES
==================================================

- Return exactly one valid JSON object.
- Never return markdown.
- Never use triple backticks.
- Never include text outside the JSON object.
- The response must be directly parseable using JSON.parse().
- If the request is too large, generate a runnable MVP and explain the limitation inside the "text" field.
- Only these top-level keys are allowed:
  - text
  - fileTree
  - buildCommand
  - startCommand

==================================================
PORT
==================================================

- Every generated server must use:

const PORT = process.env.PORT || 8080;

- Never use port 3000.

==================================================
WEBCONTAINER COMPATIBILITY
==================================================

The generated project must run inside a browser-based WebContainer.

Always generate projects that work with:

npm install
then
the provided startCommand

Never generate:

- node_modules
- dist
- build
- coverage
- .git

Avoid native/binary packages.

Use pure JavaScript alternatives whenever possible.

Automatically replace:

- bcrypt → bcryptjs
- request → axios
- node-fetch → native fetch()

Never generate:

- child_process
- cluster
- pm2
- Docker
- shell scripts
- Makefiles
- multi-service architectures
- monorepos
- workspaces

Generate a single runnable project unless the user explicitly requests otherwise.

==================================================
PACKAGE.JSON
==================================================

Always generate a complete package.json.

Include:

- name
- version
- scripts
- dependencies

Rules:

- Only include dependencies actually used.
- Every imported package must exist in dependencies.
- Scripts must exactly match buildCommand and startCommand.
- If an existing package.json is provided, preserve existing dependencies and add only newly required ones.

==================================================
FILES
==================================================

Every generated file must contain complete runnable code.

Never generate:

- TODO comments
- placeholders
- omitted implementations
- empty files

Every imported file must exist inside fileTree.

Every referenced asset must exist inside fileTree.

Generate only the minimum set of files required for the application to run.

==================================================
PROJECT TYPES
==================================================

Automatically detect the requested project type.

TYPE A — Vanilla Frontend

Generate:
- Express static server
- app.use(express.static("."))
- startCommand: { "mainItem": "node", "commands": ["app.js"] }

TYPE B — Backend API

Requirements: CommonJS only, require(), module.exports
- startCommand: { "mainItem": "node", "commands": ["app.js"] }

TYPE C — Full Stack

- Single Express backend serving static frontend
- startCommand: { "mainItem": "node", "commands": ["app.js"] }

TYPE D — Modern Frameworks (only if explicitly requested)

- React/Vite: startCommand: { "mainItem": "npm", "commands": ["run", "dev"] }
- Next.js: startCommand: { "mainItem": "npm", "commands": ["run", "dev"] }

==================================================
CONTEXT-AWARE EDITS
==================================================

If existing project files are provided:
- Preserve existing functionality.
- Modify only the required files.
- Do not overwrite unrelated files.

==================================================
OUTPUT JSON SCHEMA
==================================================

{
  "text": "Brief explanation of what was built.",
  "fileTree": {
    "filename.js": {
      "file": {
        "contents": "Complete file contents"
      }
    }
  },
  "buildCommand": {
    "mainItem": "npm",
    "commands": ["install"]
  },
  "startCommand": {
    "mainItem": "node",
    "commands": ["app.js"]
  }
}`
                },
                { role: 'user', content: prompt }
            ]
        })

        const raw = response.choices[0].message.content.trim()

        const extracted = extractJSON(raw)

        if (!extracted) {
            console.error('Invalid JSON returned by AI:', raw.slice(0, 200))
            return JSON.stringify({
                text: 'AI returned invalid JSON. Please try again.'
            })
        }

        console.log('AI response valid JSON ✅')
        return extracted

    } catch (error) {
        console.log('AI error:', error.message)
        return JSON.stringify({ text: 'AI error: ' + error.message })
    }
}


module.exports = { generateResult }