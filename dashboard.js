// Toggle mobile menu
function toggleMenu() {
    const burger = document.querySelector('.burger-menu');
    const mobileMenu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('overlay');
    
    burger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    overlay.classList.toggle('active');
    
    // Prevent body scroll when menu open
    if (mobileMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

// Close menu when clicking overlay
document.getElementById('overlay')?.addEventListener('click', toggleMenu);

// Counter animation
function animateNumbers() {
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        let current = 0;
        const increment = target / 50; // Divide by number of steps
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.innerText = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                counter.innerText = target.toLocaleString();
            }
        };
        
        updateCounter();
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            
            // Close mobile menu if open
            if (document.getElementById('mobileMenu').classList.contains('active')) {
                toggleMenu();
            }
        }
    });
});

// Load animations when page loads
window.addEventListener('load', () => {
    animateNumbers();
});

// Handle active menu based on current page
function setActiveMenu() {
    const currentPath = window.location.pathname;
    const menuLinks = document.querySelectorAll('.nav-menu a, .mobile-nav a');
    
    menuLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

setActiveMenu();
