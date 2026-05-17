# YouTube Script — API Styles in the Agent Era

## Title

MCP and A2A, Explained: Where They Actually Fit in 30 Years of API Styles

## Description

Everyone is calling MCP a paradigm shift. It is not. MCP is a standardized contract layered on plumbing that has been in production for two decades, and once you see that clearly, the agent era gets a lot easier to architect. This walkthrough maps the seven API styles every AI system is built from, shows where MCP and A2A actually sit, and gives you a decision framework for picking the right contract.

Built in public as part of GenAIPros.com, an end-to-end content aggregation and RAG platform on GCP.

Timestamps:
0:00 The 60-second take
1:00 What an API style actually is
2:00 The streaming chat call that uses two styles at once
3:00 The M times N problem MCP solves
4:00 MCP and A2A under the hood
5:30 Production failures and the decision rule

---

## 0:00 - 1:00 — The 60-second take

Seventy percent of an AI codebase is glue code. That is the number that stopped me cold this week. And the reason it gets that high is that most teams still treat MCP like a brand new API style. It is not. It is a contract bolted onto plumbing that has been in production for 20 years.

So here is what I want you walking away with, if you architect AI systems for a living.

There are roughly seven API styles in production, and every AI system you have ever used is built from a few of them stacked together. MCP and A2A are not new additions to that list. They are standardized contracts that ride on top of what already exists. MCP standardizes how an LLM calls a tool. A2A standardizes how one agent talks to another.

And the real shift underneath both of them is dynamic discovery. The contract used to be read by a human before any code shipped. Now a model reads it at runtime. That single change is what removes the glue code. Let me show you how.

## 1:00 - 2:00 — What an API style actually is

[show slide 2]

An API style is not a vendor and not a technology. It is the shape your traffic has. There are four shapes: one-shot synchronous, streamed, bidirectional, and async-decoupled. Choose the shape your traffic actually has, and the style picks itself.

[show slide 3]

In practice that produces seven styles. REST and GraphQL and gRPC for request-response. Server-Sent Events and WebSocket for streaming and realtime. Webhooks and message brokers for async work.

The mistake teams make is choosing a style by what they already know, then forcing their traffic to fit. Forcing a streaming pattern into REST polling produces working code and a broken architecture. Pick the shape first.

## 2:00 - 3:00 — Two styles in one chat call

[show slide 6]

Here is the clearest example of styles composing. A streaming chat call.

[B-roll: terminal showing a curl POST to a messages endpoint, then a stream of data events scrolling]

You send a POST request with your prompt. That is REST. A synchronous HTTP request, JSON body, bearer token. The server holds the connection open and replies with a stream of token events, one at a time, until it sends a done marker. That is Server-Sent Events.

Two styles, two directions, one connection. Once you can see that, you stop treating "the API" as one thing and start seeing the composition. That is the skill.

## 3:00 - 4:00 — The M times N problem

[show slide 7]

Before MCP, every integration between an AI tool and a data source was custom glue. Three tools and three data sources is nine adapters. Add a fourth tool, write three more. A reasonable estimate is that 70 percent of an AI codebase became glue code.

[show slide 8]

MCP collapses that. Each tool implements MCP once. Each data source exposes one MCP server. M times N becomes M plus N. The framing the project uses is the USB-C of AI: one connector, any device.

But here is the part the hype skips. Under the hood MCP is JSON-RPC 2.0 over stdio or HTTP and SSE. That message format has been in production since 2005. The innovation is a thin semantic layer on top, and nothing else.

## 4:00 - 5:30 — MCP and A2A under the hood

[show slide 10]

That semantic layer exposes three things to the model. First, functions it can call. MCP calls those tools. Second, context it can read, sitting behind a URI. Those are resources. Third, pre-built workflows the user can kick off directly. Those are prompts. And the part that matters: the model discovers all three at runtime. Nobody pre-wires anything. Compare that to the old way, where an engineer reads an OpenAPI spec, writes a client, ships it, and hopes the contract does not change. MCP turns that into something the model just introspects when it needs to.

[show slide 12]

A2A is MCP's sibling. Same wire family, different audience. Where MCP is LLM-to-tool, A2A is agent-to-agent. Its key primitive is the task: a stateful unit of work with an ID and a lifecycle that can run for minutes, hours, or days. And that is the real line between the two protocols. An MCP tool call is one-shot, it has a timeout measured in seconds. An A2A task is a workflow. It survives across many messages, you can poll it, subscribe to its progress, and collect artifacts when it finishes.

[B-roll: diagram of a Salesforce agent handing a task to a Vertex AI agent handing to a ServiceNow agent]

This is already real. A2A is in production at over 150 organizations, letting agents on different vendor platforms hand work to each other with none of them needing to understand the others' internal architecture. That is genuinely new. For a decade, multi-cloud meant duplicating workloads. A2A makes multi-vendor agents collaborate without the duplication.

## 5:30 - 6:30 — Production failures and the decision rule

[show slide 13]

Ship this and you meet new failure modes. Prompt injection through tool output is the largest. Hallucinated tool results that cascade through a chain of agents. Schema drift between server versions. Cost that grows quadratically as a chatty agent's context balloons. Plan the defenses before scale forces them on you.

[show slide 16]

So here is how I actually use this at the whiteboard. Start with the shape of the traffic, and the contract falls out. A one-shot ask, that is REST. The server needs to stream data over time, that is SSE. Both sides talk continuously, WebSocket. You need to decouple the sender from the receiver, reach for a broker. An LLM should be able to call your service, that is MCP. And agents that collaborate across vendors or run long workflows, that is A2A. None of these are mutually exclusive. A real system picks three or four and composes them.

## 6:30 - 7:00 — GenAIPros tie-in and CTA

On GenAIPros, the platform I am building in public, this settled a concrete call. The GCP-hosted RAG pipeline is now exposed as an MCP server, so no client ever gets hand-wired to a data source. And A2A goes on the roadmap for the exact moment the ingestion agent and the summarization agent need to hand off work across a task lifecycle longer than a single tool call.

The wire is settled. The work is what you build on it. Follow the build at genaipros.com, and subscribe if you want the next topic.