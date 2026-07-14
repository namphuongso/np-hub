var NP_HUB_LOCAL = "/dist/np-hub.min.global.js";
var NP_HUB_CDN =
  "https://cdn.jsdelivr.net/npm/@namphuongtechnologi/np-hub@0.1.9/dist/np-hub.min.global.js";
var USE_CDN_FALLBACK = false;

function bindDemoActions(widget) {
  var openBtn = document.getElementById("open-widget");
  if (openBtn) {
    openBtn.addEventListener("click", function () {
      widget.open();
    });
  }

  var successBtn = document.getElementById("btn-test-success");
  if (successBtn) {
    successBtn.addEventListener("click", function () {
      // Ensure widget is loaded
      var hub = document.querySelector("np-hub");
      if (hub && hub.shadowRoot) {
        var toast = hub.shadowRoot.getElementById("toast");
        var title = hub.shadowRoot.getElementById("toast-title");
        var msg = hub.shadowRoot.getElementById("toast-message");
        var details = hub.shadowRoot.getElementById("toast-details");
        var reqVal = hub.shadowRoot.getElementById("toast-request-code");
        var linkRow = hub.shadowRoot.getElementById("toast-link-row");
        var link = hub.shadowRoot.getElementById("toast-link");
        var countdown = hub.shadowRoot.getElementById("toast-countdown");
        var countdownSeconds = hub.shadowRoot.getElementById("toast-countdown-seconds");
        var countdownBar = hub.shadowRoot.getElementById("toast-countdown-bar");
        var closeBtn = hub.shadowRoot.getElementById("toast-close-btn");

        title.textContent = "Gửi yêu cầu thành công";
        msg.textContent = "Successful.";
        reqVal.textContent = "2607-230-1322";
        details.classList.remove("is-hidden");
        link.href =
          "https://hotro.azurewebsites.net/yeu-cau/2607-230-1322";
        link.textContent =
          "https://hotro.azurewebsites.net/yeu-cau/2607-230-1322";
        linkRow.classList.remove("is-hidden");
        if (countdown) countdown.classList.remove("is-hidden");
        if (countdownSeconds) countdownSeconds.textContent = "8s";
        countdownBar.style.strokeDashoffset = "0";

        toast.classList.remove("error");
        toast.classList.add("success", "show");

        // Simple close logic for demo
        var closeHandler = function () {
          toast.classList.remove("show");
          closeBtn.removeEventListener("click", closeHandler);
        };
        closeBtn.addEventListener("click", closeHandler);
      }
    });
  }

  var errorBtn = document.getElementById("btn-test-error");
  if (errorBtn) {
    errorBtn.addEventListener("click", function () {
      var hub = document.querySelector("np-hub");
      if (hub && hub.shadowRoot) {
        var toast = hub.shadowRoot.getElementById("toast");
        var title = hub.shadowRoot.getElementById("toast-title");
        var msg = hub.shadowRoot.getElementById("toast-message");
        var details = hub.shadowRoot.getElementById("toast-details");
        var countdown = hub.shadowRoot.getElementById("toast-countdown");
        var countdownSeconds = hub.shadowRoot.getElementById("toast-countdown-seconds");
        var countdownBar = hub.shadowRoot.getElementById("toast-countdown-bar");
        var closeBtn = hub.shadowRoot.getElementById("toast-close-btn");

        title.textContent = "Gửi yêu cầu thất bại";
        msg.textContent = "Phone number is invalid";
        details.classList.add("is-hidden");
        if (countdown) countdown.classList.remove("is-hidden");
        if (countdownSeconds) countdownSeconds.textContent = "6s";
        countdownBar.style.strokeDashoffset = "0";

        toast.classList.remove("success");
        toast.classList.add("error", "show");

        // Simple close logic for demo
        var closeHandler = function () {
          toast.classList.remove("show");
          closeBtn.removeEventListener("click", closeHandler);
        };
        closeBtn.addEventListener("click", closeHandler);
      }
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
    toastDuration: 6000, // toast tự đóng sau 6 giây (mặc định 4000)
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

  // Optional: tuỳ chỉnh vị trí nút nổi (mặc định right/bottom = 20px)
  // widget.setAttribute("right", "24");
  // widget.setAttribute("bottom", "24");
  // hoặc góc khác: left/top
  // widget.setAttribute("left", "20");
  // widget.setAttribute("bottom", "20");

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

loadScript(NP_HUB_LOCAL, initNpHub, function () {
  console.error(
    "Cannot load local bundle /dist/np-hub.min.global.js. Run from repo root: npx serve . then open /examples/static-html/",
  );
  if (USE_CDN_FALLBACK) {
    console.warn("Fallback to CDN is enabled.");
    loadScript(NP_HUB_CDN, initNpHub, function () {
      console.error("Cannot load NP Hub script from both local and CDN.");
    });
  }
});
