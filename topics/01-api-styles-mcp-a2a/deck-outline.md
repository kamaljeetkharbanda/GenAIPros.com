# Topic 01 — API Styles in the Agent Era: REST, MCP, A2A

## Slide 1
type: title
eyebrow: BUILDING GENAIPROS · TOPIC 01
title: API Styles in the Agent Era
subtitle: MCP is not a new style — it is a contract layered on 30 years of plumbing

---

## Slide 2
type: definition
title: What Is an API Style?
subtitle: A shape of communication, not a product or a trend
category: sky
iconLabel: API
definition: An API style is a paradigm — a set of patterns, protocols, and practices for exposing application interfaces. It is not a vendor. It is not a technology. It is the shape your traffic has. Four shapes cover virtually all distributed systems: one-shot synchronous, streamed, bidirectional, and async-decoupled. Choose the shape your traffic has and the style usually picks itself. Teams that choose by familiarity or trend, then force their traffic to fit, produce working code and broken architectures.
insight: The style question is really a traffic-shape question — answer that first.

---

## Slide 3
type: comparison-table
title: The Seven Styles at a Glance
subtitle: Every AI architecture is a composition of several of these
headers:
  - Style
  - Protocol
  - Shape
  - Typical AI Use
rows:
  - col1: REST
    col2: HTTP/1.1
    col3: Sync one-shot
    col4: LLM chat APIs — OpenAI, Anthropic
  - col1: GraphQL
    col2: HTTP / WS
    col3: Sync one-shot
    col4: RAG context shaping, no overfetch
  - col1: gRPC
    col2: HTTP/2
    col3: Sync + streaming
    col4: Internal serving — Triton, vLLM
  - col1: SSE
    col2: HTTP
    col3: Server-push stream
    col4: Token-by-token chat streaming
  - col1: WebSocket
    col2: TCP/WS
    col3: Bidirectional duplex
    col4: Voice agents, realtime multimodal
insight: No single AI product uses just one style — map all seven before you architect.

---

## Slide 4
type: card-grid
title: Request-Response Styles
subtitle: The synchronous trio powering most AI frontends today
columns: 3
cards:
  - title: REST
    body: Resource URLs plus fixed verbs — GET, POST, PUT, DELETE. JSON on the wire. Every LLM chat API — OpenAI, Anthropic, HF Inference — is a REST POST. Stateless, CDN-friendly, debuggable with curl.
    takeaway: Default style for every LLM chat call.
    iconLabel: RE
    category: sky
  - title: GraphQL
    body: Client specifies exactly which fields it wants from a typed schema. One endpoint, one round trip, zero overfetching. RAG pipelines use it to pull only the fields the LLM needs, conserving context window and token cost.
    takeaway: Precision context retrieval for RAG pipelines.
    iconLabel: GQ
    category: teal
  - title: gRPC
    body: Proto-defined functions, binary Protocol Buffers, HTTP/2 multiplexing. Four modes including bidirectional streaming. Triton, TF Serving, and vLLM all speak gRPC internally for high-throughput inference traffic.
    takeaway: The spine for internal model serving at scale.
    iconLabel: gR
    category: amber
insight: REST is for the edge; gRPC is for the spine. Do not swap them.

---

## Slide 5
type: card-grid
title: Streaming and Async Styles
subtitle: Four styles that handle time — tokens, audio, events, and queues
columns: 2
cards:
  - title: Server-Sent Events
    body: Long-lived HTTP response; server pushes data events one by one. Auto-reconnect, proxy-friendly. Every token-streaming chat UI — OpenAI, Anthropic, HF — runs on SSE under the hood. Server-to-client only.
    takeaway: The wire under every streaming chat UI.
    iconLabel: SE
    category: sky
  - title: WebSocket
    body: Full-duplex persistent connection started via HTTP Upgrade. Both sides send frames freely. Low per-message overhead. OpenAI Realtime API, voice agents, and live multimodal sessions all require WebSocket.
    takeaway: Required for any realtime bidirectional session.
    iconLabel: WS
    category: teal
  - title: Webhooks
    body: HTTP POST from server to a registered URL when an event fires. OpenAI batch API, fine-tune, and transcription jobs all signal completion this way.
    takeaway: Right pattern for long-running job callbacks.
    iconLabel: WH
    category: amber
  - title: Broker / Queue
    body: Kafka, GCP Pub/Sub, RabbitMQ — producers and consumers decouple entirely. Fan-out is free; retries and dead-letter queues are operational primitives. Multi-agent task distribution lives here.
    takeaway: Decouple scale from timing; standard for agent fanout.
    iconLabel: BR
    category: sky
insight: Streaming and async styles are where AI systems scale — and where most bugs hide.

---

## Slide 6
type: step
title: Anatomy of a Streaming Chat Call
subtitle: REST out, SSE back — two styles composing into one user experience
category: sky
codeBlock: |
  POST /v1/messages          (REST)
  Content-Type: application/json

  { "model": "claude-opus-4-7",
    "stream": true,
    "messages": [
      {"role": "user",
       "content": "Explain MCP"} ]
  }

  --- response ---           (SSE)
  Content-Type: text/event-stream

  data: {"delta":{"text":"MCP "}}
  data: {"delta":{"text":"is a "}}
  data: [DONE]
whyHeader: REST for intent, SSE for delivery
whyBody: The request is REST — a synchronous HTTP POST with a JSON body and a bearer token. The response is SSE — a long-lived stream of data events, one per token group, closing with a DONE marker. Same TCP connection; two distinct styles; two different trade-off profiles. Recognising this composition is the key to building chat UIs that feel fast rather than laggy. Nothing about this is new — the styles have been in production for years.
insight: One connection, two styles — the prototypical AI composition pattern.

---

## Slide 7
type: two-column
title: The M x N Integration Problem
subtitle: Why 70% of AI codebases became glue code before MCP
leftCategory: amber
rightCategory: sky
leftHeader: The combinatorial trap
leftBullets:
  - 3 AI tools x 3 data sources = 9 adapters
  - Add one tool — write 3 more adapters
  - Add one source — write 4 more adapters
  - Context lost at every schema translation hop
  - 70% of AI codebase is glue not product
  - Each adapter is its own auth and audit surface
rightHeader: Symptoms in production
rightBullets:
  - Chatbot knows purchase history; recommender does not
  - Three tools, three summaries of the same record
  - Fine-tune dataset schemas mismatched across sources
  - Auth policies duplicated per integration pair
  - No unified audit log across the glue layer
  - One broken adapter silently corrupts downstream agents
insight: M x N is not a scaling problem — it is architectural debt that compounds with every new tool.

---

## Slide 8
type: definition
title: What MCP Actually Is
subtitle: A standardised contract layered on existing plumbing — not a new API style
category: headline
iconLabel: MCP
definition: The Model Context Protocol is an open standard introduced by Anthropic in November 2024, contributed to the Linux Foundation in December 2025, and adopted by Anthropic, OpenAI, and Google DeepMind. It defines how AI applications expose tools, resources, and prompts to LLMs — and how LLMs invoke them at runtime. The architectural shift is M+N: each tool implements MCP once, each data source exposes one MCP server, and any compliant client can use any server. Under the hood it speaks JSON-RPC 2.0 over stdio or streamable HTTP+SSE — familiar two-decade-old plumbing, with a new semantic layer on top.
insight: MCP is the USB-C moment for AI tooling — one connector, any device.

---

## Slide 9
type: card-grid
title: MCP Under the Hood — Four Layers
subtitle: Innovation lives only in the semantic layer; everything else is reused infrastructure
columns: 2
cards:
  - title: Application — The Host
    body: Your LLM-powered app — Claude Desktop, ChatGPT, Cursor, or a custom agent. It manages the LLM session, picks which MCP servers to connect, and owns the trust boundary.
    takeaway: Trust decisions live at the host, not the server.
    iconLabel: L4
    category: purple
  - title: MCP Primitives — The New Layer
    body: The only genuinely new layer in the stack. Server-side: tools, resources, prompts. Client-side: sampling, roots, elicitation. Everything below this layer is reused infrastructure.
    takeaway: Tools are verbs; resources are nouns; prompts are workflows.
    iconLabel: L3
    category: purple
  - title: JSON-RPC 2.0 — The Envelope
    body: Standard message format — methods, params, results, errors. In production since 2005. Stateless by default; sessions opt in via the Mcp-Session-Id header.
    takeaway: Twenty-year-old plumbing. Zero reinvention required.
    iconLabel: L2
    category: teal
  - title: Transport — Two Modes
    body: Stdio for local subprocess servers — the host launches the server and talks via stdin and stdout. Streamable HTTP+SSE for remote servers — an HTTPS endpoint secured with OAuth 2.1 and PKCE.
    takeaway: Local = stdio; remote = HTTP+SSE + OAuth 2.1.
    iconLabel: L1
    category: sky
insight: Strip the primitives layer and what remains is infrastructure every backend engineer already runs.

---

## Slide 10
type: card-grid
title: MCP Primitives — What Servers Expose
subtitle: Three server-side primitives the LLM discovers and invokes at runtime
columns: 3
cards:
  - title: Tools — Verbs
    body: Callable functions with a name, description, and JSON Schema input. The LLM reads descriptions at runtime, picks a tool, and invokes it. Accuracy drops sharply above roughly ten tools per server — narrow names beat broad ones.
    takeaway: Precision naming is the highest-leverage MCP skill.
    iconLabel: TL
    category: purple
  - title: Resources — Nouns
    body: Readable context identified by URI — a file, a database row, an API response. Read-only from the model's perspective. Subscribable, so the host is notified when content changes.
    takeaway: Resources are what the LLM reads; tools are what it does.
    iconLabel: RS
    category: purple
  - title: Prompts — Workflows
    body: Reusable conversation templates the server publishes. Invoked by the user via slash command, not by the LLM. They return a fully-formed conversation seed — server-defined best practices.
    takeaway: Prompts encode team knowledge as repeatable workflows.
    iconLabel: PR
    category: purple
insight: In-band runtime discovery is what separates MCP from every hand-written OpenAPI spec before it.

---

## Slide 11
type: comparison-table
title: Three Contracts — One Wire Family
subtitle: Traditional API vs MCP vs A2A — same plumbing, different audience
headers:
  - Axis
  - Traditional API
  - MCP
  - A2A
rows:
  - col1: Client type
    col2: Human developer
    col3: LLM at runtime
    col4: Autonomous agent
  - col1: Discovery
    col2: OpenAPI docs — out of band
    col3: list_tools — in band
    col4: agent-card.json — in band
  - col1: State model
    col2: Stateless, sessions opt-in
    col3: Stateless calls, sessions opt-in
    col4: Stateful tasks, long-running
  - col1: Integration cost
    col2: M x N custom adapters
    col3: M+N — one server, many clients
    col4: M+N — at the agent layer
insight: Dynamic in-band discovery is the architectural shift that unites MCP and A2A.

---

## Slide 12
type: card-grid
title: Meet A2A — MCP's Sibling Protocol
subtitle: Google + 50 launch partners, April 2025 — in production at 150+ orgs by Cloud Next 2026
columns: 3
cards:
  - title: Agent Card
    body: JSON metadata served at /.well-known/agent-card.json. Describes capabilities, skills, transport, and security schemes. The A2A analog of MCP list_tools — in-band runtime discovery. Cards can be cryptographically signed.
    takeaway: Discovery without a hand-wired registry.
    iconLabel: AC
    category: teal
  - title: Tasks and Artifacts
    body: A stateful work unit with a unique ID and lifecycle — submitted, in-progress, completed, failed. Tasks run minutes to days. Artifacts are tangible deliverables. MCP tool calls are one-shot; A2A tasks are workflows.
    takeaway: Tasks are the primitive MCP deliberately omits.
    iconLabel: TK
    category: teal
  - title: Three Wire Shapes
    body: A2A composes the seven styles beneath it. Request and response polling is REST-shaped. Progress streaming uses SSE. Completion callbacks are webhook-shaped. One protocol, three patterns, zero new transport.
    takeaway: New protocols layer on top — they do not replace.
    iconLabel: WR
    category: sky
insight: A2A lets Salesforce Agentforce hand off to Vertex AI to ServiceNow — different vendors, real production traffic.

---

## Slide 13
type: two-column
title: Production Challenges — Security
subtitle: The failure modes burning teams in 2025 MCP deployments
leftCategory: amber
rightCategory: teal
leftHeader: Prompt injection via tool output
leftBullets:
  - Tool returns attacker-controlled text
  - LLM reads it as a trusted instruction
  - Largest attack class in MCP deployments today
  - Action-Selector — only predefined actions allowed
  - Plan-Then-Execute — plan locked before tools run
  - Dual-LLM — privileged planner, sandboxed processor
rightHeader: Excessive tool authorization
rightBullets:
  - MCP inherits whatever scopes the user granted
  - No least-privilege enforcement by default
  - Narrow send_email_to_team beats broad send_email
  - Map-Reduce — untrusted inputs in isolated subagents
  - Code-Then-Execute — LLM writes code, code runs deterministically
  - Context-Minimization — strip original prompt after step one
insight: Security in MCP is a design problem — narrow tools and elicitation are the primary mitigations.

---

## Slide 14
type: card-grid
title: Production Challenges — Reliability and Ops
subtitle: Four failure modes that compound across multi-agent chains
columns: 2
cards:
  - title: Hallucinated Tool Results
    body: Agent reports success when the tool actually timed out. Downstream agents act on the lie; errors cascade. Fix: cite raw tool output, log executions separately, require structured success and failure indicators.
    takeaway: Never let an agent paraphrase a tool result.
    iconLabel: H1
    category: amber
  - title: Wrong Tool Selection
    body: With 20 similar tools the LLM picks the wrong one. Accuracy in current frontier models drops sharply above roughly ten tools per server. Fix: small surfaces, distinct names, intent guidance in the prompt.
    takeaway: Keep MCP server surfaces under 10 tools.
    iconLabel: H2
    category: amber
  - title: Schema Drift
    body: An MCP server adds a required field; existing clients break at runtime. Fix: version the server, prefer additive-only changes, test compatibility in CI.
    takeaway: Treat MCP schemas like any versioned API contract.
    iconLabel: H3
    category: teal
  - title: Chatty Tool Cost Blowup
    body: Each tool call grows the conversation context. A 20-step agent pays token cost scaling with the square of conversation length. Fix: paginate output, return URIs not full payloads, cache the stable prefix.
    takeaway: Token cost grows quadratically with chatty calls.
    iconLabel: H4
    category: teal
insight: Current research cites 40-80% task failure rates for multi-agent systems — instrument everything from day one.

---

## Slide 15
type: card-grid
title: The Hyperscaler Ecosystem in 2026
subtitle: Protocol is commoditized — the moat is runtime, bridges, identity, and registries
columns: 3
cards:
  - title: Runtime Hosts
    body: AWS Bedrock AgentCore Runtime — ARM64 microVMs, sticky sessions. Azure AI Foundry Agent Service — Entra identity, OBO OAuth. Google Vertex AI Agent Engine — deploy ADK agents from a Python script. Cloudflare Workers — cheapest global distribution.
    takeaway: Pick by where your data and identity already live.
    iconLabel: RT
    category: sky
  - title: API-to-MCP Bridges
    body: Google Apigee auto-exposes any managed API as an MCP server, inheriting existing rate limits. AWS Bedrock AgentCore Gateway wraps REST APIs as MCP tools. Azure API Center catalogs MCP servers with Entra governance.
    takeaway: Enterprise API gateway is the new MCP server factory.
    iconLabel: BR
    category: teal
  - title: Identity and Registries
    body: OAuth 2.1 + PKCE + Dynamic Client Registration is the 2026 baseline. Providers: Microsoft Entra, Auth0, Stytch. Registries: the Anthropic directory, Microsoft Foundry Add Tools, Google Vertex Agent Garden, Zapier AI Actions.
    takeaway: OAuth 2.1 + DCR is the baseline for remote servers.
    iconLabel: ID
    category: amber
insight: Linux Foundation governs both MCP and A2A — single-vendor capture is structurally off the table.

---

## Slide 16
type: comparison-table
title: Decision Framework — Which Contract?
subtitle: Match traffic shape to protocol before writing a single line of integration code
headers:
  - Traffic Shape
  - Use
  - Why
  - Common Mistake
rows:
  - col1: One-shot ask, one answer
    col2: REST
    col3: Stateless, cacheable, debuggable
    col4: Adding streaming when polling works
  - col1: Server streams over time
    col2: SSE
    col3: Proxy-friendly, auto-reconnect
    col4: WebSocket for one-way push
  - col1: Both sides talk continuously
    col2: WebSocket
    col3: Full-duplex, low overhead
    col4: REST polling for realtime audio
  - col1: Decouple sender from receiver
    col2: Broker
    col3: Free fan-out, retries, DLQs
    col4: Chaining webhooks instead of a queue
  - col1: LLM calls your service
    col2: MCP
    col3: In-band discovery, M+N cost
    col4: Custom REST adapter per tool pair
insight: MCP and A2A layer on top of the seven styles — they do not replace the plumbing beneath them.

---

## Slide 17
type: takeaways
title: Five Things Worth Keeping
takeaways:
  - API styles are communication shapes. Pick the shape your traffic has and the style follows. Forcing fit produces working code and broken architectures.
  - Real AI systems compose styles. REST out plus SSE back for chat. WebSocket for voice. gRPC for internal serving. Broker for agent fanout. Nothing in production is single-style.
  - MCP is not a new API style. It is JSON-RPC 2.0 over stdio or HTTP+SSE with a semantic layer on top — tools, resources, prompts, in-band discovery. Same plumbing, new vocabulary.
  - A2A is MCP's sibling for agent-to-agent work. It adds stateful tasks, lifecycle states, and artifacts — the primitives MCP leaves out. Real systems need both, and the two compose.
  - Dynamic in-band discovery is the architectural shift. OpenAPI is read by humans before code ships. MCP and A2A contracts are introspected by models at runtime. That eliminates the glue layer.

---

## Slide 18
type: closing
eyebrow: BUILDING GENAIPROS · TOPIC 01
title: The Wire Is Settled
subtitle: Now build on it
body: GenAIPros wraps its GCP-hosted RAG pipeline as an MCP server — in-band discovery, zero hand-wired clients, every content source and retrieval tool behind one standard contract. A2A enters the picture the moment the ingestion agent and the summarisation agent must hand work across a task lifecycle longer than a tool-call timeout — that boundary is exactly the line this deck traces. MCP for LLM-to-tool. A2A for agent-to-agent. The seven styles underneath both. Follow the build at genaipros.com.
