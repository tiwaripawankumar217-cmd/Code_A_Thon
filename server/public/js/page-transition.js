document.addEventListener('DOMContentLoaded', () => {
    // Select all internal links that should trigger the transition
    const links = document.querySelectorAll('a[href^="/"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Ignore external, logout, login, or anchor links
            if (!href || href.startsWith('http') || href.includes('logout') || href.includes('login') || href === '#') return;
            
            // Ignore if going to the exact same page
            if (href === window.location.pathname) return;

            // Intercept navigation
            e.preventDefault();

            // Select the main content areas to animate out
            const mainContent = document.querySelector('main');
            if (mainContent) {
                // Add the exit animation class
                mainContent.classList.add('page-exit-active');
            }

            // Wait for the CSS animation to complete before navigating
            setTimeout(() => {
                window.location.href = href;
            }, 450); // Matches the CSS transition duration
        });
    });
});
