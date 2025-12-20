# PACE - Personal Assistance Center

PACE is a futuristic, personalized dashboard designed to streamline your daily workflow. It combines task management, note-taking, and AI assistance into a single, cohesive interface featuring a modern "Bento Grid" layout and glassmorphism aesthetics.

## 🚀 Features

- **Bento Grid Layout:** A responsive and organized dashboard view.
- **AI Assistant:** Integrated with Google's Gemini AI for intelligent assistance.
- **Task Management:** Keep track of your daily to-dos.
- **Rich Text Notes:** A powerful note-taking editor powered by Tiptap.
- **3D Visuals:** Immersive background elements using Three.js.
- **Modern UI:** Built with Tailwind CSS, featuring glassmorphism and smooth animations.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Editor:** [Tiptap](https://tiptap.dev/)
- **3D Graphics:** [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- **AI:** [Google Gemini API](https://ai.google.dev/)
- **Backend/Auth:** [Supabase](https://supabase.com/)

## 🏁 Getting Started

Follow these steps to run the project locally.

### Prerequisites

- Node.js installed on your machine.
- A Google Gemini API Key.
- A Supabase project (URL and Anon Key).

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/AnthonyS051105/PACE-PersonalAssistanceCenter.git
    cd pace-project
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**

    Create a `.env.local` file in the root directory and add the following keys:

    ```env
    GEMINI_API_KEY=your_gemini_api_key
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

5.  **Open the app:**

    Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
