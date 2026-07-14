import {
  createElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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
  const widgetRef = useRef<SupportWidgetElement | null>(null);

  const setWidgetRef = useCallback((node: SupportWidgetElement | null) => {
    widgetRef.current = node;
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const el = widgetRef.current;
    if (!el) return;
    el.setConfig({
      projectId,
      isDev,
      priority,
      coordinators,
      emailContacts,
      toastDuration,
    });
  }, [projectId, isDev, priority, coordinators, emailContacts, toastDuration]);

  useEffect(() => {
    const el = widgetRef.current;
    if (!el || !user) return;
    el.setUser(user);
  }, [user]);

  useEffect(() => {
    const el = widgetRef.current;
    if (!el || !formPrefill) return;
    el.setFormPrefill(formPrefill);
  }, [formPrefill]);

  useEffect(() => {
    const el = widgetRef.current;
    if (!el) return;

    const handleSuccess = (event: Event) => {
      onSubmitSuccess?.((event as CustomEvent).detail);
    };
    const handleError = (event: Event) => {
      onSubmitError?.((event as CustomEvent).detail);
    };

    if (onSubmitSuccess) {
      el.addEventListener(WIDGET_EVENTS.SUBMIT_SUCCESS, handleSuccess);
    }
    if (onSubmitError) {
      el.addEventListener(WIDGET_EVENTS.SUBMIT_ERROR, handleError);
    }
    if (onOpen) {
      el.addEventListener(WIDGET_EVENTS.OPEN, onOpen);
    }
    if (onClose) {
      el.addEventListener(WIDGET_EVENTS.CLOSE, onClose);
    }

    return () => {
      if (onSubmitSuccess) {
        el.removeEventListener(WIDGET_EVENTS.SUBMIT_SUCCESS, handleSuccess);
      }
      if (onSubmitError) {
        el.removeEventListener(WIDGET_EVENTS.SUBMIT_ERROR, handleError);
      }
      if (onOpen) {
        el.removeEventListener(WIDGET_EVENTS.OPEN, onOpen);
      }
      if (onClose) {
        el.removeEventListener(WIDGET_EVENTS.CLOSE, onClose);
      }
    };
  }, [onSubmitSuccess, onSubmitError, onOpen, onClose]);

  if (!mounted) {
    return null;
  }

  return createElement("np-hub", {
    ref: setWidgetRef,
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
