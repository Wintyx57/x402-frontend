---
title: "LangChain + x402: Give Your AI Agent a Crypto Wallet"
date: 2026-02-28
author: x402 Team
tags:
  - langchain
  - ai-agents
  - python
  - usdc
  - tutorials
---

# LangChain + x402: Give Your AI Agent a Crypto Wallet

You've built a LangChain agent that can think, reason, and take actions. But it's stuck.

It can search the web with DuckDuckGo (but only 10 free queries/month). It can generate images with a local model (but it's slow). It can run code (but only in a sandboxed interpreter). Every tool it uses is either free-tier-limited or running locally.

What if your agent could **pay for better tools when it needed them**?

With x402 Bazaar and LangChain, it can. Your agent gets a wallet, a budget, and access to 69+ premium APIs. When it needs high-quality image generation, accurate real-time weather data, or specialized code execution, it pays USDC and gets the job done right.

## Install x402_langchain

```bash
pip install x402-langchain
```

That's it. One package gives your LangChain agents payment capabilities.

## Create an Agent with a Budget

```python
from langchain.agents import initialize_agent, Tool
from langchain.llms import OpenAI
from x402_langchain import X402Agent, X402Tools

# Initialize with a budget
agent = X402Agent(
    model="gpt-4",
    max_budget_usdc=5.0,  # Agent has $5 USDC to spend
    chain_id="base"  # Use Base blockchain (low fees)
)

# Define what tools the agent can use
tools = [
    Tool(
        name="X402 Image Generator",
        func=agent.tools.generate_image,
        description="Generate a high-quality image from text. Costs 0.10 USDC."
    ),
    Tool(
        name="X402 Weather API",
        func=agent.tools.get_weather,
        description="Get real-time weather for any city. Costs 0.001 USDC."
    ),
    Tool(
        name="X402 Code Executor",
        func=agent.tools.run_code,
        description="Execute Python code safely. Costs 0.05 USDC."
    ),
]

agent.add_tools(tools)
```

## Example 1: Image Generation + Web Scraping

Your agent needs to create a visual summary of a product:

```python
result = agent.run(
    """
    1. Search for "best wireless headphones 2026"
    2. Get product details and prices
    3. Generate an image showing the top 3 products
    4. Write a comparison review
    """
)

print(result)
# Output:
# Based on my search, the top 3 wireless headphones are:
# 1. Sony WH-1000XM5 - $399
# 2. Apple AirPods Pro - $249
# 3. Bose QuietComfort Ultra - $379
#
# [Generated image showing all three products side-by-side]
#
# Here's my analysis:
# Sony leads in noise cancellation...
```

**Cost breakdown:**
- Web scraping: 0.01 USDC
- Weather lookup: 0.001 USDC
- Image generation: 0.10 USDC
- **Total: 0.111 USDC**

Your agent spent less than 1 cent to complete a task that would take a human 30 minutes.

## Example 2: Complex Data Analysis

Your agent analyzes market trends:

```python
result = agent.run(
    """
    Analyze crypto market trends today:
    1. Get BTC, ETH, and USDC prices
    2. Check trading volumes
    3. Analyze sentiment from news
    4. Generate a summary report with charts
    """
)
```

**Cost:**
- Price feeds: 0.001 USDC × 3 = 0.003 USDC
- Volume data: 0.005 USDC
- Sentiment analysis: 0.02 USDC
- Chart generation: 0.05 USDC
- **Total: 0.078 USDC**

## Example 3: Autonomous Problem Solving

Your agent solves a programming challenge:

```python
result = agent.run(
    """
    Write a Python function that:
    - Takes a list of numbers
    - Removes duplicates while preserving order
    - Returns the deduplicated list

    Execute the code and test it with [1, 2, 2, 3, 1, 4].
    """
)

# Output:
# def remove_duplicates(lst):
#     seen = set()
#     result = []
#     for item in lst:
#         if item not in seen:
#             seen.add(item)
#             result.append(item)
#     return result
#
# Test result: [1, 2, 3, 4]
# ✓ Success
```

**Cost:** 0.05 USDC for code execution

## Budget Controls

Set spending limits to prevent runaway costs:

```python
agent = X402Agent(
    model="gpt-4",
    max_budget_usdc=5.0,
    max_per_call_usdc=0.50,  # No single call costs > $0.50
    budget_callback=on_budget_exceeded  # Callback when budget is low
)

def on_budget_exceeded():
    """Called when remaining budget is low"""
    print("Budget running low! Switching to cheaper APIs...")
```

When the agent runs out of budget:
- It switches to free alternatives
- It batches requests (fewer API calls)
- It escalates to a human for approval
- You can refill the wallet programmatically

## Full Working Example

Here's a complete agent that generates social media posts with images:

```python
from langchain.agents import initialize_agent, AgentType
from langchain.llms import OpenAI
from langchain.memory import ConversationBufferMemory
from x402_langchain import X402Agent

# Set up the agent
agent = X402Agent(
    model="gpt-4",
    max_budget_usdc=2.0,
    chain_id="base"
)

# Add tools
agent.add_tool("generate_image", "Create images from text prompts")
agent.add_tool("web_search", "Search the internet for topics")
agent.add_tool("sentiment_analysis", "Analyze emotion in text")

# Use it
task = """
Create a social media post for a tech startup launching tomorrow.
1. Research the startup's mission
2. Generate a professional image for the post
3. Write a compelling 280-character post
4. Check if the tone is appropriate
"""

result = agent.run(task)

print(f"Generated post:\n{result['post']}")
print(f"Image URL: {result['image_url']}")
print(f"Total spent: {result['cost_usdc']} USDC")
```

## Advanced: Custom Tools

Add your own paid tools to the marketplace:

```python
from x402_langchain import register_x402_tool

@register_x402_tool(
    name="my-custom-api",
    price_usdc=0.25,
    description="Analyze sentiment with state-of-the-art model"
)
async def analyze_sentiment(text: str) -> dict:
    """Your custom sentiment analysis"""
    return {
        "sentiment": "positive",
        "confidence": 0.95,
        "emotion": "excited"
    }

# Agents can now use your tool
agent.run("Analyze the sentiment of this: 'I love x402 Bazaar!'")
```

## Monitoring Agent Spending

Track what your agent spends:

```python
# Get spending breakdown
spending = agent.get_spending_report()

print(f"Total spent: {spending['total_usdc']} USDC")
print(f"Breakdown:")
for tool, cost in spending['by_tool'].items():
    print(f"  {tool}: {cost} USDC")

# Output:
# Total spent: 1.234 USDC
# Breakdown:
#   generate_image: 0.700 USDC
#   weather_api: 0.004 USDC
#   web_scraping: 0.530 USDC
```

## Real-World Use Cases

### 1. Content Creators
An agent that researches trends, generates images, writes articles, and posts to social media. Budget: $1-2/month. Revenue: $100+/month.

### 2. Research Assistants
An agent that gathers data from multiple paid APIs, analyzes it, and generates reports. Budget: $5/month. Replaces hiring a researcher.

### 3. E-Commerce Automation
An agent that monitors competitor prices, scrapes listings, generates product descriptions, and creates listings. Budget: $10/month. Manages 1000+ products.

### 4. Code Review
An agent that analyzes code, runs tests, checks security, and reports issues. Budget: $20/month. Reduces manual review time by 80%.

## Pricing Overview

x402 Bazaar APIs range from dirt-cheap to premium:

| API | Price | Use Case |
|-----|-------|----------|
| Weather lookup | 0.001 USDC | Real-time data |
| Email validation | 0.001 USDC | Data cleaning |
| Web scraping | 0.01 USDC | Market research |
| Sentiment analysis | 0.02 USDC | Content moderation |
| Code execution | 0.05 USDC | Task automation |
| Image generation | 0.10-0.50 USDC | Content creation |
| Video analysis | 0.25 USDC | Complex processing |

An agent with a $5 monthly budget can make thousands of API calls.

## Comparison: With vs Without x402

**Without x402:**
- Agent uses free tier APIs only
- Poor accuracy, limited data
- Can't handle edge cases
- Costs developer hours to debug

**With x402:**
- Agent chooses best API for the job
- High accuracy, real-time data
- Handles 99% of cases autonomously
- Minimal developer oversight

## Get Started

```bash
# Install the package
pip install x402-langchain

# Clone a template
git clone https://github.com/Wintyx57/x402-langchain-examples

# Run an example
python examples/image_generator_agent.py

# View your spending
python examples/check_spending.py
```

## Documentation & Examples

- **Full API docs:** [/docs/langchain](/docs/langchain)
- **Code examples:** [github.com/Wintyx57/x402-langchain-examples](https://github.com/Wintyx57/x402-langchain-examples)
- **Community:** [/community](/community)
- **Support:** x402bazaar@gmail.com

Your LangChain agent shouldn't be limited by free APIs. Give it a budget. Let it pay. Watch what it can accomplish.

The future is autonomous agents with autonomous payments.
