import { getTranscript } from "youtube-transcript";
import { track } from "@vercel/analytics";

interface VideoDetails {
  title: string;
  description: string;
  transcript: string;
}

interface TutorialSection {
  title: string;
  content: string;
  completed: boolean;
  subsections?: string[];
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

// Add this function to split prompt into sections
function createSectionPrompt(
  videoDetails: VideoDetails,
  githubLinks: string[],
  section: TutorialSection,
  previousContent?: string
): string {
  const isImplementationSection = section.title === "Implementation Guide";

  return `
    Generate an extremely detailed technical tutorial section.
    
    VIDEO DETAILS:
    Title: ${videoDetails.title}
    Description: ${videoDetails.description}
    Transcript: ${videoDetails.transcript}
    ${
      githubLinks.length > 0
        ? `\nGitHub Repositories: ${githubLinks.join("\n")}`
        : ""
    }

    ${
      isImplementationSection
        ? `This is the main implementation section. Cover ALL code changes and steps shown in the video.
           Break down the implementation into these subsections:
           ${section.subsections?.join("\n")}
           
           For each file change:
           - Show the complete file path
           - Explain what changes are being made and why
           - Include the relevant code snippets
           - Add any necessary configuration`
        : `Current section to generate: ${section.title}`
    }

    ${
      previousContent
        ? "\nPrevious content summary:\n" + previousContent.slice(-500)
        : ""
    }

    CRITICAL REQUIREMENTS:
    1. Document EVERY detail from the video for this section
    2. Include ALL terminal commands and their output
    3. Show ALL file changes with complete paths
    4. Explain EVERY step thoroughly
    5. Add relevant diagrams and visual aids

    FORMAT REQUIREMENTS:
    1. Use clean Markdown with proper hierarchy
    2. Format code blocks with language and filename:
       \`\`\`language:path/to/file
       code here
       \`\`\`
    3. Use blockquotes for important notes
    4. Add warning boxes for common pitfalls

    Note: This section MUST be generated with complete details.
    Do not return SKIP_SECTION - if there's relevant content in the video, include it.
    If certain aspects aren't shown in the video, use standard best practices to fill in the gaps.
  `;
}

// Modify the main generation function
export async function generateTutorial(
  videoDetails: VideoDetails,
  githubLinks: string[]
): Promise<string> {
  const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new Error("Gemini API key is not configured");
  }

  // Dynamic section determination based on content type
  const sections: TutorialSection[] = [
    {
      title: "Introduction and Project Overview",
      content: "",
      completed: false,
    },
    {
      title: "Setup and Installation",
      content: "",
      completed: false,
    },
    {
      title: "Implementation Guide",
      content: "",
      completed: false,
      subsections: [
        "File Structure and Configuration",
        "Core Implementation Steps",
        "Code Changes and Explanations",
      ],
    },
    {
      title: "Testing and Troubleshooting",
      content: "",
      completed: false,
    },
  ];

  let fullTutorial = "";
  const totalSections = sections.length;
  const completedSections: TutorialSection[] = [];

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    // Update progress calculation to be more granular
    // Each section accounts for ~90% of progress, reserving 10% for final processing
    const sectionProgress = Math.round((i / sections.length) * 90);

    // Emit "starting section" progress
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tutorialProgress", {
          detail: {
            section: `Starting ${section.title}...`,
            progress: sectionProgress,
          },
        })
      );
    }

    const sectionPrompt = createSectionPrompt(
      videoDetails,
      githubLinks,
      section,
      fullTutorial
    );

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: sectionPrompt }],
            },
          ],
          safetySettings: [
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_ONLY_HIGH",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_ONLY_HIGH",
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
      console.error("Gemini API Error:", errorData);

      // Track API errors
      track("gemini_api_error", {
        error: errorData.error?.message || JSON.stringify(errorData),
      });

      throw new Error(
        `Gemini API Error: ${
          errorData.error?.message || JSON.stringify(errorData)
        }`
      );
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;

    // Always include the content if it's the implementation section
    if (
      section.title === "Implementation Guide" ||
      content.trim().length > 100
    ) {
      section.completed = true;
      completedSections.push(section);

      if (completedSections.length === 1) {
        fullTutorial = `# ${videoDetails.title}\n\n${content}`;
      } else {
        fullTutorial += `\n\n## ${section.title}\n\n${content}`;
      }
    }

    // After API response, update progress to show section completion
    const completedSectionProgress = Math.round(
      ((i + 0.9) / sections.length) * 90
    );
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tutorialProgress", {
          detail: {
            section: `Completed ${section.title}`,
            progress: completedSectionProgress,
          },
        })
      );
    }
  }

  // If no sections were generated, create a comprehensive single tutorial
  if (completedSections.length === 0) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tutorialProgress", {
          detail: {
            section: "Generating comprehensive tutorial...",
            progress: 90,
          },
        })
      );
    }

    const fallbackPrompt = `
      Create an extremely detailed, step-by-step tutorial that covers EVERYTHING shown in the video.
      
      Required Sections:
      1. Project Overview
         - Goals and objectives
         - Final result preview
         - Technical requirements

      2. Complete Setup Guide
         - Development environment
         - Required tools and versions
         - Configuration files
         - Environment variables

      3. Implementation Details
         - Every file change with explanations
         - All terminal commands
         - Configuration updates
         - Step-by-step instructions

      4. Code Documentation
         - Full file paths
         - Before/after code changes
         - Inline explanations
         - Best practices

      5. Visual Explanations
         - Workflow diagrams
         - Project structure
         - Process flows
         - Data flow diagrams

      6. Testing and Validation
         - Test procedures
         - Expected results
         - Error handling
         - Debugging tips

      7. Troubleshooting Guide
         - Common issues
         - Solutions
         - Prevention tips

      Format everything in clean Markdown with proper code blocks, diagrams, and visual hierarchy.
      Don't skip any detail shown in the video.

      VIDEO DETAILS:
      Title: ${videoDetails.title}
      Description: ${videoDetails.description}
      Transcript: ${videoDetails.transcript}
      ${
        githubLinks.length > 0
          ? `\nGitHub Repositories: ${githubLinks.join("\n")}`
          : ""
      }
    `;

    const fallbackResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: fallbackPrompt }],
            },
          ],
          safetySettings: [
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_ONLY_HIGH",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_ONLY_HIGH",
            },
          ],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    const fallbackData = await fallbackResponse.json();
    fullTutorial = `# ${videoDetails.title}\n\n${fallbackData.candidates[0].content.parts[0].text}`;

    // Final progress update
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tutorialProgress", {
          detail: {
            section: "Finalizing...",
            progress: 95,
          },
        })
      );
    }
  }

  // Final update to 100% only when actually returning
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("tutorialProgress", {
        detail: {
          section: "Complete!",
          progress: 100,
        },
      })
    );
  }

  return fullTutorial;
}
