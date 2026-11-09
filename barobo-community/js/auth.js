/* auth.js — email/password authentication using Supabase Auth */
(function (B) {
  const { $ } = B.utils;
  let client = null;
  let currentUser = null;
  let adminCheckId = 0;
  let authStateVersion = 0;
  let adminStatusUserId = null;
  let adminStatus = null;
  let adminStatusRequest = null;

  function configured() {
    const settings = B.config.supabase || {};
    return Boolean(settings.url && settings.anonKey);
  }

  function updateAccount(user) {
    const label = $('[data-auth-label]');
    const signIn = $('[data-account-action="sign-in"]');
    const signUp = $('[data-account-action="sign-up"]');
    const signOut = $('[data-account-action="sign-out"]');
    const adminLink = $('[data-admin-link]');
    if (label) label.textContent = user ? 'Signed in as ' + user.email : 'Join the Barobo Community';
    if (signIn) signIn.hidden = Boolean(user);
    if (signUp) signUp.hidden = Boolean(user);
    if (signOut) signOut.hidden = !user;
    if (adminLink && !user) adminLink.hidden = true;
  }

  function updateAdminLink(user) {
    const link = $('[data-admin-link]');
    if (!link || !user || !client) return;
    if (adminStatusUserId === user.id && adminStatus !== null) {
      link.hidden = !adminStatus;
      return;
    }
    if (adminStatusRequest && adminStatusUserId === user.id) return;

    const checkId = ++adminCheckId;
    adminStatusUserId = user.id;
    adminStatus = null;
    link.hidden = true;
    adminStatusRequest = client.rpc('is_site_admin').then(function (result) {
      if (checkId !== adminCheckId) return;
      if (result.error) {
        adminStatusUserId = null;
        B.ui.toast('Could not verify administrator access: ' + result.error.message, 'error');
        return;
      }
      adminStatus = result.data === true;
      link.hidden = !adminStatus;
    }).catch(function (error) {
      if (checkId !== adminCheckId) return;
      adminStatusUserId = null;
      B.ui.toast('Could not verify administrator access: ' + ((error && error.message) || 'Please try again.'), 'error');
    }).finally(function () {
      if (checkId === adminCheckId) adminStatusRequest = null;
    });
  }

  function scheduleAdminLinkUpdate(user) {
    window.setTimeout(function () {
      if (currentUser && user && currentUser.id === user.id) {
        updateAdminLink(currentUser);
      }
    }, 0);
  }

  function isGmailAddress(value) {
    const parts = String(value || '').trim().toLowerCase().split('@');
    return parts.length === 2 && parts[1] === 'gmail.com';
  }

  function googleIcon() {
    return '<svg class="auth-form__google-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>';
  }

  function formMarkup(mode, notice) {
    const isSignUp = mode === 'sign-up';
    const isResetPassword = mode === 'reset-password';
    return '<form class="auth-form" data-auth-form autocomplete="off">' +
      '<p class="muted small">' + (isSignUp
        ? 'Create an account with your Gmail address. Password reset links will be sent to this email.'
        : isResetPassword
          ? 'Choose a new password for your account.'
          : 'Sign in with the email address linked to your account.') + '</p>' +
      (!isResetPassword
        ? '<div class="field">' +
            '<label for="auth-email">Email address</label>' +
            '<div class="auth-form__input-wrap">' + B.icons.svg('mail') +
              '<input id="auth-email" name="email" type="email" autocomplete="off" required maxlength="254" placeholder="' + (isSignUp ? 'you@gmail.com' : 'you@example.com') + '">' +
            '</div>' +
          '</div>'
        : '') +
      (mode !== 'forgot-password'
        ? '<div class="field">' +
            '<label for="auth-password">' + (isResetPassword ? 'New password' : 'Password') + '</label>' +
            '<div class="auth-form__input-wrap">' + B.icons.svg('lock') +
              '<input id="auth-password" name="password" type="password" autocomplete="off" minlength="6" required placeholder="' + (isSignUp || isResetPassword ? 'At least 6 characters' : 'Enter your password') + '">' +
              '<button class="auth-form__password-toggle" type="button" data-password-toggle="auth-password" aria-label="Show password" aria-controls="auth-password" aria-pressed="false">' + B.icons.svg('eye') + '</button>' +
            '</div>' +
          '</div>'
        : '') +
      (isSignUp || isResetPassword
        ? '<div class="field"><label for="auth-password-confirm">' + (isResetPassword ? 'Confirm new password' : 'Confirm password') + '</label>' +
          '<div class="auth-form__input-wrap">' + B.icons.svg('lock') +
            '<input id="auth-password-confirm" name="passwordConfirm" type="password" autocomplete="new-password" minlength="6" required placeholder="Re-enter your password">' +
            '<button class="auth-form__password-toggle" type="button" data-password-toggle="auth-password-confirm" aria-label="Show password" aria-controls="auth-password-confirm" aria-pressed="false">' + B.icons.svg('eye') + '</button>' +
          '</div></div>'
        : '') +
      (!isSignUp && !isResetPassword
        ? '<p class="auth-form__forgot"><button type="button" class="auth-form__link" data-auth-forgot>Forgot password?</button></p>'
        : '') +
      '<p class="auth-form__message" data-auth-message role="status" aria-live="polite"' + (notice ? '' : ' hidden') + '>' + (notice || '') + '</p>' +
      '<button class="btn btn--primary btn--block" type="submit">' + (isSignUp ? 'Create account' : isResetPassword ? 'Update password' : 'Sign in') + '</button>' +
      (!isResetPassword
        ? '<div class="auth-form__divider"><span>or</span></div>' +
          '<button class="auth-form__google" type="button" data-google-auth>' + googleIcon() + 'Continue with Google</button>' +
          '<p class="auth-form__google-note">Use your Google account to sign in or create an account.</p>'
        : '') +
      '<p class="auth-form__switch">' +
        (isSignUp ? 'Already have an account?' : isResetPassword ? 'Remembered your password?' : 'New to the community?') +
        ' <button type="button" class="auth-form__link" data-auth-switch="' + (isSignUp || isResetPassword ? 'sign-in' : 'sign-up') + '">' +
          (isSignUp || isResetPassword ? 'Sign in' : 'Create an account') +
        '</button>' +
      '</p>' +
      (!configured()
        ? '<p class="auth-form__setup" role="note">Supabase is not configured yet. Add your project URL and anon key in <code>js/config.js</code> to enable account access.</p>'
        : '') +
    '</form>';
  }

  function setMessage(root, message, isError) {
    const element = $('[data-auth-message]', root);
    if (!element) return;
    element.textContent = message;
    element.hidden = false;
    element.classList.toggle('auth-form__message--error', Boolean(isError));
  }

  function authErrorMessage(error, fallback) {
    if (error && error.code === 'over_request_rate_limit') {
      return 'Too many sign-in requests were made. Please wait a few minutes before trying again.';
    }
    return error && error.message ? error.message : fallback;
  }

  function openForm(mode, notice, initialEmail) {
    const isSignUp = mode === 'sign-up';
    const isResetPassword = mode === 'reset-password';
    B.ui.openModal({
      title: isSignUp ? 'Create your account' : isResetPassword ? 'Reset your password' : 'Sign in',
      html: formMarkup(mode, notice),
      onMount: function (root) {
        const form = $('[data-auth-form]', root);
        const email = $('#auth-email', root);
        const password = $('#auth-password', root);
        const submit = $('button[type="submit"]', form);
        const switchButton = $('[data-auth-switch]', root);
        const forgotButton = $('[data-auth-forgot]', root);
        const googleButton = $('[data-google-auth]', root);
        if (initialEmail && email) email.value = initialEmail;

        if (googleButton) {
          googleButton.addEventListener('click', async function () {
            if (!configured()) {
              setMessage(root, 'Add your Supabase project URL and anon key in js/config.js first.', true);
              return;
            }
            if (!client) {
              setMessage(root, 'Supabase is unavailable. Check your connection and configuration, then reload the page.', true);
              return;
            }

            googleButton.disabled = true;
            googleButton.textContent = 'Connecting to Google…';
            try {
              const result = await client.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: window.location.origin + window.location.pathname
                }
              });
              if (result.error) {
                setMessage(root, authErrorMessage(result.error, 'Could not connect to Google. Please try again.'), true);
                googleButton.disabled = false;
                googleButton.innerHTML = googleIcon() + 'Continue with Google';
              }
            } catch (error) {
              setMessage(root, authErrorMessage(error, 'Could not connect to Google. Please try again.'), true);
              googleButton.disabled = false;
              googleButton.innerHTML = googleIcon() + 'Continue with Google';
            }
          });
        }

        if (forgotButton) {
          forgotButton.addEventListener('click', async function () {
            if (!email.value.trim() || !email.checkValidity()) {
              setMessage(root, 'Enter your account email address first.', true);
              email.focus();
              return;
            }
            if (!configured()) {
              setMessage(root, 'Add your Supabase project URL and anon key in js/config.js first.', true);
              return;
            }
            if (!client) {
              setMessage(root, 'Supabase is unavailable. Check your connection and configuration, then reload the page.', true);
              return;
            }

            forgotButton.disabled = true;
            forgotButton.textContent = 'Sending…';
            try {
              const result = await client.auth.resetPasswordForEmail(email.value.trim(), {
                redirectTo: window.location.origin + window.location.pathname
              });
              if (result.error) {
                setMessage(root, authErrorMessage(result.error, 'Could not send the reset email. Please try again.'), true);
              } else {
                setMessage(root, 'If an account exists for this email, a password reset link has been sent. Check your inbox.', false);
              }
            } catch (error) {
              setMessage(root, authErrorMessage(error, 'Could not send the reset email. Please try again.'), true);
            } finally {
              forgotButton.disabled = false;
              forgotButton.textContent = 'Forgot password?';
            }
          });
        }

        B.utils.$$('[data-password-toggle]', form).forEach(function (button) {
          button.addEventListener('click', function () {
            const input = $('#' + button.getAttribute('data-password-toggle'), form);
            const isVisible = input.type === 'text';
            input.type = isVisible ? 'password' : 'text';
            button.setAttribute('aria-label', isVisible ? 'Show password' : 'Hide password');
            button.setAttribute('aria-pressed', String(!isVisible));
            button.innerHTML = B.icons.svg(isVisible ? 'eye' : 'eye-off');
          });
        });

        switchButton.addEventListener('click', function () {
          openForm(switchButton.getAttribute('data-auth-switch'));
        });

        form.addEventListener('submit', async function (event) {
          event.preventDefault();
          if (!configured()) {
            setMessage(root, 'Add your Supabase project URL and anon key in js/config.js first.', true);
            return;
          }
          if (!client) {
            setMessage(root, 'Supabase is unavailable. Check your connection and configuration, then reload the page.', true);
            return;
          }

          if (isSignUp && !isGmailAddress(email.value)) {
            setMessage(root, 'Please register with a Gmail address ending in @gmail.com. Password reset links will be sent to that address.', true);
            email.focus();
            return;
          }

          if ((isSignUp || isResetPassword) && $('[name="passwordConfirm"]', form).value !== password.value) {
            setMessage(root, 'Passwords do not match.', true);
            return;
          }

          submit.disabled = true;
          submit.textContent = isSignUp ? 'Creating account…' : isResetPassword ? 'Updating password…' : 'Signing in…';
          let result;
          try {
            if (isResetPassword) {
              result = await client.auth.updateUser({ password: password.value });
            } else if (isSignUp) {
              result = await client.auth.signUp({
                email: email.value.trim(),
                password: password.value,
                options: {
                  emailRedirectTo: window.location.origin + window.location.pathname
                }
              });
            } else {
              result = await client.auth.signInWithPassword({ email: email.value.trim(), password: password.value });
            }
          } catch (error) {
            setMessage(root, authErrorMessage(error, 'The authentication request failed. Please try again.'), true);
          } finally {
            submit.disabled = false;
            submit.textContent = isSignUp ? 'Create account' : isResetPassword ? 'Update password' : 'Sign in';
          }
          if (!result) return;

          if (result.error) {
            setMessage(root, authErrorMessage(result.error, 'The authentication request failed. Please try again.'), true);
            return;
          }

          if (isResetPassword) {
            B.ui.closeModal();
            B.ui.toast('Your password has been updated.', 'success');
            return;
          }

          if (isSignUp) {
            if (result.data.session) {
              try {
                const signOutResult = await client.auth.signOut({ scope: 'local' });
                if (signOutResult.error) {
                  setMessage(root, 'Your account was created, but automatic sign-in could not be cleared: ' + signOutResult.error.message, true);
                  return;
                }
              } catch (error) {
                setMessage(root, 'Your account was created, but automatic sign-in could not be cleared: ' + ((error && error.message) || 'Please try again.'), true);
                return;
              }
            }

            openForm(
              'sign-in',
              result.data.session
                ? 'Account created. You can now sign in.'
                : 'Account created. Check your email for a confirmation link, then sign in.',
              email.value.trim()
            );
            return;
          }

          if (!result.data.session || !result.data.session.user) {
            setMessage(root, 'Sign-in did not return an active session. Check your email confirmation and try again.', true);
            return;
          }
          currentUser = result.data.session.user;
          authStateVersion += 1;
          updateAccount(currentUser);
          scheduleAdminLinkUpdate(currentUser);
          B.ui.closeModal();
          B.ui.toast('You are signed in.', 'success');
        });

        if (email) email.focus();
        else if (password) password.focus();
      }
    });
  }

  function requireSignIn() {
    if (currentUser) return true;

    B.ui.openModal({
      title: 'Sign in required',
      html: '<div class="auth-required">' +
        '<p>Please sign in or create an account to use this community feature.</p>' +
        '<div class="auth-required__actions">' +
          '<button type="button" class="btn btn--outline" data-auth-required="sign-in">Sign in</button>' +
          '<button type="button" class="btn btn--primary" data-auth-required="sign-up">Create an account</button>' +
        '</div>' +
      '</div>',
      onMount: function (root) {
        B.utils.$$('[data-auth-required]', root).forEach(function (button) {
          button.addEventListener('click', function () {
            openForm(button.getAttribute('data-auth-required'));
          });
        });
      }
    });
    return false;
  }

  async function signOut() {
    const wasOnAdminPage = window.location.hash.replace(/^#\/?/, '').split('?')[0] === 'admin';
    try {
      const result = await client.auth.signOut();
      if (result.error) {
        B.ui.toast('Could not sign out: ' + result.error.message, 'error');
        return;
      }
      if (wasOnAdminPage) {
        window.addEventListener('hashchange', function () {
          openForm('sign-up');
        }, { once: true });
        window.location.hash = '#/home';
      } else {
        openForm('sign-in', 'You are signed out. Sign in again to continue.');
      }
    } catch (error) {
      B.ui.toast('Could not sign out: ' + ((error && error.message) || 'Please try again.'), 'error');
    }
  }

  function init() {
    const bar = $('#account-bar');
    if (!bar) return;

    bar.addEventListener('click', function (event) {
      const button = event.target.closest('[data-account-action]');
      if (!button) return;
      const action = button.getAttribute('data-account-action');
      if (action === 'sign-in' || action === 'sign-up') openForm(action);
      if (action === 'sign-out' && client) signOut();
    });

    currentUser = null;
    updateAccount(null);
    if (!configured()) return;
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      B.ui.toast('Supabase could not be loaded. Check your internet connection and reload the page.', 'error');
      return;
    }

    try {
      client = window.supabase.createClient(B.config.supabase.url, B.config.supabase.anonKey);
    } catch (error) {
      B.ui.toast('Supabase configuration is invalid: ' + ((error && error.message) || 'check js/config.js.'), 'error');
      return;
    }
    client.auth.onAuthStateChange(function (event, session) {
      authStateVersion += 1;
      currentUser = session && session.user ? session.user : null;
      updateAccount(currentUser);
      if (event === 'SIGNED_OUT' || !currentUser) {
        adminCheckId += 1;
        adminStatusUserId = null;
        adminStatus = null;
        adminStatusRequest = null;
      } else if (event === 'PASSWORD_RECOVERY') {
        openForm('reset-password');
      } else if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        scheduleAdminLinkUpdate(currentUser);
      }
    });
    const initialAuthStateVersion = authStateVersion;
    client.auth.getSession().then(function (result) {
      if (result.error) {
        B.ui.toast('Could not check your sign-in status: ' + result.error.message, 'error');
        return;
      }
      if (authStateVersion !== initialAuthStateVersion) return;
      currentUser = result.data.session && result.data.session.user ? result.data.session.user : null;
      updateAccount(currentUser);
      if (currentUser) scheduleAdminLinkUpdate(currentUser);
    }).catch(function (error) {
      B.ui.toast('Could not check your sign-in status: ' + ((error && error.message) || 'Please reload the page.'), 'error');
    });
  }

  B.auth = {
    init,
    openForm,
    requireSignIn,
    isSignedIn: function () { return Boolean(currentUser); },
    getUserId: function () { return currentUser ? currentUser.id : null; },
    getClient: function () { return client; }
  };
})(window.Barobo = window.Barobo || {});
