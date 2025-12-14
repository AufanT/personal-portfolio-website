document.addEventListener("DOMContentLoaded", function () {
    const typingElement = document.getElementById("typing-text");
    if (typingElement) {
        const words = [
            "Backend Developer",
            "Frontend Developer",
            "AI Enthusiast",
            "UI/UX Designer",
        ];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        const typeSpeed = 100;
        const deleteSpeed = 50;
        const delayAfterWord = 2000;

        function typeEffect() {
            const currentWord = words[wordIndex];

            if (isDeleting) {
                typingElement.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingElement.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
            }

            let typingDelay = isDeleting ? deleteSpeed : typeSpeed;

            if (!isDeleting && charIndex === currentWord.length) {
                typingDelay = delayAfterWord;
                isDeleting = true;
            }
            else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex++;
                if (wordIndex === words.length) {
                    wordIndex = 0;
                }
            }
            setTimeout(typeEffect, typingDelay);
        }
        typeEffect();
    }

    const filterBtns = document.querySelectorAll(".filter-btn");
    const portfolioItems = document.querySelectorAll(".portfolio-item");
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener("click", function () {
                filterBtns.forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                const filterValue = this.getAttribute("data-filter");
                portfolioItems.forEach(item => {
                    if (filterValue === "all" || item.classList.contains(filterValue)) {
                        item.classList.remove("d-none");
                        item.classList.add("fade-in");
                    } else {
                        item.classList.add("d-none");
                        item.classList.remove("fade-in");
                    }
                });
            });
        });
    }

    const projectModal = document.getElementById('projectModal');
    if (projectModal) {
        projectModal.addEventListener('show.bs.modal', event => {
            const button = event.relatedTarget;

            const title = button.getAttribute('data-title');
            const category = button.getAttribute('data-category');
            const img = button.getAttribute('data-img');
            const desc = button.getAttribute('data-desc');
            const demoLink = button.getAttribute('data-demo');
            const sourceLink = button.getAttribute('data-source');

            projectModal.querySelector('#modalTitle').textContent = title;
            projectModal.querySelector('#modalCategory').textContent = category;
            projectModal.querySelector('#modalImage').src = img;
            projectModal.querySelector('#modalDesc').textContent = desc;
            
            const btnDemo = projectModal.querySelector('#btnLiveDemo');
            const btnSource = projectModal.querySelector('#btnSourceCode');

            btnDemo.href = demoLink;
            btnSource.href = sourceLink;

            if (demoLink === "#" || !demoLink) {
                btnDemo.classList.add('d-none');
            } else {
                btnDemo.classList.remove('d-none');
            }
            
            if (sourceLink === "#" || !sourceLink) {
                btnSource.classList.add('d-none');
            } else {
                btnSource.classList.remove('d-none');
            }
        });
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const submitBtn = document.getElementById('submitBtn');
        const successAlert = document.getElementById('successAlert');
        const errorAlert = document.getElementById('errorAlert');

        contactForm.addEventListener('input', function () {
            if (contactForm.checkValidity()) {
                submitBtn.removeAttribute('disabled');
            } else {
                submitBtn.setAttribute('disabled', 'true');
            }
        });

        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();
            event.stopPropagation();

            if (contactForm.checkValidity()) {
                successAlert.classList.remove('d-none');
                errorAlert.classList.add('d-none');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';

                setTimeout(() => {
                    contactForm.reset();
                    contactForm.classList.remove('was-validated');
                    submitBtn.innerHTML = originalText;
                    submitBtn.setAttribute('disabled', 'true');
                    setTimeout(() => successAlert.classList.add('d-none'), 5000);
                }, 2000);

            } else {
                errorAlert.classList.remove('d-none');
                successAlert.classList.add('d-none');
            }
            contactForm.classList.add('was-validated');
        });
    }

    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                entry.target.classList.remove('active');
            }
        });
    }, {
        threshold: 0.15 
    });
    
    revealElements.forEach((el) => {
        revealObserver.observe(el);
    });
});

