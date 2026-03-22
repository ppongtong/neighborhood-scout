# 🏘️ Neighborhood Scout CLI

Evaluating neighborhoods with state-of-the-art AI. Built using the **Gemini @google/genai SDK**.

Neighborhood Scout is a TypeScript CLI agent designed to help users evaluate neighborhoods for moving or visiting. It leverages the official **`@google/genai`** SDK to orchestrate multi-tool grounding and context circulation server-side via the **Interactions API**.

## 🚀 Features

-   **Combined Tool Grounding**: Seamlessly integrates **Google Maps**, **Google Search**, and **Custom Functions** in a single API request.
-   **Context Circulation**: Automatic data transfer between tools. Search results and Maps data flow directly into custom logic.
-   **Interactions API**: Server-side state management using the `interactions.create` flow.

## 🛠️ Getting Started

### Prerequisites

-   Node.js (v18+)
-   A Google AI API Key (from [Google AI Studio](https://aistudio.google.com/)).

### Installation

1.  Clone the repository and install dependencies:
    ```bash
    git clone https://github.com/ppongtong/neighborhood-scout.git
    cd neighborhood-scout
    npm install
    ```

2.  Configure your environment in a `.env` file:
    ```env
    # Use your API Key from Google AI Studio
    GOOGLE_API_KEY=your-api-key-here
    ```

    > [!NOTE]
    > If you are using the Google Cloud (Vertex AI) integration instead of a standalone API key, you should use your **Project ID** (the alphanumeric name), not the Project Number.

3.  Build the project:
    ```bash
    npm run build
    ```

### Running the Agent

```bash
npm start
```

---
Built by Neighborhood Scout.
