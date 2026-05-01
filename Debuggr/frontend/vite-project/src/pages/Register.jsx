import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = (data) => {
    setLoading(true);
    setError('');
    
    // MOCK BACKEND (2 sec delay)
    setTimeout(() => {
      console.log('Register:', data); // Remove later
      
      // Fake success (Manager role!)
      const fakeUser = {
        id: '1',
        name: data.name,
        email: data.email,
        role: 'manager' // First user = manager 🎉
      };
      
      localStorage.setItem('user', JSON.stringify(fakeUser));
      reset();
      navigate('/dashboard');
      setLoading(false);
    }, 2000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>First user becomes Manager 👑</p>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Full Name"
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && <p style={styles.errorText}>Name is required</p>}
          
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            {...register('email', { 
              required: 'Email required',
              pattern: { 
                value: /^\S+@\S+$/i, 
                message: 'Invalid email' 
              }
            })}
          />
          {errors.email && <p style={styles.errorText}>{errors.email.message}</p>}
          
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            {...register('password', { 
              required: 'Password required',
              minLength: { value: 6, message: 'Min 6 characters' }
            })}
          />
          {errors.password && <p style={styles.errorText}>{errors.password.message}</p>}
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '⏳ Creating...' : '🚀 Create Account'}
          </button>
        </form>
        
        <p style={styles.link}>
          Already have account? <Link to="/login" style={styles.linkText}>Login</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    padding: 20,
  },
  card: {
    background: 'white',
    padding: 40,
    borderRadius: 16,
    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: '2.5rem',
    margin: 0,
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 30,
    fontSize: '1.1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  input: {
    padding: '16px 20px',
    border: '2px solid #e2e8f0',
    borderRadius: 12,
    fontSize: 16,
    transition: 'border-color 0.2s',
    outline: 'none',
  },
  button: {
    padding: '16px',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  error: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    border: '1px solid #fecaca',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    margin: '4px 0 0 0',
  },
  link: {
    textAlign: 'center',
    marginTop: 24,
    color: '#64748b',
  },
  linkText: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: 500,
  },
};

export default Register;