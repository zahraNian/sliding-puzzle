export class Modal {
    constructor(title = "Modal") {
        // Overlay
        this.overlay = document.createElement("div");
        this.overlay.classList.add("modal-overlay", "closed");

        this.modal = document.createElement("div");
        this.modal.classList.add("modal", "closed");

        // Title
        const titleEl = document.createElement("div");
        titleEl.innerText = title;
        titleEl.style.fontWeight = "bold";
        titleEl.style.marginBottom = "12px";
        this.modal.appendChild(titleEl);

        // Content container
        this.content = document.createElement("div");
        this.modal.appendChild(this.content);

        // Add to Body
        document.body.appendChild(this.overlay);
        document.body.appendChild(this.modal);

        // Close modal by click outside
        this.overlay.addEventListener("click", () => this.close());
    }

    setContent(element) {
        this.content.innerHTML = "";
        this.content.appendChild(element);
    }

    open() {
        this.overlay.style.display = "block";
        this.modal.style.display = "block";
        requestAnimationFrame(() => {
            this.overlay.classList.remove("closed");
            this.overlay.classList.add("open");
            this.modal.classList.remove("closed");
            this.modal.classList.add("open");
            this.modal.style.opacity = "1";
            this.modal.style.transform = "translate(-50%, -50%) scale(1)";
        });
    }

    close() {
        this.overlay.classList.remove("open");
        this.overlay.classList.add("closed");
        this.modal.classList.remove("open");
        this.modal.classList.add("closed");
        this.modal.style.opacity = "0";
        this.modal.style.transform = "translate(-50%, -50%) scale(0.9)";
        setTimeout(() => {
            this.overlay.style.display = "none";
            this.modal.style.display = "none";
        }, 250);
    }
}