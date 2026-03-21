import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col items-center text-center gap-16 px-6 pb-16">

      {/* Hero */}
      <div className="mt-[10vh] max-w-[700px]">
        <p className="text-xs uppercase tracking-widest text-[#1DB954] mb-4">Personal Journal & AI Reflection</p>
        <h1 className="text-[3.5rem] max-sm:text-4xl font-bold mb-6 leading-tight">
          Your space for{" "}
          <span className="text-[#1DB954]">honest reflection</span>.
        </h1>
        <p className="text-[#aaa] text-[1.1rem] max-sm:text-base leading-[1.8]">
          InnerLog is a personal blog where thoughts meet psychology. 
          Every entry is analyzed by AI — not to judge, but to reflect back 
          what you might not see yourself. Read, react, and leave your own mark.
        </p>

        <div className="flex gap-4 justify-center mt-8 max-sm:flex-col max-sm:items-center">
          <Link
            to="/archive"
            className="px-8 py-[0.8rem] bg-[#1DB954] text-[#121212] no-underline rounded-full font-bold text-[1rem] transition-opacity hover:opacity-85"
          >
            Read the Blog
          </Link>
          <Link
            to="/archive"
            className="px-8 py-[0.8rem] border border-[#333] text-[#f0f0f0] no-underline rounded-full font-bold text-[1rem] transition-opacity hover:opacity-70"
          >
            Explore Archive
          </Link>
        </div>
      </div>

  

      {/* How it works */}
      <div className="max-w-[900px] w-full">
        <h2 className="text-xl font-bold mb-8 text-center">How it works</h2>
        <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-4">
          <div className="p-6 bg-[#181818] rounded-[15px] border border-[#222] text-left">
            <h3 className="text-white font-semibold mb-2">A thought is written</h3>
            <p className="text-[#777] text-sm leading-relaxed">
              Every post starts with a real question or feeling — unfiltered, personal, and honest.
            </p>
          </div>
          <div className="p-6 bg-[#181818] rounded-[15px] border border-[#222] text-left">
            <h3 className="text-white font-semibold mb-2">AI reflects back</h3>
            <p className="text-[#777] text-sm leading-relaxed">
              Gemini AI reads each entry and offers a philosophical and psychological reflection — and tracks the emotional tone.
            </p>
          </div>
          <div className="p-6 bg-[#181818] rounded-[15px] border border-[#222] text-left">
            <h3 className="text-white font-semibold mb-2">You join the conversation</h3>
            <p className="text-[#777] text-sm leading-relaxed">
              Leave a comment, react, or simply read. AI evaluates each comment for relevance and depth.
            </p>
          </div>
        </div>
      </div>

      {/* Quote / CTA */}
      <div className="max-w-[600px] w-full bg-[#181818] border border-[#222] rounded-[20px] p-8 text-center">
        <p className="text-[#ccc] text-lg leading-relaxed italic mb-2">
          "Opportunity is missed by most people because it's dressed in overalls and looks like work."
        </p>
        <p className="text-[#444] text-xs mb-1">— Thomas Edison</p>
        <p className="text-[#1DB954] text-xs mb-6">And who the f*ck wants to work, right?</p>
        <Link
          to="/archive"
          className="px-6 py-3 bg-[#1DB954] text-[#121212] no-underline rounded-full font-bold text-sm transition-opacity hover:opacity-85 inline-block"
        >
          Start Reading →
        </Link>
      </div>

    </div>
  );
}