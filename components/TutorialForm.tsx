"use client";

import { useState, useEffect } from "react";
import {
  getVideoId,
  fetchVideoDetails,
  extractGithubLinks,
  generateTutorial,
} from "@/utils/tutorial";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import mermaid from "mermaid";
import type { ReactMarkdownOptions } from "react-markdown/lib/react-markdown";
import type { SyntaxHighlighterProps } from "react-syntax-highlighter";

// Initialize mermaid
if (typeof window !== "undefined") {
  mermaid.initialize({
    startOnLoad: true,
    theme: "dark",
    securityLevel: "loose",
    fontFamily: "var(--font-geist-sans)",
  });
}

const codeStyle: SyntaxHighlighterProps["customStyle"] = {
  margin: "1em 0",
  borderRadius: "0.5rem",
  padding: "1em",
};

export default function TutorialForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tutorial, setTutorial] = useState("");

  useEffect(() => {
    if (tutorial) {
      try {
        mermaid.contentLoaded();
      } catch (e) {
        console.warn("Mermaid initialization error:", e);
      }
    }
  }, [tutorial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const videoId = await getVideoId(url);
      const videoDetails = await fetchVideoDetails(videoId);
      const githubLinks = extractGithubLinks(videoDetails.description);
      const generatedTutorial = await generateTutorial(
        videoDetails,
        githubLinks
      );
      setTutorial(generatedTutorial);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const markdownComponents: ReactMarkdownOptions["components"] = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      const hasMermaid = className?.includes("mermaid");

      if (hasMermaid) {
        return (
          <div className="mermaid overflow-x-auto">
            {String(children).replace(/\n$/, "")}
          </div>
        );
      }

      return !inline && match ? (
        <div className="relative group">
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
            showLineNumbers
            wrapLines
            wrapLongLines
            customStyle={{
              margin: "1em 0",
              borderRadius: "0.5rem",
              padding: "1em",
              backgroundColor: "#1E1E1E",
            }}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
          <button
            onClick={() => {
              navigator.clipboard.writeText(String(children));
            }}
            className="absolute top-2 right-2 p-2 bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            title="Copy code"
          >
            📋
          </button>
        </div>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    img({ src, alt, ...props }) {
      return (
        <img
          src={src}
          alt={alt}
          className="rounded-lg shadow-md"
          loading="lazy"
          {...props}
        />
      );
    },
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube URL here..."
            className="w-full p-4 bg-surface dark:bg-surface-mixed border border-border 
                     rounded-lg text-foreground placeholder:text-muted
                     focus:ring-2 focus:ring-accent focus:border-accent outline-none 
                     transition duration-200"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-accent hover:bg-accent-dark text-white 
                   font-medium rounded-lg transition duration-200 
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </span>
          ) : (
            "Generate Tutorial"
          )}
        </button>
      </form>

      {error && (
        <div
          className="p-4 bg-red-50/50 dark:bg-red-900/20 border border-red-200 
                      dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg"
        >
          {error}
        </div>
      )}

      {tutorial && (
        <div className="prose prose-lg prose-custom max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={markdownComponents}
          >
            {tutorial}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
