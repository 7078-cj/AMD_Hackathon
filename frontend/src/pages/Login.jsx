import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import AuthContext from '../context/AuthContext'

function Login() {
  const { loginUser, loginError } = useContext(AuthContext)

  return (
    <div className="flex min-h-screen bg-[#0A1418]">
      {/* Left panel — brand / route visual, hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-[#23414D]">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(#2CB1A3 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(160deg, rgba(14,76,107,0.35) 0%, rgba(10,20,24,0) 55%)',
          }}
        />

        {/* route thread motif */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 600 800"
          preserveAspectRatio="none"
        >
          <path
            d="M 80 700 C 200 600, 150 480, 280 420 C 400 365, 380 260, 500 150"
            fill="none"
            stroke="#2CB1A3"
            strokeWidth="2"
            strokeDasharray="6 8"
            opacity="0.6"
          />
          <circle cx="80" cy="700" r="5" fill="#2CB1A3" />
          <circle cx="280" cy="420" r="5" fill="#2CB1A3" />
          <circle cx="500" cy="150" r="6" fill="#2CB1A3" />
        </svg>

        <div className="relative z-10 flex flex-col justify-between p-12">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2CB1A3]" />
            <span className="font-mono text-xs tracking-[0.2em] text-[#8CA7AC] uppercase">
              Aitinary
            </span>
          </div>

          <div>
            <h1 className="text-4xl font-semibold text-[#E8F1F2] leading-tight max-w-sm">
              Plan the route.
              <br />
              Skip the guesswork.
            </h1>
            <p className="mt-4 text-[#8CA7AC] max-w-sm">
              AI-generated itineraries, geocoded and routed automatically —
              hotels, meals, and stops mapped to a single trip.
            </p>
          </div>

          <p className="font-mono text-xs text-[#4E6B72]">AMD HACKATHON</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 justify-center items-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2CB1A3]" />
            <span className="font-mono text-xs tracking-[0.2em] text-[#8CA7AC] uppercase">
              Aitinary
            </span>
          </div>

          <h2 className="text-2xl font-semibold text-[#E8F1F2]">Sign in</h2>
          <p className="mt-1 text-sm text-[#8CA7AC]">
            Continue planning your route
          </p>

          <form onSubmit={loginUser} className="mt-8 flex flex-col space-y-5">
            <label className="flex flex-col text-sm font-medium text-[#8CA7AC]">
              Username
              <input
                type="text"
                name="username"
                className="mt-1.5 px-3 py-2.5 bg-[#11202A] border border-[#23414D] rounded-md outline-none text-[#E8F1F2] focus:border-[#2CB1A3] transition"
              />
            </label>

            <label className="flex flex-col text-sm font-medium text-[#8CA7AC]">
              Password
              <input
                type="password"
                name="password"
                className="mt-1.5 px-3 py-2.5 bg-[#11202A] border border-[#23414D] rounded-md outline-none text-[#E8F1F2] focus:border-[#2CB1A3] transition"
              />
            </label>

            <button
              type="submit"
              className="w-full py-2.5 mt-2 bg-[#2CB1A3] hover:bg-[#25998D] active:bg-[#1F857A] rounded-md text-[#0A1418] font-semibold transition"
            >
              Sign in
            </button>
          </form>

          {loginError ? (
            <p className="mt-3 text-sm text-rose-400">{loginError}</p>
          ) : null}

          <p className="mt-6 text-sm text-[#8CA7AC]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#2CB1A3] hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login