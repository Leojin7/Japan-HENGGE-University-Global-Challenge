import type { CSSProperties, Dispatch, SetStateAction, FormEvent, ChangeEvent } from 'react';
import { useMemo, useState } from 'react';

interface CreateUserFormProps {
  setUserWasCreated: Dispatch<SetStateAction<boolean>>;
}

function CreateUserForm({ setUserWasCreated }: CreateUserFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState<{ username: boolean; password: boolean }>({
    username: false,
    password: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Read bearer token from URL query parameter `token` if present
  const bearerToken = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('token');
      return t ? `Bearer ${t}` : null;
    } catch {
      return null;
    }
  }, []);

  // Client-side password validation criteria
  const passwordCriteria = useMemo(() => {
    const unmet: string[] = [];
    if (password.length < 10) unmet.push('Password must be at least 10 characters long');
    if (password.length > 24) unmet.push('Password must be at most 24 characters long');
    if (/\s/.test(password)) unmet.push('Password cannot contain spaces');
    if (!/[0-9]/.test(password)) unmet.push('Password must contain at least one number');
    if (!/[A-Z]/.test(password)) unmet.push('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(password)) unmet.push('Password must contain at least one lowercase letter');
    return unmet;
  }, [password]);

  const isUsernameValid = username.trim().length > 0;
  const isPasswordValid = passwordCriteria.length === 0;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Reset API error on resubmit
    setApiError(null);
    setTouched({ username: true, password: true });

    // Do not submit if local validation fails
    if (!isUsernameValid || !isPasswordValid) return;

    setSubmitting(true);
    try {
      const res = await fetch(
        'https://api.challenge.hennge.com/password-validation-challenge-api/001/challenge-signup',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(bearerToken ? { Authorization: bearerToken } : {}),
          },
          body: JSON.stringify({ username, password }),
        },
      );

      if (res.ok) {
        // 200 success
        setUserWasCreated(true);
        return;
      }

      // Handle known error responses
      if (res.status === 401 || res.status === 403) {
        setApiError('Not authenticated to access this resource.');
        return;
      }

      if (res.status === 500) {
        setApiError('Something went wrong, please try again.');
        return;
      }

      // 400/422 with JSON body containing errors array
      if (res.status === 400 || res.status === 422) {
        let data: any = null;
        try {
          data = await res.json();
        } catch {
          // fallthrough to generic error below
        }
        const errors: string[] | undefined = data && Array.isArray(data.errors) ? data.errors : undefined;
        if (errors && errors.includes('not_allowed')) {
          setApiError('Sorry, the entered password is not allowed, please try a different one.');
          return;
        }
        // For other validation failures from server, surface generic message
        setApiError('Something went wrong, please try again.');
        return;
      }

      // Fallback
      setApiError('Something went wrong, please try again.');
    } catch {
      setApiError('Something went wrong, please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={formWrapper}>
      <form style={form} onSubmit={onSubmit} noValidate>
        {/* make sure the username and password are submitted */}
        {/* make sure the inputs have the accessible names of their labels */}
        <label style={formLabel} htmlFor="username-input">Username</label>
        <input
          id="username-input"
          name="username"
          type="text"
          style={formInput}
          value={username}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setUsername(e.target.value);
          }}
          onBlur={() => setTouched((t: { username: boolean; password: boolean }) => ({ ...t, username: true }))}
          aria-invalid={touched.username && !isUsernameValid ? 'true' : undefined}
        />

        <label style={formLabel} htmlFor="password-input">Password</label>
        <input
          id="password-input"
          name="password"
          type="password"
          style={formInput}
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setPassword(e.target.value);
            // Reset API error when user edits password
            if (apiError) setApiError(null);
          }}
          onBlur={() => setTouched((t: { username: boolean; password: boolean }) => ({ ...t, password: true }))}
          aria-invalid={touched.password && !isPasswordValid ? 'true' : undefined}
        />

        {/* Client-side password criteria messages */}
        {password.length > 0 && passwordCriteria.length > 0 && (
          <ul aria-live="polite" style={{ margin: '4px 0 0 16px' }}>
            {passwordCriteria.map((msg: string) => (
              <li key={msg} style={{ color: '#c00', fontSize: '14px' }}>
                {msg}
              </li>
            ))}
          </ul>
        )}

        {/* API error messages (visually separated) */}
        {apiError && (
          <div aria-live="assertive" style={{ marginTop: '8px' }}>
            <p style={{ color: '#c00', margin: 0 }}>{apiError}</p>
          </div>
        )}

        <button style={formButton} type="submit" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Create User'}
        </button>
      </form>
    </div>
  );
}

export { CreateUserForm };

const formWrapper: CSSProperties = {
  maxWidth: '500px',
  width: '80%',
  backgroundColor: '#efeef5',
  padding: '24px',
  borderRadius: '8px',
};

const form: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const formLabel: CSSProperties = {
  fontWeight: 700,
};

const formInput: CSSProperties = {
  outline: 'none',
  padding: '8px 16px',
  height: '40px',
  fontSize: '14px',
  backgroundColor: '#f8f7fa',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  borderRadius: '4px',
};

const formButton: CSSProperties = {
  outline: 'none',
  borderRadius: '4px',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  backgroundColor: '#7135d2',
  color: 'white',
  fontSize: '16px',
  fontWeight: 500,
  height: '40px',
  padding: '0 8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '8px',
  alignSelf: 'flex-end',
  cursor: 'pointer',
};
