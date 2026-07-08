import { resolveBaseUrl } from "../core/config/resolve-base-url";
import { mapToSupportRequestPayload } from "../core/mapping/request-mapper";
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
    this.setInputValue("attachments", (data.attachments ?? []).join("\n"));
    this.setInputValue("priority", String(data.priority ?? 0));
    this.setInputValue("coordinators", (data.coordinators ?? []).join(","));
    this.setInputValue("email-contacts", (data.emailContacts ?? []).join(","));
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
  }

  private prefillFromState(): void {
    this.setInputValue("requester", this.user?.name ?? "");
    this.setInputValue("email", this.user?.email ?? "");
    this.setInputValue("phone-number", this.user?.phoneNumber ?? "");
    this.setInputValue("project-id", this.config.projectId ?? "");
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

  private parseArrayInput(raw: string, separator: string): string[] {
    if (!raw) return [];
    if (raw.startsWith("[")) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
      } catch {
        return [];
      }
    }
    return raw
      .split(separator)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private async submit(): Promise<void> {
    try {
      const user: SupportUser = {
        name: this.getInputValue("requester"),
        email: this.getInputValue("email"),
        phoneNumber: this.getInputValue("phone-number"),
      };

      this.user = user;
      this.config.projectId =
        this.getInputValue("project-id") || this.config.projectId;

      validateWidgetConfig(this.config);
      validateUser(user);

      const submission: SupportSubmissionInput = {
        content: this.getInputValue("content"),
        attachments: this.parseArrayInput(
          this.getInputValue("attachments"),
          "\n",
        ),
        priority: Number(this.getInputValue("priority") || 0),
        coordinators: this.parseArrayInput(
          this.getInputValue("coordinators"),
          ",",
        ),
        emailContacts: this.parseArrayInput(
          this.getInputValue("email-contacts"),
          ",",
        ),
      };
      validateSubmission(submission);

      const payload = mapToSupportRequestPayload({
        config: this.config,
        user,
        submission,
      });
      const baseUrl = resolveBaseUrl(this.config);
      const result = await createSupportRequest(baseUrl, payload);

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
