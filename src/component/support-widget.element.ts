import { resolveBaseUrl } from "../core/config/endpoints";
import {
  validateSubmission,
  validateUser,
  validateWidgetConfig,
} from "../core/validation/request-validator";
import { createSupportRequest } from "../services/api/support-api";
import type {
  SupportSubmissionInput,
  SupportUser,
  SupportUserPrefill,
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
}

type RequiredFieldId = "requester" | "phone-number" | "email" | "content";

export class SupportWidgetElement extends HTMLElement {
  static observedAttributes = ["project-id", "is-dev", "width", "height"];

  private config: SupportWidgetConfig = {
    projectId: undefined,
  };

  private user?: SupportUserPrefill;
  private dragOccurred = false;

  // Internal states for fields mapped behind the scenes
  private selectedFiles: File[] = [];
  private prefilledAttachments: string[] = [];
  private previewUrls: string[] = [];
  private closeAfterSuccessTimer: number | null = null;
  public priority: number | undefined;
  public coordinators: string[] = [];
  public emailContacts: string[] = [];

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
    this.clearCloseAfterSuccessTimer();
  }

  attributeChangedCallback(): void {
    this.syncConfigFromAttributes();
    this.prefillFromState();
    this.applyLauncherStyle();
  }

  setUser(user: SupportUserPrefill): void {
    this.user = user;
    this.prefillFromState();
  }

  setConfig(config: Partial<SupportWidgetConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
    if (config.projectId !== undefined) {
      this.setAttribute("project-id", config.projectId);
    }
    if (config.isDev !== undefined) {
      if (config.isDev) {
        this.setAttribute("is-dev", "");
      } else {
        this.removeAttribute("is-dev");
      }
    }
    if (config.priority !== undefined) {
      this.priority = config.priority;
    }
    if (config.coordinators !== undefined) {
      this.coordinators = config.coordinators;
    }
    if (config.emailContacts !== undefined) {
      this.emailContacts = config.emailContacts;
    }
  }

  setFormPrefill(data: FormPrefillInput): void {
    this.setInputValue("content", data.content ?? "");
    this.prefilledAttachments = data.attachments ?? [];
    this.renderFileList();
  }

  open(): void {
    this.shadowRoot?.getElementById("modal")?.classList.add("show");
    this.dispatchEvent(new CustomEvent(WIDGET_EVENTS.OPEN, { bubbles: true }));
  }

  close(): void {
    this.clearCloseAfterSuccessTimer();
    this.resetFormData();
    this.shadowRoot?.getElementById("modal")?.classList.remove("show");
    this.dispatchEvent(new CustomEvent(WIDGET_EVENTS.CLOSE, { bubbles: true }));
  }

  private syncConfigFromAttributes(): void {
    this.config = {
      ...this.config,
      projectId: this.getAttribute("project-id") ?? "",
      isDev: this.hasAttribute("is-dev"),
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

    this.setupClearableInputs();

    // File selection UI handlers
    const uploadTrigger = root.getElementById("upload-trigger");
    const fileInput = root.getElementById(
      "file-input",
    ) as HTMLInputElement | null;

    if (uploadTrigger && fileInput) {
      uploadTrigger.addEventListener("click", () => {
        fileInput.click();
      });

      uploadTrigger.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          fileInput.click();
        }
      });

      uploadTrigger.addEventListener("dragover", (e: DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = "copy";
        }
        uploadTrigger.classList.add("dragover");
      });

      uploadTrigger.addEventListener("dragleave", () => {
        uploadTrigger.classList.remove("dragover");
      });

      uploadTrigger.addEventListener("drop", (e: DragEvent) => {
        e.preventDefault();
        uploadTrigger.classList.remove("dragover");
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
          this.addSelectedFiles(Array.from(e.dataTransfer.files));
        }
      });

      fileInput.addEventListener("change", () => {
        if (fileInput.files) {
          this.addSelectedFiles(Array.from(fileInput.files));
          // Reset file input value to allow selecting the same file again
          fileInput.value = "";
        }
      });
    }

    this.setupClipboardPaste();
    this.setupPreviewControls();
  }

  private setupPreviewControls(): void {
    const root = this.shadowRoot;
    if (!root) return;

    const overlay = root.getElementById("preview-overlay");
    root
      .getElementById("preview-close")
      ?.addEventListener("click", () => this.closePreview());

    overlay?.addEventListener("click", (event) => {
      if (event.target === overlay) this.closePreview();
    });

    root.addEventListener("keydown", (event) => {
      if ((event as KeyboardEvent).key === "Escape") this.closePreview();
    });
  }

  private setupClipboardPaste(): void {
    const dialog = this.shadowRoot?.querySelector(".dialog");
    if (!dialog) return;

    dialog.addEventListener("paste", (event) => {
      const clipboard = (event as ClipboardEvent).clipboardData;
      if (!clipboard) return;

      const files = Array.from(clipboard.items)
        .filter((item: DataTransferItem) => item.kind === "file")
        .map((item: DataTransferItem) => item.getAsFile())
        .filter((file): file is File => file !== null);

      if (files.length === 0) return;

      event.preventDefault();
      this.addSelectedFiles(files);
    });
  }

  private addSelectedFiles(files: File[]): void {
    if (files.length === 0) return;
    this.selectedFiles.push(...files);
    this.renderFileList();
  }

  private renderFileList(): void {
    const fileListEl = this.shadowRoot?.getElementById("file-list");
    if (!fileListEl) return;
    fileListEl.innerHTML = "";

    // Release object URLs created in the previous render to avoid leaks
    this.previewUrls.forEach((url) => URL.revokeObjectURL(url));
    this.previewUrls = [];

    // Prefilled URLs
    this.prefilledAttachments.forEach((url, index) => {
      const name = url.substring(url.lastIndexOf("/") + 1) || url;
      const isImage = this.isImageName(name);
      const previewUrl = isImage ? url : null;
      fileListEl.appendChild(
        this.buildFileItem({
          name,
          title: url,
          previewUrl,
          type: "prefilled",
          index,
          isImage,
          openUrl: url,
          badge: "Đã gán",
        }),
      );
    });

    // Selected local files
    this.selectedFiles.forEach((file, index) => {
      let previewUrl: string | null = null;
      const isImage = file.type.startsWith("image/");
      if (isImage) {
        previewUrl = URL.createObjectURL(file);
        this.previewUrls.push(previewUrl);
      }
      fileListEl.appendChild(
        this.buildFileItem({
          name: file.name,
          title: file.name,
          previewUrl,
          type: "selected",
          index,
          isImage,
          openUrl: null,
          badge: null,
        }),
      );
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

  private buildFileItem(opts: {
    name: string;
    title: string;
    previewUrl: string | null;
    type: "prefilled" | "selected";
    index: number;
    isImage: boolean;
    openUrl: string | null;
    badge: string | null;
  }): HTMLDivElement {
    const item = document.createElement("div");
    item.className = "file-item";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "file-preview-trigger";
    trigger.title = "Nhấn để xem trước";
    trigger.addEventListener("click", () => {
      this.openPreview({
        name: opts.title,
        previewUrl: opts.previewUrl,
        isImage: opts.isImage,
        openUrl: opts.openUrl,
      });
    });

    const thumb = document.createElement("div");
    thumb.className = "file-thumb";
    if (opts.previewUrl) {
      const img = document.createElement("img");
      img.src = opts.previewUrl;
      img.alt = opts.name;
      // Fall back to a file icon if the image fails to load
      img.addEventListener("error", () => this.fillWithFileIcon(thumb));
      thumb.appendChild(img);
    } else {
      this.fillWithFileIcon(thumb);
    }

    const infoContainer = document.createElement("div");
    infoContainer.className = "file-info-container";

    const name = document.createElement("span");
    name.className = "file-name";
    name.title = opts.title;
    name.textContent = opts.name;

    infoContainer.appendChild(name);
    trigger.append(thumb, infoContainer);

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn-remove";
    removeBtn.setAttribute("aria-label", "Xóa tệp");
    removeBtn.setAttribute("data-type", opts.type);
    removeBtn.setAttribute("data-index", String(opts.index));
    removeBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;

    item.append(trigger, removeBtn);

    if (opts.badge) {
      const badge = document.createElement("span");
      badge.className = "file-badge";
      badge.textContent = opts.badge;
      item.appendChild(badge);
    }

    return item;
  }

  private fillWithFileIcon(thumb: HTMLElement): void {
    thumb.innerHTML = "";
    thumb.classList.add("file-thumb--icon");
    thumb.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
      </svg>`;
  }

  private openPreview(opts: {
    name: string;
    previewUrl: string | null;
    isImage: boolean;
    openUrl: string | null;
  }): void {
    const overlay = this.shadowRoot?.getElementById("preview-overlay");
    const body = this.shadowRoot?.getElementById("preview-body");
    if (!overlay || !body) return;

    body.innerHTML = "";

    if (opts.isImage && opts.previewUrl) {
      const img = document.createElement("img");
      img.src = opts.previewUrl;
      img.alt = opts.name;
      body.appendChild(img);
    } else {
      const info = document.createElement("div");
      info.className = "preview-file";
      const openLink = opts.openUrl
        ? `<a href="${opts.openUrl}" target="_blank" rel="noopener noreferrer">Mở trong tab mới</a>`
        : `<span>Không có bản xem trước cho tệp này</span>`;
      info.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
        <span class="preview-file-name"></span>
        ${openLink}`;
      const nameEl = info.querySelector(".preview-file-name");
      if (nameEl) nameEl.textContent = opts.name;
      body.appendChild(info);
    }

    overlay.classList.add("show");
  }

  private closePreview(): void {
    const overlay = this.shadowRoot?.getElementById("preview-overlay");
    if (!overlay) return;
    overlay.classList.remove("show");
    const body = this.shadowRoot?.getElementById("preview-body");
    if (body) body.innerHTML = "";
  }

  private isImageName(name: string): boolean {
    return /\.(png|jpe?g|gif|webp|bmp|svg|avif)$/i.test(name);
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

  private setupClearableInputs(): void {
    const root = this.shadowRoot;
    if (!root) return;

    root.querySelectorAll(".input-wrap").forEach((wrap) => {
      const input = wrap.querySelector("input, textarea") as
        | HTMLInputElement
        | HTMLTextAreaElement
        | null;
      const clearBtn = wrap.querySelector(
        ".btn-clear",
      ) as HTMLButtonElement | null;
      if (!input || !clearBtn) return;

      const updateVisibility = () => this.updateClearButton(input);

      input.addEventListener("input", updateVisibility);
      input.addEventListener("input", () => this.clearFieldError(input.id));
      clearBtn.addEventListener("click", () => {
        input.value = "";
        input.focus();
        updateVisibility();
        this.clearFieldError(input.id);
      });

      updateVisibility();
    });
  }

  private updateClearButton(
    input: HTMLInputElement | HTMLTextAreaElement,
  ): void {
    const wrap = input.parentElement;
    if (wrap?.classList.contains("input-wrap")) {
      wrap.classList.toggle("has-value", input.value.length > 0);
    }
  }

  private setInputValue(id: string, value: string): void {
    const el = this.shadowRoot?.getElementById(id) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;
    if (!el) return;
    el.value = value;
    this.updateClearButton(el);
  }

  private getInputValue(id: string): string {
    const el = this.shadowRoot?.getElementById(id) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;
    return el?.value?.trim() ?? "";
  }

  private setFieldError(id: RequiredFieldId): void {
    const errorEl = this.shadowRoot?.getElementById(`${id}-error`);
    if (errorEl) {
      errorEl.textContent = "";
    }

    const input = this.shadowRoot?.getElementById(id) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;
    const wrap = input?.parentElement;
    if (wrap?.classList.contains("input-wrap")) {
      wrap.classList.add("has-error");
    }
  }

  private clearFieldError(id: string): void {
    const errorEl = this.shadowRoot?.getElementById(`${id}-error`);
    if (errorEl) {
      errorEl.textContent = "";
    }

    const input = this.shadowRoot?.getElementById(id) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;
    const wrap = input?.parentElement;
    if (wrap?.classList.contains("input-wrap")) {
      wrap.classList.remove("has-error");
    }
  }

  private clearAllFieldErrors(): void {
    this.clearFieldError("requester");
    this.clearFieldError("phone-number");
    this.clearFieldError("email");
    this.clearFieldError("content");
  }

  private setSubmitFeedback(
    type: "success" | "error",
    message: string,
  ): void {
    const feedbackEl = this.shadowRoot?.getElementById("submit-feedback");
    if (!feedbackEl) return;

    feedbackEl.textContent = message;
    feedbackEl.classList.remove("success", "error");
    feedbackEl.classList.add(type, "show");
  }

  private clearSubmitFeedback(): void {
    const feedbackEl = this.shadowRoot?.getElementById("submit-feedback");
    if (!feedbackEl) return;

    feedbackEl.textContent = "";
    feedbackEl.classList.remove("success", "error", "show");
  }

  private clearCloseAfterSuccessTimer(): void {
    if (this.closeAfterSuccessTimer !== null) {
      window.clearTimeout(this.closeAfterSuccessTimer);
      this.closeAfterSuccessTimer = null;
    }
  }

  private validateRequiredFields(): boolean {
    this.clearAllFieldErrors();

    const requiredFields: RequiredFieldId[] = [
      "requester",
      "phone-number",
      "email",
      "content",
    ];

    let firstInvalidId: RequiredFieldId | null = null;

    requiredFields.forEach((id) => {
      if (!this.getInputValue(id)) {
        this.setFieldError(id);
        if (!firstInvalidId) {
          firstInvalidId = id;
        }
      }
    });

    if (firstInvalidId) {
      const firstInvalid = this.shadowRoot?.getElementById(firstInvalidId) as
        | HTMLInputElement
        | HTMLTextAreaElement
        | null;
      firstInvalid?.focus();
      return false;
    }

    return true;
  }

  private resetFormData(): void {
    this.setInputValue("requester", "");
    this.setInputValue("email", "");
    this.setInputValue("phone-number", "");
    this.setInputValue("content", "");
    this.clearAllFieldErrors();
    this.clearSubmitFeedback();

    this.selectedFiles = [];
    this.prefilledAttachments = [];
    this.renderFileList();
    this.closePreview();
  }

  private async submit(): Promise<void> {
    try {
      this.clearCloseAfterSuccessTimer();
      this.clearSubmitFeedback();

      if (!this.validateRequiredFields()) {
        this.dispatchEvent(
          new CustomEvent(WIDGET_EVENTS.SUBMIT_ERROR, {
            bubbles: true,
            detail: { message: "Please fill in all required fields." },
          }),
        );
        return;
      }

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
      };
      validateSubmission(submission);

      // Create FormData to send request as multipart/form-data
      const formData = new FormData();
      formData.append("Requester", user.name);
      formData.append("PhoneNumber", user.phoneNumber);
      formData.append("Email", user.email);
      formData.append("Content", content);
      if (this.config.projectId?.trim()) {
        formData.append("ProjectId", this.config.projectId.trim());
      }
      if (typeof this.priority === "number") {
        formData.append("Priority", String(this.priority));
      }

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
      if (this.coordinators.length > 0) {
        this.coordinators.forEach((coord) =>
          formData.append("Coordinators", coord),
        );
      }
      if (this.emailContacts.length > 0) {
        this.emailContacts.forEach((contact) =>
          formData.append("EmailContacts", contact),
        );
      }

      const baseUrl = resolveBaseUrl(this.config);
      const result = await createSupportRequest(baseUrl, formData);

      this.dispatchEvent(
        new CustomEvent(WIDGET_EVENTS.SUBMIT_SUCCESS, {
          bubbles: true,
          detail: result,
        }),
      );
      this.closeAfterSuccessTimer = window.setTimeout(() => {
        this.close();
      }, 1200);
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
