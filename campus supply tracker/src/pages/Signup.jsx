import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext.jsx'

const BACKGROUND_IMAGE = '/login-bg.jpg'

function Signup() {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [showPassword, setShowPassword] =
    useState(false)

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    signup,
    signupWithGoogle,
  } = useAdmin()

  const navigate = useNavigate()

  function navigateByRole(role) {
    if (role === 'Superadmin') {
      navigate('/superadmin')
    } else {
      navigate('/inventory')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    setError('')

    if (
      !name.trim() ||
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError(
        'Please fill in all required fields.'
      )
      return
    }

    if (password.length < 6) {
      setError(
        'Password must be at least 6 characters.'
      )
      return
    }

    if (password !== confirmPassword) {
      setError(
        'Passwords do not match.'
      )
      return
    }

    setLoading(true)

    const result = await signup(
      name.trim(),
      username.trim(),
      email.trim(),
      password
    )

    setLoading(false)

    if (!result || !result.success) {
      setError(
        result?.error ||
          'Sign up failed. Please try again.'
      )
      return
    }

    navigateByRole(result.role)
  }

  async function handleGoogleSignup() {
    setError('')
    setLoading(true)

    const result =
      await signupWithGoogle()

    setLoading(false)

    if (!result || !result.success) {
      setError(
        result?.error ||
          'Google sign-up failed. Please try again.'
      )
      return
    }

    navigateByRole(result.role)
  }

  return (
    <div
      className="d-flex flex-column flex-lg-row justify-content-center align-items-center p-3"
      style={{
        minHeight: '100vh',
        backgroundColor: '#04121f',
        backgroundImage: `radial-gradient(circle at 15% 20%, rgba(13, 202, 240, 0.35) 0%, rgba(13, 202, 240, 0) 45%), linear-gradient(200deg, rgba(4, 18, 31, 0.92) 0%, rgba(11, 94, 120, 0.70) 50%, rgba(25, 135, 84, 0.75) 100%), url(${BACKGROUND_IMAGE})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
     
      <div
        className="signup-rise p-3 mb-4 mb-lg-0 me-lg-4 text-center text-lg-start"
        style={{ maxWidth: '400px' }}
      >
        <h1 className="fw-bold fs-3 text-white mb-2">
          Campus Supply Tracker
        </h1>

        <p className="text-info small mb-3">
          School Supplies & Inventory Management
        </p>

        <figure className="mb-3">
          <blockquote className="blockquote fs-6 fst-italic text-white">
            "Organization is not about being perfect, it is about having what you need when you need it."
          </blockquote>

          <figcaption className="blockquote-footer text-white-50 mb-0">
            Inventory Wisdom
          </figcaption>
        </figure>

        <figure className="mb-0">
          <blockquote className="blockquote fs-6 fst-italic text-white">
            "A well-managed supply room keeps every classroom learning without interruption."
          </blockquote>

          <figcaption className="blockquote-footer text-white-50 mb-0">
            Resource Management
          </figcaption>
        </figure>
      </div>

      <div
        data-bs-theme="light"
        className="signup-rise-delay card mx-3 shadow-lg text-dark"
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'rgba(255, 255, 255, 0.90)',
          border: '1px solid rgba(255, 255, 255, 0.45)',
          borderRadius: '1rem',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
        }}
      >
        <div className="card-body px-4 py-3">
          <div className="text-center mb-3">
            <h2 className="fw-bold mt-2 mb-0 fs-4">
              Create an Account
            </h2>

            <p className="text-body-secondary small mt-1 mb-0">
              Register for Campus Supply Tracker
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <label className="form-label small">
                Full Name
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                disabled={loading}
              />
            </div>

            <div className="mb-2">
              <label className="form-label small">
                Username
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Choose a username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                disabled={loading}
              />
            </div>

            <div className="mb-2">
              <label className="form-label small">
                Email
              </label>

              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                disabled={loading}
              />
            </div>

            <div className="mb-2">
              <label className="form-label small">
                Password
              </label>

              <div className="input-group">
                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  className="form-control"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  disabled={loading}
                />

                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  disabled={loading}
                >
                  <i
                    className={`bi ${
                      showPassword
                        ? 'bi-eye-slash'
                        : 'bi-eye'
                    }`}
                  ></i>
                </button>
              </div>
            </div>

            <div className="mb-2">
              <label className="form-label small">
                Confirm Password
              </label>

              <div className="input-group">
                <input
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  className="form-control"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  disabled={loading}
                />

                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  disabled={loading}
                >
                  <i
                    className={`bi ${
                      showConfirmPassword
                        ? 'bi-eye-slash'
                        : 'bi-eye'
                    }`}
                  ></i>
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading
                ? 'Creating account...'
                : 'Create Account'}
            </button>
          </form>

          <div className="d-flex align-items-center my-2">
            <hr className="flex-grow-1" />

            <span className="px-2 small text-body-secondary">
              or
            </span>

            <hr className="flex-grow-1" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 48 48"
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              />

              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              />

              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              />

              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              />
            </svg>

            Sign up with Google
          </button>

          <div className="text-center mt-2">
            <span className="small text-body-secondary">
              Already have an account?
            </span>

            <button
              type="button"
              className="btn btn-link btn-sm text-success fw-semibold text-decoration-none"
              onClick={() =>
                navigate('/login')
              }
              disabled={loading}
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup