# SCI Code Reviewer

SCI Code Reviewer is a GitHub Action that leverages OpenAI's GPT-4 API to provide intelligent feedback and suggestions on
your pull requests. This powerful tool helps improve code quality and saves developers time by partially automating the code
review process. The code review process is initiated when a specific label is added to a pull request. This approach reduce the noise 
of automated code review comments but also provide the flexibility to developers to choose when to trigger the code review process. 
There are two labels that can be used to trigger the code review process:
- `ai-review`: This label is used to trigger the code review process. When this label is added to a pull request, the code review process is initiated.
- `ai-pr-desc`: This label is used to generate Pull Request description follow an predefined template.

## Features

- Reviews pull requests using OpenAI's GPT-4 API.
- Provides intelligent comments and suggestions for improving your code.
- Filters out files that match specified exclude patterns.
- Easy to set up and integrate into your GitHub workflow.
- Generate Pull Request description follow an predefined template.

## Setup

1. To use this GitHub Action, you need an OpenAI API key. If you don't have one, sign up for an API key
   at [OpenAI](https://beta.openai.com/signup).

2. Add the OpenAI API key as a GitHub Secret in your repository with the name `OPENAI_API_KEY`. You can find more
   information about GitHub Secrets [here](https://docs.github.com/en/actions/reference/encrypted-secrets).

3. Create a `.github/workflows/main.yml` file in your repository and add the following content:

```yaml
name: SCI Code Reviewer

on:
  pull_request:
    types: [ labeled ]
    branches:
       - beta
permissions: write-all
jobs:
  review:
    if: ${{ github.event.label.name == 'ai-review' || github.event.label.name == 'ai-pr-desc' }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v3

      - name: Code Reviewer
        uses: moneyforward/sci_codereview@master
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # The GITHUB_TOKEN is there by default so you just need to keep it like it is and not necessarily need to add it as secret as it will throw an error. [More Details](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#about-the-github_token-secret)
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          OPENAI_API_MODEL: "gpt-4" # Optional: defaults to "gpt-4"
          exclude: "**/*.json, **/*.md" # Optional: exclude patterns separated by commas
```

4. Customize the `exclude` input if you want to ignore certain file patterns from being reviewed.

5. Commit the changes to your repository, and AI Code Reviewer will start working on your future pull requests.

## How It Works

The SCI Code Reviewer GitHub Action retrieves the pull request diff, filters out excluded files, and sends code chunks to
the OpenAI API. It then generates review comments based on the AI's response and adds them to the pull request.
