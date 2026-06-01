# Test Framework Template Integration

A dual-judge test framework that combines deterministic verification with LLM-powered semantic analysis.

## Repository

https://github.com/dogkeeper886/test-framework-template

## Overview

The test framework addresses a critical testing gap: traditional tests rely solely on exit codes, which miss subtle failures where processes complete "successfully" but produce incorrect results.

**Dual-Judge System:**
- **Simple Judge**: Fast, deterministic checks (exit codes, patterns, error detection)
- **LLM Judge**: Semantic analysis using Ollama to understand if output meets criteria

Both judges must pass for a test to pass.

## Installation

### Install to Your Project

    # Clone the template
    git clone https://github.com/dogkeeper886/test-framework-template
    
    # Install to your project
    cd test-framework-template
    make install TARGET=/path/to/your/project NAME=your-project
    
    # Setup dependencies
    cd /path/to/your/project/cicd/tests
    npm install

### Directory Structure After Installation

    your-project/
      cicd/
        tests/
          src/           # Framework source code
          testcases/     # Your YAML test definitions
            build/
            integration/
            e2e/
          package.json
        scripts/
        results/
      .github/workflows/
        test-pipeline.yml
        test-suite.yml

## Configuration

Edit cicd/tests/src/config.ts:

    export const CONFIG = {
      projectName: "your-project",
      
      llm: {
        defaultUrl: "http://localhost:11434",  // Ollama URL
        defaultModel: "llama3:8b",             // LLM model
        batchSize: 5,
        timeout: 300000,
      },
    };

## Writing Test Cases

### YAML Schema

    id: TC-BUILD-001
    name: Project Build Verification
    suite: build
    priority: 1
    timeout: 120000
    dependencies: []
    
    steps:
      - name: Step name
        command: shell command
        timeout: 60000
        expectPatterns:
          - "pattern that must appear"
        rejectPatterns:
          - "pattern that must not appear"
    
    criteria: |
      Human-readable criteria for LLM evaluation

### Field Reference

| Field | Required | Description |
|-------|----------|-------------|
| id | Yes | Unique test ID (e.g., TC-BUILD-001) |
| name | Yes | Human-readable test name |
| suite | Yes | Test suite: build, integration, e2e |
| priority | No | Execution order (default: 1) |
| timeout | No | Test timeout in ms (default: 60000) |
| dependencies | No | Test IDs that must pass first |
| steps | Yes | Array of test steps |
| criteria | No | LLM evaluation criteria |

### Step Fields

| Field | Required | Description |
|-------|----------|-------------|
| name | Yes | Step name |
| command | Yes | Shell command to execute |
| timeout | No | Step timeout (overrides test timeout) |
| expectPatterns | No | Regex patterns that MUST appear |
| rejectPatterns | No | Regex patterns that must NOT appear |

## Running Tests

### Command Line Options

    # Run all tests
    npm test
    
    # Run without LLM judge (faster)
    npm test -- --no-llm
    
    # Run specific suite
    npm test -- --suite build
    npm test -- --suite integration
    npm test -- --suite e2e
    
    # Run specific test
    npm test -- --id TC-BUILD-001
    
    # Preview what would run
    npm test -- --dry-run
    
    # Output as JSON
    npm test -- --format json
    
    # Override Ollama settings
    npm test -- --judge-url http://host:11434 --judge-model gemma3:12b

### List Available Tests

    npm run list
    npm run list -- --suite build

## CI/CD Integration

### GitHub Actions Workflows

**test-pipeline.yml** - Full pipeline with stages:

    build -> integration -> e2e

**test-suite.yml** - Individual suite runner:

    inputs:
      suite: build | integration | e2e | all
      judge_mode: simple | dual
      judge_model: llama3:8b

### Workflow Dispatch

    gh workflow run test-pipeline.yml
    gh workflow run test-suite.yml -f suite=build -f judge_mode=simple

## Output and Reporting

### JSON Output Structure

    {
      "summary": {
        "runId": "2025-01-05T12:00:00.000Z",
        "suite": "build",
        "total": 5,
        "passed": 4,
        "failed": 1,
        "simple": { "passed": 5, "failed": 0 },
        "llm": { "passed": 4, "failed": 1 }
      },
      "results": [...]
    }

### Result Files

    cicd/results/2025-01-05T12-00-00_build/
      summary.json
      TC-BUILD-001.json
      TC-BUILD-002.json
      session.log

## Integration with TestLink

### Mapping TestLink to YAML

| TestLink | YAML |
|----------|------|
| Test Case ID | id |
| Test Case Name | name |
| Test Suite | suite |
| Priority | priority |
| Preconditions | dependencies |
| Test Steps | steps |
| Expected Results | criteria + expectPatterns |

### Workflow

1. Create test case in TestLink: /create-test-case
2. Create YAML file with matching ID
3. Run tests: npm test
4. Report results: /create-test-execution

## Troubleshooting

### LLM Judge Not Available

    [WARN] LLM judge not available, using simple judge results

Solution: Ensure Ollama is running at the configured URL.

### Test Timeout

    [TIMEOUT] Command killed after 60s

Solution: Increase timeout in YAML or config.ts.

### Pattern Not Found

    Missing expected patterns: pattern1, pattern2

Solution: Check command output and adjust patterns.

## Related Resources

- [Test Lifecycle Workflow](../workflows/test-lifecycle.md)
- [MCP TestLink Integration](./mcp-testlink.md)
- [Ollama](https://ollama.ai/) - Local LLM for semantic judging
