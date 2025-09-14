export class Modal {
    constructor(title = "Modal") {
        this.title = title;
        this.overlay = null;
        this.modal = null;
        this.content = null;
    }

    createElements() {
        this.overlay = document.createElement("div");
        this.overlay.classList.add("modal-overlay", "closed");

        this.modal = document.createElement("div");
        this.modal.classList.add("modal", "closed");

        const titleEl = document.createElement("div");
        titleEl.innerText = this.title;
        titleEl.classList.add("modal-title");
        this.modal.appendChild(titleEl);

        this.content = document.createElement("div");
        this.content.classList.add("modal-content");
        this.modal.appendChild(this.content);

        this.overlay.addEventListener("click", () => this.close());
    }

    setContent(element) {
        if (!this.content) {
            this.createElements();
        }
        this.content.innerHTML = "";
        this.content.appendChild(element);
    }

    toggleClasses(open) {
        const action = open ? ["add", "remove"] : ["remove", "add"];
        this.overlay.classList[action[0]]("open");
        this.overlay.classList[action[1]]("closed");
        this.modal.classList[action[0]]("open");
        this.modal.classList[action[1]]("closed");
    }

    open() {
        if (!this.modal) {
            this.createElements();
        }
        if (!document.body.contains(this.modal)) {
            document.body.appendChild(this.overlay);
            document.body.appendChild(this.modal);
        }

        this.overlay.style.display = "block";
        this.modal.style.display = "block";

        requestAnimationFrame(() => {
            this.toggleClasses(true);
            this.modal.style.opacity = "1";
            this.modal.style.transform = "translate(-50%, -50%) scale(1)";
        });
    }

    close() {
        this.toggleClasses(false);
        this.modal.style.opacity = "0";
        this.modal.style.transform = "translate(-50%, -50%) scale(0.9)";

        setTimeout(() => {
            this.overlay.remove();
            this.modal.remove();
        }, 150);
    }
}