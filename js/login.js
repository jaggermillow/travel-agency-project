import AuthService from './services/auth.js';

document.addEventListener('DOMContentLoaded', () => {
    // If already logged in, redirect to dashboard
    if (AuthService.isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    const form = document.getElementById('login-form');
    const errorMsg = document.getElementById('login-error');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const success = AuthService.login(
            formData.get('username'),
            formData.get('password')
        );

        if (success) {
            window.location.href = 'index.html';
        } else {
            errorMsg.style.display = 'block';
            // Shake animation effect
            const card = document.querySelector('.login-card');
            card.style.transform = 'translateX(5px)';
            setTimeout(() => card.style.transform = 'translateX(-5px)', 50);
            setTimeout(() => card.style.transform = 'translate(0)', 100);
        }
    });
});
