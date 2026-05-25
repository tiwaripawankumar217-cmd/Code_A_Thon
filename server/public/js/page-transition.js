document.addEventListener('DOMContentLoaded', () => {
    // 1. Create the heavy entrance/exit overlay (Curtains)
    const overlay = document.createElement('div');
    overlay.className = 'heavy-transition-overlay';
    
    // We will use 5 staggered columns for a heavy dynamic sweep
    for(let i=0; i<5; i++) {
        const col = document.createElement('div');
        col.className = 'heavy-transition-col';
        col.style.left = `${i * 20}%`;
        // Stagger the animation delays
        col.style.transitionDelay = `${i * 0.08}s`;
        overlay.appendChild(col);
    }
    document.body.appendChild(overlay);

    // 2. Entrance Animation: If we are on a page, the overlay columns start down, then slide up.
    // Also, the main content zooms in heavily from 3D space.
    const mainContent = document.querySelector('main');
    
    // Slight delay to allow DOM to render before pulling up curtains
    setTimeout(() => {
        overlay.classList.add('curtains-up');
        if (mainContent) {
            mainContent.classList.add('heavy-enter-active');
        }
    }, 50);

    // Remove classes after entrance is done to free up resources
    setTimeout(() => {
        if(mainContent) mainContent.classList.remove('heavy-enter-active');
    }, 1200);

    // 3. Intercept Links for Exit Animation
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

            // Heavy Exit: Main content falls backward, curtains slam down
            if (mainContent) {
                mainContent.classList.add('heavy-exit-active');
            }
            
            // Remove curtains-up to make them drop down again
            overlay.classList.remove('curtains-up');
            overlay.classList.add('curtains-down');

            // Wait for the heavy CSS animation to complete before navigating
            setTimeout(() => {
                window.location.href = href;
            }, 850); // 850ms to allow the heavy stagger to finish
        });
    });
});
