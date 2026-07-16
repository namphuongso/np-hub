import { createElement, useEffect, useState } from "react";
import type { SupportWidgetElement } from "../component/support-widget.element";
import { WIDGET_EVENTS } from "../component/events/widget-events";
import { registerSupportWidget } from "../register";
import type {
  SupportSubmissionInput,
  SupportUserPrefill,
} from "../types/public";

registerSupportWidget();

export interface SupportWidgetProps {
  projectId: string;
  isDev?: boolean;
  priority?: number;
  coordinators?: string[];
  emailContacts?: string[];
  toastDuration?: number | { success?: number; error?: number };
  /** Stacking order of the widget. Defaults to `10000` when omitted. */
  zIndex?: number;
  width?: string | number;
  height?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
  top?: string | number;
  user?: SupportUserPrefill;
  formPrefill?: SupportSubmissionInput;
  onSubmitSuccess?: (detail: unknown) => void;
  onSubmitError?: (detail: unknown) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export function SupportWidget({
  projectId,
  isDev,
  priority,
  coordinators,
  emailContacts,
  toastDuration,
  zIndex,
  width,
  height,
  right,
  bottom,
  left,
  top,
  user,
  formPrefill,
  onSubmitSuccess,
  onSubmitError,
  onOpen,
  onClose,
}: SupportWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [widgetEl, setWidgetEl] = useState<SupportWidgetElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!widgetEl) return;
    widgetEl.setConfig({
      projectId,
      isDev,
      priority,
      coordinators,
      emailContacts,
      toastDuration,
      zIndex,
    });
  }, [
    widgetEl,
    projectId,
    isDev,
    priority,
    coordinators,
    emailContacts,
    toastDuration,
    zIndex,
  ]);

  useEffect(() => {
    if (!widgetEl || !user) return;
    widgetEl.setUser(user);
  }, [widgetEl, user]);

  useEffect(() => {
    if (!widgetEl || !formPrefill) return;
    widgetEl.setFormPrefill(formPrefill);
  }, [widgetEl, formPrefill]);

  useEffect(() => {
    if (!widgetEl) return;

    const handleSuccess = (event: Event) => {
      onSubmitSuccess?.((event as CustomEvent).detail);
    };
    const handleError = (event: Event) => {
      onSubmitError?.((event as CustomEvent).detail);
    };

    if (onSubmitSuccess) {
      widgetEl.addEventListener(WIDGET_EVENTS.SUBMIT_SUCCESS, handleSuccess);
    }
    if (onSubmitError) {
      widgetEl.addEventListener(WIDGET_EVENTS.SUBMIT_ERROR, handleError);
    }
    if (onOpen) {
      widgetEl.addEventListener(WIDGET_EVENTS.OPEN, onOpen);
    }
    if (onClose) {
      widgetEl.addEventListener(WIDGET_EVENTS.CLOSE, onClose);
    }

    return () => {
      if (onSubmitSuccess) {
        widgetEl.removeEventListener(
          WIDGET_EVENTS.SUBMIT_SUCCESS,
          handleSuccess,
        );
      }
      if (onSubmitError) {
        widgetEl.removeEventListener(WIDGET_EVENTS.SUBMIT_ERROR, handleError);
      }
      if (onOpen) {
        widgetEl.removeEventListener(WIDGET_EVENTS.OPEN, onOpen);
      }
      if (onClose) {
        widgetEl.removeEventListener(WIDGET_EVENTS.CLOSE, onClose);
      }
    };
  }, [widgetEl, onSubmitSuccess, onSubmitError, onOpen, onClose]);

  if (!mounted) {
    return null;
  }

  return createElement("np-hub", {
    ref: setWidgetEl,
    "project-id": projectId,
    ...(isDev ? { "is-dev": true } : {}),
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    ...(right !== undefined ? { right } : {}),
    ...(bottom !== undefined ? { bottom } : {}),
    ...(left !== undefined ? { left } : {}),
    ...(top !== undefined ? { top } : {}),
  });
}
