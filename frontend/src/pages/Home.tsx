import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col items-center text-center mt-[10vh] gap-8 px-6">

      {/* Hero text */}
      <div>
        <h1 className="text-[3.5rem] max-sm:text-4xl font-bold mb-4 leading-tight">
          Your space for{" "}
          <span className="text-[#1DB954]">reflection</span>.
        </h1>
        <p className="text-[#aaa] max-w-[600px] text-[1.2rem] max-sm:text-base leading-[1.6]">
          InnerLog helps you track and organize your thoughts. Capture how you feel,
          and let our AI provide deep philosophical and psychological insights into your daily life.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 max-sm:flex-col max-sm:w-full max-sm:max-w-xs">
        <Link
          to="/write"
          className="px-8 py-[0.8rem] bg-[#1DB954] text-[#121212] no-underline rounded-full font-bold text-[1.1rem] max-sm:text-base max-sm:text-center transition-opacity hover:opacity-85"
        >
          Start Writing
        </Link>
        <Link
          to="/archive"
          className="px-8 py-[0.8rem] border border-[#333] text-[#f0f0f0] no-underline rounded-full font-bold text-[1.1rem] max-sm:text-base max-sm:text-center transition-opacity hover:opacity-70"
        >
          Explore Archive
        </Link>
      </div>

      {/* Feature cards */}
      <div className="mt-16 max-sm:mt-8 flex flex-row max-sm:flex-col gap-4 w-full max-w-[1100px] pb-10">
        <div className="p-6 bg-[#181818] rounded-[15px] border border-[#222] text-left flex-1">
          <h3 className="text-[#1DB954] font-semibold text-base mb-2">Private</h3>
          <p className="text-[#888] text-[0.9rem]">Your thoughts are secure and stored locally in your database.</p>
        </div>
        <div className="p-6 bg-[#181818] rounded-[15px] border border-[#222] text-left flex-1">
          <h3 className="text-[#1DB954] font-semibold text-base mb-2">Smart</h3>
          <p className="text-[#888] text-[0.9rem]">Powered by Gemini AI to analyze your tone and provide guidance.</p>
        </div>
        <div className="p-6 bg-[#181818] rounded-[15px] border border-[#222] text-left flex-1">
          <h3 className="text-[#1DB954] font-semibold text-base mb-2">Minimal</h3>
          <p className="text-[#888] text-[0.9rem]">Zero distractions. A clean interface focused entirely on your mind.</p>
        </div>
      </div>

    </div>
  );
}