export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="bg-slate-900/80 rounded-3xl shadow-xl p-10 max-w-lg w-full text-center border border-cyan-700">
        <div className="flex justify-center mb-6">
          <svg
            className="w-16 h-16 text-cyan-400 animate-bounce"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Thank You for Downloading!
        </h1>
        <p className="text-lg text-slate-300 mb-6">
          Your download should start automatically in a few seconds.
          <br />
          If it doesn't,{" "}
          <a
            href="https://wayfinder-api.charlseempire.tech/downloads/wayfinder.apk"
            className="text-cyan-400 underline"
          >
            click here
          </a>
          .
        </p>
        <div className="flex justify-center">
          <svg
            className="w-10 h-10 text-cyan-400 animate-spin"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  );
}
