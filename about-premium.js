document.addEventListener('DOMContentLoaded', () => {

    // 2. Magnetic Buttons
    const magneticBtns = document.querySelectorAll('.magnetic');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', function(e) {
            const position = btn.getBoundingClientRect();
            const x = e.pageX - position.left - position.width / 2;
            const y = e.pageY - position.top - position.height / 2;
            
            gsap.to(btn, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.5,
                ease: "power3.out"
            });
        });

        btn.addEventListener('mouseleave', function() {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.7,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });

    // 3. Hero Section Animation
    const tlHero = gsap.timeline();
    tlHero.from(".hero-title-line", {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power4.out",
        delay: 0.5
    })
    .from(".hero-gold-line", {
        scaleX: 0,
        transformOrigin: "left",
        duration: 1,
        ease: "power3.inOut"
    }, "-=0.8")
    .from(".hero-cta", {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    }, "-=0.5");

    // Ken Burns background effect
    gsap.to(".hero-bg", {
        scale: 1.1,
        duration: 20,
        ease: "none",
        repeat: -1,
        yoyo: true
    });

    // 4. Scroll Reveal Animations
    const isMobile = window.innerWidth <= 768;
    const revealElements = document.querySelectorAll('.gsap-reveal');
    revealElements.forEach(el => {
        const direction = el.dataset.direction || 'up';
        let x = 0, y = 0;
        
        if (direction === 'up') y = 60;
        if (direction === 'down') y = -60;
        if (direction === 'left') x = isMobile ? 0 : -80;
        if (direction === 'right') x = isMobile ? 0 : 80;

        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none none" // Play once
            },
            x: x,
            y: y,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out"
        });
    });

    // Staggered reveals
    const staggerContainers = document.querySelectorAll('.gsap-stagger-container');
    staggerContainers.forEach(container => {
        const items = container.querySelectorAll('.gsap-stagger-item');
        gsap.from(items, {
            scrollTrigger: {
                trigger: container,
                start: "top 80%",
            },
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out"
        });
    });

    // Parallax Images
    const parallaxImages = document.querySelectorAll('.gsap-parallax');
    parallaxImages.forEach(img => {
        if (!isMobile) {
            gsap.to(img, {
                scrollTrigger: {
                    trigger: img.parentElement,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1
                },
                y: 50,
                ease: "none"
            });
        }
    });

    // 6. Workflow Timeline
    const timelineLine = document.querySelector('.timeline-line-progress');
    if (timelineLine) {
        gsap.to(timelineLine, {
            scrollTrigger: {
                trigger: ".workflow-timeline",
                start: "top center",
                end: "bottom center",
                scrub: true
            },
            height: "100%",
            ease: "none"
        });
    }

    const workflowSteps = document.querySelectorAll('.workflow-step');
    workflowSteps.forEach((step, i) => {
        const isLeft = i % 2 === 0;
        gsap.from(step.querySelector('.workflow-content'), {
            scrollTrigger: {
                trigger: step,
                start: "top 80%"
            },
            x: isMobile ? 0 : (isLeft ? -40 : 40),
            y: isMobile ? 30 : 0,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });
        
        gsap.from(step.querySelector('.timeline-dot'), {
            scrollTrigger: {
                trigger: step,
                start: "top 80%"
            },
            scale: 0,
            opacity: 0,
            duration: 0.6,
            ease: "back.out(2)"
        });
    });


    // 7. Mouse Tilt Effect for Glass Cards
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg
            const rotateY = ((x - centerX) / centerX) * 10;
            
            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                transformPerspective: 1000,
                duration: 0.5,
                ease: "power2.out"
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.7,
                ease: "power2.out"
            });
        });
    });
});

