import { resolveBaseUrl } from "../core/config/resolve-base-url";
import {
  validateSubmission,
  validateUser,
  validateWidgetConfig,
} from "../core/validation/request-validator";
import { createSupportRequest } from "../services/api/support-api";
import type {
  SupportSubmissionInput,
  SupportUser,
  SupportWidgetConfig,
} from "../types/public";
import { WIDGET_EVENTS } from "./events/widget-events";
import npSupportLogo from "./assets/np-support-logo.png";
import styles from "./support-widget.styles.css";
import markup from "./support-widget.template.html";

let sharedTemplate: HTMLTemplateElement | null = null;

function getTemplate(): HTMLTemplateElement {
  if (!sharedTemplate) {
    sharedTemplate = document.createElement("template");
    sharedTemplate.innerHTML = `<style>${styles}</style>${markup}`;
  }
  return sharedTemplate;
}

async function urlToFile(url: string): Promise<File | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    const name = url.substring(url.lastIndexOf("/") + 1) || "attachment";
    return new File([blob], name, { type: blob.type });
  } catch (e) {
    console.warn("Failed to fetch prefilled attachment", url, e);
    return null;
  }
}

interface FormPrefillInput {
  content?: string;
  attachments?: string[];
  priority?: number;
  coordinators?: string[];
  emailContacts?: string[];
}

export class SupportWidgetElement extends HTMLElement {
  static observedAttributes = [
    "project-id",
    "api-base-url",
    "is-developer",
    "width",
    "height",
  ];

  private config: SupportWidgetConfig = {
    projectId: "",
  };

  private user?: SupportUser;
  private dragOccurred = false;

  // Internal states for fields mapped behind the scenes
  private selectedFiles: File[] = [];
  private prefilledAttachments: string[] = [];
  private priority = 0;
  private coordinators: string[] = [];
  private emailContacts: string[] = [];

  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.appendChild(getTemplate().content.cloneNode(true));
    this.bindActions();
  }

  connectedCallback(): void {
    this.syncConfigFromAttributes();
    this.prefillFromState();
    this.applyLauncherStyle();
    this.restorePosition();
    window.addEventListener("resize", this.handleResize);
  }

  disconnectedCallback(): void {
    window.removeEventListener("resize", this.handleResize);
  }

  attributeChangedCallback(): void {
    this.syncConfigFromAttributes();
    this.prefillFromState();
    this.applyLauncherStyle();
  }

  setUser(user: SupportUser): void {
    this.user = user;
    this.prefillFromState();
  }

  setFormPrefill(data: FormPrefillInput): void {
    this.setInputValue("content", data.content ?? "");
    this.prefilledAttachments = data.attachments ?? [];
    this.priority = data.priority ?? 0;
    this.coordinators = data.coordinators ?? [];
    this.emailContacts = data.emailContacts ?? [];
    this.renderFileList();
  }

  open(): void {
    this.shadowRoot?.getElementById("modal")?.classList.add("show");
    this.dispatchEvent(new CustomEvent(WIDGET_EVENTS.OPEN, { bubbles: true }));
  }

  close(): void {
    this.shadowRoot?.getElementById("modal")?.classList.remove("show");
    this.dispatchEvent(new CustomEvent(WIDGET_EVENTS.CLOSE, { bubbles: true }));
  }

  private syncConfigFromAttributes(): void {
    this.config = {
      projectId: this.getAttribute("project-id") ?? "",
      baseUrl: this.getAttribute("api-base-url") ?? undefined,
      isDeveloper: this.hasAttribute("is-developer"),
    };
  }

  private bindActions(): void {
    const root = this.shadowRoot;
    if (!root) return;

    const launcher = root.getElementById("open-btn");
    if (launcher) {
      launcher.addEventListener("click", () => {
        if (this.dragOccurred) {
          this.dragOccurred = false;
          return;
        }
        this.open();
      });
      this.setupDrag(launcher);
    }

    root
      .getElementById("close-btn")
      ?.addEventListener("click", () => this.close());
    root
      .getElementById("cancel-btn")
      ?.addEventListener("click", () => this.close());
    root
      .getElementById("submit-btn")
      ?.addEventListener("click", () => void this.submit());
    root.getElementById("modal")?.addEventListener("click", (event) => {
      if (event.target instanceof HTMLElement && event.target.id === "modal") {
        this.close();
      }
    });

    // File selection UI handlers
    const uploadTrigger = root.getElementById("upload-trigger");
    const fileInput = root.getElementById("file-input") as HTMLInputElement | null;

    if (uploadTrigger && fileInput) {
      uploadTrigger.addEventListener("click", () => {
        fileInput.click();
      });

      fileInput.addEventListener("change", () => {
        if (fileInput.files) {
          Array.from(fileInput.files).forEach((file) => {
            this.selectedFiles.push(file);
          });
          // Reset file input value to allow selecting the same file again
          fileInput.value = "";
          this.renderFileList();
        }
      });
    }
  }

  private renderFileList(): void {
    const fileListEl = this.shadowRoot?.getElementById("file-list");
    if (!fileListEl) return;
    fileListEl.innerHTML = "";

    // Prefilled URLs
    this.prefilledAttachments.forEach((url, index) => {
      const item = document.createElement("div");
      item.className = "file-item";
      const name = url.substring(url.lastIndexOf("/") + 1) || url;
      item.innerHTML = `
        <span class="file-name" title="${url}">${name} (đã gán)</span>
        <button type="button" class="btn-remove" data-type="prefilled" data-index="${index}">×</button>
      `;
      fileListEl.appendChild(item);
    });

    // Selected local files
    this.selectedFiles.forEach((file, index) => {
      const item = document.createElement("div");
      item.className = "file-item";
      item.innerHTML = `
        <span class="file-name" title="${file.name}">${file.name}</span>
        <button type="button" class="btn-remove" data-type="selected" data-index="${index}">×</button>
      `;
      fileListEl.appendChild(item);
    });

    // Hook remove event
    fileListEl.querySelectorAll(".btn-remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.currentTarget as HTMLElement;
        const type = target.getAttribute("data-type");
        const index = parseInt(target.getAttribute("data-index") || "0", 10);
        if (type === "prefilled") {
          this.prefilledAttachments.splice(index, 1);
        } else {
          this.selectedFiles.splice(index, 1);
        }
        this.renderFileList();
      });
    });
  }

  private prefillFromState(): void {
    this.setInputValue("requester", this.user?.name ?? "");
    this.setInputValue("email", this.user?.email ?? "");
    this.setInputValue("phone-number", this.user?.phoneNumber ?? "");
  }

  private applyLauncherStyle(): void {
    const launcher = this.shadowRoot?.getElementById("open-btn");
    if (!launcher) return;

    const launcherStyles = [`--np-hub-icon: url("${npSupportLogo}")`];
    const width = this.normalizeSize(this.getAttribute("width"));
    const height = this.normalizeSize(this.getAttribute("height"));
    if (width) launcherStyles.push(`--np-hub-width: ${width}`);
    if (height) launcherStyles.push(`--np-hub-height: ${height}`);

    launcher.setAttribute("style", `${launcherStyles.join("; ")};`);
  }

  private normalizeSize(value: string | null): string | null {
    const trimmed = value?.trim();
    if (!trimmed) return null;
    return /^\d+(\.\d+)?$/.test(trimmed) ? `${trimmed}px` : trimmed;
  }

  private setInputValue(id: string, value: string): void {
    const el = this.shadowRoot?.getElementById(id) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;
    if (!el) return;
    el.value = value;
  }

  private getInputValue(id: string): string {
    const el = this.shadowRoot?.getElementById(id) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;
    return el?.value?.trim() ?? "";
  }

  private async submit(): Promise<void> {
    try {
      const user: SupportUser = {
        name: this.getInputValue("requester"),
        email: this.getInputValue("email"),
        phoneNumber: this.getInputValue("phone-number"),
      };

      this.user = user;

      validateWidgetConfig(this.config);
      validateUser(user);

      const content = this.getInputValue("content");
      const submission: SupportSubmissionInput = {
        content,
        attachments: [], // dummy value for local validation of required content field
        priority: this.priority,
        coordinators: this.coordinators,
        emailContacts: this.emailContacts,
      };
      validateSubmission(submission);

      // Create FormData to send request as multipart/form-data
      const formData = new FormData();
      formData.append("Requester", user.name);
      formData.append("PhoneNumber", user.phoneNumber);
      formData.append("Email", user.email);
      formData.append("Content", content);
      formData.append("ProjectId", this.config.projectId);
      formData.append("Priority", String(this.priority));

      // Fetch prefilled attachments and convert them to Files
      for (const url of this.prefilledAttachments) {
        const file = await urlToFile(url);
        if (file) {
          formData.append("Attachments", file);
        }
      }

      // Add newly selected files
      for (const file of this.selectedFiles) {
        formData.append("Attachments", file);
      }

      // Add coordinators and emailContacts
      this.coordinators.forEach((coord) => formData.append("Coordinators", coord));
      this.emailContacts.forEach((contact) => formData.append("EmailContacts", contact));

      const baseUrl = resolveBaseUrl(this.config);
      const result = await createSupportRequest(baseUrl, formData);

      this.dispatchEvent(
        new CustomEvent(WIDGET_EVENTS.SUBMIT_SUCCESS, {
          bubbles: true,
          detail: result,
        }),
      );
      this.close();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.dispatchEvent(
        new CustomEvent(WIDGET_EVENTS.SUBMIT_ERROR, {
          bubbles: true,
          detail: { message },
        }),
      );
    }
  }


  private setupDrag(launcher: HTMLElement): void {
    launcher.addEventListener("pointerdown", (e: PointerEvent) => {
      if (e.button !== 0) return;

      this.dragOccurred = false;
      const rect = this.getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;
      const initialLeft = rect.left;
      const initialTop = rect.top;

      try {
        launcher.setPointerCapture(e.pointerId);
      } catch {
        // ignore if pointer capture fails
      }

      const onPointerMove = (moveEvent: PointerEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        if (!this.dragOccurred && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
          this.dragOccurred = true;
          launcher.style.cursor = "grabbing";
        }

        if (this.dragOccurred) {
          const leftVal = initialLeft + dx;
          const topVal = initialTop + dy;
          this.adjustPosition(leftVal, topVal);
        }
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        try {
          launcher.releasePointerCapture(upEvent.pointerId);
        } catch {
          // ignore
        }
        launcher.removeEventListener("pointermove", onPointerMove);
        launcher.removeEventListener("pointerup", onPointerUp);
        launcher.removeEventListener("pointercancel", onPointerUp);
        launcher.style.cursor = "";

        if (this.dragOccurred) {
          localStorage.setItem(
            "np-hub-widget-position",
            JSON.stringify({
              left: this.style.left,
              top: this.style.top,
            }),
          );
        }
      };

      launcher.addEventListener("pointermove", onPointerMove);
      launcher.addEventListener("pointerup", onPointerUp);
      launcher.addEventListener("pointercancel", onPointerUp);
    });
  }

  private adjustPosition(leftVal: number, topVal: number): void {
    const rect = this.getBoundingClientRect();
    const width = rect.width || 72;
    const height = rect.height || 72;

    const minLeft = 0;
    const maxLeft = window.innerWidth - width;
    const minTop = 0;
    const maxTop = window.innerHeight - height;

    const clampedLeft = Math.max(minLeft, Math.min(maxLeft, leftVal));
    const clampedTop = Math.max(minTop, Math.min(maxTop, topVal));

    this.style.right = "auto";
    this.style.bottom = "auto";
    this.style.left = `${clampedLeft}px`;
    this.style.top = `${clampedTop}px`;
  }

  private restorePosition(): void {
    const savedPosition = localStorage.getItem("np-hub-widget-position");
    if (savedPosition) {
      try {
        const { left, top } = JSON.parse(savedPosition);
        if (left && top) {
          const leftVal = parseFloat(left);
          const topVal = parseFloat(top);
          this.adjustPosition(leftVal, topVal);
        }
      } catch {
        // Ignore parsing errors
      }
    }
  }

  private handleResize = (): void => {
    if (this.style.left && this.style.top) {
      const leftVal = parseFloat(this.style.left);
      const topVal = parseFloat(this.style.top);
      this.adjustPosition(leftVal, topVal);
    }
  };
}
