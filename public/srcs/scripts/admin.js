class AdminView {
    constructor(wrapperId, navId) {
        this.wrapper = document.getElementById(wrapperId);
        this.navLinks = document.querySelectorAll(`#${navId} a`);
        this.sections = document.querySelectorAll(`#${wrapperId} section`);
        this.init();
    }
    
    init() {
        this.navLinks.forEach(link => {
            link.addEventListener("click", (e) => this.handleNavClick(e));
            link.addEventListener("contextmenu", (e) => this.handleSectionRightClick(e));
        });
        
        // Show the first section by default
        if (this.sections.length > 0) {
            this.showSection(this.sections[0]);
        }
    }

    handleNavClick(event) {
        event.preventDefault();
        // Remove 'active' class from all sections
        this.sections.forEach(section => section.classList.remove("active"));

        // Add 'active' class to the target section
        const targetId = event.target.getAttribute("href");
        const targetSection = document.getElementById(targetId.substring(1));
        if (targetSection) {
            this.showSection(targetSection);
        }
        if (!targetSection.classList.contains("loaded")) {
            ajax(event, "inject",
                {
                    action: "/db/" + targetId.substring(1),
                    method: "POST",
                    form:{default: true}
                },
                document.querySelector(`${targetId} .wrapper`)
            );
        }
        // Reset grid layout to show only one section
        this.wrapper.classList.remove("split-view");
        this.sections.forEach(section => section.style.display = "none");
        targetSection.style.display = "block";
    }

    handleSectionRightClick(event) {
        event.preventDefault(); // Prevent the default context menu from appearing
        let section = event.target.getAttribute("href").substring(1);
        section = document.getElementById(section);
        if(!section) return;
        // Make the right-clicked section visible alongside the active section
        section.style.display = "block";
        section.classList.add("active");

        // Adjust grid layout to accommodate multiple sections
        this.wrapper.classList.add("split-view");
    }

    showSection(section) {
        section.classList.add("active");
        section.style.display = "block";
    }
}

// Initialize the AdminView class
document.addEventListener('DOMContentLoaded', () => {
    new AdminView("admin_wrapper", "admin_nav");
});