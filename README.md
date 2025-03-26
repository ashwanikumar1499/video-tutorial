# Video Tutorial Generator

Transform any YouTube coding tutorial into a comprehensive written guide with AI-powered content generation. This tool automatically creates detailed, step-by-step tutorials from YouTube videos, complete with code snippets, explanations, and best practices.

![Video Tutorial Generator Demo](public/demo.gif)

## ✨ Features

- **Automatic Tutorial Generation**: Convert YouTube videos into structured written tutorials
- **Code Snippet Extraction**: Automatically formats and highlights code from the video
- **Smart Content Organization**: Divides content into logical sections with proper hierarchy
- **Progress Tracking**: Real-time progress indication during tutorial generation
- **Syntax Highlighting**: Beautiful code formatting with VSCode-like theme
- **Copy Code Feature**: One-click code copying for all code blocks
- **Dark/Light Mode**: Automatic theme switching based on system preferences
- **Mermaid Diagram Support**: Renders technical diagrams and flowcharts
- **Analytics Integration**: Built-in Vercel Analytics for usage tracking
- **Mobile Responsive**: Fully responsive design that works on all devices

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom theme
- **AI Integration**: Google's Gemini Pro API
- **Markdown**: React-Markdown with remark-gfm
- **Syntax Highlighting**: react-syntax-highlighter
- **Diagrams**: Mermaid.js
- **Analytics**: Vercel Web Analytics
- **Fonts**: Geist Sans & Geist Mono
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- YouTube API Key
- Gemini API Key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/video-tutorial-generator.git
cd video-tutorial-generator
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

4. Run the development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📝 Usage

1. Visit the application URL
2. Paste a YouTube tutorial URL in the input field
   - A sample URL is preloaded for demonstration
3. Click "Generate Tutorial"
4. Wait for the AI to process the video and generate the tutorial
5. The generated tutorial will include:
   - Project overview
   - Setup instructions
   - Implementation details
   - Code snippets
   - Best practices
   - Troubleshooting tips

## 🔑 API Keys Setup

### YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create credentials (API key)
5. Add the API key to your `.env.local` file

### Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add the API key to your `.env.local` file

## 📊 Analytics

This project uses Vercel Analytics to track:

- Page views
- Tutorial generations
- Success/error rates
- User interactions

To view analytics:

1. Deploy to Vercel
2. Go to your project dashboard
3. Navigate to the Analytics tab

## 🎨 Customization

### Styling

- Modify `tailwind.config.ts` for theme customization
- Edit `app/globals.css` for global styles
- Update `components/TutorialForm.tsx` for component-specific styles

### Tutorial Sections

Modify `utils/tutorial.ts` to customize:

- Section organization
- Content generation prompts
- AI parameters
- Output formatting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Vercel](https://vercel.com/) for hosting and analytics
- [Google](https://ai.google.dev/) for Gemini API
- [YouTube](https://developers.google.com/youtube/v3) for video data API

## 📧 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)

Project Link: [https://github.com/yourusername/video-tutorial-generator](https://github.com/yourusername/video-tutorial-generator)
