var NP_HUB_LOCAL = "/dist/np-hub.min.global.js";
var NP_HUB_CDN =
  "https://cdn.jsdelivr.net/npm/@namphuongtechnologi/np-hub@0.1.8/dist/np-hub.min.global.js";
var USE_CDN_FALLBACK = false;

function bindDemoActions(widget) {
  var openBtn = document.getElementById("open-widget");
  if (openBtn) {
    openBtn.addEventListener("click", function () {
      widget.open();
    });
  }
}

function initNpHub() {
  var widget = document.createElement("np-hub");

  // Cách dùng mới: cấu hình qua setConfig
  widget.setConfig({
    projectId: "NPP",
    isDev: true,
    priority: 0,
    coordinators: [],
    emailContacts: [],
  });

  // Optional: chỉ prefill, form vẫn bắt buộc nhập đầy đủ khi submit
  // widget.setUser({
  //   name: "Nguyen Van A",
  //   email: "a@gmail.com",
  //   phoneNumber: "0912345678",
  // });

  // Optional: prefill nội dung/file
  // widget.setFormPrefill({
  //   content: "Mô tả sự cố cần hỗ trợ...",
  //   attachments: [],
  // });

  document.body.appendChild(widget);
  bindDemoActions(widget);

  widget.addEventListener("np-hub-open", function () {
    console.log("Widget opened");
  });

  widget.addEventListener("np-hub-close", function () {
    console.log("Widget closed");
  });

  widget.addEventListener("np-hub-submit-success", function (event) {
    console.log("Tạo yêu cầu thành công:", event.detail);
  });

  widget.addEventListener("np-hub-submit-error", function (event) {
    console.error("Lỗi gửi yêu cầu:", event.detail);
  });
}

function loadScript(src, onLoad, onError) {
  var script = document.createElement("script");
  script.src = src;
  script.onload = onLoad;
  script.onerror = onError;
  document.head.appendChild(script);
}

loadScript(
  NP_HUB_LOCAL,
  initNpHub,
  function () {
    console.error(
      "Cannot load local bundle /dist/np-hub.min.global.js. Run from repo root: npx serve . then open /examples/static-html/",
    );
    if (USE_CDN_FALLBACK) {
      console.warn("Fallback to CDN is enabled.");
      loadScript(NP_HUB_CDN, initNpHub, function () {
        console.error("Cannot load NP Hub script from both local and CDN.");
      });
    }
  },
);
