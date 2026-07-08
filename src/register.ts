import { SupportWidgetElement } from "./component/support-widget.element";

const TAG_NAME = "np-hub";

export function registerSupportWidget(): void {
  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, SupportWidgetElement);
  }
}

registerSupportWidget();
