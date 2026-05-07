import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/register',
        formData
      );

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      alert('Registered successfully!');
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.grid} />

      <main style={styles.main}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h1 style={styles.title}>Create account</h1>
            <p style={styles.subtitle}>Join Debuggr.</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>USERNAME</label>

              <input
                type="text"
                name="username"
                placeholder="yourname"
                value={formData.username}
                onChange={handleChange}
                onFocus={() => setFocused('username')}
                onBlur={() => setFocused(null)}
                required
                style={{
                  ...styles.input,
                  borderColor:
                    focused === 'username' ? '#22c55e' : '#1a1a1a',
                  boxShadow:
                    focused === 'username'
                      ? '0 0 0 1px #22c55e'
                      : 'none',
                }}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>EMAIL</label>

              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                required
                style={{
                  ...styles.input,
                  borderColor:
                    focused === 'email' ? '#22c55e' : '#1a1a1a',
                  boxShadow:
                    focused === 'email'
                      ? '0 0 0 1px #22c55e'
                      : 'none',
                }}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>PASSWORD</label>

              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                required
                style={{
                  ...styles.input,
                  borderColor:
                    focused === 'password' ? '#22c55e' : '#1a1a1a',
                  boxShadow:
                    focused === 'password'
                      ? '0 0 0 1px #22c55e'
                      : 'none',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!loading)
                  e.currentTarget.style.backgroundColor = '#1aa344';
              }}
              onMouseLeave={(e) => {
                if (!loading)
                  e.currentTarget.style.backgroundColor = '#22c55e';
              }}
            >
              {loading ? 'Creating...' : 'Register →'}
            </button>
          </form>

          <p style={styles.registerText}>
            Already have an account?{' '}
            <span
              style={styles.registerLink}
              onClick={() => navigate('/login')}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = '#22c55e')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = '#555')
              }
            >
              Login
            </span>
          </p>
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#000',
    color: '#fff',
    fontFamily: "'Inter', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },

  main: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
    padding: '24px',
  },

  card: {
    width: '100%',
    maxWidth: '380px',
    background: '#0a0a0a',
    border: '1px solid #1a1a1a',
    borderRadius: '6px',
    padding: '36px 32px',
  },

  cardHeader: {
    marginBottom: '28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },

  title: {
    fontSize: '1.8rem',
    fontWeight: '900',
    letterSpacing: '-0.02em',
    marginBottom: '6px',
    lineHeight: 1.1,
  },

  subtitle: {
    fontSize: '0.8rem',
    color: '#444',
    letterSpacing: '0.03em',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },

  label: {
    fontSize: '0.65rem',
    letterSpacing: '0.2em',
    color: '#555',
  },

  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '0.85rem',
    fontFamily: "'Inter', sans-serif",
    background: '#111',
    color: '#fff',
    border: '1px solid #1a1a1a',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    boxSizing: 'border-box',
  },

  submitButton: {
    marginTop: '8px',
    width: '100%',
    padding: '11px',
    fontSize: '0.85rem',
    letterSpacing: '0.08em',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 'bold',
    backgroundColor: '#22c55e',
    color: '#000',
    border: 'none',
    borderRadius: '4px',
    transition: 'background-color 0.15s ease',
  },

  registerText: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '0.75rem',
    color: '#444',
    letterSpacing: '0.05em',
  },

  registerLink: {
    color: '#555',
    cursor: 'pointer',
    transition: 'color 0.15s ease',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
  },
};

export default Register;