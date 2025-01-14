import { getTranscript } from "youtube-transcript";

interface VideoDetails {
  title: string;
  description: string;
  transcript: string;
}

export async function getVideoId(url: string): Promise<string> {
  const regex =
    /(?:youtube\.com\/(?:[^\/\n\s]+\/\s*(?:\w*\/)*|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  if (!match) throw new Error("Invalid YouTube URL");
  return match[1];
}

// Step 1: Fetch YouTube video details
export async function fetchVideoDetails(
  videoId: string
): Promise<VideoDetails> {
  const youtubeApiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  if (!youtubeApiKey) {
    throw new Error("YouTube API key is not configured");
  }

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${youtubeApiKey}`
  );

  if (!response.ok) throw new Error("Failed to fetch video details");
  const data = await response.json();
  if (!data.items?.length) throw new Error("Video not found");

  // Step 2: Get transcript
  let transcript = "";
  try {
    const transcriptResponse = await getTranscript(videoId);
    transcript = transcriptResponse.map((item) => item.text).join("\n");
  } catch (error) {
    console.warn("Failed to fetch transcript:", error);
    transcript = "Transcript not available for this video.";
  }

  return {
    title: data.items[0].snippet.title,
    description: data.items[0].snippet.description,
    transcript,
  };
}

// Step 3: Extract GitHub links from description
export function extractGithubLinks(description: string): string[] {
  const githubRegex = /https:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-_.]+/g;
  return description.match(githubRegex) || [];
}

// Step 4: Generate tutorial using LLM
export async function generateTutorial(
  videoDetails: VideoDetails,
  githubLinks: string[]
): Promise<string> {
  const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new Error("Gemini API key is not configured");
  }

  const prompt = `
    You are a professional technical writer creating a high-quality Medium blog post. 
    Create a comprehensive, visually engaging tutorial that explains concepts thoroughly with diagrams, code examples, and clear explanations.
    
    VIDEO DETAILS:
    Title: ${videoDetails.title}
    Description: ${videoDetails.description}
    Transcript: ${videoDetails.transcript}
    ${
      githubLinks.length > 0
        ? `\nGitHub Repositories: ${githubLinks.join("\n")}`
        : ""
    }

    Create a tutorial following these specific requirements:

    1. Title and Introduction:
       - Create a catchy, SEO-friendly title
       - Write a compelling subtitle
       - Add a cover image or diagram representing the concept
       - Include estimated reading time and difficulty level
       - Start with a real-world problem statement
       - Explain what readers will build/learn
       
    2. Prerequisites and Setup:
       - List required tools with exact versions
       - Include environment setup commands
       - Show directory structure
       - Provide quick setup script if applicable
       
    3. Concept Visualization:
       Create Mermaid diagrams for:
       - Architecture overview
       - Data flow
       - Component relationships
       - Step-by-step process flow
       Example Mermaid diagram:
       \`\`\`mermaid
       graph TD
         A[Start] --> B{Process}
         B --> C[Result]
       \`\`\`

    4. Step-by-Step Implementation:
       For each major step:
       - Clear step title and objective
       - Concept explanation with diagrams
       - Complete code snippet with filename
       - Line-by-line code explanation
       - Expected output or result
       - Common errors and solutions
       - Testing instructions
       
    5. Code Snippets Format:
       \`\`\`language:filename.ext
       // Purpose: Brief description
       // Dependencies: List any dependencies
       
       // Step 1: Description
       code here...
       
       // Step 2: Description
       code here...
       
       // Expected Output:
       // output here...
       \`\`\`
       
    6. Visual Learning Aids:
       - Add screenshots for UI elements
       - Include console output examples
       - Show before/after comparisons
       - Add warning and info boxes
       - Use emojis for visual breaks
       
    7. Best Practices and Tips:
       - Industry standard approaches
       - Performance optimization tips
       - Security considerations
       - Debugging strategies
       - Common pitfalls to avoid
       
    8. Interactive Elements:
       - Add checkboxes for progress tracking
       - Include expandable sections for details
       - Provide troubleshooting decision trees
       - Add copy-to-clipboard code blocks
       
    9. Conclusion and Next Steps:
       - Summarize key learnings
       - Suggest advanced topics
       - Provide resource links
       - Include practice exercises
       - Add call to action

    Markdown Formatting:
    1. Use proper heading hierarchy (#, ##, ###)
    2. Format code blocks with language and filename
    3. Use blockquotes for important notes
    4. Include horizontal rules for sections
    5. Use bold and italic for emphasis
    6. Create tables for comparing options
    7. Use numbered lists for steps
    8. Add anchors for table of contents

    Special Instructions:
    1. Include at least one diagram per major concept
    2. Provide complete, working code examples
    3. Add inline comments in code
    4. Include error handling
    5. Show expected output
    6. Add testing instructions
    7. Include performance tips
    8. Reference GitHub code when available

    Format everything in proper Markdown with clear section breaks and visual hierarchy.
    Focus on making complex concepts easy to understand through examples and visualizations.
    Ensure all code snippets are complete and functional.
  `;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 4096,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Gemini API Error: ${errorData.error?.message || "Unknown error"}`
    );
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}
