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
import type { SupportSubmissionInput, SupportUser } from "../types/public";

registerSupportWidget();

export interface SupportWidgetProps {
  projectId: string;
  isDev?: boolean;
  priority?: number;
  coordinators?: string[];
  emailContacts?: string[];
  width?: string | number;
  height?: string | number;
  user?: SupportUser;
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
  width,
  height,
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
    });
  }, [projectId, isDev, priority, coordinators, emailContacts]);

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
  });
}
